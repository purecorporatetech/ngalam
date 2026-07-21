import type { Tables } from "@/integrations/supabase/types";

export type Campaign = Tables<"campaigns">;

const PARIS = "Europe/Paris";

// Statut effectif (décidé en étape A, calcul côté app) :
// un drop est réellement ouvert = status 'live' ET now ∈ [opens_at, closes_at[.
export const isCampaignLive = (c: Campaign, now: number = Date.now()): boolean => {
  if (c.status !== "live") return false;
  const opens = new Date(c.opens_at).getTime();
  const closes = new Date(c.closes_at).getTime();
  return now >= opens && now < closes;
};

// Un drop part au Vestiaire dès qu'il est 'closed' ou que sa fenêtre est passée.
export const isCampaignClosed = (c: Campaign, now: number = Date.now()): boolean =>
  c.status === "closed" || new Date(c.closes_at).getTime() <= now;

// ---- Formatage Europe/Paris (stockage UTC) ----
export const formatParisDate = (iso: string): string =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: PARIS,
  }).format(new Date(iso));

export const formatParisMonth = (iso: string): string =>
  new Intl.DateTimeFormat("fr-FR", {
    month: "long",
    year: "numeric",
    timeZone: PARIS,
  }).format(new Date(iso));

// ---- Compte à rebours (durée absolue, indépendante du fuseau) ----
export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  done: boolean;
}

export const computeCountdown = (targetIso: string, now: number = Date.now()): CountdownParts => {
  const diff = new Date(targetIso).getTime() - now;
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
  const total = Math.floor(diff / 1000);
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: false,
  };
};

// ---- Conversion <input type="datetime-local"> ⇆ UTC, en Europe/Paris ----
// L'admin saisit/voit une heure « murale » de Paris ; on stocke l'instant UTC.

// Offset (minutes à ajouter à UTC pour obtenir l'heure de Paris) à un instant donné.
const parisOffsetMinutes = (date: Date): number => {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: PARIS,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p: Record<string, string> = {};
  for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return (asUTC - date.getTime()) / 60000;
};

// UTC ISO -> valeur "YYYY-MM-DDTHH:mm" pour l'input (heure de Paris).
export const isoToParisInput = (iso: string): string => {
  const p: Record<string, string> = {};
  for (const part of new Intl.DateTimeFormat("en-CA", {
    timeZone: PARIS,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(new Date(iso))) {
    p[part.type] = part.value;
  }
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
};

// Valeur d'input "YYYY-MM-DDTHH:mm" (heure de Paris) -> UTC ISO à stocker.
export const parisInputToIso = (local: string): string => {
  const m = local.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return new Date(local).toISOString();
  const [, y, mo, d, h, mi] = m.map(Number) as unknown as number[];
  // Instant si ces composantes étaient de l'UTC, puis correction par l'offset de Paris.
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  const offset = parisOffsetMinutes(new Date(guess));
  return new Date(guess - offset * 60000).toISOString();
};

export const slugify = (s: string): string =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
