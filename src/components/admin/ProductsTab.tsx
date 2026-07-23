import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import ProductForm from "./ProductForm";
import InlineEditCell from "./InlineEditCell";
import EditProductModal from "./EditProductModal";
import type { Tables } from "@/integrations/supabase/types";

interface ProductsTabProps {
  filterOutOfStock?: boolean;
}

type VariantSummary = Pick<Tables<"product_variants">, "finish" | "stock_quantity">;
type ImageSummary = Pick<Tables<"product_images">, "image_url" | "is_primary">;
type ProductWithVariants = Tables<"products"> & {
  product_variants: VariantSummary[];
  product_images: ImageSummary[];
};

const CATEGORY_LABELS: Record<string, string> = {
  colliers: "Colliers",
  bagues: "Bagues",
  bracelets: "Bracelets",
  boucles: "Boucles d'oreilles",
};

// Stock effectif = somme des variantes (source unique product_variants.stock_quantity).
const totalStock = (p: ProductWithVariants) =>
  p.product_variants.reduce((s, v) => s + v.stock_quantity, 0);

// Vignette : image principale de la galerie (product_images), placeholder sinon.
const primaryImage = (p: ProductWithVariants): string | null => {
  const imgs = p.product_images ?? [];
  return (imgs.find((i) => i.is_primary) ?? imgs[0])?.image_url ?? null;
};

const ProductsTab = ({ filterOutOfStock = false }: ProductsTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Tables<"products"> | null>(null);

  const { data: products, refetch } = useQuery<ProductWithVariants[]>({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, product_variants(finish, stock_quantity), product_images(image_url, is_primary)")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as ProductWithVariants[];
    },
  });

  // Seul le prix produit s'édite en ligne. Le stock se gère par variante
  // (product_variants) dans le formulaire produit — plus de stock legacy.
  const updatePrice = async (id: string, value: number) => {
    const { error } = await supabase.from("products").update({ price: value }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Prix mis à jour");
    refetch();
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Produit supprimé");
    refetch();
  };

  if (showForm) {
    return (
      <div>
        <h2 className="font-serif text-xl font-semibold mb-4">Ajouter un produit</h2>
        <ProductForm
          onSuccess={() => { setShowForm(false); refetch(); }}
          onCancel={() => setShowForm(false)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-serif text-xl font-semibold">Produits</h2>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Ajouter un produit
        </Button>
      </div>

      <div className="border border-border rounded">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Catégorie</TableHead>
              <TableHead>Dispo.</TableHead>
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>En avant</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Aucun produit. Cliquez sur "Ajouter un produit" pour commencer.
                </TableCell>
              </TableRow>
            )}
            {products
              ?.filter((p) => !filterOutOfStock || totalStock(p) === 0)
              .map((product) => {
                const stock = totalStock(product);
                const hasVariants = product.product_variants.length > 0;
                const img = primaryImage(product);
                return (
              <TableRow key={product.id} className={stock === 0 ? "bg-destructive/5" : stock < 5 ? "bg-orange-50 dark:bg-orange-950/20" : ""}>
                <TableCell>
                  {img ? (
                    <img src={img} alt={product.name} className="h-10 w-10 object-cover rounded" />
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded" />
                  )}
                </TableCell>
                <TableCell className="font-medium">
                  {product.name}
                  {product.wolof_name && (
                    <span className="block text-xs text-muted-foreground italic">{product.wolof_name}</span>
                  )}
                </TableCell>
                <TableCell>
                  {product.category_key ? (
                    <Badge variant="secondary">{CATEGORY_LABELS[product.category_key] ?? product.category_key}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={product.availability === "drop" ? "default" : "outline"}>
                    {product.availability === "drop" ? "Drop" : "Permanent"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <InlineEditCell value={product.price} type="price" onSave={(v) => updatePrice(product.id, v)} />
                </TableCell>
                <TableCell>
                  {hasVariants ? (
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className={stock === 0 ? "text-destructive font-bold" : stock < 5 ? "text-orange-500 font-semibold" : ""}>
                          {stock}
                        </span>
                        {stock === 0 && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                            <AlertTriangle className="h-3 w-3 mr-0.5" />
                            ÉPUISÉ
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {product.product_variants.map((v) => (
                          <Badge key={v.finish} variant="secondary" className="text-[10px] px-1.5 py-0 capitalize">
                            {v.finish}: {v.stock_quantity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm" title="Ajoutez des variantes de finition pour gérer le stock">
                      — <span className="text-xs">(sans variante)</span>
                    </span>
                  )}
                </TableCell>
                <TableCell>{product.is_featured ? "✓" : "—"}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditingProduct(product)} title="Modifier">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="Supprimer">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer "{product.name}" ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. Le produit sera définitivement supprimé.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteProduct(product.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          open={!!editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={() => refetch()}
        />
      )}
    </div>
  );
};

export default ProductsTab;
