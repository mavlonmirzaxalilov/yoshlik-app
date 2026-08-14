import type { PaymentMethod } from "../types";
import { useOrder } from "../context/OrderContext";

const OPTIONS: { method: PaymentMethod; label: string; emoji: string }[] = [
  { method: "cash", label: "Naqd", emoji: "💵" },
  { method: "online", label: "Click-Payme", emoji: "💳" },
];

export function PaymentMethodSelector() {
  const { paymentMethod, setPaymentMethod } = useOrder();

  return (
    <div className="grid grid-cols-2 gap-2">
      {OPTIONS.map((option) => {
        const active = paymentMethod === option.method;
        return (
          <button
            key={option.method}
            onClick={() => setPaymentMethod(option.method)}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-gray-600 shadow-sm shadow-black/5"
            }`}
          >
            <span className="text-lg">{option.emoji}</span>
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
