import { useCart } from "../context/CartContext";
import { CartItemRow } from "../components/CartItemRow";
import { BillSummary } from "../components/BillSummary";

interface CartScreenProps {
  onBack: () => void;
  onCheckout: () => void;
}

export function CartScreen({ onBack, onCheckout }: CartScreenProps) {
  const { items } = useCart();

  return (
    <div className="pb-32">
      <header className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm shadow-black/5">
        <button
          onClick={onBack}
          aria-label="Orqaga"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Savat</h1>
      </header>

      {items.length === 0 ? (
        <p className="py-16 text-center text-sm text-gray-400">Savat bo'sh</p>
      ) : (
        <div className="flex flex-col gap-3 px-5 py-4">
          {items.map((item) => (
            <CartItemRow key={item.product.id} item={item} />
          ))}

          <BillSummary />
        </div>
      )}

      {items.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center pb-4">
          <div className="w-full max-w-[390px] px-4">
            <button
              onClick={onCheckout}
              className="w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
            >
              Buyurtmani rasmiylashtirish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
