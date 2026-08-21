import { supabase } from "./supabase";
import type { OrderType } from "../types";

const DISH_UNIT_PRICE_FALLBACK = 2000;
const DELIVERY_BASE_FEE_FALLBACK = 10000;
export const DELIVERY_PER_KM = 2000;

let dishUnitPrice = DISH_UNIT_PRICE_FALLBACK;
let deliveryBaseFee = DELIVERY_BASE_FEE_FALLBACK;

export async function loadPricingSettings(): Promise<void> {
  try {
    const { data, error } = await supabase
      .from("settings")
      .select("key, value")
      .in("key", ["container_price", "delivery_price"]);

    if (error) throw error;

    for (const row of data ?? []) {
      const numericValue = Number(row.value);
      if (Number.isNaN(numericValue)) continue;
      if (row.key === "container_price") dishUnitPrice = numericValue;
      if (row.key === "delivery_price") deliveryBaseFee = numericValue;
    }
  } catch (err) {
    console.error("Narx sozlamalarini o'qishda xatolik, zaxira qiymatlar ishlatiladi:", err);
  }
}

export function calcDishTotal(orderType: OrderType, totalQuantity: number): number {
  return orderType !== "dine_in" ? totalQuantity * dishUnitPrice : 0;
}

export function calcDeliveryFee(orderType: OrderType, distanceKm: number | null): number {
  if (orderType !== "delivery") return 0;
  if (distanceKm == null) return 0;
  return Math.round(deliveryBaseFee + DELIVERY_PER_KM * distanceKm);
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
