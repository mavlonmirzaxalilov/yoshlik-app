import { del, put } from "@vercel/blob";

// Taom rasmlari — Vercel Blob (ochiq store). Token faqat Vercel'da (BLOB_READ_WRITE_TOKEN):
// lokalda yo'q bo'lsa yuklash o'chiq — lokal sinovdan production omboriga yozib yubormaslik uchun.

// Vercel'da ulangan store OIDC + BLOB_STORE_ID bilan ishlaydi (yoki eski usulda BLOB_READ_WRITE_TOKEN).
export const rasmYoqilganmi = () =>
  Boolean(process.env.BLOB_READ_WRITE_TOKEN || (process.env.BLOB_STORE_ID && process.env.VERCEL));

const TURLAR: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const RASM_MAX_BAYT = 2 * 1024 * 1024;

export function rasmTekshir(fayl: File): string | null {
  if (!TURLAR[fayl.type]) return "Faqat JPG, PNG yoki WebP rasm";
  if (fayl.size > RASM_MAX_BAYT) return "Rasm 2 MB dan katta bo'lmasin";
  return null;
}

export async function rasmYukla(taomId: number, fayl: File): Promise<string> {
  const blob = await put(`taomlar/${taomId}-${Date.now()}.${TURLAR[fayl.type]}`, fayl, {
    access: "public",
    contentType: fayl.type,
  });
  return blob.url;
}

/** Eski rasmni o'chirish; xato bo'lsa jim (rasm o'chmay qolsa ham taom ishlayveradi). */
export async function rasmniOchir(url: string) {
  if (!rasmYoqilganmi() || !url.includes("blob.vercel-storage.com")) return;
  await del(url).catch((e) => console.warn("[rasm] o'chirilmadi:", e instanceof Error ? e.message : e));
}
