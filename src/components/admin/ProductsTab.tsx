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

const ProductsTab = ({ filterOutOfStock = false }: ProductsTabProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Tables<"products"> | null>(null);

  const { data: products, refetch } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateField = async (id: string, field: string, value: number) => {
    const { error } = await supabase.from("products").update({ [field]: value }).eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(field === "price" ? "Prix mis à jour" : "Stock mis à jour");
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
              <TableHead>Prix</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead>En avant</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  Aucun produit. Cliquez sur "Ajouter un produit" pour commencer.
                </TableCell>
              </TableRow>
            )}
            {products
              ?.filter((p) => !filterOutOfStock || p.stock_quantity === 0)
              .map((product) => (
              <TableRow key={product.id} className={product.stock_quantity === 0 ? "bg-destructive/5" : product.stock_quantity < 5 ? "bg-orange-50 dark:bg-orange-950/20" : ""}>
                <TableCell>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="h-10 w-10 object-cover rounded" />
                  ) : (
                    <div className="h-10 w-10 bg-muted rounded" />
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell><Badge variant="secondary">{product.category}</Badge></TableCell>
                <TableCell>
                  <InlineEditCell value={product.price} type="price" onSave={(v) => updateField(product.id, "price", v)} />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <InlineEditCell value={product.stock_quantity} type="stock" onSave={(v) => updateField(product.id, "stock_quantity", v)} />
                    {product.stock_quantity === 0 && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        <AlertTriangle className="h-3 w-3 mr-0.5" />
                        ÉPUISÉ
                      </Badge>
                    )}
                  </div>
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
            ))}
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
