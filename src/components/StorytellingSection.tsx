import { Link } from "react-router-dom";
import { Play } from "lucide-react";

const StorytellingSection = () => {
  return (
    <section className="bg-background border-t border-gold/40 py-14 md:py-24 px-5 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* En-tête Centré */}
        <div className="text-center mb-10 md:mb-16">
          <span className="text-primary text-[10px] sm:text-xs tracking-[0.25em] font-bold uppercase block mb-3 md:mb-4">
            Notes de Voyage
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl md:text-5xl text-foreground leading-tight">
            L'Esprit de Dakar.
          </h2>
        </div>

        {/* Grille 3 colonnes */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 items-center">
          {/* Colonne 1 — Le Récit */}
          <div className="flex flex-col justify-center items-start max-w-xs">
            <p className="font-sans text-sm leading-relaxed text-foreground/75 text-justify mb-8">
              De la Corniche au Plateau, une lumière unique. Nous avons capturé cet éclat dans des pièces fortes, qui habillent une tenue à elles seules.
            </p>
            <Link
              to="/journal/signares"
              className="text-primary font-sans text-sm font-medium underline underline-offset-4 hover:text-gold transition-colors w-fit"
            >
              Voir le Moodboard
            </Link>
          </div>

          {/* Colonne 2 — Le Moodboard */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-[280px] mx-auto">
              {/* Cadre arrière — archive N&B */}
              <div className="aspect-[3/4] w-[85%] bg-foreground/20 rounded-sm flex items-center justify-center">
                <span className="text-foreground/30 text-[10px] tracking-[0.15em] uppercase">
                  Archive N&B
                </span>
              </div>
              {/* Cadre devant — texture or */}
              <div className="aspect-[3/4] w-[55%] bg-gold/40 rounded-sm absolute top-12 right-0 flex items-center justify-center shadow-xl border border-gold/20">
                <span className="text-foreground/50 text-[10px] tracking-[0.15em] uppercase">
                  Texture Or
                </span>
              </div>
            </div>
          </div>

          {/* Colonne 3 — Le Viral / TikTok */}
          <div className="flex flex-col items-center justify-center">
            <div className="aspect-[9/16] w-full max-w-[200px] bg-muted rounded-sm flex items-center justify-center relative cursor-pointer group">
              <div className="w-14 h-14 rounded-full bg-foreground/10 flex items-center justify-center group-hover:bg-gold/30 transition-colors">
                <Play className="w-6 h-6 text-foreground/50 group-hover:text-gold transition-colors ml-0.5" />
              </div>
            </div>
            <p className="text-xs text-foreground/50 mt-4 tracking-wide text-center">
              L'histoire virale (Vue 150k fois)
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StorytellingSection;
