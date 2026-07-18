import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import AdminSidebar from "@/components/admin/AdminSidebar";
import ProductsTab from "@/components/admin/ProductsTab";
import OrdersTab from "@/components/admin/OrdersTab";
import KpiCards from "@/components/admin/KpiCards";
import { Loader2 } from "lucide-react";

const Admin = () => {
  const { isAdmin, loading } = useAdminCheck();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [filterOutOfStock, setFilterOutOfStock] = useState(false);

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate("/", { replace: true });
    }
  }, [loading, isAdmin, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 p-8">
        <KpiCards
          onOutOfStockClick={() => { setActiveTab("products"); setFilterOutOfStock((v) => !v); }}
          outOfStockActive={filterOutOfStock}
        />
        {activeTab === "products" && <ProductsTab filterOutOfStock={filterOutOfStock} />}
        {activeTab === "orders" && <OrdersTab />}
      </main>
    </div>
  );
};

export default Admin;
