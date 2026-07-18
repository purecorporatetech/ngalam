import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Upload, Loader2 } from "lucide-react";
import type { Tables } from "@/integrations/supabase/types";

const CATEGORIES = ["Drop", "Collier", "Bague", "Bracelet", "BO"];

interface EditProductModalProps {
  product: Tables<"products">;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProductModal = ({ product, open, onClose, onSuccess }: EditProductModalProps) => {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description || "");
  const [price, setPrice] = useState(String(product.price));
  const [stock, setStock] = useState(String(product.stock_quantity));
  const [category, setCategory] = useState(product.category);
  const [isFeatured, setIsFeatured] = useState(product.is_featured);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error("Le nom est requis");
      return;
    }

    setLoading(true);
    try {
      let imageUrl = product.image_url;

      if (imageFile) {
        const ext = imageFile.name.split(".").pop();
        const path = `${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, imageFile);
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }

      const { error } = await supabase
        .from("products")
        .update({
          name,
          description: description || null,
          price: parseFloat(price),
          stock_quantity: parseInt(stock) || 0,
          category,
          is_featured: isFeatured,
          image_url: imageUrl,
        })
        .eq("id", product.id);

      if (error) throw error;

      toast.success("Produit modifié avec succès");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
          <DialogDescription>Modifiez les informations du produit ci-dessous.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Nom *</Label>
            <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-desc">Description</Label>
            <Textarea id="edit-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-price">Prix (€) *</Label>
              <Input id="edit-price" type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stock">Stock</Label>
              <Input id="edit-stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Catégorie</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="edit-featured" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} className="rounded border-input" />
            <Label htmlFor="edit-featured" className="cursor-pointer">Produit mis en avant (Best Seller)</Label>
          </div>

          <div className="space-y-2">
            <Label>Image</Label>
            {product.image_url && !imageFile && (
              <img src={product.image_url} alt={product.name} className="h-20 w-20 object-cover rounded mb-2" />
            )}
            <label className="flex items-center gap-2 cursor-pointer border border-dashed border-input rounded px-4 py-3 hover:bg-secondary transition-colors">
              <Upload className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                {imageFile ? imageFile.name : "Changer l'image..."}
              </span>
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Enregistrer les modifications
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
