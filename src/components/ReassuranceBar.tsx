// Barre de réassurance — contenu neutre et vrai, sans claim matière.
const items = [
  "Livraison offerte",
  "Fabrication artisanale à Dakar",
  "Paiement sécurisé",
  "Éditions limitées",
];

const ReassuranceBar = () => {
  return (
    <section className="bg-background border-y border-foreground/10 py-5 md:py-6 px-5 md:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row flex-wrap justify-center items-center gap-3 sm:gap-6 md:gap-10">
        {items.map((item, i) => (
          <span key={item} className="text-[9px] sm:text-[10px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.2em] text-foreground/50">
            {i > 0 && <span className="hidden sm:inline mr-6 md:mr-10 text-gold">✦</span>}
            {item}
          </span>
        ))}
      </div>
    </section>
  );
};

export default ReassuranceBar;
