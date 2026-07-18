// Généré à l'origine par Lovable, puis édité (Chantier 3a) : la connexion Supabase
// est désormais lue depuis les variables d'environnement Vite (voir .env / .env.example).
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

// Garde-fou : sans configuration, on échoue explicitement au démarrage plutôt
// que de laisser un "Failed to fetch" silencieux à la première requête réseau.
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Configuration Supabase manquante : définissez VITE_SUPABASE_URL et " +
      "VITE_SUPABASE_PUBLISHABLE_KEY dans votre fichier .env (voir .env.example)."
  );
}

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});