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
export type PaymentMethod = "cash" | "click_payme";
