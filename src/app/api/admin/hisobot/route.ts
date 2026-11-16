import { prisma } from "@/lib/prisma";
import { talabQil } from "@/lib/auth";
import { kunBoshi } from "@/lib/vaqt";

// GET /api/admin/hisobot?dan=YYYY-MM-DD&gacha=YYYY-MM-DD (ikkalasi ham kiritiladi; default — bugun)
// Savdo: BEKOR va TOLOV_KUTILMOQDA hisobga olinmaydi. Foyda = savdo − harajat.
export async function GET(request: Request) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const p = new URL(request.url).searchParams;
  const dan = kunBoshi(p.get("dan"));
  const oxirgiKun = kunBoshi(p.get("gacha") ?? p.get("dan"));
  const gacha = new Date(Math.max(oxirgiKun.getTime(), dan.getTime()) + 86_400_000);
  if (gacha.getTime() - dan.getTime() > 366 * 86_400_000) {
    return Response.json({ xato: "Davr 1 yildan oshmasin" }, { status: 400 });
  }
  const oraliq = { gte: dan, lt: gacha };

  const zakazlar = await prisma.zakaz.findMany({
    where: { yaratilgan: oraliq },
    select: {
      holat: true,
      olishUsuli: true,
      tolovUsuli: true,
      manba: true,
      jamiSumma: true,
      yaratilgan: true,
      qatorlar: { select: { nom: true, narx: true, soni: true } },
    },
  });
  const sotilgan = zakazlar.filter((z) => z.holat !== "BEKOR" && z.holat !== "TOLOV_KUTILMOQDA");

  const guruh = (kalit: (z: (typeof sotilgan)[number]) => string) => {
    const m: Record<string, { soni: number; summa: number }> = {};
    for (const z of sotilgan) {
      const k = kalit(z);
      m[k] ??= { soni: 0, summa: 0 };
      m[k].soni++;
      m[k].summa += z.jamiSumma;
    }
    return m;
  };

  const taomlar: Record<string, { soni: number; summa: number }> = {};
  for (const z of sotilgan)
    for (const q of z.qatorlar) {
      taomlar[q.nom] ??= { soni: 0, summa: 0 };
      taomlar[q.nom].soni += q.soni;
      taomlar[q.nom].summa += q.narx * q.soni;
    }

  // Kunlik savdo (Toshkent kuni)
  const kun = (d: Date) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Tashkent" }).format(d);
  const kunlik = guruh((z) => kun(z.yaratilgan));

  const harajatlar = await prisma.harajat.groupBy({ by: ["turkum"], where: { sana: oraliq }, _sum: { summa: true } });
  const harajatJami = harajatlar.reduce((s, h) => s + (h._sum.summa ?? 0), 0);
  const savdo = sotilgan.reduce((s, z) => s + z.jamiSumma, 0);

  return Response.json({
    dan: kun(dan),
    gacha: kun(new Date(gacha.getTime() - 1)),
    soni: sotilgan.length,
    savdo,
    ortachaChek: sotilgan.length ? Math.round(savdo / sotilgan.length) : 0,
    bekorlar: zakazlar.filter((z) => z.holat === "BEKOR").length,
    olishUsuli: guruh((z) => z.olishUsuli),
    tolovTuri: guruh((z) => z.tolovUsuli ?? "NOMALUM"),
    manba: guruh((z) => z.manba),
    kunlik,
    topTaomlar: Object.entries(taomlar)
      .map(([nom, v]) => ({ nom, ...v }))
      .sort((a, b) => b.soni - a.soni)
      .slice(0, 5),
    harajat: { jami: harajatJami, turkum: Object.fromEntries(harajatlar.map((h) => [h.turkum, h._sum.summa ?? 0])) },
    foyda: savdo - harajatJami,
  });
}
