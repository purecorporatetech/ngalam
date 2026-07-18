import { Link, useParams } from "react-router-dom";
import { ChevronRight, ShoppingBag, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const ProductDetail = () => {
  const { addItem } = useCart();
  const { id } = useParams<{ id: string }>();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: crossSell } = useQuery({
    queryKey: ["cross-sell", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .neq("id", id!)
        .neq("category", "Drop")
        .limit(3);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!product || product.stock_quantity <= 0) return;
    addItem({ id: product.id, name: product.name, price: product.price, image_url: product.image_url });
    toast.success(`${product.name} ajouté au panier`);
  };

  const isOutOfStock = product && product.stock_quantity <= 0;

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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-5 md:px-6 py-8 md:py-14">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6 md:mb-10">
          <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
          <ChevronRight className="w-3 h-3" />
          <span>{product.category}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14">
          {/* LEFT — Image */}
          <div>
            <div className="aspect-[3/4] bg-muted rounded-sm relative flex items-center justify-center overflow-hidden">
              {product.is_featured && (
                <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-[10px] px-2.5 py-1 uppercase tracking-wider font-bold z-10">
                  Best Seller
                </span>
              )}
              {product.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-muted-foreground/40 text-xs tracking-[0.15em] uppercase">
                  Photo principale
                </span>
              )}
            </div>
          </div>

          {/* RIGHT — Info & Purchase */}
          <div className="flex flex-col">
            <h1 className="font-serif text-3xl sm:text-4xl text-foreground mb-3">
              {product.name}
            </h1>
            <p className="font-serif text-sm italic text-primary mb-2">
              Inspiré par les courbes de l'Hôtel Indépendance.
            </p>
            <span className="font-sans text-xl font-medium text-foreground mb-5">
              {product.price}&nbsp;€
            </span>

            <p className="font-sans text-sm leading-relaxed text-foreground/75 mb-6">
              {product.description || "Un bijou élégant en acier inoxydable, finition Or PVD."}
            </p>

            {/* Finish selector */}
            <div className="mb-6">
              <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2 block">
                Finition
              </span>
              <div className="inline-flex items-center gap-2 border border-primary/30 rounded-sm px-4 py-2 text-sm text-foreground">
                <span className="w-3 h-3 rounded-full bg-accent" />
                Or (PVD)
              </div>
            </div>

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
              disabled={!!isOutOfStock}
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
                  Chaque pièce Ngalam porte le nom d'un lieu emblématique d'Afrique de l'Ouest,
                  en hommage à la richesse culturelle et architecturale du continent.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="material" className="border-foreground/10">
                <AccordionTrigger className="font-serif text-base text-foreground hover:no-underline py-4">
                  Matière &amp; Entretien
                </AccordionTrigger>
                <AccordionContent className="text-sm text-foreground/70 leading-relaxed pb-4">
                  Acier inoxydable 316L avec finition Or PVD. Résistant à l'eau, au chlore
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
              Elles se portent bien ensemble
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 sm:gap-x-6 gap-y-8 max-w-4xl mx-auto">
              {crossSell.map((p) => (
                <div key={p.id} className="group">
                  <Link to={`/product/${p.id}`}>
                    <div className="aspect-[3/4] bg-muted mb-3 relative flex items-center justify-center rounded-sm overflow-hidden">
                      {p.is_featured && (
                        <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-[10px] px-2 py-1 uppercase tracking-wider z-10">
                          BEST SELLER
                        </span>
                      )}
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-muted-foreground/40 text-xs tracking-[0.15em] uppercase">
                          Photo à venir
                        </span>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif text-base sm:text-lg text-foreground leading-tight">
                        <Link to={`/product/${p.id}`} className="hover:text-primary transition-colors">
                          {p.name}
                        </Link>
                      </h4>
                      <span className="font-sans font-medium text-sm text-foreground/70">
                        {p.price}€
                      </span>
                    </div>
                    <button
                      aria-label={`Ajouter ${p.name}`}
                      onClick={() => {
                        addItem({ id: p.id, name: p.name, price: p.price, image_url: p.image_url });
                        toast.success(`${p.name} ajouté au panier`);
                      }}
                      className="mt-1 w-7 h-7 flex items-center justify-center border border-foreground/20 rounded-sm text-foreground/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </div>
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
