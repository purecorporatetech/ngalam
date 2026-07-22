// Réglages de site (table site_settings, value JSONB). Le hero d'accueil est
// piloté par la ligne key='home_hero'. On parse défensivement pour que la home
// ne casse jamais, même si la ligne manque ou est malformée.

export interface HomeHero {
  media_type: "image" | "video";
  media_url: string | null;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_href: string;
}

export const HOME_HERO_KEY = "home_hero";

export const DEFAULT_HOME_HERO: HomeHero = {
  media_type: "image",
  media_url: null,
  eyebrow: "NGALAM",
  title: "L'élégance en héritage",
  subtitle: "Des pièces qui portent une histoire.",
  cta_label: "Découvrir la boutique",
  cta_href: "/boutique",
};

// Fusionne la valeur brute (Json) sur les défauts. Toute clé absente/invalide
// retombe sur le défaut.
export const parseHomeHero = (value: unknown): HomeHero => {
  const v = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const str = (k: keyof HomeHero, d: string) => (typeof v[k] === "string" ? (v[k] as string) : d);
  return {
    media_type: v.media_type === "video" ? "video" : "image",
    media_url: typeof v.media_url === "string" ? (v.media_url as string) : null,
    eyebrow: str("eyebrow", DEFAULT_HOME_HERO.eyebrow),
    title: str("title", DEFAULT_HOME_HERO.title),
    subtitle: str("subtitle", DEFAULT_HOME_HERO.subtitle),
    cta_label: str("cta_label", DEFAULT_HOME_HERO.cta_label),
    cta_href: str("cta_href", DEFAULT_HOME_HERO.cta_href),
  };
};
