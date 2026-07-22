import { Package, ShoppingCart, Sparkles, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export type AdminTab = "home" | "products" | "orders" | "campaigns";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
}

const AdminSidebar = ({ activeTab, onTabChange }: AdminSidebarProps) => {
  const items = [
    { id: "home" as const, label: "Accueil", icon: Home },
    { id: "products" as const, label: "Produits", icon: Package },
    { id: "campaigns" as const, label: "L'Édition", icon: Sparkles },
    { id: "orders" as const, label: "Commandes", icon: ShoppingCart },
  ];

  return (
    <aside className="w-56 min-h-screen border-r border-border bg-card p-4">
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
    </aside>
  );
};

export default AdminSidebar;
