import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const CollectionGrid = () => {
  const { data: products, isLoading } = useQuery({
    queryKey: ["essentials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .neq("category", "Drop")
        .order("created_at", { ascending: false })
        .limit(4);
      if (error) throw error;
      return data;
    },
  });

  return (
    <section className="bg-background py-14 md:py-24 px-5 md:px-6">
      <h2 className="text-center font-serif text-2xl sm:text-3xl text-foreground mb-8 md:mb-12">
        Les Essentiels Solaires
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-6 md:gap-y-12 max-w-6xl mx-auto">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] mb-4 rounded-sm" />
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))
          : products?.map((product) => (
              <div key={product.id} className="group">
                <Link to={`/product/${product.id}`}>
                  <div className="aspect-[3/4] bg-muted mb-4 relative flex items-center justify-center rounded-sm overflow-hidden">
                    {product.is_featured && (
                      <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-[10px] px-2 py-1 uppercase tracking-wider z-10">
                        BEST SELLER
                      </span>
                    )}
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-muted-foreground/40 text-xs tracking-[0.15em] uppercase">
                        Photo à venir
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-serif text-lg text-foreground leading-tight">
                      <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors">
                        {product.name}
                      </Link>
                    </h3>
                    <span className="font-sans font-medium text-sm text-foreground/70">{product.price}€</span>
                  </div>
                  <button
                    aria-label={`Ajouter ${product.name}`}
                    className="mt-1 w-7 h-7 flex items-center justify-center border border-foreground/20 rounded-sm text-foreground/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={2} />
                  </button>
                </div>
              </div>
            ))}
      </div>
    </section>
  );
};

export default CollectionGrid;
