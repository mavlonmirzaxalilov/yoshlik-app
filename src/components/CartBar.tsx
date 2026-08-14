import { useCart } from "../context/CartContext";
import { formatPrice } from "../lib/pricing";

export function CartBar({ onOpenCart }: { onOpenCart: () => void }) {
  const { totalQuantity, foodTotal } = useCart();

  if (totalQuantity === 0) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center pb-4">
      <div className="w-full max-w-[390px] px-4">
        <button
          onClick={onOpenCart}
          className="flex w-full items-center justify-between rounded-2xl bg-gray-900 px-5 py-4 text-white shadow-lg shadow-black/20 active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-2">
            <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold">
              {totalQuantity}
            </span>
            <span className="text-sm font-medium">Savat</span>
          </div>
          <span className="text-sm font-bold">{formatPrice(foodTotal)} so'm</span>
        </button>
      </div>
    </div>
  );
}
