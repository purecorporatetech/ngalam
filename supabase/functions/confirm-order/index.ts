import Stripe from "https://esm.sh/stripe@17.7.0?target=deno&deno-std=0.132.0";
import { corsHeaders } from "../_shared/cors.ts";

// LECTURE SEULE — sert uniquement à afficher la confirmation sur /success.
//
// La CRÉATION de la commande (orders + order_items) et le DÉCRÉMENT de stock ne
// se font PLUS ici : ils passent par la fonction transactionnelle atomique
// public.create_paid_order, appelée depuis le webhook Stripe signé (Chantier 11b).
// Cela évite la survente et les doubles créations (idempotence via
// orders.stripe_session_id). Cette fonction ne lit donc aucune colonne legacy
// (products.stock_quantity / image_url) et n'écrit rien.
Deno.serve(async (req) => {
  const cors = corsHeaders(req);
  const json = (body: unknown, status: number) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: cors });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

    const { session_id } = await req.json();
    if (!session_id) {
      return json({ error: "session_id manquant." }, 400);
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      return json({ error: "Le paiement n'a pas été confirmé.", status: session.payment_status }, 400);
    }

    return json({
      success: true,
      amount_total: session.amount_total ? session.amount_total / 100 : 0,
      customer_email: session.customer_details?.email || "",
    }, 200);
  } catch (err) {
    console.error("Confirm order error:", err);
    return json({ error: (err as Error).message || "Erreur interne." }, 500);
  }
});
