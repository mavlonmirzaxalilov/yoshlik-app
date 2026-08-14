interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function QuantityStepper({
  quantity,
  onIncrement,
  onDecrement,
}: QuantityStepperProps) {
  return (
    <div className="flex items-center gap-3 rounded-full bg-gray-100 px-2 py-1">
      <button
        onClick={onDecrement}
        aria-label="Kamaytirish"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-gray-600 shadow-sm active:scale-95"
      >
        −
      </button>
      <span className="min-w-4 text-center text-sm font-semibold text-gray-800">
        {quantity}
      </span>
      <button
        onClick={onIncrement}
        aria-label="Ko'paytirish"
        className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-sm active:scale-95"
      >
        +
      </button>
    </div>
  );
}
