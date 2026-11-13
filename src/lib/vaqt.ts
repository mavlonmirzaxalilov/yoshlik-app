// Kafe Toshkent vaqtida ishlaydi — server qaysi zonada bo'lishidan qat'i nazar.
export function hozirgiVaqtToshkent(): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export const vaqtTogrimi = (v: unknown): v is string => typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
