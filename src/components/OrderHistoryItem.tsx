import type { Order } from "../types";
import { formatPrice } from "../lib/pricing";
import {
  ORDER_TYPE_LABELS,
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
  formatOrderDate,
  summarizeItems,
} from "../lib/orderStatus";

export function OrderHistoryItem({ order }: { order: Order }) {
  const itemsSummary = summarizeItems(order.order_items);

  return (
    <div className="rounded-2xl bg-white p-3.5 shadow-sm shadow-black/5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">
          #{order.order_number} · {formatOrderDate(order.created_at)}
        </span>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_BADGE_CLASSES[order.status]}`}>
          {STATUS_LABELS[order.status]}
        </span>
      </div>
      {itemsSummary && (
        <p className="mb-2 line-clamp-2 text-sm text-gray-700">{itemsSummary}</p>
      )}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-primary">
          {formatPrice(order.grand_total)} so'm
        </span>
        <span className="text-xs text-gray-400">{ORDER_TYPE_LABELS[order.order_type]}</span>
      </div>
    </div>
  );
}
