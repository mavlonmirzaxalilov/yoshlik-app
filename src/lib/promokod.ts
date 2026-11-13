import type { Prisma, PrismaClient } from "@prisma/client";

type Db = PrismaClient | Prisma.TransactionClient;

export type PromokodNatija = { ok: true; id: number; foiz: number; chegirma: number } | { ok: false; xato: string };

/** Kodni tekshiradi; chegirma faqat taomlar summasiga (yetkazishga emas). */
export async function promokodTekshir(db: Db, kod: unknown, taomlarSumma: number): Promise<PromokodNatija> {
  if (typeof kod !== "string" || !kod.trim()) return { ok: false, xato: "Promokodni kiriting" };
  const p = await db.promokod.findUnique({ where: { kod: kod.trim().toUpperCase() } });
  if (!p || !p.faol || p.foiz <= 0) return { ok: false, xato: "Promokod topilmadi" };
  if (p.muddati && p.muddati < new Date()) return { ok: false, xato: "Promokod muddati o'tgan" };
  if (p.maxIshlatish !== null && p.ishlatildi >= p.maxIshlatish) {
    return { ok: false, xato: "Promokod limiti tugagan" };
  }
  return { ok: true, id: p.id, foiz: p.foiz, chegirma: Math.floor((taomlarSumma * p.foiz) / 100) };
}
