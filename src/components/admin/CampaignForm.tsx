import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";
import { type Campaign, slugify, isoToParisInput, parisInputToIso } from "@/lib/signares";

interface CampaignFormProps {
  campaign?: Campaign;
  onSuccess: () => void;
  onCancel: () => void;
}

type ProductLite = Pick<Tables<"products">, "id" | "name" | "image_url" | "drop_id">;

const CampaignForm = ({ campaign, onSuccess, onCancel }: CampaignFormProps) => {
  const isEdit = !!campaign;

  const [title, setTitle] = useState(campaign?.title ?? "");
  const [slug, setSlug] = useState(campaign?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [valeur, setValeur] = useState(campaign?.valeur ?? "");
  const [subtitle, setSubtitle] = useState(campaign?.subtitle ?? "");
  const [story, setStory] = useState(campaign?.story ?? "");
  const [heroImage, setHeroImage] = useState<string | null>(campaign?.hero_image ?? null);
  const [heroFile, setHeroFile] = useState<File | null>(null);
  const [opensAt, setOpensAt] = useState(campaign ? isoToParisInput(campaign.opens_at) : "");
  const [closesAt, setClosesAt] = useState(campaign ? isoToParisInput(campaign.closes_at) : "");
  const [status, setStatus] = useState(campaign?.status ?? "scheduled");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Slug auto-généré tant que l'admin ne l'a pas édité manuellement.
  useEffect(() => {
    if (!slugTouched) setSlug(slugify(title));
  }, [title, slugTouched]);

  const { data: products } = useQuery<ProductLite[]>({
    queryKey: ["admin-products-lite"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, image_url, drop_id")
        .order("name", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProductLite[];
    },
  });

  // Initialise les pièces déjà rattachées à cette campagne (édition).
  useEffect(() => {
    if (campaign && products) {
      setSelected(new Set(products.filter((p) => p.drop_id === campaign.id).map((p) => p.id)));
    }
  }, [campaign, products]);

  const toggleProduct = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error("Le nom de la Signare est requis"); return; }
    if (!slug.trim()) { toast.error("Le slug est requis"); return; }
    if (!opensAt || !closesAt) { toast.error("Renseignez les dates d'ouverture et de fermeture"); return; }

    const opensIso = parisInputToIso(opensAt);
    const closesIso = parisInputToIso(closesAt);
    if (new Date(closesIso).getTime() <= new Date(opensIso).getTime()) {
      toast.error("La fermeture doit être postérieure à l'ouverture.");
      return;
    }

    setLoading(true);
    try {
      let heroUrl = heroImage;
      if (heroFile) {
        const ext = heroFile.name.split(".").pop();
        const path = `campaigns/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, heroFile);
        if (upErr) throw upErr;
        heroUrl = supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
      }

      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        valeur: valeur || null,
        subtitle: subtitle || null,
        story: story || null,
        hero_image: heroUrl,
        opens_at: opensIso,
        closes_at: closesIso,
        status,
      };

      let campaignId: string;
      if (isEdit) {
        const { error } = await supabase.from("campaigns").update(payload).eq("id", campaign!.id);
        if (error) throw error;
        campaignId = campaign!.id;
      } else {
        const { data, error } = await supabase.from("campaigns").insert(payload).select("id").single();
        if (error) throw error;
        campaignId = data.id;
      }

      // Réconciliation des pièces de la capsule.
      const attach: string[] = [];
      const detach: string[] = [];
      for (const p of products ?? []) {
        const isSel = selected.has(p.id);
        if (isSel && p.drop_id !== campaignId) attach.push(p.id);
        if (!isSel && p.drop_id === campaignId) detach.push(p.id);
      }
      if (attach.length) {
        const { error } = await supabase.from("products")
          .update({ drop_id: campaignId, availability: "drop" }).in("id", attach);
        if (error) throw error;
      }
      if (detach.length) {
        const { error } = await supabase.from("products")
          .update({ drop_id: null, availability: "permanent" }).in("id", detach);
        if (error) throw error;
      }

      toast.success(isEdit ? "Signare mise à jour" : "Signare créée");
      onSuccess();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur lors de l'enregistrement";
      // 23505 = slug déjà pris (unicité).
      const code = (err as { code?: string })?.code;
      toast.error(code === "23505" ? "Ce slug est déjà utilisé — choisis-en un autre." : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="c-title">Nom de la Signare *</Label>
          <Input id="c-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Diongoma" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-slug">Slug *</Label>
          <Input id="c-slug" value={slug} onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} placeholder="diongoma" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="c-valeur">Valeur (wolof)</Label>
          <Input id="c-valeur" value={valeur} onChange={(e) => setValeur(e.target.value)} placeholder="Jom — la dignité" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-subtitle">Accroche</Label>
          <Input id="c-subtitle" value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="La femme qui avance sans baisser les yeux." />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="c-story">Récit</Label>
        <Textarea id="c-story" value={story} onChange={(e) => setStory(e.target.value)} rows={5} placeholder="Le récit du mois…" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="c-opens">Ouverture (Paris) *</Label>
          <Input id="c-opens" type="datetime-local" value={opensAt} onChange={(e) => setOpensAt(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="c-closes">Fermeture (Paris) *</Label>
          <Input id="c-closes" type="datetime-local" value={closesAt} onChange={(e) => setClosesAt(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label>Statut</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="scheduled">Programmée</SelectItem>
              <SelectItem value="live">En ligne</SelectItem>
              <SelectItem value="closed">Refermée</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Hero image */}
      <div className="space-y-2">
        <Label>Visuel d'ambiance</Label>
        {heroImage && !heroFile && (
          <img src={heroImage} alt="" className="h-24 w-40 object-cover rounded-sm mb-2" />
        )}
        <label className="flex items-center gap-2 cursor-pointer border border-dashed border-input rounded-sm px-4 py-3 hover:bg-secondary transition-colors">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{heroFile ? heroFile.name : "Choisir une image…"}</span>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => setHeroFile(e.target.files?.[0] ?? null)} />
        </label>
      </div>

      {/* Rattacher les pièces */}
      <div className="space-y-3 border-t border-border pt-5">
        <div>
          <h3 className="font-serif text-lg">La capsule</h3>
          <p className="text-sm text-muted-foreground">Coche les pièces exclusives de cette Signare (elles passent en « drop »).</p>
        </div>
        {!products || products.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucun produit disponible à rattacher.</p>
        ) : (
          <div className="space-y-1 max-h-60 overflow-y-auto border border-border rounded-sm p-2">
            {products.map((p) => {
              const attachedElsewhere = p.drop_id && p.drop_id !== campaign?.id;
              return (
                <label key={p.id} className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-secondary cursor-pointer">
                  <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggleProduct(p.id)} />
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="h-8 w-8 object-cover rounded-sm" />
                  ) : (
                    <div className="h-8 w-8 bg-muted rounded-sm" />
                  )}
                  <span className="text-sm text-foreground">{p.name}</span>
                  {attachedElsewhere && !selected.has(p.id) && (
                    <span className="text-[10px] uppercase tracking-wide text-muted-foreground ml-auto">déjà dans un autre drop</span>
                  )}
                </label>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Enregistrer" : "Créer la Signare"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
      </div>
    </form>
  );
};

export default CampaignForm;
