import WaitlistForm from "@/components/edition/WaitlistForm";

// Bloc « Le Cercle » — capture waitlist liste générale (campaign_id null),
// même registre que la page Édition (état C).
const CircleSection = () => {
  return (
    <section className="bg-secondary/40 py-16 md:py-24 px-5 md:px-6 text-center">
      <span className="text-primary text-[10px] sm:text-xs tracking-[0.3em] font-bold uppercase block mb-4">
        Le Cercle
      </span>
      <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl text-foreground mb-3">
        Rejoins le Cercle
      </h2>
      <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto mb-8">
        Sois prévenue en avant-première des nouvelles pièces et de l'ouverture des Éditions.
      </p>
      <WaitlistForm campaignId={null} />
    </section>
  );
};

export default CircleSection;
