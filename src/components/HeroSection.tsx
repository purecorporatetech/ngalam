import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { HOME_HERO_KEY, DEFAULT_HOME_HERO, parseHomeHero } from "@/lib/siteSettings";

const HeroSection = () => {
  // Hero piloté par site_settings.home_hero. Fallback local systématique :
  // la home ne doit jamais casser si la requête échoue ou renvoie vide.
  const { data } = useQuery({
    queryKey: ["site-settings", HOME_HERO_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings").select("value").eq("key", HOME_HERO_KEY).maybeSingle();
      if (error) throw error;
      return data?.value ?? null;
    },
  });

  const hero = parseHomeHero(data ?? DEFAULT_HOME_HERO);
  const hasMedia = !!hero.media_url;
  const light = hasMedia; // texte clair sur media sombre, sinon texte foncé sur fond token

  return (
    <section className={`relative min-h-[70vh] md:min-h-[80vh] flex flex-col justify-center items-center text-center overflow-hidden ${hasMedia ? "" : "bg-secondary"}`}>
      {/* Media plein écran (image ou vidéo) + overlay pour lisibilité */}
      {hasMedia && (
        <>
          {hero.media_type === "video" ? (
            <video
              className="absolute inset-0 w-full h-full object-cover"
              src={hero.media_url!}
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img src={hero.media_url!} alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover" />
          )}
          <div className="absolute inset-0 bg-foreground/45" />
        </>
      )}

      <div className="relative z-10 px-5 md:px-6 max-w-4xl mx-auto py-20">
        {hero.eyebrow && (
          <span className={`inline-block text-[10px] md:text-xs uppercase tracking-[0.3em] mb-3 md:mb-4 font-medium animate-fade-up ${light ? "text-primary-foreground/80" : "text-primary"}`}>
            {hero.eyebrow}
          </span>
        )}
        <h1 className={`font-serif text-3xl sm:text-5xl md:text-7xl mb-4 md:mb-6 animate-fade-up tracking-tight leading-[1.1] ${light ? "text-primary-foreground" : "text-foreground"}`}>
          {hero.title}
        </h1>
        {hero.subtitle && (
          <p className={`font-sans text-base md:text-lg tracking-wide mb-6 md:mb-8 max-w-md md:max-w-xl mx-auto animate-fade-up ${light ? "text-primary-foreground/85" : "text-muted-foreground"}`} style={{ animationDelay: "0.15s" }}>
            {hero.subtitle}
          </p>
        )}
        {hero.cta_label && (
          <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Button asChild size="lg" className="rounded-sm px-6 md:px-8 py-3 md:py-4 h-auto text-[10px] md:text-xs uppercase tracking-[0.25em]">
              <Link to={hero.cta_href || "/boutique"}>{hero.cta_label}</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;
