import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Button } from "@/components/ui/button";
import { LogOut, Package } from "lucide-react";

const Compte = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="max-w-2xl mx-auto px-5 md:px-6 py-12 md:py-20">
        <header className="mb-10">
          <span className="text-primary text-[10px] sm:text-xs tracking-[0.3em] font-bold uppercase block mb-3">
            Mon compte
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-foreground">Bonjour.</h1>
        </header>

        {/* Identité */}
        <section className="border border-border rounded-sm p-5 md:p-6 mb-6">
          <span className="text-xs uppercase tracking-[0.15em] text-muted-foreground block mb-1">Email</span>
          <p className="text-foreground">{user?.email}</p>
        </section>

        {/* Mes commandes — emplacement honnête, branché au Chantier 11 */}
        <section className="border border-border rounded-sm p-5 md:p-6 mb-8">
          <h2 className="font-serif text-lg text-foreground flex items-center gap-2 mb-3">
            <Package className="w-4 h-4 text-muted-foreground" />
            Mes commandes
          </h2>
          <p className="text-sm text-muted-foreground">
            Tes commandes apparaîtront ici une fois passées.
          </p>
        </section>

        <Button variant="outline" onClick={handleSignOut} className="uppercase text-xs tracking-[0.2em]">
          <LogOut className="w-4 h-4" />
          Se déconnecter
        </Button>
      </main>
      <SiteFooter />
    </div>
  );
};

export default Compte;
