import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/ProductCard";
import { SHOP_SELECT, type ShopProduct } from "@/lib/products";

const CollectionGrid = () => {
  const { data: products, isLoading } = useQuery<ShopProduct[]>({
    queryKey: ["essentials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(SHOP_SELECT)
        .eq("availability", "permanent")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return (data ?? []) as ShopProduct[];
    },
  });

  return (
    <section className="bg-background py-14 md:py-24 px-5 md:px-6">
      <h2 className="text-center font-serif text-2xl sm:text-3xl text-foreground mb-8 md:mb-12">
        Les Essentiels
      </h2>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-6 md:gap-y-12 max-w-6xl mx-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="aspect-[3/4] mb-4 rounded-sm" />
              <Skeleton className="h-5 w-3/4 mb-1" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          ))}
        </div>
      ) : products && products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-6 md:gap-y-12 max-w-6xl mx-auto">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <p className="text-center font-serif text-lg text-muted-foreground italic max-w-md mx-auto py-6">
          Les premières pièces arrivent bientôt.
        </p>
      )}

      <div className="text-center mt-10 md:mt-14">
        <Link
          to="/boutique"
          className="inline-block text-xs uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground border-b border-foreground/30 pb-1 transition-colors"
        >
          Voir toute la boutique
        </Link>
      </div>
    </section>
  );
};

export default CollectionGrid;
