-- ============================================================================
-- Chantier Signares A — base : campaigns (drops mensuels), FK products.drop_id,
--                              waitlist.
-- Migration ADDITIVE uniquement : CREATE TABLE / INDEX / POLICY / TRIGGER,
-- ALTER TABLE ADD COLUMN (idempotent) / ADD CONSTRAINT. Aucun DROP, aucun
-- ALTER destructif. Aucune donnée seed.
--
-- Conventions reprises des migrations existantes :
--   * UUID PK (gen_random_uuid())
--   * RLS : lecture publique + écriture admin via public.has_role(auth.uid(),'admin')
--   * updated_at maintenu par public.update_updated_at_column()
--
-- Fuseau : tous les instants sont stockés en TIMESTAMPTZ (UTC). Le fuseau
-- d'affichage/saisie du module (Europe/Paris) est traité côté app aux étapes
-- suivantes ; rien de spécifique au fuseau dans ce SQL.
-- ============================================================================

-- ============ CAMPAIGNS (une Signare = un drop mensuel) ============
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,                 -- nom de la Signare (ex. "Diongoma")
  slug TEXT UNIQUE NOT NULL,
  valeur TEXT,                         -- valeur wolof incarnée
  subtitle TEXT,                       -- accroche courte
  story TEXT,                          -- récit du mois (long)
  hero_image TEXT,                     -- visuel d'ambiance
  opens_at TIMESTAMPTZ NOT NULL,
  closes_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled','live','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (closes_at > opens_at)
);

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Campaigns are publicly readable"
  ON public.campaigns FOR SELECT
  USING (true);

-- Écriture réservée aux admins
CREATE POLICY "Admins can insert campaigns"
  ON public.campaigns FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update campaigns"
  ON public.campaigns FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete campaigns"
  ON public.campaigns FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- ============ PRODUCTS.drop_id → campaigns ============
-- La colonne drop_id était prévue au Chantier 3a mais n'a pas été créée :
-- on l'ajoute ici de façon idempotente, puis on branche la FK et l'index.
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS drop_id UUID;

-- FK ajoutée seulement si absente (idempotent).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'products_drop_id_fkey'
  ) THEN
    ALTER TABLE public.products
      ADD CONSTRAINT products_drop_id_fkey
      FOREIGN KEY (drop_id) REFERENCES public.campaigns(id) ON DELETE SET NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_products_drop_id
  ON public.products(drop_id);

-- ============ WAITLIST (liste d'attente du rituel) ============
-- campaign_id NULL = liste générale "prochaine Signare".
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email, campaign_id)
);

-- Déduplication de la liste générale : NULL étant distinct de NULL dans une
-- contrainte UNIQUE, on ajoute un index partiel pour empêcher un même email de
-- s'inscrire plusieurs fois à la liste "prochaine Signare" (campaign_id NULL).
-- Le UNIQUE(email, campaign_id) ci-dessus couvre les listes par drop.
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_email_general_unique
  ON public.waitlist (email)
  WHERE campaign_id IS NULL;

ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

-- Inscription publique (visiteurs non authentifiés inclus).
CREATE POLICY "Anyone can join the waitlist"
  ON public.waitlist FOR INSERT
  WITH CHECK (true);

-- Consultation réservée aux admins.
CREATE POLICY "Admins can view the waitlist"
  ON public.waitlist FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Pas de policy UPDATE ni DELETE : RLS activée => ces opérations sont refusées
-- à tous (public comme authenticated), seul le service_role y échappe.
