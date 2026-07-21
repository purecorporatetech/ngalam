import { type Campaign, formatParisMonth } from "@/lib/edition";

interface VestiaireProps {
  closed: Campaign[];
}

// Archive des Éditions refermées — présentées comme des souvenirs,
// NON rachetables. Aucun lien d'achat.
const Vestiaire = ({ closed }: VestiaireProps) => {
  return (
    <section className="py-16 md:py-24 px-5 md:px-6 border-t border-foreground/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 md:mb-14">
          <span className="text-primary text-[10px] sm:text-xs tracking-[0.3em] font-bold uppercase block mb-3">
            L'Archive
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-foreground">Le Vestiaire</h2>
        </div>

        {closed.length === 0 ? (
          <p className="text-center font-serif text-lg sm:text-xl text-muted-foreground italic max-w-xl mx-auto">
            Le Vestiaire s'écrira au fil des Éditions. Chaque édition refermée y déposera son souvenir.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {closed.map((c) => (
              <article key={c.id} className="group">
                <div className="aspect-[4/5] bg-muted rounded-sm overflow-hidden relative mb-4">
                  {c.hero_image ? (
                    <img
                      src={c.hero_image}
                      alt={c.title}
                      className="w-full h-full object-cover grayscale-[0.35] group-hover:grayscale-0 transition-all duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs tracking-[0.15em] uppercase">
                      Souvenir
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-end p-4 bg-gradient-to-t from-foreground/40 to-transparent">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/90">
                      Refermée
                    </span>
                  </div>
                </div>
                <span className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                  {formatParisMonth(c.opens_at)}
                </span>
                <h3 className="font-serif text-xl text-foreground leading-tight">{c.title}</h3>
                {c.valeur && (
                  <p className="font-serif text-sm italic text-primary mt-0.5">{c.valeur}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">Cette Édition s'est refermée.</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Vestiaire;
