import type { OrderStatus, OrderType } from "../types";

export const ACTIVE_STATUSES: OrderStatus[] = ["new", "accepted", "preparing", "ready"];

export const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "Yangi",
  accepted: "Qabul qilindi",
  preparing: "Tayyorlanmoqda",
  ready: "Tayyor",
  cancelled: "Bekor qilindi",
};

export const STATUS_BADGE_CLASSES: Record<OrderStatus, string> = {
  new: "bg-gray-100 text-gray-600",
  accepted: "bg-blue-100 text-blue-600",
  preparing: "bg-primary-light text-primary-dark",
  ready: "bg-green-100 text-green-600",
  cancelled: "bg-red-100 text-red-500",
};

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  delivery: "Yetkazish",
  pickup: "Olib ketish",
  dine_in: "Joyida",
};

// Faol buyurtma uchun 3 bosqichli progress: Qabul qilindi -> Tayyorlanmoqda -> Tayyor
export const STEP_LABELS = ["Qabul qilindi", "Tayyorlanmoqda", "Tayyor"] as const;

export function getStepIndex(status: OrderStatus): number {
  switch (status) {
    case "new":
    case "accepted":
      return 0;
    case "preparing":
      return 1;
    case "ready":
      return 2;
    default:
      return 0;
  }
}

export function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function summarizeItems(items: { product_name: string; quantity: number }[]): string {
  return items.map((item) => `${item.quantity} ta ${item.product_name}`).join(", ");
}
