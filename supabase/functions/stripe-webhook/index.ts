import Stripe from "https://esm.sh/stripe@17.7.0?target=deno&deno-std=0.132.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

// Webhook Stripe — appel serveur-à-serveur (pas de navigateur → pas de CORS).
// Fonction PUBLIQUE (verify_jwt = false) : Stripe n'envoie pas de JWT Supabase.
// La sécurité repose ENTIÈREMENT sur la vérification de signature ci-dessous.
Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeKey || !webhookSecret) {
    console.error("Stripe env manquante (STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET)");
    return new Response("Server misconfigured", { status: 500 });
  }

  const stripe = new Stripe(stripeKey, { apiVersion: "2024-12-18.acacia" });

  // 1) Vérification de signature — piège Deno : corps BRUT (jamais du JSON parsé)
  //    et constructEventAsync (pas constructEvent).
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  let event: Stripe.Event;
  try {
    if (!signature) throw new Error("signature manquante");
    event = await stripe.webhooks.constructEventAsync(rawBody, signature, webhookSecret);
  } catch (err) {
    console.error("Signature webhook invalide:", (err as Error).message);
    return new Response("Invalid signature", { status: 400 });
  }

  // 2) On ne traite que la finalisation de paiement. Le reste : 200 (ignoré proprement).
  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({ received: true, ignored: event.type }), { status: 200 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const sessionId = (event.data.object as Stripe.Checkout.Session).id;

    // 3) Session complète + line items avec expansion produit (pour relire metadata).
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items.data.price.product"],
    });

    // 4) Items dérivés de Stripe UNIQUEMENT (montants réellement encaissés).
    const lineItems = session.line_items?.data ?? [];
    const items = lineItems.map((li) => {
      const product = li.price?.product as Stripe.Product | undefined;
      const meta = product?.metadata ?? {};
      const qty = li.quantity ?? 1;
      // unit_price = montant total de la ligne / quantité (en euros), depuis Stripe.
      const unitPrice = (li.amount_total ?? 0) / 100 / qty;
      return {
        product_id: meta.product_id ?? null,
        finish: meta.finish ?? null,
        quantity: qty,
        unit_price: unitPrice,
      };
    });

    // shipping_details : selon versions Stripe, sous collected_information ou à plat.
    // deno-lint-ignore no-explicit-any
    const s = session as any;
    const shippingAddress =
      s.collected_information?.shipping_details?.address ??
      s.shipping_details?.address ??
      null;

    const userId = session.metadata?.user_id ? session.metadata.user_id : null;

    // 5) Création atomique + idempotente (montants = Stripe, jamais le navigateur).
    const { data, error } = await supabase.rpc("create_paid_order", {
      _stripe_session_id: session.id,
      _user_id: userId,
      _customer_email: session.customer_details?.email ?? "",
      _customer_name: session.customer_details?.name ?? "",
      _total_amount: (session.amount_total ?? 0) / 100,
      _shipping_address: shippingAddress,
      _items: items,
    });

    if (error) {
      // Erreur métier (stock insuffisant, variante introuvable…) : on LOGUE de façon
      // repérable et on répond 200 — un non-2xx ferait rejouer Stripe indéfiniment.
      console.error(`create_paid_order ÉCHEC session=${session.id}:`, error.message);
      return new Response(JSON.stringify({ received: true, handled: false }), { status: 200 });
    }

    if (data === null) {
      // Session déjà traitée : rejeu normal, aucune duplication.
      console.log(`Webhook rejeu (déjà traité) session=${session.id}`);
      return new Response(JSON.stringify({ received: true, duplicate: true }), { status: 200 });
    }

    console.log(`Commande créée ${data} session=${session.id}`);
    return new Response(JSON.stringify({ received: true, order_id: data }), { status: 200 });
  } catch (err) {
    // Erreur inattendue : logue et 200 (éviter la boucle de rejeu Stripe). À surveiller.
    console.error("Webhook erreur inattendue:", (err as Error).message);
    return new Response(JSON.stringify({ received: true, handled: false }), { status: 200 });
  }
});
