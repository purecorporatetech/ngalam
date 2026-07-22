import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";
import { HOME_HERO_KEY, DEFAULT_HOME_HERO, parseHomeHero, type HomeHero } from "@/lib/siteSettings";

const HeroSettingsTab = () => {
  const [hero, setHero] = useState<HomeHero>(DEFAULT_HOME_HERO);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["site-settings", HOME_HERO_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings").select("value").eq("key", HOME_HERO_KEY).maybeSingle();
      if (error) throw error;
      return data?.value ?? null;
    },
  });

  useEffect(() => {
    if (data !== undefined) setHero(parseHomeHero(data));
  }, [data]);

  const set = (patch: Partial<HomeHero>) => setHero((h) => ({ ...h, ...patch }));

  const handleSave = async () => {
    if (!hero.title.trim()) { toast.error("Le titre est requis"); return; }
    setLoading(true);
    try {
      let mediaUrl = hero.media_url;
      if (mediaFile) {
        const ext = mediaFile.name.split(".").pop();
        const path = `site/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, mediaFile);
        if (upErr) throw upErr;
        mediaUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      }
      const value: HomeHero = { ...hero, media_url: mediaUrl };
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: HOME_HERO_KEY, value: value as unknown as Json }, { onConflict: "key" });
      if (error) throw error;
      setHero(value); setMediaFile(null);
      toast.success("Accueil mis à jour");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Chargement…</div>;
  }

  return (
    <div className="max-w-2xl">
      <h2 className="font-serif text-xl font-semibold mb-1">Accueil — Hero</h2>
      <p className="text-sm text-muted-foreground mb-6">Media et textes de la bannière d'accueil. Visibles sur la home après enregistrement.</p>

      <div className="space-y-5">
        {/* Media */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Type de media</Label>
            <Select value={hero.media_type} onValueChange={(v) => set({ media_type: v as HomeHero["media_type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="image">Image</SelectItem>
                <SelectItem value="video">Vidéo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Media {hero.media_type === "video" ? "(mp4/webm)" : "(image)"}</Label>
            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-input rounded-sm px-4 py-2 hover:bg-secondary transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground truncate">{mediaFile ? mediaFile.name : "Choisir un fichier…"}</span>
              <input type="file" accept="image/*,video/mp4,video/webm" className="hidden" onChange={(e) => setMediaFile(e.target.files?.[0] ?? null)} />
            </label>
          </div>
        </div>
        {hero.media_url && !mediaFile && (
          <p className="text-xs text-muted-foreground break-all">Media actuel : {hero.media_url}</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="h-eyebrow">Sur-titre (eyebrow)</Label>
          <Input id="h-eyebrow" value={hero.eyebrow} onChange={(e) => set({ eyebrow: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="h-title">Titre *</Label>
          <Input id="h-title" value={hero.title} onChange={(e) => set({ title: e.target.value })} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="h-subtitle">Sous-titre</Label>
          <Textarea id="h-subtitle" value={hero.subtitle} onChange={(e) => set({ subtitle: e.target.value })} rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="h-cta">Libellé du bouton</Label>
            <Input id="h-cta" value={hero.cta_label} onChange={(e) => set({ cta_label: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="h-href">Lien du bouton</Label>
            <Input id="h-href" value={hero.cta_href} onChange={(e) => set({ cta_href: e.target.value })} placeholder="/boutique" />
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSettingsTab;
