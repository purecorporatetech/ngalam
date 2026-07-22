-- ============================================================================
-- Chantier Home — site_settings (réglages de site pilotés depuis l'admin)
-- Migration ADDITIVE uniquement : CREATE TABLE / TRIGGER / POLICY + seed.
-- Aucun DROP, aucun ALTER destructif.
-- Conventions reprises des migrations existantes :
--   * RLS : lecture publique + écriture admin via public.has_role(auth.uid(),'admin')
--   * updated_at maintenu par public.update_updated_at_column()
-- ============================================================================

CREATE TABLE public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Lecture publique (anon + authenticated)
CREATE POLICY "Site settings are publicly readable"
  ON public.site_settings FOR SELECT
  USING (true);

-- Écriture réservée aux admins
CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete site settings"
  ON public.site_settings FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Seed : réglages par défaut du hero d'accueil (idempotent).
INSERT INTO public.site_settings (key, value)
VALUES (
  'home_hero',
  '{
    "media_type": "image",
    "media_url": null,
    "eyebrow": "NGALAM",
    "title": "L''élégance en héritage",
    "subtitle": "Des pièces qui portent une histoire.",
    "cta_label": "Découvrir la boutique",
    "cta_href": "/boutique"
  }'::jsonb
)
ON CONFLICT (key) DO NOTHING;
