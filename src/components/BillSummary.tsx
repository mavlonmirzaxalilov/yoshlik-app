import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import {
  calcDeliveryFee,
  calcDishTotal,
  calcGrandTotal,
  formatDistance,
  formatPrice,
} from "../lib/pricing";

export function BillSummary() {
  const { foodTotal, totalQuantity } = useCart();
  const { orderType, distanceKm } = useOrder();

  const dishTotal = calcDishTotal(orderType, totalQuantity);
  const deliveryFee = calcDeliveryFee(orderType, distanceKm);
  const grandTotal = calcGrandTotal(foodTotal, orderType, totalQuantity, distanceKm);
  const showDelivery = orderType === "delivery" && distanceKm != null;

  return (
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-4 shadow-sm shadow-black/5">
      <Row label="Taomlar" value={foodTotal} />
      <Row label="Idish" value={dishTotal} />
      {showDelivery && (
        <Row label={`Yetkazib berish (${formatDistance(distanceKm!)})`} value={deliveryFee} />
      )}
      <div className="my-1 border-t border-dashed border-gray-200" />
      <Row label="Jami" value={grandTotal} bold />
    </div>
  );
}

function Row({
  label,
  value,
  bold,
}: {
  label: string;
  value: number;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between text-sm ${
        bold ? "text-base font-bold text-gray-900" : "text-gray-500"
      }`}
    >
      <span>{label}</span>
      <span className={bold ? "text-primary" : "text-gray-700"}>
        {formatPrice(value)} so'm
      </span>
    </div>
  );
}
