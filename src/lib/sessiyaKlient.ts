"use client";

// Klient tomonidagi kichik yordamchilar: sessiya o'zgarganini xabar qilish va savatchani saqlash.

export const SESSIYA_HODISA = "sessiya-ozgardi";
export const sessiyaOzgardi = () => window.dispatchEvent(new Event(SESSIYA_HODISA));

const SAVATCHA_KALIT = "yoshlik-savatcha";

export type SaqlanganQator = { taomId: number; soni: number };

export function savatchaniOqi(): SaqlanganQator[] {
  try {
    const qiymat = JSON.parse(localStorage.getItem(SAVATCHA_KALIT) ?? "[]");
    return Array.isArray(qiymat) ? qiymat : [];
  } catch {
    return [];
  }
}

export function savatchaniYoz(qatorlar: SaqlanganQator[]) {
  try {
    if (qatorlar.length) localStorage.setItem(SAVATCHA_KALIT, JSON.stringify(qatorlar));
    else localStorage.removeItem(SAVATCHA_KALIT);
  } catch {
    /* saqlab bo'lmasa ham savatcha ishlayveradi */
  }
}
