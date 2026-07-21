import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type Campaign, isCampaignLive, formatParisDate } from "@/lib/edition";

// Bandeau discret en tête de boutique, visible uniquement si une Édition est
// réellement ouverte (status='live' ET fenêtre en cours — calcul côté app).
const EditionTeaser = () => {
  const { data: campaigns } = useQuery<Campaign[]>({
    queryKey: ["edition-teaser-live"],
    queryFn: async () => {
      const { data, error } = await supabase.from("campaigns").select("*").eq("status", "live");
      if (error) throw error;
      return (data ?? []) as Campaign[];
    },
  });

  const live = (campaigns ?? []).find((c) => isCampaignLive(c));
  if (!live) return null;

  return (
    <Link
      to="/edition"
      className="group block bg-primary text-primary-foreground rounded-sm overflow-hidden mb-8 md:mb-10"
    >
      <div className="flex items-stretch">
        {live.hero_image && (
          <div className="hidden sm:block w-28 md:w-40 shrink-0">
            <img src={live.hero_image} alt={live.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="flex-1 flex items-center justify-between gap-4 px-5 md:px-8 py-4 md:py-5">
          <div className="min-w-0">
            <span className="block text-[10px] sm:text-xs tracking-[0.3em] uppercase text-primary-foreground/60 mb-1">
              L'Édition · en cours
            </span>
            <span className="font-serif text-xl sm:text-2xl leading-tight block truncate">{live.title}</span>
            <span className="text-xs sm:text-sm text-primary-foreground/75">
              {live.valeur ? `${live.valeur} · ` : ""}se referme le {formatParisDate(live.closes_at)}
            </span>
          </div>
          <span className="shrink-0 inline-flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold border-b border-primary-foreground/40 pb-1 group-hover:border-primary-foreground transition-colors">
            Découvrir l'Édition
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default EditionTeaser;
