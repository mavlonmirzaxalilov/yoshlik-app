import type { OrderType } from "../types";

export const DISH_UNIT_PRICE = 2000;
export const DELIVERY_BASE_FEE = 10000;
export const DELIVERY_PER_KM = 2000;

export function calcDishTotal(orderType: OrderType, totalQuantity: number): number {
  return orderType !== "dine_in" ? totalQuantity * DISH_UNIT_PRICE : 0;
}

export function calcDeliveryFee(orderType: OrderType, distanceKm: number | null): number {
  if (orderType !== "delivery") return 0;
  if (distanceKm == null) return 0;
  return Math.round(DELIVERY_BASE_FEE + DELIVERY_PER_KM * distanceKm);
}

export function calcGrandTotal(
  foodTotal: number,
  orderType: OrderType,
  totalQuantity: number,
  distanceKm: number | null
): number {
  return (
    foodTotal +
    calcDishTotal(orderType, totalQuantity) +
    calcDeliveryFee(orderType, distanceKm)
  );
}

export function formatPrice(price: number): string {
  return price.toLocaleString("ru-RU").replace(/,/g, " ");
}

export function formatDistance(distanceKm: number): string {
  return distanceKm < 10 ? `${distanceKm.toFixed(1)} km` : `${Math.round(distanceKm)} km`;
}
