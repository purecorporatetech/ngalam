import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const MAX_STOCK = 50;

/* ---------- countdown helper ---------- */
const TARGET = new Date();
TARGET.setDate(TARGET.getDate() + 4);
TARGET.setHours(TARGET.getHours() + 12);
TARGET.setMinutes(TARGET.getMinutes() + 30);

function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc), 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

/* ---------- data ---------- */
const coffretItems = [
  { name: "Le Collier Yoff", value: "59€" },
  { name: "La Bague N'Gor", value: "45€" },
  { name: "Les Créoles Mermoz", value: "39€" },
  { name: "Le Bracelet Corniche", value: "45€" },
];

const CoffretDakar = () => {
  const countdown = useCountdown(TARGET);

  const { data: product } = useQuery({
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

  const stock = product?.stock_quantity ?? 12;
  const stockPercent = Math.round((stock / MAX_STOCK) * 100);
  const price = product?.price ?? 129;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* 1. HERO */}
      <section className="bg-primary text-primary-foreground">
        <div className="max-w-6xl mx-auto px-5 md:px-6 py-14 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-14 items-center">
            <div>
              <span className="text-accent text-[10px] sm:text-xs tracking-[0.25em] font-bold uppercase block mb-4">
                Édition Limitée • Février
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-2 md:mb-3">
                COFFRET SIGNARES
              </h1>
              <span className="text-primary-foreground/50 text-[10px] sm:text-xs uppercase tracking-[0.2em] block mb-4 md:mb-6">
                Chapitre 1 : Dakar
              </span>
              <p className="font-sans text-base sm:text-lg text-primary-foreground/75 mb-8 max-w-md">
                Hommage aux reines de l'élégance de Saint-Louis. Une parure pour celles qui portent l'histoire comme une seconde peau.
              </p>

              {/* Countdown */}
              <div className="mb-8">
                <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-primary-foreground/50 block mb-3">
                  Fin des ventes dans
                </span>
                <div className="flex gap-3 sm:gap-4">
                  {[
                    { v: countdown.days, l: "Jours" },
                    { v: countdown.hours, l: "Heures" },
                    { v: countdown.minutes, l: "Min" },
                    { v: countdown.seconds, l: "Sec" },
                  ].map((u) => (
                    <div key={u.l} className="flex flex-col items-center">
                      <span className="font-serif text-2xl sm:text-3xl md:text-4xl tabular-nums">
                        {String(u.v).padStart(2, "0")}
                      </span>
                      <span className="text-[9px] sm:text-[10px] uppercase tracking-wider text-primary-foreground/50 mt-1">
                        {u.l}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stock bar */}
              <div className="max-w-sm mb-2">
                <div className="h-1.5 w-full rounded-full bg-primary-foreground/15">
                  <div className="h-1.5 rounded-full bg-accent transition-all" style={{ width: `${stockPercent}%` }} />
                </div>
              </div>
              <span className="text-accent text-xs tracking-wide block mb-8">
                {stock}/{MAX_STOCK} exemplaires restants
              </span>

              {/* CTA */}
              {product ? (
                <Link
                  to={`/product/${product.id}`}
                  className="w-full sm:w-auto bg-accent text-accent-foreground px-8 py-4 font-bold uppercase text-[10px] sm:text-xs tracking-[0.2em] rounded-sm hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 inline-flex"
                >
                  <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                  Réserver Mon Écrin — {price}€
                </Link>
              ) : (
                <button className="w-full sm:w-auto bg-accent text-accent-foreground px-8 py-4 font-bold uppercase text-[10px] sm:text-xs tracking-[0.2em] rounded-sm hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
                  <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                  Réserver Mon Écrin — {price}€
                </button>
              )}
              <p className="text-primary-foreground/40 text-xs mt-3">
                <span className="line-through">180€</span>{" "}
                <span className="text-accent font-medium">-28%</span>
              </p>
            </div>

            {/* Right — Image */}
            <div className="aspect-square bg-primary-foreground/10 rounded-sm flex items-center justify-center order-first md:order-last overflow-hidden">
              {product?.image_url ? (
                <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-primary-foreground/25 text-xs tracking-[0.15em] uppercase text-center px-4">
                  Visuel Coffret (À venir)
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. L'UNBOXING */}
      <section className="bg-background py-14 md:py-24 px-5 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <span className="text-primary text-[10px] sm:text-xs tracking-[0.25em] font-bold uppercase block mb-3">
              Ce que contient le coffret
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground">
              4 Trésors, 1 Histoire
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-10 md:mb-14">
            {coffretItems.map((item) => (
              <div key={item.name} className="group">
                <div className="aspect-[3/4] bg-muted rounded-sm flex items-center justify-center mb-2 sm:mb-3">
                  <span className="text-muted-foreground/40 text-[10px] sm:text-xs tracking-[0.12em] uppercase text-center px-2">
                    Photo à venir
                  </span>
                </div>
                <h3 className="font-serif text-xs sm:text-base text-foreground leading-tight">
                  {item.name}
                </h3>
                <span className="font-sans text-[10px] sm:text-sm text-foreground/60">
                  Valeur : {item.value}
                </span>
              </div>
            ))}
          </div>

          <div className="bg-primary rounded-sm p-6 sm:p-8 text-center text-primary-foreground">
            <p className="text-sm sm:text-base text-primary-foreground/60 mb-1">
              Valeur Totale : <span className="line-through">188€</span>
            </p>
            <p className="font-serif text-3xl sm:text-4xl md:text-5xl">
              Prix Coffret : <span className="text-accent">{price}€</span>
            </p>
          </div>
        </div>
      </section>

      {/* 3. GARANTIE TAILLE */}
      <section className="bg-secondary/50 py-12 md:py-20 px-5 md:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/15 flex items-center justify-center">
            <svg className="w-8 h-8 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 3.13-9 7s4.03 7 9 7 9-3.13 9-7-4.03-7-9-7Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.5 7.5 12 3l3.5 4.5" />
            </svg>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-foreground mb-4">
            Pas de stress pour la taille
          </h2>
          <p className="font-sans text-sm sm:text-base text-foreground/70 leading-relaxed max-w-lg mx-auto">
            La bague N'Gor est <span className="font-medium text-foreground">ajustable</span> et
            s'adapte à tous les doigts. Si ça ne va pas, l'échange est gratuit.
          </p>
        </div>
      </section>

      {/* 4. Second CTA */}
      <section className="bg-primary py-12 md:py-16 px-5 md:px-6 text-center">
        <p className="font-serif text-xl sm:text-2xl text-primary-foreground mb-6">
          Ne manquez pas cette édition
        </p>
        {product ? (
          <Link
            to={`/product/${product.id}`}
            className="bg-accent text-accent-foreground px-8 py-4 font-bold uppercase text-[10px] sm:text-xs tracking-[0.2em] rounded-sm hover:bg-accent/90 transition-colors inline-flex items-center gap-2"
          >
            Réserver Mon Écrin — {price}€
            <ArrowRight className="w-4 h-4" />
          </Link>
        ) : (
          <button className="bg-accent text-accent-foreground px-8 py-4 font-bold uppercase text-[10px] sm:text-xs tracking-[0.2em] rounded-sm hover:bg-accent/90 transition-colors inline-flex items-center gap-2">
            Réserver Mon Écrin — {price}€
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </section>

      <SiteFooter />

      {/* STICKY BAR (Mobile) */}
      <div className="fixed bottom-0 inset-x-0 z-50 md:hidden bg-primary border-t border-primary-foreground/10 px-4 py-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="font-serif text-sm text-primary-foreground truncate">Coffret Signares</p>
          <p className="text-[10px] text-accent tracking-wider uppercase">Édition Limitée</p>
        </div>
        {product ? (
          <Link
            to={`/product/${product.id}`}
            className="flex-shrink-0 bg-accent text-accent-foreground px-5 py-2.5 font-bold uppercase text-[10px] tracking-[0.15em] rounded-sm hover:bg-accent/90 transition-colors whitespace-nowrap"
          >
            Ajouter — {price}€
          </Link>
        ) : (
          <button className="flex-shrink-0 bg-accent text-accent-foreground px-5 py-2.5 font-bold uppercase text-[10px] tracking-[0.15em] rounded-sm hover:bg-accent/90 transition-colors whitespace-nowrap">
            Ajouter — {price}€
          </button>
        )}
      </div>

      <div className="h-16 md:hidden" />
    </div>
  );
};

export default CoffretDakar;
