import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight, ShoppingBag } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  SHOP_SELECT,
  CATEGORY_LABELS,
  FINISHES,
  getGalleryUrls,
  getFinishes,
  type ShopProduct,
} from "@/lib/products";

const FINISH_DOT: Record<string, string> = {
  or: "bg-accent",
  argent: "bg-muted-foreground",
};
const FINISH_LABELS: Record<string, string> = Object.fromEntries(FINISHES.map((f) => [f.key, f.label]));

const ProductDetail = () => {
  const { addItem } = useCart();
  const { id } = useParams<{ id: string }>();

  const [selectedFinish, setSelectedFinish] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);

  const { data: product, isLoading } = useQuery<ShopProduct | null>({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(SHOP_SELECT)
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as ShopProduct | null;
    },
    enabled: !!id,
  });

  const { data: crossSell } = useQuery<ShopProduct[]>({
    queryKey: ["cross-sell", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(SHOP_SELECT)
        .eq("availability", "permanent")
        .neq("id", id!)
        .order("sort_order", { ascending: true })
        .limit(3);
      if (error) throw error;
      return (data ?? []) as ShopProduct[];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="max-w-6xl mx-auto px-5 md:px-6 py-8 md:py-14">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
            <Skeleton className="aspect-[3/4] rounded-sm" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/4" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="max-w-6xl mx-auto px-5 md:px-6 py-20 text-center">
          <h1 className="font-serif text-3xl text-foreground mb-4">Produit introuvable</h1>
          <Link to="/" className="text-primary underline">Retour à l'accueil</Link>
        </main>
        <SiteFooter />
      </div>
    );
  }

  const images = getGalleryUrls(product);
  const currentImage = images[imageIndex] ?? images[0];
  const finishes = getFinishes(product);
  const activeFinish = selectedFinish ?? finishes[0] ?? null;
  const activeVariant = product.product_variants.find((v) => v.finish === activeFinish) ?? null;

  const displayPrice = activeVariant ? (activeVariant.price ?? product.price) : product.price;
  const stock = activeVariant ? activeVariant.stock_quantity : product.product_variants.length === 0
    ? Number.POSITIVE_INFINITY // aucun modèle variante : ne bloque pas la vente
    : 0;
  const isOutOfStock = stock <= 0;

  const categoryLabel = product.category_key ? CATEGORY_LABELS[product.category_key] : null;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addItem({
      id: product.id,
      name: product.name,
      price: displayPrice,
      image_url: images[0] ?? null,
      finish: activeFinish,
    });
    toast.success(`${product.name}${activeFinish ? ` (${FINISH_LABELS[activeFinish] ?? activeFinish})` : ""} ajouté au panier`);
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-5 md:px-6 py-8 md:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 md:mb-10">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <Link to="/boutique" className="hover:text-foreground transition-colors">Boutique</Link>
          <ChevronRight className="w-3 h-3" />
          <span>{categoryLabel ?? "Pièce"}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
          {/* LEFT — Galerie */}
          <div>
            <div className="aspect-[3/4] bg-muted rounded-sm relative flex items-center justify-center overflow-hidden">
              {product.is_featured && (
                <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-[10px] px-2.5 py-1 uppercase tracking-wider font-bold z-10">
                  Best Seller
                </span>
              )}
              {product.availability === "drop" && (
                <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] px-2.5 py-1 uppercase tracking-wider font-bold z-10">
                  Édition limitée
                </span>
              )}
              {currentImage ? (
                <img src={currentImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground/40 text-xs tracking-[0.15em] uppercase">
                  Photo à venir
                </span>
              )}
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 mt-3">
                {images.map((url, i) => (
                  <button
                    key={url}
                    onClick={() => setImageIndex(i)}
                    className={`w-16 h-20 rounded-sm overflow-hidden border transition-colors ${i === imageIndex ? "border-primary" : "border-foreground/15 hover:border-foreground/40"}`}
                    aria-label={`Voir l'image ${i + 1}`}
                  >
                    <img src={url} alt={`${product.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT — Info & Purchase */}
          <div className="flex flex-col">
            {product.wolof_name && (
              <span className="font-serif text-sm italic text-primary mb-1">{product.wolof_name}</span>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-3">
              {product.name}
            </h1>
            <span className="font-sans text-xl font-medium text-foreground mb-5">
              {displayPrice}&nbsp;€
            </span>

            <p className="font-sans text-sm leading-relaxed text-foreground/75 mb-6">
              {product.description || "Un bijou élégant en acier inoxydable."}
            </p>

            {/* Finish selector — généré depuis les variantes */}
            {finishes.length > 0 && (
              <div className="mb-6">
                <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
                  Finition
                </span>
                <div className="flex flex-wrap gap-2">
                  {finishes.map((f) => {
                    const variant = product.product_variants.find((v) => v.finish === f);
                    const soldOut = (variant?.stock_quantity ?? 0) <= 0;
                    const selected = f === activeFinish;
                    return (
                      <button
                        key={f}
                        onClick={() => setSelectedFinish(f)}
                        className={`inline-flex items-center gap-2 border rounded-sm px-4 py-2 text-sm transition-colors ${
                          selected ? "border-primary text-foreground" : "border-foreground/20 text-foreground/70 hover:border-foreground/40"
                        }`}
                      >
                        <span className={`w-3 h-3 rounded-full border border-foreground/15 ${FINISH_DOT[f] ?? "bg-muted"}`} />
                        {FINISH_LABELS[f] ?? f}
                        {soldOut && <span className="text-[10px] uppercase text-muted-foreground">(épuisé)</span>}
                      </button>
                    );
                  })}
                </div>
                {activeVariant?.sku && (
                  <p className="text-xs text-muted-foreground mt-2">Réf. {activeVariant.sku}</p>
                )}
              </div>
            )}

            {/* Waterproof box */}
            <div className="border border-accent/50 bg-background rounded-sm p-4 mb-8">
              <p className="font-sans text-xs uppercase tracking-[0.15em] font-bold text-foreground mb-1">
                🌊 100% Waterproof
              </p>
              <p className="font-sans text-sm text-foreground/80 leading-relaxed">
                Ne les enlevez jamais. Nos bijoux en acier inoxydable ne craignent ni la douche, ni la mer, ni le parfum. Garantie couleur à vie.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-full py-4 font-bold uppercase text-xs tracking-[0.25em] rounded-sm flex items-center justify-center gap-2 mb-8 transition-colors ${
                isOutOfStock
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90"
              }`}
            >
              <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
              {isOutOfStock ? "Épuisé" : "Ajouter au Panier"}
            </button>

            {/* Accordions */}
            <Accordion type="multiple" className="w-full">
              <AccordionItem value="story" className="border-foreground/10">
                <AccordionTrigger className="font-serif text-base text-foreground hover:no-underline py-4">
                  L'Histoire du Nom
                </AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/70 leading-relaxed pb-4">
                  {product.histoire ||
                    "Chaque pièce Ngalam porte le nom d'un lieu emblématique d'Afrique de l'Ouest, en hommage à la richesse culturelle et architecturale du continent."}
                </AccordionContent>
              </AccordionItem>
              {product.valeur && (
                <AccordionItem value="valeur" className="border-foreground/10">
                  <AccordionTrigger className="font-serif text-base text-foreground hover:no-underline py-4">
                    La Valeur
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-foreground/70 leading-relaxed pb-4">
                    {product.valeur}
                  </AccordionContent>
                </AccordionItem>
              )}
              <AccordionItem value="material" className="border-foreground/10">
                <AccordionTrigger className="font-serif text-base text-foreground hover:no-underline py-4">
                  Matière &amp; Entretien
                </AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/70 leading-relaxed pb-4">
                  Acier inoxydable 316L. Résistant à l'eau, au chlore
                  et à la transpiration. Nettoyez simplement avec un chiffon doux.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="shipping" className="border-foreground/10">
                <AccordionTrigger className="font-serif text-base text-foreground hover:no-underline py-4">
                  Livraison &amp; Retours
                </AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/70 leading-relaxed pb-4">
                  Livraison offerte dès 100€ d'achat. Expédition sous 48h.
                  Retours gratuits sous 14 jours dans leur emballage d'origine.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>

        {/* Cross-sell */}
        {crossSell && crossSell.length > 0 && (
          <section className="mt-16 md:mt-24">
            <h3 className="text-center font-serif text-2xl sm:text-3xl text-foreground mb-8 md:mb-12">
              Complète le sañse
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 max-w-4xl mx-auto">
              {crossSell.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default ProductDetail;
