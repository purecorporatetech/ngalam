import { useEffect, useState, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/contexts/CartContext";
import { CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface OrderResult {
  success: boolean;
  amount_total: number;
  customer_email: string;
  order_id?: string;
  error?: string;
}

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [result, setResult] = useState<OrderResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { clearCart } = useCart();
  const confirmedRef = useRef(false);

  useEffect(() => {
    if (!sessionId || confirmedRef.current) return;
    confirmedRef.current = true;

    const confirmOrder = async () => {
      try {
        const { data, error: fnError } = await supabase.functions.invoke("confirm-order", {
          body: { session_id: sessionId },
        });

        if (fnError) throw new Error("Erreur lors de la confirmation.");

        if (data?.error) {
          setError(data.error);
        } else {
          setResult(data);
          clearCart();
        }
      } catch (err: any) {
        setError(err.message || "Une erreur est survenue.");
      } finally {
        setLoading(false);
      }
    };

    confirmOrder();
  }, [sessionId, clearCart]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F2EFED" }}>
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="font-serif text-lg text-foreground/70">Confirmation en cours…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#F2EFED" }}>
        <div className="text-center max-w-md">
          <p className="font-serif text-xl text-destructive mb-4">{error}</p>
          <Button asChild variant="outline">
            <Link to="/">Retourner à la boutique</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6" style={{ backgroundColor: "#F2EFED" }}>
      <div className="text-center max-w-lg">
        {/* Animated check icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
          className="mx-auto mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 12, delay: 0.4 }}
            >
              <CheckCircle className="w-14 h-14 text-primary" strokeWidth={1.5} />
            </motion.div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="font-serif text-3xl md:text-4xl text-foreground mb-4 leading-tight"
        >
          Merci. Votre héritage est en route.
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          className="text-muted-foreground text-base mb-8"
        >
          Vous recevrez un email de confirmation dans quelques instants.
        </motion.p>

        {/* Amount recap */}
        {result && result.amount_total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
            className="mb-10 py-5 px-6 rounded-md border border-foreground/10 bg-background/60 inline-block"
          >
            <p className="text-sm text-muted-foreground uppercase tracking-[0.15em] mb-1">Montant payé</p>
            <p className="font-serif text-2xl font-semibold text-foreground">
              {result.amount_total.toFixed(2)}&nbsp;€
            </p>
            {result.customer_email && (
              <p className="text-xs text-muted-foreground mt-2">
                Envoyé à {result.customer_email}
              </p>
            )}
          </motion.div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          <Button
            asChild
            className="uppercase text-xs tracking-[0.2em] font-semibold px-8 py-3"
          >
            <Link to="/">Retourner à la boutique</Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default SuccessPage;
