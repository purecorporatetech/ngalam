import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-jewelry.jpg";

const trustItems = [
  "Livraison Offerte dès 100€",
  "Finition Or PVD",
  "Résistant à l'eau",
  "Hypoallergénique",
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[70vh] md:min-h-[80vh] flex flex-col justify-center items-center text-center overflow-hidden"
      style={{
        background: "linear-gradient(180deg, hsl(24 14% 94%) 0%, hsl(44 58% 93%) 100%)",
      }}
    >
      {/* Decorative background image with overlay */}
      <div className="absolute inset-0 opacity-[0.07]">
        <img src={heroImage} alt="" className="w-full h-full object-cover" aria-hidden="true" />
      </div>

      <div className="relative z-10 px-5 md:px-6 max-w-4xl mx-auto">
        <span className="inline-block text-[10px] md:text-xs uppercase tracking-[0.3em] text-primary mb-3 md:mb-4 animate-fade-up font-medium">
          Chapitre 1 : Dakar
        </span>
        <h1 className="font-serif text-3xl sm:text-5xl md:text-7xl text-foreground mb-4 md:mb-6 animate-fade-up tracking-tight leading-[1.1]">
          L'ÉLÉGANCE SOLAIRE.
        </h1>
        <p className="font-sans text-base md:text-lg tracking-wide text-muted-foreground mb-6 md:mb-8 max-w-md md:max-w-xl mx-auto animate-fade-up"
          style={{ animationDelay: "0.15s" }}
        >
          Hommage aux reines de l'élégance de Saint-Louis. Une parure pour celles qui portent l'histoire comme une seconde peau.
        </p>
        <div className="animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Button variant="default" size="lg" className="rounded-sm px-6 md:px-8 py-3 md:py-4 h-auto text-[10px] md:text-xs uppercase tracking-[0.25em]">
            Voir le Chapitre 1
          </Button>
        </div>
      </div>

      {/* Trust banner */}
      <div className="relative z-10 mt-auto pb-6 md:pb-8 pt-12 md:pt-16">
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-6 md:gap-10">
          {trustItems.map((item, i) => (
            <span
              key={item}
              className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] text-foreground/50 animate-fade-in"
              style={{ animationDelay: `${0.5 + i * 0.1}s` }}
            >
              {i > 0 && <span className="hidden sm:inline mr-6 md:mr-10 text-gold">✦</span>}
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
