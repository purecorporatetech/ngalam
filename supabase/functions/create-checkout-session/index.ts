import Stripe from "https://esm.sh/stripe@17.7.0?target=deno&deno-std=0.132.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

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

    // items: [{ id, finish, quantity }] — la finition est requise (modèle variantes).
    const { items, origin } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return json({ error: "Le panier est vide." }, 400);
    }

    const productIds = [...new Set(items.map((i: { id: string }) => i.id))];

    // Source unique : product_variants (stock + prix par finition), product_images
    // (image). Plus aucune lecture des colonnes legacy products.stock_quantity/image_url.
    const { data: products, error: dbError } = await supabase
      .from("products")
      .select("id, name, price, product_variants(finish, price, stock_quantity), product_images(image_url, is_primary, position)")
      .in("id", productIds);

    if (dbError || !products) {
      throw new Error("Impossible de récupérer les produits.");
    }

    type Variant = { finish: string; price: number | null; stock_quantity: number };
    type Image = { image_url: string; is_primary: boolean; position: number };
    type Product = { id: string; name: string; price: number; product_variants: Variant[]; product_images: Image[] };
    const productMap = new Map((products as Product[]).map((p) => [p.id, p]));

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items as { id: string; finish?: string; quantity: number }[]) {
      const qty = item.quantity;
      if (!qty || qty <= 0) continue;

      const product = productMap.get(item.id);
      if (!product) return json({ error: "Produit introuvable." }, 400);

      const finish = item.finish;
      const variant = (product.product_variants ?? []).find((v) => v.finish === finish);
      if (!variant) {
        return json({ error: `Finition requise pour « ${product.name} ».` }, 400);
      }

      // Stock validé contre la VARIANTE (product_variants.stock_quantity).
      if (variant.stock_quantity < qty) {
        return json({
          error: `Stock insuffisant pour « ${product.name} » (${finish}) : ${variant.stock_quantity} restant(s).`,
        }, 400);
      }

      // Prix serveur : override de variante sinon prix de base (jamais le front).
      const unitPrice = variant.price ?? product.price;

      // Image : principale de la galerie, sinon première par position.
      const imgs = (product.product_images ?? []).slice().sort((a, b) =>
        a.is_primary !== b.is_primary ? (a.is_primary ? -1 : 1) : a.position - b.position
      );
      const image = imgs[0]?.image_url;

      lineItems.push({
        price_data: {
          currency: "eur",
          unit_amount: Math.round(unitPrice * 100),
          product_data: {
            name: `${product.name} — ${finish}`,
            ...(image ? { images: [image] } : {}),
          },
        },
        quantity: qty,
      });
    }

    if (lineItems.length === 0) {
      return json({ error: "Aucun produit valide dans le panier." }, 400);
    }

    const totalCents = lineItems.reduce((sum, li) => sum + (li.price_data!.unit_amount! * li.quantity!), 0);
    if (totalCents < 50) {
      return json({ error: "Le montant minimum de commande est de 0,50 €." }, 400);
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      shipping_address_collection: {
        allowed_countries: ["FR", "SN", "BE", "CH", "CA", "CI", "ML", "MA"],
      },
    });

    return json({ url: session.url }, 200);
  } catch (err) {
    console.error("Checkout error:", err);
    return json({ error: (err as Error).message || "Erreur interne du serveur." }, 500);
  }
});
