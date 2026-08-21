export interface Category {
  id: number;
  name: string;
  sort_order: number;
  is_active: boolean;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  sort_order: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderType = "delivery" | "pickup" | "dine_in";
export type PaymentMethod = "cash" | "online";
export type OrderStatus = "new" | "accepted" | "preparing" | "ready" | "cancelled";

export interface BotUser {
  telegram_id: number;
  full_name: string | null;
  phone: string | null;
}

export interface OrderItemRow {
  product_name: string;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: number;
  customer_name: string;
  order_type: OrderType;
  grand_total: number;
  status: OrderStatus;
  created_at: string;
  order_items: OrderItemRow[];
}
