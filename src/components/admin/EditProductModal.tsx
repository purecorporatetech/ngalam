import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import ProductForm from "./ProductForm";
import type { Tables } from "@/integrations/supabase/types";

interface EditProductModalProps {
  product: Tables<"products">;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditProductModal = ({ product, open, onClose, onSuccess }: EditProductModalProps) => {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier le produit</DialogTitle>
          <DialogDescription>
            Récit, variantes de finition et galerie du produit.
          </DialogDescription>
        </DialogHeader>
        <ProductForm
          product={product}
          onSuccess={() => {
            onSuccess();
            onClose();
          }}
          onCancel={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditProductModal;
