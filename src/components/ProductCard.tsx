import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/pricing";

export function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  return (
    <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm shadow-black/5">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            🍽️
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <h3 className="truncate text-sm font-semibold text-gray-800">
            {product.name}
          </h3>
          {product.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm font-bold text-primary">
            {formatPrice(product.price)} so'm
          </span>
          <button
            onClick={() => addItem(product)}
            aria-label={`${product.name} qo'shish`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm active:scale-95"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
