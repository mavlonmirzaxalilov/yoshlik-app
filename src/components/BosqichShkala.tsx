import { Check, ChefHat, Bike, Bell } from "lucide-react";
import type { ZakazHolati } from "@/lib/holatlar";

// Faol buyurtma bosqichlari (maketdagi shkala), bizning holatlarga moslangan:
// Qabul qilindi/To'landi → Tayyorlanmoqda → Tayyor (→ yetkazishda Yo'lda).

type Bosqich = { nom: string; ikona: typeof Check };

export default function BosqichShkala({ holat, olishUsuli }: { holat: ZakazHolati; olishUsuli: string }) {
  const bosqichlar: Bosqich[] = [
    { nom: holat === "TOLANDI" ? "To'landi" : "Qabul qilindi", ikona: Check },
    { nom: "Tayyorlanmoqda", ikona: ChefHat },
    { nom: "Tayyor", ikona: Bell },
    ...(olishUsuli === "YETKAZISH" ? [{ nom: "Yo'lda", ikona: Bike }] : []),
  ];
  const joriy =
    { TOLANDI: 0, QABUL_QILINDI: 0, TAYYORLANMOQDA: 1, TAYYOR: 2, YOLDA: 3, BERILDI: bosqichlar.length } as Partial<
      Record<ZakazHolati, number>
    >;
  const indeks = joriy[holat] ?? 0;

  return (
    <ol className="flex items-start justify-between">
      {bosqichlar.map((b, i) => {
        const otgan = i < indeks;
        const hozir = i === indeks;
        const Ikona = otgan ? Check : b.ikona;
        return (
          <li key={b.nom} className="relative flex flex-1 flex-col items-center gap-1.5 text-center">
            {i > 0 && (
              <span
                className={`absolute right-1/2 top-3.5 -z-0 h-0.5 w-full ${i <= indeks ? "bg-asosiy" : "bg-stone-200"}`}
                aria-hidden
              />
            )}
            <span
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full ${
                otgan ? "bg-yashil text-white" : hozir ? "bg-asosiy text-white" : "border border-stone-300 bg-white text-stone-500"
              }`}
            >
              <Ikona size={15} strokeWidth={2.2} />
            </span>
            <span className={`text-xs ${hozir ? "font-semibold text-asosiy-toq" : "text-stone-700"}`}>{b.nom}</span>
          </li>
        );
      })}
    </ol>
  );
}
