// CORS piloté par variable d'environnement ALLOWED_ORIGINS (liste d'origines
// séparées par des virgules, ex. "http://localhost:5173,https://ngalam.xyz").
// Une origine non listée reçoit un ACAO vide → le navigateur bloque la réponse.
// (Le webhook Stripe n'utilise pas ce module : appel serveur-à-serveur, sans CORS.)
const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

export function corsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allow = allowedOrigins.includes(origin) ? origin : "";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}
