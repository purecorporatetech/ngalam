import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingCart, AlertTriangle } from "lucide-react";

interface KpiCardsProps {
  onOutOfStockClick?: () => void;
  outOfStockActive?: boolean;
}

const KpiCards = ({ onOutOfStockClick, outOfStockActive }: KpiCardsProps) => {
  const { data } = useQuery({
    queryKey: ["admin-kpis"],
    queryFn: async () => {
      const [ordersRes, productsRes] = await Promise.all([
        supabase.from("orders").select("status, total_amount"),
        supabase.from("products").select("stock_quantity"),
      ]);
      if (ordersRes.error) throw ordersRes.error;
      if (productsRes.error) throw productsRes.error;

      const orders = ordersRes.data ?? [];
      const products = productsRes.data ?? [];

      const revenue = orders
        .filter((o) => ["paid", "delivered"].includes(o.status))
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      const activeOrders = orders.filter((o) =>
        ["paid", "preparing"].includes(o.status)
      ).length;

      const outOfStock = products.filter((p) => p.stock_quantity === 0).length;

      return { revenue, activeOrders, outOfStock };
    },
  });

  const kpis = [
    { title: "Chiffre d'affaires", value: `${data?.revenue?.toFixed(2) ?? "0"} €`, icon: DollarSign, onClick: undefined, active: false },
    { title: "Commandes en cours", value: String(data?.activeOrders ?? 0), icon: ShoppingCart, onClick: undefined, active: false },
    { title: "Produits en rupture", value: String(data?.outOfStock ?? 0), icon: AlertTriangle, onClick: onOutOfStockClick, active: outOfStockActive },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {kpis.map((kpi) => (
        <Card
          key={kpi.title}
          className={`${kpi.onClick ? "cursor-pointer hover:border-primary/50 transition-colors" : ""} ${kpi.active ? "border-primary ring-1 ring-primary/30" : ""}`}
          onClick={kpi.onClick}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{kpi.title}</CardTitle>
            <kpi.icon className={`h-4 w-4 ${kpi.active ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.value}</div>
            {kpi.onClick && <p className="text-xs text-muted-foreground mt-1">{kpi.active ? "Cliquer pour tout afficher" : "Cliquer pour filtrer"}</p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KpiCards;
