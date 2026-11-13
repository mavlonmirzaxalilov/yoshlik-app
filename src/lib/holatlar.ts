// Zakaz holatlari zanjiri (PRD 8-bo'lim). Server va klientda bir xil ishlatiladi.

export type ZakazHolati =
  | "TOLOV_KUTILMOQDA"
  | "TOLANDI"
  | "QABUL_QILINDI"
  | "TAYYORLANMOQDA"
  | "TAYYOR"
  | "YOLDA"
  | "BERILDI"
  | "BEKOR";

export const HOLAT_NOMLARI: Record<ZakazHolati, string> = {
  TOLOV_KUTILMOQDA: "To'lov kutilmoqda",
  TOLANDI: "To'landi",
  QABUL_QILINDI: "Qabul qilindi",
  TAYYORLANMOQDA: "Tayyorlanmoqda",
  TAYYOR: "Tayyor",
  YOLDA: "Yo'lda",
  BERILDI: "Berildi",
  BEKOR: "Bekor qilindi",
};

// Mijoz faqat oshxona boshlamaguncha bekor qila oladi (PRD: "tayyorlanmoqda"gacha).
export const BEKOR_MUMKIN: ZakazHolati[] = ["TOLOV_KUTILMOQDA", "TOLANDI", "QABUL_QILINDI"];

/** Admin bosadigan "keyingi holat". To'lov holatlari (TOLOV_KUTILMOQDA -> TOLANDI) faqat to'lov orqali o'zgaradi. */
export function keyingiHolat(holat: ZakazHolati, olishUsuli: string): ZakazHolati | null {
  switch (holat) {
    case "TOLANDI":
    case "QABUL_QILINDI":
      return "TAYYORLANMOQDA";
    case "TAYYORLANMOQDA":
      return "TAYYOR";
    case "TAYYOR":
      return olishUsuli === "YETKAZISH" ? "YOLDA" : "BERILDI";
    case "YOLDA":
      return "BERILDI";
    default:
      return null;
  }
}
