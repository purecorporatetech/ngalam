import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Upload, Loader2, ArrowUp, ArrowDown, Star, X } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const CATEGORY_KEYS = [
  { value: "colliers", label: "Colliers" },
  { value: "bagues", label: "Bagues" },
  { value: "bracelets", label: "Bracelets" },
  { value: "boucles", label: "Boucles d'oreilles" },
] as const;

const FINISHES = ["or", "argent"] as const;
type Finish = (typeof FINISHES)[number];

interface VariantState {
  active: boolean;
  stock: string;
  price: string;
  sku: string;
}

interface GalleryItem {
  key: string;
  existingId?: string;
  file?: File;
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface ProductFormProps {
  product?: Tables<"products">;
  onSuccess: () => void;
  onCancel: () => void;
}

const emptyVariant = (): VariantState => ({ active: false, stock: "", price: "", sku: "" });

const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const isEdit = !!product;

  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [categoryKey, setCategoryKey] = useState<string>(product?.category_key ?? "");
  const [availability, setAvailability] = useState<string>(product?.availability ?? "permanent");
  const [wolofName, setWolofName] = useState(product?.wolof_name ?? "");
  const [valeur, setValeur] = useState(product?.valeur ?? "");
  const [histoire, setHistoire] = useState(product?.histoire ?? "");
  const [sortOrder, setSortOrder] = useState(product ? String(product.sort_order) : "0");
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? false);

  const [variants, setVariants] = useState<Record<Finish, VariantState>>({
    or: emptyVariant(),
    argent: emptyVariant(),
  });

  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // En mode édition, charger variantes + galerie existantes.
  useEffect(() => {
    if (!product) return;
    let active = true;
    (async () => {
      const [{ data: variantRows }, { data: imageRows }] = await Promise.all([
        supabase.from("product_variants").select("*").eq("product_id", product.id),
        supabase
          .from("product_images")
          .select("*")
          .eq("product_id", product.id)
          .order("position", { ascending: true }),
      ]);
      if (!active) return;
      if (variantRows) {
        setVariants((prev) => {
          const next = { or: emptyVariant(), argent: emptyVariant() };
          for (const v of variantRows) {
            const f = v.finish as Finish;
            if (f in next) {
              next[f] = {
                active: true,
                stock: String(v.stock_quantity),
                price: v.price != null ? String(v.price) : "",
                sku: v.sku ?? "",
              };
            }
          }
          return next;
        });
      }
      if (imageRows && imageRows.length > 0) {
        setGallery(
          imageRows.map((img) => ({
            key: img.id,
            existingId: img.id,
            url: img.image_url,
            alt: img.alt_text ?? "",
            isPrimary: img.is_primary,
          }))
        );
      }
    })();
    return () => {
      active = false;
    };
  }, [product]);

  const setVariant = (finish: Finish, patch: Partial<VariantState>) =>
    setVariants((prev) => ({ ...prev, [finish]: { ...prev[finish], ...patch } }));

  const onAddFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newItems: GalleryItem[] = Array.from(files).map((file, i) => ({
      key: `${crypto.randomUUID()}`,
      file,
      url: URL.createObjectURL(file),
      alt: "",
      isPrimary: false,
    }));
    setGallery((prev) => {
      const combined = [...prev, ...newItems];
      // Garantir une image principale s'il n'y en a pas encore.
      if (!combined.some((g) => g.isPrimary) && combined.length > 0) {
        combined[0] = { ...combined[0], isPrimary: true };
      }
      return combined;
    });
  };

  const moveImage = (index: number, dir: -1 | 1) => {
    setGallery((prev) => {
      const next = [...prev];
      const target = index + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const setPrimary = (key: string) =>
    setGallery((prev) => prev.map((g) => ({ ...g, isPrimary: g.key === key })));

  const removeImage = (item: GalleryItem) => {
    setGallery((prev) => {
      const next = prev.filter((g) => g.key !== item.key);
      // Si on retire la principale, promouvoir la première restante.
      if (item.isPrimary && next.length > 0 && !next.some((g) => g.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
    if (item.existingId) setRemovedImageIds((prev) => [...prev, item.existingId!]);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("product-images").upload(path, file);
    if (error) throw error;
    return supabase.storage.from("product-images").getPublicUrl(path).data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error("Le nom et le prix sont requis");
      return;
    }
    const activeFinishes = FINISHES.filter((f) => variants[f].active);
    for (const f of activeFinishes) {
      if (variants[f].stock === "" || isNaN(parseInt(variants[f].stock))) {
        toast.error(`Renseignez le stock pour la finition ${f}`);
        return;
      }
    }

    setLoading(true);
    try {
      const basePrice = parseFloat(price);
      // Colonnes legacy (stock_quantity, category, image_url) non écrites : le stock
      // vit dans product_variants, les images dans product_images, la catégorie dans
      // category_key. Plus aucun pont de compat.
      const corePayload = {
        name,
        description: description || null,
        price: basePrice,
        category_key: categoryKey || null,
        availability,
        wolof_name: wolofName || null,
        valeur: valeur || null,
        histoire: histoire || null,
        sort_order: parseInt(sortOrder) || 0,
        is_featured: isFeatured,
      };

      // 1. Créer ou mettre à jour le produit, récupérer son id.
      let productId: string;
      if (isEdit) {
        const { error } = await supabase.from("products").update(corePayload).eq("id", product!.id);
        if (error) throw error;
        productId = product!.id;
      } else {
        const { data, error } = await supabase
          .from("products")
          .insert(corePayload)
          .select("id")
          .single();
        if (error) throw error;
        productId = data.id;
      }

      // 2. Galerie : suppressions, uploads, upserts.
      if (removedImageIds.length > 0) {
        const { error } = await supabase.from("product_images").delete().in("id", removedImageIds);
        if (error) throw error;
      }
      for (let i = 0; i < gallery.length; i++) {
        const item = gallery[i];
        const url = item.file ? await uploadFile(item.file) : item.url;
        if (item.existingId) {
          const { error } = await supabase
            .from("product_images")
            .update({ position: i, is_primary: item.isPrimary, alt_text: item.alt || null })
            .eq("id", item.existingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("product_images").insert({
            product_id: productId,
            image_url: url,
            alt_text: item.alt || null,
            position: i,
            is_primary: item.isPrimary,
          });
          if (error) throw error;
        }
      }

      // 3. Variantes : upsert des actives, suppression des désactivées.
      for (const finish of FINISHES) {
        const v = variants[finish];
        if (v.active) {
          const { error } = await supabase.from("product_variants").upsert(
            {
              product_id: productId,
              finish,
              stock_quantity: parseInt(v.stock) || 0,
              price: v.price === "" ? null : parseFloat(v.price),
              sku: v.sku || null,
            },
            { onConflict: "product_id,finish" }
          );
          if (error) throw error;
        } else if (isEdit) {
          const { error } = await supabase
            .from("product_variants")
            .delete()
            .eq("product_id", productId)
            .eq("finish", finish);
          if (error) throw error;
        }
      }

      toast.success(isEdit ? "Produit modifié avec succès" : "Produit créé avec succès");
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur lors de l'enregistrement";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* ---- Infos de base ---- */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom *</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Collier Gorée" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="wolof">Nom wolof</Label>
            <Input id="wolof" value={wolofName} onChange={(e) => setWolofName(e.target.value)} placeholder="Caalis" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Prix de base (€) *</Label>
            <Input id="price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="89.00" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={categoryKey} onValueChange={setCategoryKey}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir…" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_KEYS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Disponibilité</Label>
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="permanent">Permanent</SelectItem>
                <SelectItem value="drop">Drop</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="valeur">Valeur</Label>
            <Input id="valeur" value={valeur} onChange={(e) => setValeur(e.target.value)} placeholder="Transmission, élégance…" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sort">Ordre d'affichage</Label>
            <Input id="sort" type="number" min="0" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description courte du produit…" rows={2} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="histoire">Histoire / Récit</Label>
          <Textarea id="histoire" value={histoire} onChange={(e) => setHistoire(e.target.value)} placeholder="Le récit derrière la pièce…" rows={4} />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox id="featured" checked={isFeatured} onCheckedChange={(v) => setIsFeatured(v === true)} />
          <Label htmlFor="featured" className="cursor-pointer">Produit mis en avant</Label>
        </div>
      </div>

      {/* ---- Variantes de finition ---- */}
      <div className="space-y-3 border-t border-border pt-5">
        <div>
          <h3 className="font-serif text-lg">Variantes de finition</h3>
          <p className="text-sm text-muted-foreground">Activez une finition et renseignez son stock. Prix vide = prix de base du produit.</p>
        </div>
        {FINISHES.map((finish) => {
          const v = variants[finish];
          return (
            <div key={finish} className="border border-border rounded-sm p-3 space-y-3">
              <div className="flex items-center gap-2">
                <Checkbox
                  id={`finish-${finish}`}
                  checked={v.active}
                  onCheckedChange={(checked) => setVariant(finish, { active: checked === true })}
                />
                <Label htmlFor={`finish-${finish}`} className="cursor-pointer capitalize">Finition {finish}</Label>
              </div>
              {v.active && (
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Stock *</Label>
                    <Input type="number" min="0" value={v.stock} onChange={(e) => setVariant(finish, { stock: e.target.value })} placeholder="10" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Prix (€)</Label>
                    <Input type="number" step="0.01" min="0" value={v.price} onChange={(e) => setVariant(finish, { price: e.target.value })} placeholder="hérite" />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">SKU</Label>
                    <Input value={v.sku} onChange={(e) => setVariant(finish, { sku: e.target.value })} placeholder="optionnel" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ---- Galerie ---- */}
      <div className="space-y-3 border-t border-border pt-5">
        <div>
          <h3 className="font-serif text-lg">Galerie</h3>
          <p className="text-sm text-muted-foreground">Ajoutez des images, réordonnez-les et marquez l'image principale.</p>
        </div>

        <label className="flex items-center gap-2 cursor-pointer border border-dashed border-input rounded-sm px-4 py-3 hover:bg-secondary transition-colors">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Ajouter des images…</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => { onAddFiles(e.target.files); e.target.value = ""; }} />
        </label>

        {gallery.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">Aucune image pour l'instant.</p>
        ) : (
          <ul className="space-y-2">
            {gallery.map((item, i) => (
              <li key={item.key} className="flex items-center gap-3 border border-border rounded-sm p-2">
                <img src={item.url} alt={item.alt} className="h-14 w-14 object-cover rounded-sm" />
                <Input
                  value={item.alt}
                  onChange={(e) => setGallery((prev) => prev.map((g) => (g.key === item.key ? { ...g, alt: e.target.value } : g)))}
                  placeholder="Texte alternatif…"
                  className="flex-1 h-9"
                />
                <Button
                  type="button"
                  variant={item.isPrimary ? "default" : "outline"}
                  size="sm"
                  onClick={() => setPrimary(item.key)}
                  title="Définir comme principale"
                >
                  <Star className="h-3.5 w-3.5" />
                  {item.isPrimary ? "Principale" : ""}
                </Button>
                <div className="flex flex-col">
                  <button type="button" onClick={() => moveImage(i, -1)} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30" title="Monter">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => moveImage(i, 1)} disabled={i === gallery.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30" title="Descendre">
                    <ArrowDown className="h-4 w-4" />
                  </button>
                </div>
                <button type="button" onClick={() => removeImage(item)} className="text-destructive hover:text-destructive/80" title="Retirer">
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---- Actions ---- */}
      <div className="flex gap-3 pt-2 border-t border-border">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {isEdit ? "Enregistrer les modifications" : "Créer le produit"}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
      </div>
    </form>
  );
};

export default ProductForm;
