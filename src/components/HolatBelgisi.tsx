import { HOLAT_NOMLARI, type ZakazHolati } from "@/lib/holatlar";

const RANG: Record<ZakazHolati, string> = {
  TOLOV_KUTILMOQDA: "bg-amber-100 text-amber-800",
  TOLANDI: "bg-emerald-100 text-emerald-800",
  QABUL_QILINDI: "bg-emerald-100 text-emerald-800",
  TAYYORLANMOQDA: "bg-sky-100 text-sky-800",
  TAYYOR: "bg-emerald-600 text-white",
  YOLDA: "bg-sky-100 text-sky-800",
  BERILDI: "bg-stone-200 text-stone-700",
  BEKOR: "bg-red-100 text-red-700",
};

export default function HolatBelgisi({ holat }: { holat: ZakazHolati }) {
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${RANG[holat]}`}>
      {HOLAT_NOMLARI[holat]}
    </span>
  );
}
