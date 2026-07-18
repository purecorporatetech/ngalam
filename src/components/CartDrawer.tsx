import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X, ShoppingBag, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const CartDrawer = () => {
  const { items, isOpen, closeCart, removeItem, updateQuantity, subtotal } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout-session", {
        body: {
          items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
          origin: window.location.origin,
        },
      });

      if (error || !data?.url) {
        throw new Error(data?.error || "Erreur lors de l'initialisation du paiement.");
      }

      window.location.href = data.url;
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err.message || "Erreur lors de l'initialisation du paiement.",
        variant: "destructive",
      });
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
      <SheetContent
        className="w-full sm:max-w-md flex flex-col p-0"
        style={{ backgroundColor: "#F9F9F7" }}
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-foreground/10">
          <SheetTitle className="font-serif text-xl tracking-wide">Mon Panier</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
            <ShoppingBag className="w-12 h-12 text-muted-foreground/40" strokeWidth={1} />
            <div className="text-center">
              <p className="font-serif text-lg text-foreground mb-1">Votre écrin est vide.</p>
              <p className="text-sm text-muted-foreground">Découvrez nos pièces d'exception.</p>
            </div>
            <Button
              variant="outline"
              className="uppercase text-xs tracking-[0.2em] font-semibold"
              onClick={closeCart}
              asChild
            >
              <Link to="/">Découvrir nos trésors</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Items list */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Image */}
                  <div className="w-20 h-24 bg-muted rounded-sm overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground/30 text-[10px] uppercase">Photo</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <h4 className="font-serif text-sm text-foreground leading-tight truncate">{item.name}</h4>
                      <p className="text-sm font-medium text-foreground/80 mt-0.5">{item.price}&nbsp;€</p>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3">
                      <div className="inline-flex items-center border border-foreground/15 rounded-sm">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                          aria-label="Réduire la quantité"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-7 h-7 flex items-center justify-center text-xs font-medium text-foreground">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
                          aria-label="Augmenter la quantité"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start text-muted-foreground hover:text-destructive transition-colors p-1"
                    aria-label="Retirer du panier"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-foreground/10 px-6 py-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground/70 uppercase tracking-[0.1em]">Sous-total</span>
                <span className="font-serif text-lg font-semibold text-foreground">{subtotal.toFixed(2)}&nbsp;€</span>
              </div>
              <p className="text-xs text-muted-foreground">Frais de port calculés à l'étape suivante.</p>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="w-full py-3.5 bg-primary text-primary-foreground font-bold uppercase text-xs tracking-[0.25em] rounded-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Redirection vers Stripe…
                  </>
                ) : (
                  "Passer à la caisse"
                )}
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
