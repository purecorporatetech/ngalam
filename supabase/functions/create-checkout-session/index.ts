import Stripe from "https://esm.sh/stripe@17.7.0?target=deno&deno-std=0.132.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";
import { corsHeaders } from "../_shared/cors.ts";

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // user_id dérivé du JWT (achat invité = pas de token = user_id null).
    // On ne fait JAMAIS confiance à un user_id venant du corps de la requête.
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      const { data } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
      userId = data.user?.id ?? null;
    }

    // items: [{ id, finish, quantity }]
    const { items, origin } = await req.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return json({ error: "Le panier est vide." }, 400);
    }

    const productIds = [...new Set(items.map((i: { id: string }) => i.id))];

    // Source unique : variantes (stock+prix par finition), galerie (image),
    // + campagne liée (contrôle serveur du drop). Aucune colonne legacy.
    const { data: products, error: dbError } = await supabase
      .from("products")
      .select(
        "id, name, price, availability, drop_id, product_variants(finish, price, stock_quantity), product_images(image_url, is_primary, position), campaign:campaigns(status, opens_at, closes_at)",
      )
      .in("id", productIds);

    if (dbError || !products) throw new Error("Impossible de récupérer les produits.");

    type Variant = { finish: string; price: number | null; stock_quantity: number };
    type Image = { image_url: string; is_primary: boolean; position: number };
    type Campaign = { status: string; opens_at: string; closes_at: string } | null;
    type Product = {
      id: string; name: string; price: number; availability: string; drop_id: string | null;
      product_variants: Variant[]; product_images: Image[]; campaign: Campaign;
    };
    const productMap = new Map((products as Product[]).map((p) => [p.id, p]));

    // Un drop n'est achetable que si sa campagne est réellement ouverte.
    const isCampaignLive = (c: Campaign): boolean => {
      if (!c || c.status !== "live") return false;
      const now = Date.now();
      return now >= new Date(c.opens_at).getTime() && now < new Date(c.closes_at).getTime();
    };

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    for (const item of items as { id: string; finish?: string; quantity: number }[]) {
      const qty = item.quantity;
      if (!qty || qty <= 0) continue;

      const product = productMap.get(item.id);
      if (!product) return json({ error: "Produit introuvable." }, 400);

      // Contrôle serveur du drop actif.
      if (product.availability === "drop" && !isCampaignLive(product.campaign)) {
        return json({ error: `« ${product.name} » n'est plus disponible à la vente.` }, 400);
      }

      const finish = item.finish;
      const variant = (product.product_variants ?? []).find((v) => v.finish === finish);
      if (!variant) return json({ error: `Finition requise pour « ${product.name} ».` }, 400);

      if (variant.stock_quantity < qty) {
        return json({
          error: `Stock insuffisant pour « ${product.name} » (${finish}) : ${variant.stock_quantity} restant(s).`,
        }, 400);
      }

      // Prix serveur (jamais le front) : override de variante sinon prix de base.
      const unitPrice = variant.price ?? product.price;

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
            // Identité de la ligne relue par le webhook (via expansion produit).
            metadata: { product_id: product.id, finish: finish ?? "" },
            ...(image ? { images: [image] } : {}),
          },
        },
        quantity: qty,
      });
    }

    if (lineItems.length === 0) return json({ error: "Aucun produit valide dans le panier." }, 400);

    const totalCents = lineItems.reduce((sum, li) => sum + (li.price_data!.unit_amount! * li.quantity!), 0);
    if (totalCents < 50) return json({ error: "Le montant minimum de commande est de 0,50 €." }, 400);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      // user_id en metadata de session (achat invité = chaîne vide → null au webhook).
      metadata: { user_id: userId ?? "" },
      shipping_address_collection: {
        allowed_countries: ["FR", "BE", "CH", "LU", "DE", "ES", "IT", "NL", "PT", "SN", "CI", "ML", "MA", "CA"],
      },
    });

    return json({ url: session.url }, 200);
  } catch (err) {
    console.error("Checkout error:", err);
    return json({ error: (err as Error).message || "Erreur interne du serveur." }, 500);
  }
});
