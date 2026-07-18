-- ============================================================================
-- Chantier — enrichissement products + product_variants (finition or/argent)
--           + product_images
-- Migration ADDITIVE uniquement : ALTER TABLE ADD COLUMN / CREATE TABLE /
-- CREATE POLICY / CREATE INDEX / CREATE TRIGGER.
-- Aucune modification destructive ni suppression sur les tables existantes.
-- Conventions reprises de la migration initiale :
--   * UUID PK (gen_random_uuid())
--   * RLS : lecture publique + écriture réservée aux admins (public.has_role)
--   * updated_at maintenu par public.update_updated_at_column()
-- ============================================================================

-- ============ PRODUCTS (enrichissement additif) ============
-- Colonnes manquantes ajoutées sans toucher aux données existantes.
ALTER TABLE public.products
  ADD COLUMN category_key TEXT
    CHECK (category_key IN ('colliers','bagues','bracelets','boucles') OR category_key IS NULL),
  ADD COLUMN availability TEXT NOT NULL DEFAULT 'permanent'
    CHECK (availability IN ('permanent','drop')),
  ADD COLUMN wolof_name TEXT,
  ADD COLUMN valeur TEXT,
  ADD COLUMN histoire TEXT,
  ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

-- ============ PRODUCT VARIANTS (finition or / argent) ============
-- Déclinaison SPÉCIFIQUE à la finition : une ligne par finition d'un produit.
-- price NULL => hérite de products.price ; sinon prix absolu de la déclinaison.
CREATE TABLE public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  finish TEXT NOT NULL CHECK (finish IN ('or','argent')),
  sku TEXT,
  price NUMERIC,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (product_id, finish)
);

CREATE INDEX idx_product_variants_product_id
  ON public.product_variants(product_id);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Product variants are publicly readable"
  ON public.product_variants FOR SELECT
  USING (true);

-- Écriture réservée aux admins
CREATE POLICY "Admins can insert product variants"
  ON public.product_variants FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product variants"
  ON public.product_variants FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product variants"
  ON public.product_variants FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ PRODUCT IMAGES ============
-- Galerie d'images par produit. position = ordre d'affichage ;
-- is_primary marque l'image principale. Les fichiers vivent dans le bucket
-- storage 'product-images' déjà existant ; image_url pointe dessus.
CREATE TABLE public.product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  image_url TEXT NOT NULL,
  alt_text TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_product_images_product_id
  ON public.product_images(product_id);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Lecture publique
CREATE POLICY "Product images are publicly readable"
  ON public.product_images FOR SELECT
  USING (true);

-- Écriture réservée aux admins
CREATE POLICY "Admins can insert product images"
  ON public.product_images FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product images"
  ON public.product_images FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product images"
  ON public.product_images FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
