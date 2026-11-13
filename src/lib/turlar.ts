// API va sahifalar o'rtasidagi umumiy turlar.

export type OlishUsuli = "ZAL" | "OLIB_KETISH" | "YETKAZISH";

export const OLISH_USULLARI: { qiymat: OlishUsuli; nom: string }[] = [
  { qiymat: "ZAL", nom: "Zalda" },
  { qiymat: "OLIB_KETISH", nom: "Olib ketish" },
  { qiymat: "YETKAZISH", nom: "Yetkazib berish" },
];

// Olish vaqti faqat zal va olib ketishda tanlanadi (PRD, 5-bo'lim).
export const vaqtKerak = (usul: OlishUsuli) => usul === "ZAL" || usul === "OLIB_KETISH";

export type Kategoriya = { id: number; nom: string; belgi: string; tartib: number };

export type Taom = {
  id: number;
  nom: string;
  narx: number;
  hajm: string | null;
  tavsif: string | null;
  rasm: string | null;
  tugadi: boolean;
  kategoriyaId: number | null;
  kategoriya: Pick<Kategoriya, "id" | "nom" | "belgi"> | null;
};

export type ZakazQatori = { id: number; taomId: number | null; nom: string; narx: number; soni: number };

export type Zakaz = {
  id: number;
  raqam: number;
  olishUsuli: OlishUsuli;
  olishVaqti: string | null;
  qatorlar: ZakazQatori[];
  jamiSumma: number;
  yaratilgan: string;
};

export const somFormat = (summa: number) =>
  `${summa.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`;

// "13.11.2026, 11:40" — brauzerlarning uz-UZ formati bir xil emas, shuning uchun qo'lda
export const sanaFormat = (iso: string) => {
  const d = new Date(iso);
  const ikki = (n: number) => String(n).padStart(2, "0");
  return `${ikki(d.getDate())}.${ikki(d.getMonth() + 1)}.${d.getFullYear()}, ${ikki(d.getHours())}:${ikki(d.getMinutes())}`;
};

export const usulNomi =(usul: OlishUsuli) =>
  OLISH_USULLARI.find((u) => u.qiymat === usul)?.nom ?? usul;
