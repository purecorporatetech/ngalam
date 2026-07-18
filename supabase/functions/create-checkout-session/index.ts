import Stripe from "https://esm.sh/stripe@17.7.0?target=deno&deno-std=0.132.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) throw new Error("STRIPE_SECRET_KEY not configured");

    const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { items, origin } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Le panier est vide." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Extract product IDs and build a quantity map
    const productIds = items.map((i: { id: string }) => i.id);
    const quantityMap: Record<string, number> = {};
    for (const item of items) {
      quantityMap[item.id] = item.quantity;
    }

    // Fetch real prices & stock from DB — never trust frontend prices
    const { data: products, error: dbError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, image_url")
      .in("id", productIds);

    if (dbError || !products) {
      throw new Error("Impossible de récupérer les produits.");
    }

    // Validate stock & build line items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const product of products) {
      const qty = quantityMap[product.id];
      if (!qty || qty <= 0) continue;

      if (product.stock_quantity < qty) {
        return new Response(
          JSON.stringify({
            error: `Stock insuffisant pour "${product.name}" (${product.stock_quantity} restant(s)).`,
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      lineItems.push({
        price_data: {
          currency: "eur",
          unit_amount: Math.round(product.price * 100),
          product_data: {
            name: product.name,
            ...(product.image_url ? { images: [product.image_url] } : {}),
          },
        },
        quantity: qty,
      });
    }

    if (lineItems.length === 0) {
      return new Response(
        JSON.stringify({ error: "Aucun produit valide dans le panier." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Stripe requires a minimum of €0.50 for EUR transactions
    const totalCents = lineItems.reduce((sum, li) => sum + (li.price_data!.unit_amount! * li.quantity!), 0);
    if (totalCents < 50) {
      return new Response(
        JSON.stringify({ error: "Le montant minimum de commande est de 0,50 €." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const successUrl = `${origin}/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/`;

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: successUrl,
      cancel_url: cancelUrl,
      shipping_address_collection: {
        allowed_countries: ["FR", "SN", "BE", "CH", "CA", "CI", "ML", "MA"],
      },
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Checkout error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erreur interne du serveur." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
