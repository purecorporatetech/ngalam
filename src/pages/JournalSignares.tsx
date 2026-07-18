import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const JournalSignares = () => {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* EN-TÊTE */}
        <section className="pt-20 md:pt-32 pb-14 md:pb-20 px-5 md:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <span className="text-primary text-[10px] sm:text-xs tracking-[0.3em] font-bold uppercase block mb-4">
              L'Inspiration
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-6">
              Les Signares&nbsp;: L'Art de Paraître.
            </h1>
            <p className="font-sans text-sm sm:text-base md:text-lg text-foreground/70 leading-relaxed max-w-xl mx-auto">
              Elles étaient les femmes les plus puissantes du 18ème siècle. Commerçantes, esthètes, libres. 
              Elles ont inventé une élégance qui défie le temps.
            </p>
          </div>
        </section>

        {/* MOSAÏQUE VISUELLE */}
        <section className="px-5 md:px-6 pb-16 md:pb-24">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {/* Image 1 — Grande, couvre 2 rangées */}
              <div className="row-span-2">
                <div className="aspect-[3/4] bg-muted rounded-sm flex items-center justify-center w-full h-full">
                  <span className="text-muted-foreground/40 text-[10px] tracking-[0.12em] uppercase text-center px-4">
                    Archive Signare
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-foreground/40 mt-2 italic">
                  Dentelles et Or, Saint-Louis 1950
                </p>
              </div>

              {/* Image 2 — Carrée */}
              <div>
                <div className="aspect-square bg-gold/20 rounded-sm flex items-center justify-center">
                  <span className="text-foreground/30 text-[10px] tracking-[0.12em] uppercase text-center px-4">
                    Texture Or
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-foreground/40 mt-2 italic">
                  Wax & métaux précieux
                </p>
              </div>

              {/* Image 3 — Verticale */}
              <div>
                <div className="aspect-[3/4] bg-primary/10 rounded-sm flex items-center justify-center">
                  <span className="text-foreground/30 text-[10px] tracking-[0.12em] uppercase text-center px-4">
                    Architecture Gorée
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-foreground/40 mt-2 italic">
                  Balcons en fer forgé, Île de Gorée
                </p>
              </div>

              {/* Image 4 — Paysage, couvre 2 colonnes sur desktop */}
              <div className="col-span-2 hidden md:block">
                <div className="aspect-[16/9] bg-muted rounded-sm flex items-center justify-center">
                  <span className="text-muted-foreground/40 text-[10px] tracking-[0.12em] uppercase text-center px-4">
                    Panorama Saint-Louis
                  </span>
                </div>
                <p className="text-[10px] sm:text-xs text-foreground/40 mt-2 italic">
                  Le pont Faidherbe au crépuscule
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LE LIEN AVEC LE BIJOU */}
        <section className="bg-secondary/50 py-14 md:py-24 px-5 md:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
              <div>
                <span className="text-primary text-[10px] sm:text-xs tracking-[0.25em] font-bold uppercase block mb-3">
                  Du Patrimoine au Bijou
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground leading-tight mb-5">
                  Comment nous avons traduit cet esprit&nbsp;?
                </h2>
                <p className="font-sans text-sm sm:text-base text-foreground/70 leading-relaxed mb-4">
                  Nous avons repris les courbes des balcons en fer forgé de Gorée pour dessiner 
                  les maillons du collier Signare. Chaque pièce du coffret est un fragment 
                  d'architecture porté à même la peau.
                </p>
                <p className="font-sans text-sm text-foreground/50 leading-relaxed">
                  L'acier doré rappelle la lumière de fin d'après-midi sur les façades ocre. 
                  Les volumes sont généreux, comme les parures des Signares, mais pensés pour le quotidien.
                </p>
              </div>

              {/* Placeholder image */}
              <div className="order-first md:order-last">
                <div className="aspect-[4/5] bg-muted rounded-sm flex items-center justify-center">
                  <span className="text-muted-foreground/40 text-[10px] tracking-[0.12em] uppercase text-center px-4">
                    Détail Bijou × Architecture
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER CTA */}
        <section className="py-16 md:py-24 px-5 md:px-6 text-center">
          <p className="font-serif text-xl sm:text-2xl md:text-3xl text-foreground mb-8">
            Appropriez-vous cet héritage.
          </p>
          <Link
            to="/coffret-dakar"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-4 font-bold uppercase text-[10px] sm:text-xs tracking-[0.2em] rounded-sm hover:bg-primary/90 transition-colors"
          >
            Voir le Coffret Signares
            <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-foreground/40 text-xs mt-3 tracking-wide uppercase">
            Édition Limitée — 50 exemplaires
          </p>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
};

export default JournalSignares;
