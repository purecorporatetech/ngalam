// Traduit les erreurs Supabase Auth en messages français lisibles.
// Ne jamais afficher un message technique brut à la cliente.
export const translateAuthError = (message?: string): string => {
  const m = (message ?? "").toLowerCase();
  if (m.includes("invalid login credentials")) return "Email ou mot de passe incorrect.";
  if (m.includes("email not confirmed")) return "Confirme d'abord ton email via le lien reçu.";
  if (m.includes("already registered") || m.includes("already exists")) return "Un compte existe déjà pour cet email.";
  if (m.includes("password should be at least")) return "Le mot de passe est trop court.";
  if (m.includes("new password should be different")) return "Le nouveau mot de passe doit être différent de l'ancien.";
  if (m.includes("invalid email") || m.includes("unable to validate email")) return "Adresse email invalide.";
  if (m.includes("rate limit") || m.includes("too many requests")) return "Trop de tentatives. Réessaie dans quelques minutes.";
  if (m.includes("network") || m.includes("failed to fetch")) return "Problème de connexion. Vérifie ton réseau.";
  if (m.includes("session") && m.includes("expired")) return "Le lien a expiré. Redemande un lien de réinitialisation.";
  return "Une erreur est survenue. Réessaie.";
};
