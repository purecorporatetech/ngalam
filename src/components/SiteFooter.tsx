import WaitlistForm from "@/components/edition/WaitlistForm";

const SiteFooter = () => {
  return (
    <footer className="bg-foreground text-background border-t border-gold/30">
      <div className="max-w-6xl mx-auto py-10 md:py-16 px-5 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-8">
          {/* Newsletter */}
          <div>
            <h3 className="font-serif text-lg mb-4">Rejoindre le Cercle</h3>
            <p className="text-sm text-background/60 mb-4">Accès prioritaire aux nouveautés et aux Éditions.</p>
            <WaitlistForm
              campaignId={null}
              layout="stacked"
              placeholder="Votre email"
              inputClassName="bg-transparent border-0 border-b border-background/50 rounded-none px-0 h-11 text-background placeholder:text-background/40 focus-visible:ring-0 focus-visible:border-gold"
            />
          </div>

          {/* Navigation */}
          <div>
            <h3 className="font-serif text-lg mb-4">Navigation</h3>
            <ul className="space-y-3">
              {["À Propos", "FAQ", "Livraison"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-background/60 hover:text-gold transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h3 className="font-serif text-lg mb-4">Légal</h3>
            <ul className="space-y-3">
              {["CGV", "Mentions Légales"].map((item) => (
                <li key={item}>
                  <a href="#" className="text-sm text-background/60 hover:text-gold transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Identité */}
          <div className="flex flex-col justify-start">
            <img
              src="/brand/wordmark-sand-full.png"
              alt="NGALAM — Designed in Paris. Soul in Dakar."
              width={1200}
              height={240}
              className="w-[220px] sm:w-[240px] h-auto"
            />
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-background/10 py-6 px-6">
        <p className="text-center text-xs text-background/40 tracking-wider">
          © 2026 NGALAM. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default SiteFooter;
