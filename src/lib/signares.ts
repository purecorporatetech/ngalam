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
