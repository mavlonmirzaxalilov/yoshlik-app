import { supabase } from "./supabase";
import { getTelegramUser } from "./telegram";
import { calcDeliveryFee, calcDishTotal } from "./pricing";
import type { CartItem, OrderType, PaymentMethod } from "../types";

interface PlaceOrderParams {
  items: CartItem[];
  orderType: OrderType;
  address: string | null;
  distanceKm: number | null;
  paymentMethod: PaymentMethod;
}

interface PlaceOrderResult {
  orderId: string;
  orderNumber: number;
}

export async function placeOrder(params: PlaceOrderParams): Promise<PlaceOrderResult> {
  const telegramUser = getTelegramUser();
  if (!telegramUser) {
    throw new Error(
      "Telegram foydalanuvchi ma'lumoti topilmadi. Ilovani Telegram ichida oching."
    );
  }

  const userTelegramId = telegramUser.id;

  let customerName = [telegramUser.first_name, telegramUser.last_name]
    .filter(Boolean)
    .join(" ")
    .trim();
  let customerPhone = "";

  const { data: botUser, error: botUserError } = await supabase
    .from("bot_users")
    .select("full_name, phone")
    .eq("telegram_id", userTelegramId)
    .maybeSingle();

  if (botUserError) {
    console.error("bot_users so'rovida xatolik:", botUserError.message);
  }

  if (botUser) {
    if (botUser.full_name) customerName = botUser.full_name;
    if (botUser.phone) customerPhone = botUser.phone;
  }

  const totalQuantity = params.items.reduce((sum, item) => sum + item.quantity, 0);
  const itemsTotal = params.items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const containerTotal = calcDishTotal(params.orderType, totalQuantity);
  const deliveryTotal = calcDeliveryFee(params.orderType, params.distanceKm);
  const grandTotal = itemsTotal + containerTotal + deliveryTotal;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_telegram_id: userTelegramId,
      customer_name: customerName || "Noma'lum",
      customer_phone: customerPhone || "",
      order_type: params.orderType,
      address: params.orderType === "delivery" ? params.address : null,
      payment_method: params.paymentMethod,
      items_total: itemsTotal,
      container_total: containerTotal,
      delivery_total: deliveryTotal,
      grand_total: grandTotal,
      status: "new",
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    throw new Error(orderError?.message ?? "Buyurtmani saqlashda xatolik yuz berdi");
  }

  const orderItemsPayload = params.items.map((item) => ({
    order_id: order.id,
    product_id: item.product.id,
    product_name: item.product.name,
    price: item.product.price,
    quantity: item.quantity,
    subtotal: item.product.price * item.quantity,
  }));

  const { error: itemsError } = await supabase.from("order_items").insert(orderItemsPayload);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  return { orderId: order.id, orderNumber: order.order_number };
}
