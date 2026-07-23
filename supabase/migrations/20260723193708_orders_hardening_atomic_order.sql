-- ============================================================================
-- Chantier 11a — socle paiement : durcissement commandes + décrément atomique
-- Migration ADDITIVE (colonnes/contraintes/fonction). Un seul DROP : deux
-- policies INSERT « navigateur » (validé) — aucun DROP de colonne.
-- Conventions : has_role / user_roles, product_variants.stock_quantity NOT NULL.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- A) ORDERS : clé d'idempotence
-- (user_id existe déjà : uuid nullable, ON DELETE SET NULL — rien à faire.)
-- ---------------------------------------------------------------------------
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stripe_session_id TEXT;

-- UNIQUE = clé d'idempotence du webhook (les NULL existants restent permis).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_stripe_session_id_key'
  ) THEN
    ALTER TABLE public.orders
      ADD CONSTRAINT orders_stripe_session_id_key UNIQUE (stripe_session_id);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- B) ORDER_ITEMS : finition achetée (le prix figé price_at_purchase existe déjà)
-- ---------------------------------------------------------------------------
-- Garde-fou : finish NOT NULL n'est sûr que si la table est vide (chaque ligne
-- doit connaître sa finition, impossible à rétro-déduire pour du legacy).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.order_items) THEN
    RAISE EXCEPTION
      'order_items non vide : finish NOT NULL nécessite une stratégie de backfill. Migration interrompue (rien modifié).';
  END IF;
END $$;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS finish TEXT NOT NULL
    CHECK (finish IN ('or','argent'));

-- ---------------------------------------------------------------------------
-- A.4) RLS : plus aucune écriture depuis le navigateur.
-- Les commandes sont créées uniquement côté serveur (service_role, qui ignore
-- la RLS). On retire les 2 policies INSERT « client ». Les policies SELECT
-- (own + admin) sont conservées.
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can create orders" ON public.orders;
DROP POLICY IF EXISTS "Users can insert order items" ON public.order_items;

-- ---------------------------------------------------------------------------
-- C) FONCTION TRANSACTIONNELLE UNIQUE — le chemin de l'argent (appelée en 11b
--    par le webhook, en service_role). Tout réussit ou tout échoue.
--    * INSERT commande ON CONFLICT (stripe_session_id) DO NOTHING → idempotence
--    * si déjà traitée → RETURN NULL (sortie propre)
--    * sinon : pour chaque item, verrou de ligne sur la variante, échec si
--      stock insuffisant, décrément, puis insertion de l'order_item — dans LA
--      MÊME transaction (la fonction est atomique par nature).
--
--    _items : JSONB [{ "product_id": uuid, "finish": "or"|"argent",
--                      "quantity": int, "unit_price": numeric }, ...]
--    Retour : UUID de la commande créée, ou NULL si la session était déjà traitée.
--
--    ⚠️ RÈGLE ABSOLUE (11b) : cette fonction FAIT CONFIANCE aux montants qu'on
--    lui passe (unit_price, total_amount). C'est correct pour une fonction
--    serveur, MAIS l'edge function du webhook DOIT dériver unit_price et
--    total_amount de la SESSION STRIPE elle-même (montants réellement encaissés),
--    JAMAIS de données venant du navigateur.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_paid_order(
  _stripe_session_id TEXT,
  _user_id UUID,
  _customer_email TEXT,
  _customer_name TEXT,
  _total_amount NUMERIC,
  _shipping_address JSONB,
  _items JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _order_id UUID;
  _item JSONB;
  _pid UUID;
  _finish TEXT;
  _qty INT;
  _price NUMERIC;
  _current INT;
BEGIN
  IF _stripe_session_id IS NULL OR length(_stripe_session_id) = 0 THEN
    RAISE EXCEPTION 'stripe_session_id requis';
  END IF;

  -- Idempotence réelle : no-op si la session a déjà donné lieu à une commande.
  INSERT INTO public.orders (
    stripe_session_id, user_id, customer_email, customer_name,
    total_amount, status, shipping_address
  )
  VALUES (
    _stripe_session_id, _user_id, _customer_email, _customer_name,
    _total_amount, 'paid', _shipping_address
  )
  ON CONFLICT (stripe_session_id) DO NOTHING
  RETURNING id INTO _order_id;

  IF _order_id IS NULL THEN
    RETURN NULL;  -- déjà traitée → on ne décrémente rien, on ne duplique rien
  END IF;

  FOR _item IN SELECT * FROM jsonb_array_elements(_items)
  LOOP
    _pid    := (_item->>'product_id')::uuid;
    _finish := _item->>'finish';
    _qty    := (_item->>'quantity')::int;
    _price  := (_item->>'unit_price')::numeric;

    IF _qty IS NULL OR _qty <= 0 THEN
      RAISE EXCEPTION 'Quantité invalide (produit %, finition %)', _pid, _finish;
    END IF;

    -- Verrou de ligne sur la variante + lecture du stock courant.
    SELECT stock_quantity INTO _current
      FROM public.product_variants
      WHERE product_id = _pid AND finish = _finish
      FOR UPDATE;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Variante introuvable (produit %, finition %)', _pid, _finish;
    END IF;

    -- stock_quantity est NOT NULL en base ; garde défensive au cas où.
    IF _current IS NULL OR _current < _qty THEN
      RAISE EXCEPTION 'Stock insuffisant (produit %, finition % : % demandé, % disponible)',
        _pid, _finish, _qty, COALESCE(_current, 0);
    END IF;

    UPDATE public.product_variants
      SET stock_quantity = stock_quantity - _qty
      WHERE product_id = _pid AND finish = _finish;

    INSERT INTO public.order_items (order_id, product_id, finish, quantity, price_at_purchase)
    VALUES (_order_id, _pid, _finish, _qty, _price);
  END LOOP;

  RETURN _order_id;
END;
$$;

-- La fonction ne doit JAMAIS être appelée depuis le navigateur.
-- Le propriétaire est le rôle de migration (postgres) ; service_role n'est ni
-- propriétaire ni superuser → il faut lui accorder EXECUTE explicitement APRÈS
-- les REVOKE, sinon le webhook 11b échoue en « permission denied ».
REVOKE ALL ON FUNCTION public.create_paid_order(TEXT, UUID, TEXT, TEXT, NUMERIC, JSONB, JSONB) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_paid_order(TEXT, UUID, TEXT, TEXT, NUMERIC, JSONB, JSONB) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_paid_order(TEXT, UUID, TEXT, TEXT, NUMERIC, JSONB, JSONB) TO service_role;
