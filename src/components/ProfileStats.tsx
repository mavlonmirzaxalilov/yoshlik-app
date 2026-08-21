import { formatPrice } from "../lib/pricing";

interface ProfileStatsProps {
  ordersCount: number;
  totalSpent: number;
}

export function ProfileStats({ ordersCount, totalSpent }: ProfileStatsProps) {
  return (
    <section className="grid grid-cols-2 gap-3 px-5">
      <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3 shadow-sm shadow-black/5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12l1 13H5L6 7Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7a3 3 0 0 1 6 0" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Buyurtmalar</p>
          <p className="text-lg font-bold text-gray-900">{ordersCount}</p>
        </div>
      </div>
      <div className="flex items-center gap-2.5 rounded-2xl bg-white p-3 shadow-sm shadow-black/5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-light text-primary">
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="6" width="18" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 12h.01" />
          </svg>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-gray-500">Jami</p>
          <p className="truncate text-lg font-bold text-gray-900">{formatPrice(totalSpent)}</p>
        </div>
      </div>
    </section>
  );
}
