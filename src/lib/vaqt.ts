// Kafe Toshkent vaqtida ishlaydi — server qaysi zonada bo'lishidan qat'i nazar.
export function hozirgiVaqtToshkent(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

/** Toshkentdagi bugungi kun boshi (UTC Date sifatida). Toshkent UTC+5, yozgi vaqt yo'q. */
export function bugunBoshiToshkent(): Date {
  const sana = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(new Date()); // YYYY-MM-DD
  return new Date(`${sana}T00:00:00+05:00`);
}

/** "YYYY-MM-DD" (Toshkent kuni) → shu kunning boshi; noto'g'ri/bo'sh bo'lsa bugun. */
export function kunBoshi(sana: string | null | undefined): Date {
  return sana && /^\d{4}-\d{2}-\d{2}$/.test(sana) ? new Date(`${sana}T00:00:00+05:00`) : bugunBoshiToshkent();
}

/** Bitta Toshkent kuni oralig'i [dan, gacha). */
export function kunOraligi(sana: string | null | undefined) {
  const dan = kunBoshi(sana);
  return { dan, gacha: new Date(dan.getTime() + 86_400_000) };
}

/** Toshkent kuni "YYYY-MM-DD" ko'rinishida. */
export const bugunSana = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(new Date());

export const vaqtTogrimi = (v: unknown): v is string => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
