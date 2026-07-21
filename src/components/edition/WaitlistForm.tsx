import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "success" | "already" | "error";

interface WaitlistFormProps {
  // Campagne à laquelle rattacher l'inscription ; null = liste générale.
  campaignId?: string | null;
  className?: string;
}

const WaitlistForm = ({ campaignId = null, className = "" }: WaitlistFormProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      setStatus("error");
      return;
    }
    setStatus("submitting");
    const { error } = await supabase.from("waitlist").insert({ email: email.trim(), campaign_id: campaignId });
    if (error) {
      // 23505 = violation d'unicité (déjà inscrite).
      setStatus(error.code === "23505" ? "already" : "error");
      return;
    }
    setStatus("success");
  };

  if (status === "success" || status === "already") {
    return (
      <div className={`flex items-center gap-3 justify-center text-center ${className}`}>
        <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-accent" />
        </span>
        <p className="font-serif text-lg text-foreground">
          {status === "already"
            ? "Tu fais déjà partie du Cercle."
            : "Bienvenue dans le Cercle. Tu seras prévenue en premier."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full max-w-md mx-auto ${className}`}>
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
          placeholder="ton@email.com"
          aria-label="Adresse email"
          className="flex-1 h-12 bg-background"
        />
        <Button type="submit" disabled={status === "submitting"} className="h-12 px-6 uppercase text-xs tracking-[0.2em]">
          {status === "submitting" && <Loader2 className="w-4 h-4 animate-spin" />}
          Rejoindre le Cercle
        </Button>
      </div>
      {status === "error" && (
        <p className="text-destructive text-xs mt-2 text-center">
          Entre une adresse email valide pour rejoindre le Cercle.
        </p>
      )}
    </form>
  );
};

export default WaitlistForm;
