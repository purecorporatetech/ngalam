import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Renseigne ton email.")
  .email("Adresse email invalide.");

export const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit contenir au moins 8 caractères.");
