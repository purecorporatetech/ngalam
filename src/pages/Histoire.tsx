import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Gem, Shield, Heart } from "lucide-react";

const pillars = [
  {
    icon: Gem,
    title: "Héritage",
    text: "Chaque pièce raconte une ville, une reine, une époque.",
  },
  {
    icon: Shield,
    title: "Durabilité",
    text: "L'acier inoxydable pour vivre avec vous, pas dans une boîte.",
  },
  {
    icon: Heart,
    title: "Communauté",
    text: "Une marque pensée par et pour la diaspora.",
  },
];

const Histoire = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {/* 1. Hero Manifesto */}
        <section className="py-20 md:py-32 px-5 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-tight">
              Nous ne vendons pas des bijoux.
            </h1>
            <p className="mt-6 md:mt-8 font-serif text-2xl sm:text-3xl md:text-4xl italic text-primary">
              Nous célébrons des lignées.
            </p>
          </div>
        </section>

        {/* 2. L'Origine du Nom */}
        <section className="py-14 md:py-24 px-5 md:px-6">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl text-foreground mb-6">
              Ngalam : L'Héritage de l'Or.
            </h2>
            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
              En Wolof, le Ngalam désigne l'or le plus pur, celui réservé aux
              reines. Nous avons choisi ce nom pour sa philosophie, pas pour sa
              matière. Notre mission ? Capturer cet éclat royal et le rendre
              inaltérable grâce à l'acier moderne. Pour que la noblesse ne soit
              plus réservée aux grandes occasions, mais se vive au quotidien.
              </p>
            </div>
            <div className="aspect-square bg-muted rounded-sm flex items-center justify-center">
              <span className="text-muted-foreground/40 text-sm tracking-wider uppercase">
                Visuel à venir
              </span>
            </div>
          </div>
        </section>

        {/* 3. L'Âme de l'Atelier */}
        <section className="bg-white py-14 md:py-24 px-5 md:px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl text-foreground text-center mb-4 font-normal">
              L'Esprit Ngalam.
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 items-center mt-10">
              {/* Gauche — Photo mains */}
              <div className="aspect-[3/4] bg-muted rounded-sm flex items-center justify-center grayscale">
                <span className="text-muted-foreground/40 text-xs tracking-wider uppercase text-center px-4">
                  Mains d'artisan — Noir & Blanc
                </span>
              </div>

              {/* Milieu — Texte */}
              <div className="text-center flex flex-col items-center justify-center py-6">
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base max-w-sm">
                  C'est né d'une envie simple : créer le trait d'union manquant.
                  Entre l'énergie solaire de Dakar et nos vies ici. Sans folklore,
                  sans cliché. Juste des lignes pures qui racontent une histoire,
                  dans une matière faite pour durer. Pour que la fierté se porte
                  au quotidien, tout simplement.
                </p>
              </div>

              {/* Droite — Portrait artisan */}
              <div className="aspect-[3/4] bg-muted rounded-sm flex items-center justify-center grayscale">
                <span className="text-muted-foreground/40 text-xs tracking-wider uppercase text-center px-4">
                  Portrait artisan — Noir & Blanc
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Nos 3 Piliers */}
        <section className="bg-primary py-14 md:py-24 px-5 md:px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl text-primary-foreground text-center mb-12 md:mb-16">
              Nos 3 Piliers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 md:gap-12">
              {pillars.map((p) => (
                <div key={p.title} className="text-center">
                  <p.icon
                    className="w-8 h-8 mx-auto mb-5 text-accent"
                    strokeWidth={1.2}
                  />
                  <h3 className="font-serif text-xl text-primary-foreground mb-3">
                    {p.title}
                  </h3>
                  <p className="text-primary-foreground/70 text-sm leading-relaxed">
                    {p.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Histoire;
