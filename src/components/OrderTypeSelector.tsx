import type { OrderType } from "../types";
import { useOrder } from "../context/OrderContext";

const OPTIONS: { type: OrderType; label: string; emoji: string }[] = [
  { type: "delivery", label: "Yetkazish", emoji: "🚚" },
  { type: "pickup", label: "Olib ketish", emoji: "🏃" },
  { type: "dine_in", label: "Joyida", emoji: "🍴" },
];

export function OrderTypeSelector() {
  const { orderType, setOrderType } = useOrder();

  return (
    <div className="grid grid-cols-3 gap-2">
      {OPTIONS.map((option) => {
        const active = orderType === option.type;
        return (
          <button
            key={option.type}
            onClick={() => setOrderType(option.type)}
            className={`flex flex-col items-center gap-1.5 rounded-2xl py-4 transition-colors ${
              active
                ? "bg-primary text-white shadow-sm"
                : "bg-white text-gray-600 shadow-sm shadow-black/5"
            }`}
          >
            <span className="text-2xl">{option.emoji}</span>
            <span className="text-xs font-medium">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
