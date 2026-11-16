import { kunBoshi } from "@/lib/vaqt";

// Harajat formasi tekshiruvi (POST va PATCH uchun umumiy). Turkumlar tayyor ro'yxat (DECISIONS.md).

export const TURKUMLAR = ["MAHSULOT", "ISH_HAQI", "KOMMUNAL", "IJARA", "BOSHQA"] as const;
export type Turkum = (typeof TURKUMLAR)[number];

export function harajatMaydonlari(body: Record<string, unknown>) {
  const summa = Number(body.summa);
  if (!Number.isInteger(summa) || summa <= 0 || summa > 1_000_000_000) return "Summa noto'g'ri (so'mda, butun son)";
  if (!TURKUMLAR.includes(body.turkum as Turkum)) return "Turkumni tanlang";
  const izoh = typeof body.izoh === "string" && body.izoh.trim() ? body.izoh.trim().slice(0, 200) : null;
  return { summa, turkum: body.turkum as Turkum, izoh, sana: kunBoshi(typeof body.sana === "string" ? body.sana : null) };
}
