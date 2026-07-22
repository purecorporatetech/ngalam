import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Bloc récit éditorial (remplace « Notes de voyage »). Textes provisoires sobres.
const StorySection = () => {
  return (
    <section className="bg-background border-t border-foreground/10 py-16 md:py-24 px-5 md:px-6">
      <div className="max-w-2xl mx-auto text-center">
        <span className="text-primary text-[10px] sm:text-xs tracking-[0.3em] font-bold uppercase block mb-4">
          L'héritage
        </span>
        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground leading-tight mb-6">
          Une histoire qui se porte
        </h2>
        <p className="font-sans text-sm sm:text-base text-foreground/70 leading-relaxed mb-8">
          Chaque pièce puise dans la mémoire des villes d'Afrique de l'Ouest — leurs
          architectures, leurs figures, leurs gestes. Nous les traduisons en bijoux
          pensés pour être portés au quotidien.
        </p>
        <Link
          to="/journal/signares"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground border-b border-foreground/30 pb-1 transition-colors"
        >
          Découvrir l'histoire
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
};

export default StorySection;
