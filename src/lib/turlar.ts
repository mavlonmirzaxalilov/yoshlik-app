// API va sahifalar o'rtasidagi umumiy turlar.

export type OlishUsuli = "ZAL" | "OLIB_KETISH" | "YETKAZISH";

export const OLISH_USULLARI: { qiymat: OlishUsuli; nom: string }[] = [
  { qiymat: "ZAL", nom: "Zalda" },
  { qiymat: "OLIB_KETISH", nom: "Olib ketish" },
  { qiymat: "YETKAZISH", nom: "Yetkazib berish" },
];

// Olish vaqti faqat zal va olib ketishda tanlanadi (PRD, 5-bo'lim).
export const vaqtKerak = (usul: OlishUsuli) => usul === "ZAL" || usul === "OLIB_KETISH";

export type Taom = { id: number; nom: string; narx: number };

export type TarkibQatori = { taomId: number; nom: string; narx: number; soni: number };

export type Zakaz = {
  id: number;
  raqam: number;
  olishUsuli: OlishUsuli;
  olishVaqti: string | null;
  tarkib: TarkibQatori[];
  jamiSumma: number;
  yaratilgan: string;
};

export const somFormat = (summa: number) =>
  `${summa.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`;

export const usulNomi = (usul: OlishUsuli) =>
  OLISH_USULLARI.find((u) => u.qiymat === usul)?.nom ?? usul;
