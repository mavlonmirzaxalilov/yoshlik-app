import { prisma } from "@/lib/prisma";

// Admin paneldan o'zgartiriladigan sozlamalar. Bazada bo'lmasa — .env qiymati (avvalgi xatti-harakat).

export const SOZLAMA_KALITLARI = [
  "KAFE_TELEFON",
  "KAFE_TELEGRAM",
  "KAFE_LAT",
  "KAFE_LNG",
  "YETKAZISH_BAZAVIY",
  "YETKAZISH_KM_NARXI",
  "YETKAZISH_RADIUS_KM",
  "YETKAZISH_MIN_SUMMA",
] as const;

export type SozlamaKaliti = (typeof SOZLAMA_KALITLARI)[number];

/** Barcha sozlamalar: baza ustun, bo'sh bo'lsa .env. */
export async function sozlamalar(): Promise<Record<SozlamaKaliti, string>> {
  const bazada = await prisma.sozlama.findMany({ where: { kalit: { in: [...SOZLAMA_KALITLARI] } } });
  const natija = {} as Record<SozlamaKaliti, string>;
  for (const k of SOZLAMA_KALITLARI) {
    natija[k] = bazada.find((s) => s.kalit === k)?.qiymat.trim() || process.env[k]?.trim() || "";
  }
  return natija;
}
