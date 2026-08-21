import type { Order } from "../types";
import { formatPrice } from "../lib/pricing";
import { STATUS_BADGE_CLASSES, STATUS_LABELS, STEP_LABELS, getStepIndex, summarizeItems } from "../lib/orderStatus";

export function ActiveOrderCard({ order }: { order: Order }) {
  const currentStep = getStepIndex(order.status);
  const itemsSummary = summarizeItems(order.order_items);
  const progressPercent = currentStep === 0 ? 0 : currentStep === 1 ? 50 : 100;

  return (
    <section className="mx-5 rounded-2xl border border-primary-light bg-primary-light/40 p-4 shadow-sm shadow-black/5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-bold text-gray-900">
          Faol buyurtma #{order.order_number}
        </h3>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE_CLASSES[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>

      <div className="relative mb-4 flex items-center justify-between">
        <div className="absolute left-[10%] right-[10%] top-3 h-0.5 bg-gray-200" />
        <div
          className="absolute left-[10%] top-3 h-0.5 bg-primary transition-all"
          style={{ width: `${progressPercent * 0.8}%` }}
        />
        {STEP_LABELS.map((label, index) => {
          const done = index < currentStep;
          const current = index === currentStep;
          return (
            <div key={label} className="relative z-10 flex flex-col items-center gap-1 px-1">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary-light text-[10px] font-bold ${
                  done || current ? "bg-primary text-white" : "bg-gray-200 text-gray-400"
                }`}
              >
                {done ? (
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m5 13 4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-center text-[10px] font-medium ${
                  current ? "text-primary" : "text-gray-500"
                }`}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-primary-light pt-3">
        <p className="line-clamp-2 flex-1 text-sm text-gray-600">{itemsSummary}</p>
        <p className="shrink-0 text-base font-bold text-primary">
          {formatPrice(order.grand_total)} so'm
        </p>
      </div>
    </section>
  );
}
