import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ProductCard from "@/components/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  SHOP_SELECT,
  CATEGORIES,
  CATEGORY_LABELS,
  FINISHES,
  getFinishes,
  getPriceInfo,
  type ShopProduct,
  type CategoryKey,
} from "@/lib/products";

interface BoutiqueProps {
  category?: CategoryKey;
}

const Boutique = ({ category }: BoutiqueProps) => {
  const [finishFilters, setFinishFilters] = useState<string[]>([]);
  const [availability, setAvailability] = useState<string>("all");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const { data: products, isLoading } = useQuery<ShopProduct[]>({
    queryKey: ["shop-products", category ?? "all"],
    queryFn: async () => {
      let query = supabase
        .from("products")
        .select(SHOP_SELECT)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (category) query = query.eq("category_key", category);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ShopProduct[];
    },
  });

  const toggleFinish = (f: string) =>
    setFinishFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  const filtered = useMemo(() => {
    if (!products) return [];
    const min = priceMin === "" ? null : parseFloat(priceMin);
    const max = priceMax === "" ? null : parseFloat(priceMax);
    return products.filter((p) => {
      if (availability !== "all" && p.availability !== availability) return false;
      if (finishFilters.length > 0) {
        const finishes = getFinishes(p);
        if (!finishFilters.some((f) => finishes.includes(f))) return false;
      }
      const price = getPriceInfo(p).min;
      if (min != null && price < min) return false;
      if (max != null && price > max) return false;
      return true;
    });
  }, [products, availability, finishFilters, priceMin, priceMax]);

  const title = category ? CATEGORY_LABELS[category] : "La Boutique";

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-6xl mx-auto px-5 md:px-6 py-10 md:py-16">
        <header className="text-center mb-8 md:mb-12">
          <span className="text-primary text-[10px] sm:text-xs tracking-[0.3em] font-bold uppercase block mb-3">
            Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-foreground">{title}</h1>
        </header>

        {/* Catégories */}
        <nav className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <Button asChild variant={!category ? "default" : "outline"} size="sm">
            <Link to="/boutique">Tout</Link>
          </Button>
          {CATEGORIES.map((c) => (
            <Button key={c.key} asChild variant={category === c.key ? "default" : "outline"} size="sm">
              <Link to={c.path}>{c.label}</Link>
            </Button>
          ))}
        </nav>

        {/* Filtres */}
        <div className="flex flex-wrap items-end gap-4 justify-center mb-10 border-y border-border py-5">
          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Finition</Label>
            <div className="flex gap-2">
              {FINISHES.map((f) => (
                <Button
                  key={f.key}
                  type="button"
                  variant={finishFilters.includes(f.key) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleFinish(f.key)}
                >
                  {f.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Disponibilité</Label>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="permanent">Permanent</SelectItem>
                <SelectItem value="drop">Édition limitée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Prix (€)</Label>
            <div className="flex items-center gap-2">
              <Input type="number" min="0" placeholder="min" value={priceMin} onChange={(e) => setPriceMin(e.target.value)} className="w-24" />
              <span className="text-muted-foreground">—</span>
              <Input type="number" min="0" placeholder="max" value={priceMax} onChange={(e) => setPriceMax(e.target.value)} className="w-24" />
            </div>
          </div>
        </div>

        {/* Grille */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-6 md:gap-y-12">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="aspect-[3/4] mb-4 rounded-sm" />
                <Skeleton className="h-5 w-3/4 mb-1" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-serif text-xl sm:text-2xl text-foreground mb-2">
              Bientôt, les premières pièces
            </p>
            <p className="text-sm text-muted-foreground">
              {products && products.length > 0
                ? "Aucun produit ne correspond à ces filtres."
                : "Cette catégorie n'a pas encore de pièce disponible."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-3 sm:gap-x-6 gap-y-6 md:gap-y-12">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default Boutique;
