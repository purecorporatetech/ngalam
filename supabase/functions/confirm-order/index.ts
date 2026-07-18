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

    const { session_id } = await req.json();

    if (!session_id) {
      return new Response(
        JSON.stringify({ error: "session_id manquant." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Retrieve Stripe session with line items
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ["line_items"],
    });

    if (session.payment_status !== "paid") {
      return new Response(
        JSON.stringify({ error: "Le paiement n'a pas été confirmé.", status: session.payment_status }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Check if order already exists for this session (idempotency)
    const { data: existingOrders } = await supabase
      .from("orders")
      .select("id")
      .eq("id", session.id)
      .maybeSingle();

    if (existingOrders) {
      // Already processed — return session info
      return new Response(
        JSON.stringify({
          success: true,
          already_processed: true,
          amount_total: session.amount_total ? session.amount_total / 100 : 0,
          customer_email: session.customer_details?.email || "",
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const customerEmail = session.customer_details?.email || "unknown@email.com";
    const customerName = session.customer_details?.name || "Client";
    const shippingAddress = session.shipping_details?.address || null;
    const totalAmount = session.amount_total ? session.amount_total / 100 : 0;

    // Get the line items to find product quantities
    // We need to match Stripe line items back to our products
    // The checkout session was created with price_data containing product names
    const lineItems = session.line_items?.data || [];

    // Create the order
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        customer_email: customerEmail,
        customer_name: customerName,
        total_amount: totalAmount,
        status: "paid",
        shipping_address: shippingAddress,
      })
      .select("id")
      .single();

    if (orderError || !order) {
      console.error("Order creation error:", orderError);
      throw new Error("Erreur lors de la création de la commande.");
    }

    // Now we need to match line items to products and decrement stock
    // Since we used price_data (not Stripe product IDs), we match by name
    // First get all products to match
    const { data: allProducts } = await supabase
      .from("products")
      .select("id, name, price");

    if (allProducts) {
      const productMap = new Map(allProducts.map((p) => [p.name, p]));

      for (const li of lineItems) {
        const productName = li.description;
        const qty = li.quantity || 1;
        const product = productMap.get(productName);

        if (product) {
          // Insert order item
          await supabase.from("order_items").insert({
            order_id: order.id,
            product_id: product.id,
            quantity: qty,
            price_at_purchase: li.amount_total ? li.amount_total / 100 / qty : product.price,
          });

          // Decrement stock
          const { data: currentProduct } = await supabase
            .from("products")
            .select("stock_quantity")
            .eq("id", product.id)
            .single();

          if (currentProduct) {
            const newStock = Math.max(0, currentProduct.stock_quantity - qty);
            await supabase
              .from("products")
              .update({ stock_quantity: newStock })
              .eq("id", product.id);
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        amount_total: totalAmount,
        customer_email: customerEmail,
        order_id: order.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Confirm order error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erreur interne." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
