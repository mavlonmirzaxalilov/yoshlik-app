import { HOLAT_NOMLARI, type ZakazHolati } from "@/lib/holatlar";

// Maketdagi belgilar: jarayondagi — to'q sariq, yakunlangan — yashil, bekor — qizil.
const RANG: Record<ZakazHolati, string> = {
  TOLOV_KUTILMOQDA: "bg-amber-100 text-amber-800",
  TOLANDI: "bg-asosiy text-white",
  QABUL_QILINDI: "bg-asosiy text-white",
  TAYYORLANMOQDA: "bg-asosiy text-white",
  TAYYOR: "bg-asosiy text-white",
  YOLDA: "bg-asosiy text-white",
  BERILDI: "bg-yashil-fon text-yashil",
  BEKOR: "bg-qizil-fon text-qizil",
};

export default function HolatBelgisi({ holat }: { holat: ZakazHolati }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${RANG[holat]}`}>
      {HOLAT_NOMLARI[holat]}
    </span>
  );
}
