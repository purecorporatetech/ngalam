import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import CartDrawer from "@/components/CartDrawer";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Boutique from "./pages/Boutique";
import Edition from "./pages/Edition";
import Histoire from "./pages/Histoire";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Compte from "./pages/Compte";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Success from "./pages/Success";
import JournalSignares from "./pages/JournalSignares";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/boutique" element={<Boutique />} />
            <Route path="/colliers" element={<Boutique category="colliers" />} />
            <Route path="/bagues" element={<Boutique category="bagues" />} />
            <Route path="/bracelets" element={<Boutique category="bracelets" />} />
            <Route path="/boucles-doreilles" element={<Boutique category="boucles" />} />
            <Route path="/edition" element={<Edition />} />
            {/* Ancienne URL — redirection permanente vers /edition */}
            <Route path="/edition-signares" element={<Navigate to="/edition" replace />} />
            <Route path="/histoire" element={<Histoire />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/compte" element={<RequireAuth><Compte /></RequireAuth>} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/success" element={<Success />} />
            <Route path="/journal/signares" element={<JournalSignares />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
