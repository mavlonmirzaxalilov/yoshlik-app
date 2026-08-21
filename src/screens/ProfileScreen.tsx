import { useMemo } from "react";
import { ProfileHeader } from "../components/ProfileHeader";
import { ProfileStats } from "../components/ProfileStats";
import { ActiveOrderCard } from "../components/ActiveOrderCard";
import { OrderHistoryItem } from "../components/OrderHistoryItem";
import { useBotUser, useMyOrders } from "../lib/queries";
import { getTelegramUser } from "../lib/telegram";
import { ACTIVE_STATUSES } from "../lib/orderStatus";

export function ProfileScreen() {
  const telegramUser = getTelegramUser();
  const telegramId = telegramUser?.id ?? null;

  const { botUser } = useBotUser(telegramId);
  const { orders, loading, error } = useMyOrders(telegramId);

  const fullName =
    botUser?.full_name ||
    [telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(" ").trim();

  const activeOrder = useMemo(
    () => orders.find((order) => ACTIVE_STATUSES.includes(order.status)),
    [orders]
  );

  const stats = useMemo(() => {
    const ordersCount = orders.length;
    const totalSpent = orders
      .filter((order) => order.status !== "cancelled")
      .reduce((sum, order) => sum + order.grand_total, 0);
    return { ordersCount, totalSpent };
  }, [orders]);

  return (
    <div className="pb-24">
      <ProfileHeader fullName={fullName} phone={botUser?.phone ?? ""} />

      <div className="flex flex-col gap-5 pt-5">
        <ProfileStats ordersCount={stats.ordersCount} totalSpent={stats.totalSpent} />

        {activeOrder && <ActiveOrderCard order={activeOrder} />}

        <section className="px-5">
          <h3 className="mb-3 text-base font-bold text-gray-900">Buyurtmalar tarixi</h3>

          {!telegramId && (
            <p className="py-6 text-center text-sm text-gray-400">
              Foydalanuvchi aniqlanmadi. Ilovani Telegram ichida oching.
            </p>
          )}

          {telegramId && loading && (
            <p className="py-6 text-center text-sm text-gray-400">Yuklanmoqda...</p>
          )}

          {telegramId && !loading && error && (
            <p className="py-6 text-center text-sm text-red-500">
              Ma'lumotlarni yuklashda xatolik: {error}
            </p>
          )}

          {telegramId && !loading && !error && orders.length === 0 && (
            <p className="py-6 text-center text-sm text-gray-400">
              Hozircha buyurtmalar yo'q
            </p>
          )}

          {telegramId && !loading && !error && orders.length > 0 && (
            <div className="flex flex-col gap-2.5">
              {orders.map((order) => (
                <OrderHistoryItem key={order.id} order={order} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
