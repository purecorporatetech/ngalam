import { useState } from "react";
import { Menu, X, Search, User, ShoppingBag, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/contexts/CartContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { label: "E-shop", href: "#" },
  { label: "Le Coffret", href: "/coffret-dakar" },
  { label: "L'Histoire", href: "/histoire" },
];

const SiteHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { totalItems, openCart } = useCart();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-foreground/10">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 max-w-7xl mx-auto">
        {/* Left: burger + desktop links */}
        <div className="flex items-center gap-8">
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) =>
              link.href.startsWith("/") ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-xs uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-colors"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>
        </div>

        {/* Center: Logo */}
        <Link to="/" className="absolute left-1/2 -translate-x-1/2">
          <span className="font-serif font-bold text-2xl tracking-[0.3em] text-foreground">
            NGALAM
          </span>
        </Link>

        {/* Right: icons */}
        <div className="flex items-center gap-5">
          <button aria-label="Rechercher" className="text-foreground/70 hover:text-foreground transition-colors">
            <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button aria-label="Mon compte" className="text-foreground hover:text-accent transition-colors">
                  <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem className="text-xs uppercase tracking-[0.1em] cursor-pointer">
                  Mon Compte
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-xs uppercase tracking-[0.1em] cursor-pointer text-destructive"
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/auth" aria-label="Se connecter" className="text-foreground/70 hover:text-foreground transition-colors">
              <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </Link>
          )}

          <button aria-label="Panier" onClick={openCart} className="relative text-foreground/70 hover:text-foreground transition-colors">
            <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="lg:hidden border-t border-foreground/10 px-6 py-6 flex flex-col gap-5 animate-fade-in">
          {navLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link
                key={link.label}
                to={link.href}
                className="text-sm uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                className="text-sm uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </a>
            )
          )}
          {!user && (
            <Link
              to="/auth"
              className="text-sm uppercase tracking-[0.2em] text-foreground/70 hover:text-foreground transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Se connecter
            </Link>
          )}
          {user && (
            <button
              onClick={() => { handleSignOut(); setMobileOpen(false); }}
              className="text-left text-sm uppercase tracking-[0.2em] text-destructive hover:text-destructive/80 transition-colors"
            >
              Déconnexion
            </button>
          )}
        </nav>
      )}
    </header>
  );
};

export default SiteHeader;
