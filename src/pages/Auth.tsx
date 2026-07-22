import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { emailSchema, passwordSchema } from "@/lib/authSchemas";
import { translateAuthError } from "@/lib/authErrors";

type Mode = "login" | "signup" | "forgot";

const RESET_REDIRECT = `${window.location.origin}/reset-password`;

const Auth = () => {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [resetRequested, setResetRequested] = useState(false);

  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Déjà connectée → pas de raison de rester sur /auth.
  useEffect(() => {
    if (!loading && user) navigate("/compte", { replace: true });
  }, [user, loading, navigate]);

  const switchMode = (m: Mode) => {
    setMode(m);
    setErrors({});
    setResetRequested(false);
  };

  const validate = (): boolean => {
    const next: { email?: string; password?: string } = {};
    const emailRes = emailSchema.safeParse(email);
    if (!emailRes.success) next.email = emailRes.error.issues[0].message;
    if (mode !== "forgot") {
      const pwdRes = passwordSchema.safeParse(password);
      if (!pwdRes.success) next.password = pwdRes.error.issues[0].message;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Connexion réussie.");
        navigate("/compte", { replace: true });
      } else if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: name.trim() || null },
          },
        });
        if (error) throw error;
        toast.success("Compte créé. Vérifie ton email pour confirmer ton inscription.");
        switchMode("login");
      } else {
        // Mot de passe oublié : message générique systématique (anti-énumération).
        await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: RESET_REDIRECT });
        setResetRequested(true);
      }
    } catch (error) {
      const msg = translateAuthError(error instanceof Error ? error.message : undefined);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const submitLabel =
    mode === "login" ? "Se connecter" : mode === "signup" ? "Créer mon compte" : "Envoyer le lien";

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link to="/" className="font-serif font-bold text-3xl tracking-[0.3em] text-foreground">
            NGALAM
          </Link>
          <p className="mt-3 text-sm text-muted-foreground tracking-wide">
            {mode === "login" && "Connecte-toi à ton compte"}
            {mode === "signup" && "Crée ton compte"}
            {mode === "forgot" && "Réinitialise ton mot de passe"}
          </p>
        </div>

        {mode === "forgot" && resetRequested ? (
          <div className="text-center space-y-4">
            <p className="text-sm text-foreground/80 leading-relaxed">
              Si un compte existe pour cet email, tu recevras un lien pour réinitialiser ton mot de passe.
            </p>
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="text-foreground underline underline-offset-4 hover:text-accent transition-colors text-sm"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                  Nom complet <span className="normal-case tracking-normal">(optionnel)</span>
                </Label>
                <Input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="bg-secondary/50 border-border" />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((x) => ({ ...x, email: undefined })); }}
                aria-invalid={!!errors.email}
                className="bg-secondary/50 border-border"
              />
              {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
            </div>

            {mode !== "forgot" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
                    Mot de passe
                  </Label>
                  {mode === "login" && (
                    <button type="button" onClick={() => switchMode("forgot")} className="text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2 transition-colors">
                      Mot de passe oublié ?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((x) => ({ ...x, password: undefined })); }}
                  aria-invalid={!!errors.password}
                  className="bg-secondary/50 border-border"
                />
                {errors.password && <p className="text-destructive text-xs">{errors.password}</p>}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="w-full uppercase tracking-[0.2em] text-xs h-12">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Un instant…" : submitLabel}
            </Button>
          </form>
        )}

        {mode !== "forgot" && (
          <p className="text-center text-sm text-muted-foreground">
            {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
            <button
              type="button"
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="text-foreground underline underline-offset-4 hover:text-accent transition-colors"
            >
              {mode === "login" ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        )}
      </div>
    </div>
  );
};

export default Auth;
