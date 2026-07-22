import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Vérifie le rôle admin via la RPC has_role (SECURITY DEFINER — indépendante des
// policies RLS sur user_roles). Tri-état : isAdmin=null = verdict pas encore connu.
// Règle clé : « chargement » ne doit JAMAIS valoir « pas admin ». On ne rend un
// verdict qu'une fois la session ET le rôle résolus.
export const useAdminCheck = () => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Session pas encore résolue → aucun verdict.
    if (authLoading) {
      setIsAdmin(null);
      return;
    }
    // Session résolue sans utilisateur → non admin (déconnectée).
    if (!user) {
      setIsAdmin(false);
      return;
    }

    // Utilisateur présent : on repart d'un verdict inconnu le temps de la vérif.
    let cancelled = false;
    setIsAdmin(null);
    supabase
      .rpc("has_role", { _user_id: user.id, _role: "admin" })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          console.error("Vérification du rôle admin échouée :", error.message);
          setIsAdmin(false);
          return;
        }
        setIsAdmin(data === true);
      });

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  // loading tant que la session OU le rôle n'est pas résolu.
  const loading = authLoading || isAdmin === null;
  return { isAdmin: isAdmin === true, loading, user };
};
