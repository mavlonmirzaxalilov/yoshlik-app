import type { CartItem } from "../types";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/pricing";
import { QuantityStepper } from "./QuantityStepper";

export function CartItemRow({ item }: { item: CartItem }) {
  const { increment, decrement } = useCart();
  const { product, quantity } = item;

  return (
    <div className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm shadow-black/5">
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xl">
            🍽️
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <h3 className="truncate text-sm font-semibold text-gray-800">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-bold text-primary">
            {formatPrice(product.price * quantity)} so'm
          </span>
          <QuantityStepper
            quantity={quantity}
            onIncrement={() => increment(product.id)}
            onDecrement={() => decrement(product.id)}
          />
        </div>
      </div>
    </div>
  );
}
