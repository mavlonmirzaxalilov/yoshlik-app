// To'lov provayderi. Hozir faqat test provayder bor (Click/Payme kalitlari hali yo'q — DECISIONS.md).
// Click/Payme ulanganda shu ikki funksiya o'sha provayderga yo'naltiriladi.

export const testRejim = () => process.env.TOLOV_REJIM === "test";

/** Mijozni to'lov sahifasiga yuboradigan manzil. */
export function tolovManzili(tolovId: number): string {
  if (!testRejim()) throw new Error("To'lov provayderi ulanmagan");
  return `/tolov/${tolovId}`;
}

/** Pulni qaytarish. Test rejimida darhol muvaffaqiyatli. */
export async function pulniQaytar(tolovId: number): Promise<void> {
  if (!testRejim()) throw new Error(`To'lov provayderi ulanmagan: ${tolovId} qaytarilmadi`);
}
