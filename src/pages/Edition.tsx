import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import WaitlistForm from "@/components/edition/WaitlistForm";
import DropCountdown from "@/components/edition/DropCountdown";
import Vestiaire from "@/components/edition/Vestiaire";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SHOP_SELECT,
  getGalleryUrls,
  getFinishes,
  getPriceInfo,
  type ShopProduct,
} from "@/lib/products";
import {
  type Campaign,
  isCampaignLive,
  isCampaignClosed,
  formatParisDate,
} from "@/lib/edition";

const FINISH_DOT: Record<string, string> = { or: "bg-accent", argent: "bg-muted-foreground" };

/* ---------- La capsule : pièces du drop, rendu habité (pas catalogue) ---------- */
const CapsulePiece = ({ product, closesAt }: { product: ShopProduct; closesAt: string }) => {
  const images = getGalleryUrls(product);
  const finishes = getFinishes(product);
  const { min, from } = getPriceInfo(product);
  return (
    <article className="group">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-[3/4] bg-muted rounded-sm overflow-hidden mb-5">
          {images[0] ? (
            <img src={images[0]} alt={product.name} className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs tracking-[0.15em] uppercase">Pièce</div>
          )}
        </div>
      </Link>
      {product.wolof_name && (
        <span className="block font-serif text-lg text-primary italic leading-tight">{product.wolof_name}</span>
      )}
      <h3 className="font-serif text-2xl sm:text-3xl text-foreground leading-tight">
        <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors">{product.name}</Link>
      </h3>
      <div className="flex items-center gap-3 mt-2">
        <span className="font-sans text-base font-medium text-foreground/80">
          {from ? "à partir de " : ""}{min}&nbsp;€
        </span>
        {finishes.length > 0 && (
          <span className="flex items-center gap-1">
            {finishes.map((f) => (
              <span key={f} className={`w-3 h-3 rounded-full border border-foreground/15 ${FINISH_DOT[f] ?? "bg-muted"}`} title={f} />
            ))}
          </span>
        )}
      </div>
      <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground mt-3">
        Édition limitée · se referme le {formatParisDate(closesAt)}
      </p>
    </article>
  );
};

const Edition = () => {
  // Horloge de page : pilote countdown + bascule d'état à la fermeture.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const { data: campaigns, isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("opens_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Campaign[];
    },
  });

  const live = useMemo(
    () => campaigns?.find((c) => isCampaignLive(c, now)) ?? null,
    [campaigns, now]
  );
  const closed = useMemo(
    () => (campaigns ?? []).filter((c) => isCampaignClosed(c, now)),
    [campaigns, now]
  );
  const hasAny = (campaigns?.length ?? 0) > 0;

  // Produits du drop live (capsule).
  const { data: dropProducts } = useQuery<ShopProduct[]>({
    queryKey: ["drop-products", live?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select(SHOP_SELECT)
        .eq("drop_id", live!.id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ShopProduct[];
    },
    enabled: !!live,
  });

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {isLoading ? (
          <div className="max-w-6xl mx-auto px-5 md:px-6 py-20">
            <Skeleton className="h-[50vh] w-full rounded-sm mb-8" />
            <Skeleton className="h-8 w-1/3 mb-4" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : live ? (
          /* ============ ÉTAT A — drop LIVE ============ */
          <>
            {/* HERO cinématique */}
            <section
              className="relative min-h-[85vh] flex items-center justify-center overflow-hidden"
              style={live.hero_image ? { backgroundImage: `url(${live.hero_image})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
            >
              <div className="absolute inset-0 bg-foreground/55" />
              <div className="relative z-10 text-center px-5 md:px-6 py-20 max-w-3xl">
                <span className="text-primary-foreground/70 text-[10px] sm:text-xs tracking-[0.35em] uppercase block mb-5">
                  L'ÉDITION · La figure du mois
                </span>
                {live.valeur && (
                  <span className="block font-serif text-lg sm:text-xl italic text-accent mb-3">{live.valeur}</span>
                )}
                <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl text-primary-foreground leading-[1.05] mb-5">
                  {live.title}
                </h1>
                {live.subtitle && (
                  <p className="font-sans text-base sm:text-lg text-primary-foreground/85 max-w-xl mx-auto mb-10">
                    {live.subtitle}
                  </p>
                )}
                <DropCountdown closesAt={live.closes_at} now={now} />
              </div>
            </section>

            {/* RÉCIT */}
            {live.story && (
              <section className="py-16 md:py-28 px-5 md:px-6">
                <div className="max-w-2xl mx-auto">
                  <span className="text-primary text-[10px] sm:text-xs tracking-[0.3em] font-bold uppercase block mb-6 text-center">
                    Le Récit
                  </span>
                  <div className="font-serif text-xl sm:text-2xl text-foreground/90 leading-relaxed whitespace-pre-line text-center">
                    {live.story}
                  </div>
                </div>
              </section>
            )}

            {/* LA CAPSULE */}
            <section className="py-12 md:py-20 px-5 md:px-6 bg-secondary/40">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10 md:mb-14">
                  <span className="text-primary text-[10px] sm:text-xs tracking-[0.3em] font-bold uppercase block mb-3">
                    La Capsule
                  </span>
                  <h2 className="font-serif text-3xl sm:text-4xl text-foreground">Les pièces de {live.title}</h2>
                </div>
                {dropProducts && dropProducts.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
                    {dropProducts.map((p) => (
                      <CapsulePiece key={p.id} product={p} closesAt={live.closes_at} />
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground italic">Les pièces de cette Édition se dévoilent bientôt.</p>
                )}
              </div>
            </section>

            {/* WAITLIST du drop */}
            <section className="py-16 md:py-24 px-5 md:px-6 text-center">
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-3">Rejoins le Cercle</h2>
              <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-8">
                Sois prévenue avant tout le monde de l'ouverture des prochaines Éditions, et des dernières heures de celle-ci.
              </p>
              <WaitlistForm campaignId={live.id} />
            </section>
          </>
        ) : hasAny ? (
          /* ============ ÉTAT B — pas de live, mais des drops existent ============ */
          <>
            <section className="py-20 md:py-32 px-5 md:px-6 text-center">
              <span className="text-primary text-[10px] sm:text-xs tracking-[0.3em] font-bold uppercase block mb-5">
                L'Édition
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.1] mb-6 max-w-2xl mx-auto">
                La prochaine Édition se prépare.
              </h1>
              <p className="font-sans text-base sm:text-lg text-foreground/70 max-w-xl mx-auto mb-10">
                Chaque mois, une femme, une valeur, une capsule rare — ouverte quelques jours, puis refermée à jamais. Rejoins le Cercle pour être prévenue à l'ouverture.
              </p>
              <WaitlistForm campaignId={null} />
            </section>
            <Vestiaire closed={closed} />
          </>
        ) : (
          /* ============ ÉTAT C — aucun drop (première impression) ============ */
          <>
            <section className="relative min-h-[80vh] flex items-center justify-center px-5 md:px-6 overflow-hidden">
              <div className="max-w-2xl mx-auto text-center py-20">
                <span className="text-primary text-[10px] sm:text-xs tracking-[0.35em] uppercase block mb-6">
                  L'Édition
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.08] mb-8">
                  Chaque mois, une Édition.
                </h1>
                <div className="font-serif text-lg sm:text-xl text-foreground/80 leading-relaxed space-y-5 mb-12">
                  <p>
                    Une femme, une valeur wolof, un récit. Une capsule de quelques pièces, façonnées pour elle — ouverte le temps d'une lune, puis refermée à jamais.
                  </p>
                  <p className="text-muted-foreground">
                    Ce qui entre au Vestiaire n'en ressort plus. Ce que tu portes, personne ne le rachètera.
                  </p>
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-6">
                  Le Cercle s'ouvre avant les portes
                </p>
                <WaitlistForm campaignId={null} />
              </div>
            </section>
            <Vestiaire closed={closed} />
          </>
        )}
      </main>
      <SiteFooter />
    </div>
  );
};

export default Edition;
