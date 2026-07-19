import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  getGalleryUrls,
  getFinishes,
  getPriceInfo,
  type ShopProduct,
} from "@/lib/products";

const FINISH_DOT: Record<string, string> = {
  or: "bg-accent",
  argent: "bg-muted-foreground",
};

interface ProductCardProps {
  product: ShopProduct;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const images = getGalleryUrls(product);
  const primary = images[0];
  const second = images[1];
  const finishes = getFinishes(product);
  const { min, from } = getPriceInfo(product);
  const isDrop = product.availability === "drop";

  return (
    <div className="group">
      <Link to={`/product/${product.id}`}>
        <div className="aspect-[3/4] bg-muted mb-4 relative flex items-center justify-center rounded-sm overflow-hidden">
          {product.is_featured && (
            <span className="absolute top-0 left-0 bg-primary text-primary-foreground text-[10px] px-2 py-1 uppercase tracking-wider z-10">
              BEST SELLER
            </span>
          )}
          {isDrop && (
            <span className="absolute top-0 right-0 bg-accent text-accent-foreground text-[10px] px-2 py-1 uppercase tracking-wider z-10">
              Édition limitée
            </span>
          )}
          {primary ? (
            <>
              <img
                src={primary}
                alt={product.name}
                className={`w-full h-full object-cover transition-opacity duration-500 ${second ? "group-hover:opacity-0" : ""}`}
              />
              {second && (
                <img
                  src={second}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
            </>
          ) : (
            <span className="text-muted-foreground/40 text-xs tracking-[0.15em] uppercase">
              Photo à venir
            </span>
          )}
        </div>
      </Link>

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          {product.wolof_name && (
            <span className="block font-serif text-base text-foreground leading-tight truncate">
              {product.wolof_name}
            </span>
          )}
          <h3 className={`font-sans leading-tight ${product.wolof_name ? "text-xs uppercase tracking-[0.12em] text-muted-foreground" : "font-serif text-lg text-foreground"}`}>
            <Link to={`/product/${product.id}`} className="hover:text-primary transition-colors">
              {product.name}
            </Link>
          </h3>
          <span className="font-sans font-medium text-sm text-foreground/70 mt-1 block">
            {from ? "à partir de " : ""}{min}€
          </span>
        </div>

        {finishes.length > 0 && (
          <div className="flex items-center gap-1 mt-1 shrink-0" aria-label="Finitions disponibles">
            {finishes.map((f) => (
              <span
                key={f}
                className={`w-3 h-3 rounded-full border border-foreground/15 ${FINISH_DOT[f] ?? "bg-muted"}`}
                title={f}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
