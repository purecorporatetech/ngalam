import { useState } from "react";

const SiteFooter = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="bg-foreground text-background border-t border-gold/30">
      <div className="max-w-6xl mx-auto py-10 md:py-16 px-5 md:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-8">
          {/* Newsletter */}
          <div>
            <h3 className="font-serif text-lg mb-4">Rejoindre le Cercle</h3>
            <p className="text-sm text-background/60 mb-4">Accès prioritaire aux éditions limitées.</p>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre email"
                maxLength={255}
                className="w-full bg-transparent border-b border-background/50 pb-2 text-sm text-background placeholder:text-background/40 focus:outline-none focus:border-gold transition-colors"
              />
            </div>
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
          <div className="flex flex-col">
            <span className="font-serif font-bold text-2xl tracking-[0.3em] mb-3">NGALAM</span>
            <p className="text-sm leading-relaxed">
              <span className="font-sans text-background/50 tracking-wide">Designed in Paris.</span>{" "}
              <span className="font-serif italic text-background/90">Soul in Dakar.</span>
            </p>
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
