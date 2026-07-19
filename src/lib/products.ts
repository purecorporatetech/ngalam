import type { Tables } from "@/integrations/supabase/types";

// SELECT partagé : joint les variantes de finition et la galerie d'images.
// À utiliser côté boutique/vitrine plutôt que les colonnes legacy de products.
export const SHOP_SELECT =
  "*, product_variants(finish, price, stock_quantity, sku), product_images(image_url, is_primary, position)";

export type ShopVariant = Pick<Tables<"product_variants">, "finish" | "price" | "stock_quantity" | "sku">;
export type ShopImage = Pick<Tables<"product_images">, "image_url" | "is_primary" | "position">;
export type ShopProduct = Tables<"products"> & {
  product_variants: ShopVariant[];
  product_images: ShopImage[];
};

export type CategoryKey = "colliers" | "bagues" | "bracelets" | "boucles";

export const CATEGORIES: { key: CategoryKey; label: string; path: string }[] = [
  { key: "colliers", label: "Colliers", path: "/colliers" },
  { key: "bagues", label: "Bagues", path: "/bagues" },
  { key: "bracelets", label: "Bracelets", path: "/bracelets" },
  { key: "boucles", label: "Boucles d'oreilles", path: "/boucles-doreilles" },
];

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c.label])
);

export const FINISHES: { key: string; label: string }[] = [
  { key: "or", label: "Or" },
  { key: "argent", label: "Argent" },
];

// Galerie triée (par position), avec repli sur products.image_url si aucune image
// n'a été enregistrée dans product_images.
export const getGalleryUrls = (p: ShopProduct): string[] => {
  const imgs = [...(p.product_images ?? [])].sort((a, b) => {
    // L'image principale d'abord, puis par position.
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.position - b.position;
  });
  const urls = imgs.map((i) => i.image_url).filter(Boolean);
  if (urls.length > 0) return urls;
  return p.image_url ? [p.image_url] : [];
};

// Finitions réellement proposées (lignes présentes dans product_variants).
export const getFinishes = (p: ShopProduct): string[] => {
  const set = new Set((p.product_variants ?? []).map((v) => v.finish));
  return FINISHES.map((f) => f.key).filter((k) => set.has(k));
};

// Prix affiché : prix de base, ou "à partir de" si une variante a un prix
// (override) strictement inférieur au prix de base.
export const getPriceInfo = (p: ShopProduct): { min: number; from: boolean } => {
  const overrides = (p.product_variants ?? [])
    .map((v) => v.price)
    .filter((v): v is number => v != null);
  const min = Math.min(p.price, ...overrides);
  return { min, from: min < p.price };
};

// Stock effectif : somme des variantes si présentes, sinon stock legacy.
export const getTotalStock = (p: ShopProduct): number =>
  (p.product_variants ?? []).length > 0
    ? p.product_variants.reduce((s, v) => s + v.stock_quantity, 0)
    : p.stock_quantity;
