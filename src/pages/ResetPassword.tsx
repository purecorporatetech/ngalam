import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { passwordSchema } from "@/lib/authSchemas";
import { translateAuthError } from "@/lib/authErrors";

// Page atteinte via le lien reçu par email : Supabase établit une session de
// récupération (événement PASSWORD_RECOVERY) qui autorise updateUser.
const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = passwordSchema.safeParse(password);
    if (!res.success) { setError(res.error.issues[0].message); return; }
    setError(undefined);
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Mot de passe mis à jour.");
      navigate("/compte", { replace: true });
    } catch (err) {
      toast.error(translateAuthError(err instanceof Error ? err.message : undefined));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <Link to="/" className="font-serif font-bold text-3xl tracking-[0.3em] text-foreground">
            NGALAM
          </Link>
          <p className="mt-3 text-sm text-muted-foreground tracking-wide">Choisis un nouveau mot de passe</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-xs uppercase tracking-[0.15em] text-muted-foreground">
              Nouveau mot de passe
            </Label>
            <Input
              id="new-password"
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); if (error) setError(undefined); }}
              aria-invalid={!!error}
              className="bg-secondary/50 border-border"
            />
            {error && <p className="text-destructive text-xs">{error}</p>}
          </div>

          <Button type="submit" disabled={submitting} className="w-full uppercase tracking-[0.2em] text-xs h-12">
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitting ? "Un instant…" : "Mettre à jour"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
