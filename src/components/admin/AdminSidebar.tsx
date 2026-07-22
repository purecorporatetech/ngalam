import { Package, ShoppingCart, Sparkles, Home, ArrowLeft, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

export type AdminTab = "home" | "products" | "orders" | "campaigns";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const items = [
    { id: "home" as const, label: "Accueil", icon: Home },
    { id: "products" as const, label: "Produits", icon: Package },
    { id: "campaigns" as const, label: "L'Édition", icon: Sparkles },
    { id: "orders" as const, label: "Commandes", icon: ShoppingCart },
  ];

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  return (
    <aside className="w-56 min-h-screen border-r border-border bg-card p-4 flex flex-col">
      <h2 className="font-serif text-lg font-semibold mb-6 px-2 flex items-center gap-2">
        <img src="/brand/monogram-indigo.png" alt="" width={512} height={512} className="w-6 h-6" />
        Admin
      </h2>
      <nav className="space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "flex items-center gap-3 w-full px-3 py-2.5 rounded text-sm font-medium transition-colors",
              activeTab === item.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bas de sidebar : retour au site + session */}
      <div className="mt-auto pt-4 border-t border-border space-y-3">
        <Link
          to="/"
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour au site
        </Link>

        <div className="px-3 space-y-2">
          {user?.email && (
            <p className="text-xs text-muted-foreground truncate" title={user.email}>
              {user.email}
            </p>
          )}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 text-xs uppercase tracking-[0.1em] text-destructive hover:text-destructive/80 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Déconnexion
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;
