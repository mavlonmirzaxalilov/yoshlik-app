// Admin taom formasi qiymatlarini tekshirish (POST va PATCH uchun umumiy).

export type TaomMaydonlari = {
  nom?: string;
  narx?: number;
  hajm?: string | null;
  tavsif?: string | null;
  kategoriyaId?: number;
  tugadi?: boolean;
};

export function taomMaydonlari(body: Record<string, unknown>, toliq: boolean): TaomMaydonlari | string {
  const d: TaomMaydonlari = {};
  if (toliq || "nom" in body) {
    const nom = typeof body.nom === "string" ? body.nom.trim() : "";
    if (nom.length < 2) return "Taom nomini yozing";
    d.nom = nom.slice(0, 80);
  }
  if (toliq || "narx" in body) {
    const narx = Number(body.narx);
    if (!Number.isInteger(narx) || narx < 100 || narx > 10_000_000) return "Narx noto'g'ri (so'mda, butun son)";
    d.narx = narx;
  }
  if ("hajm" in body) d.hajm = typeof body.hajm === "string" && body.hajm.trim() ? body.hajm.trim().slice(0, 40) : null;
  if ("tavsif" in body) {
    d.tavsif = typeof body.tavsif === "string" && body.tavsif.trim() ? body.tavsif.trim().slice(0, 300) : null;
  }
  if (toliq || "kategoriyaId" in body) {
    if (!Number.isInteger(body.kategoriyaId)) return "Kategoriyani tanlang";
    d.kategoriyaId = body.kategoriyaId as number;
  }
  if (typeof body.tugadi === "boolean") d.tugadi = body.tugadi;
  return d;
}
