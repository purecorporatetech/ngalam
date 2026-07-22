import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Status = "idle" | "submitting" | "success" | "already" | "error";

interface WaitlistFormProps {
  // Campagne à laquelle rattacher l'inscription ; null = liste générale.
  campaignId?: string | null;
  className?: string;
  // "inline" (défaut) : input + bouton côte à côte (≥ sm). "stacked" : empilés,
  // chacun pleine largeur — pour les conteneurs étroits (colonne de footer).
  layout?: "inline" | "stacked";
  placeholder?: string;
  // Style d'input personnalisé (ex. sobre sur fond sombre). Défaut = champ encadré.
  inputClassName?: string;
}

const WaitlistForm = ({
  campaignId = null,
  className = "",
  layout = "inline",
  placeholder = "ton@email.com",
  inputClassName,
}: WaitlistFormProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const stacked = layout === "stacked";

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
      <div className={cn("flex items-center gap-3", stacked ? "justify-start text-left" : "justify-center text-center", className)}>
        <span className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
          <Check className="w-4 h-4 text-accent" />
        </span>
        <p className="font-serif text-lg">
          {status === "already"
            ? "Tu fais déjà partie du Cercle."
            : "Bienvenue dans le Cercle. Tu seras prévenue en premier."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={cn(stacked ? "w-full" : "w-full max-w-md mx-auto", className)}>
      <div className={cn("gap-3", stacked ? "flex flex-col" : "flex flex-col sm:flex-row")}>
        <Input
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (status === "error") setStatus("idle"); }}
          placeholder={placeholder}
          aria-label="Adresse email"
          className={cn("h-12", stacked ? "w-full" : "flex-1", inputClassName ?? "bg-background")}
        />
        <Button
          type="submit"
          disabled={status === "submitting"}
          className={cn("h-12 px-6 uppercase text-xs tracking-[0.2em]", stacked && "w-full")}
        >
          {status === "submitting" && <Loader2 className="w-4 h-4 animate-spin" />}
          Rejoindre le Cercle
        </Button>
      </div>
      {status === "error" && (
        <p className={cn("text-destructive text-xs mt-2", stacked ? "text-left" : "text-center")}>
          Entre une adresse email valide pour rejoindre le Cercle.
        </p>
      )}
    </form>
  );
};

export default WaitlistForm;
