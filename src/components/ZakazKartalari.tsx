import Link from "next/link";
import BosqichShkala from "@/components/BosqichShkala";
import HolatBelgisi from "@/components/HolatBelgisi";
import { sanaFormat, somFormat, type Zakaz } from "@/lib/turlar";

// Maketdagi ikki xil kartochka: "Faol buyurtma" (bosqichlar bilan) va tarix kartochkasi.

export const tarkibMatni = (z: Zakaz) => z.qatorlar.map((q) => (q.soni > 1 ? `${q.soni} ta ${q.nom}` : q.nom)).join(", ");

export const faolmi = (z: Zakaz) => !["BERILDI", "BEKOR"].includes(z.holat);

export function FaolBuyurtma({ zakaz }: { zakaz: Zakaz }) {
  const tolovKutilmoqda = zakaz.holat === "TOLOV_KUTILMOQDA";
  const tolov = zakaz.tolovlar?.find((t) => t.holat === "KUTILMOQDA");
  return (
    <div className="rounded-karta border border-shaftoli-chegara bg-shaftoli/70 p-4">
      <Link href={`/zakaz/${zakaz.id}`} className="flex items-center justify-between gap-2">
        <h3 className="text-lg font-bold">Faol buyurtma #{zakaz.raqam}</h3>
        <HolatBelgisi holat={zakaz.holat} />
      </Link>

      <div className="my-4">
        {tolovKutilmoqda ? (
          <Link
            href={tolov ? `/tolov/${tolov.id}` : `/zakaz/${zakaz.id}`}
            className="block rounded-xl bg-asosiy py-2.5 text-center font-semibold text-white"
          >
            To&apos;lashga o&apos;tish
          </Link>
        ) : (
          <BosqichShkala holat={zakaz.holat} olishUsuli={zakaz.olishUsuli} />
        )}
      </div>

      <div className="flex items-end justify-between gap-3 border-t border-shaftoli-chegara pt-3">
        <span className="text-sm text-stone-700">{tarkibMatni(zakaz)}</span>
        <span className="shrink-0 text-lg font-bold text-asosiy">{somFormat(zakaz.jamiSumma)}</span>
      </div>
    </div>
  );
}

export function TarixKartasi({ zakaz }: { zakaz: Zakaz }) {
  return (
    <Link
      href={`/zakaz/${zakaz.id}`}
      className="block rounded-karta border border-stone-200/80 bg-white p-4 shadow-karta hover:bg-stone-50"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm text-stone-700">
          #{zakaz.raqam} | {sanaFormat(zakaz.yaratilgan).split(",")[0]}
        </span>
        <HolatBelgisi holat={zakaz.holat} />
      </div>
      <p className="mt-2 truncate">{tarkibMatni(zakaz)}</p>
      <p className="mt-1 text-xl font-bold text-asosiy">{somFormat(zakaz.jamiSumma)}</p>
    </Link>
  );
}
