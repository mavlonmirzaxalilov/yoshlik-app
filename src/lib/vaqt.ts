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

export const vaqtTogrimi = (v: unknown): v is string => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
