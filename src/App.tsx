import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import CartDrawer from "@/components/CartDrawer";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Boutique from "./pages/Boutique";
import Histoire from "./pages/Histoire";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import Success from "./pages/Success";
import JournalSignares from "./pages/JournalSignares";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
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
            <Route path="/histoire" element={<Histoire />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/success" element={<Success />} />
            <Route path="/journal/signares" element={<JournalSignares />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CartProvider>
  </QueryClientProvider>
);

export default App;
