import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useOrder } from "../context/OrderContext";
import { OrderTypeSelector } from "../components/OrderTypeSelector";
import { PaymentMethodSelector } from "../components/PaymentMethodSelector";
import { BillSummary } from "../components/BillSummary";
import { calcGrandTotal, formatDistance, formatPrice } from "../lib/pricing";
import { WebApp } from "../lib/telegram";

interface OrderScreenProps {
  onBack: () => void;
  onOrderPlaced: () => void;
}

export function OrderScreen({ onBack, onOrderPlaced }: OrderScreenProps) {
  const { items, foodTotal, totalQuantity, clear } = useCart();
  const {
    orderType,
    address,
    setAddress,
    paymentMethod,
    distanceKm,
    locationStatus,
    locationError,
    requestLocation,
  } = useOrder();
  const [submitting, setSubmitting] = useState(false);

  const grandTotal = calcGrandTotal(foodTotal, orderType, totalQuantity, distanceKm);
  const addressMissing = orderType === "delivery" && address.trim() === "";
  const locationMissing = orderType === "delivery" && distanceKm == null;
  const canConfirm = items.length > 0 && !addressMissing && !locationMissing && !submitting;

  const handleConfirm = () => {
    if (!canConfirm) return;
    setSubmitting(true);

    const payload = {
      items: items.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
      })),
      orderType,
      address: orderType === "delivery" ? address.trim() : null,
      distanceKm: orderType === "delivery" ? distanceKm : null,
      paymentMethod,
      total: grandTotal,
    };

    try {
      WebApp.sendData(JSON.stringify(payload));
    } catch {
      // Telegram tashqarisida (brauzerda) ishlatilganda jim o'tkazib yuboriladi
    }

    clear();
    onOrderPlaced();
  };

  return (
    <div className="pb-32">
      <header className="flex items-center gap-3 bg-white px-5 py-4 shadow-sm shadow-black/5">
        <button
          onClick={onBack}
          aria-label="Orqaga"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-95"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900">Buyurtma</h1>
      </header>

      <div className="flex flex-col gap-5 px-5 py-4">
        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">Buyurtma turi</h2>
          <OrderTypeSelector />
        </section>

        {orderType === "delivery" && (
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-gray-700">Manzil</h2>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Ko'cha, uy, kvartira raqami"
              className="w-full rounded-2xl bg-white px-4 py-3 text-sm text-gray-800 shadow-sm shadow-black/5 placeholder:text-gray-400 focus:outline-none"
            />

            {locationStatus === "granted" && distanceKm != null ? (
              <div className="flex items-center justify-between rounded-2xl bg-primary-light px-4 py-3 text-sm text-primary-dark">
                <span>📍 Joylashuv aniqlandi ({formatDistance(distanceKm)})</span>
                <button
                  onClick={() => requestLocation()}
                  className="text-xs font-semibold underline underline-offset-2"
                >
                  Yangilash
                </button>
              </div>
            ) : (
              <button
                onClick={() => requestLocation()}
                disabled={locationStatus === "loading"}
                className="flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm shadow-black/5 active:scale-[0.98] disabled:opacity-60"
              >
                {locationStatus === "loading" ? (
                  "Aniqlanmoqda..."
                ) : (
                  <>
                    <span>📍</span> Joylashuvni yuborish
                  </>
                )}
              </button>
            )}

            {(locationStatus === "denied" || locationStatus === "error") && locationError && (
              <p className="text-xs text-red-500">{locationError}</p>
            )}
          </section>
        )}

        <section>
          <h2 className="mb-2 text-sm font-semibold text-gray-700">To'lov usuli</h2>
          <PaymentMethodSelector />
        </section>

        <section>
          <BillSummary />
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 flex justify-center pb-4">
        <div className="w-full max-w-[390px] px-4">
          <button
            onClick={handleConfirm}
            disabled={!canConfirm}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 py-4 text-sm font-bold text-white shadow-lg shadow-green-600/30 transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:shadow-none"
          >
            Buyurtmani tasdiqlash · {formatPrice(grandTotal)} so'm
          </button>
        </div>
      </div>
    </div>
  );
}
