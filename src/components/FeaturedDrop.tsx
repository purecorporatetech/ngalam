import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const MAX_STOCK = 50;

const FeaturedDrop = () => {
  const { data: product, isLoading } = useQuery({
    queryKey: ["featured-drop"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("category", "Drop")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="grid grid-cols-1 md:grid-cols-2 min-h-[500px] md:min-h-[600px]">
        <div className="bg-primary flex flex-col justify-center items-start p-8 sm:p-12 md:p-20">
          <Skeleton className="h-4 w-32 mb-6 bg-primary-foreground/10" />
          <Skeleton className="h-10 w-64 mb-6 bg-primary-foreground/10" />
          <Skeleton className="h-5 w-80 mb-8 bg-primary-foreground/10" />
          <Skeleton className="h-12 w-48 bg-primary-foreground/10" />
        </div>
        <Skeleton className="min-h-[250px] sm:min-h-[350px] md:min-h-0" />
      </section>
    );
  }

  if (!product) return null;

  const stockPercent = Math.round((product.stock_quantity / MAX_STOCK) * 100);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 min-h-[500px] md:min-h-[600px]">
      {/* Left column - Text */}
      <div className="bg-primary flex flex-col justify-center items-start p-8 sm:p-12 md:p-20">
        <span className="text-gold text-[10px] sm:text-xs tracking-[0.2em] font-bold mb-4 md:mb-6 uppercase">
          Édition Limitée • Février
        </span>

        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight mb-4 md:mb-6 text-secondary">
          4 BIJOUX. 1 ALLURE.
        </h2>

        <p className="font-sans text-base md:text-lg mb-6 md:mb-8 text-secondary/80 max-w-md">
          L'art du « Stacking » maîtrisé. Une parure complète pensée pour être portée ensemble, sans fausse note. Édition numérotée et limitée à 50 exemplaires.
        </p>

        <p className="font-sans text-xs sm:text-sm mb-6 md:mb-8 text-gold tracking-wide">
          Bijoux waterproof garantis sans ternissement.
        </p>

        {/* Stock bar */}
        <div className="w-full max-w-sm mb-2">
          <div className="h-1 w-full rounded-full bg-secondary/20">
            <div className="h-1 rounded-full bg-gold transition-all" style={{ width: `${stockPercent}%` }} />
          </div>
        </div>
        <span className="text-gold text-[10px] sm:text-xs tracking-wide mb-8 md:mb-10">
          {product.stock_quantity}/{MAX_STOCK} exemplaires restants
        </span>

        <Link
          to={`/product/${product.id}`}
          className="bg-secondary text-primary px-6 sm:px-8 py-3 sm:py-4 font-bold uppercase text-[10px] sm:text-xs tracking-[0.25em] rounded-sm hover:bg-secondary/90 transition-colors w-full sm:w-auto text-center inline-block"
        >
          Réserver Mon Coffret — {product.price}€
        </Link>
      </div>

      {/* Right column - Image */}
      <div className="bg-muted flex items-center justify-center min-h-[250px] sm:min-h-[350px] md:min-h-0 overflow-hidden">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-muted-foreground text-sm tracking-[0.15em] uppercase">
            Visuel Coffret (À venir)
          </span>
        )}
      </div>
    </section>
  );
};

export default FeaturedDrop;
