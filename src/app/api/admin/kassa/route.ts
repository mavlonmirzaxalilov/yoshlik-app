import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";

// POST /api/admin/kassa — { qatorlar: [{taomId, soni}], olishUsuli: "ZAL"|"OLIB_KETISH", tolovUsuli: "NAQD"|"KARTA" }
// Kassir kafeda zakaz kiritadi; pul kassada olingan — zakaz darhol "to'landi" bo'lib oshxonaga tushadi.
export async function POST(request: Request) {
  const t = await talabQil(["ADMIN", "KASSIR"]);
  if (t.xato) return t.xato;
  const body = await request.json().catch(() => ({}));

  const qatorlar: { taomId: number; soni: number }[] = (Array.isArray(body.qatorlar) ? body.qatorlar : []).filter(
    (q: { taomId: unknown; soni: unknown }) =>
      Number.isInteger(q.taomId) && Number.isInteger(q.soni) && (q.soni as number) > 0 && (q.soni as number) <= 99,
  );
  if (!qatorlar.length) return javobXato("Buyurtma bo'sh");
  if (body.olishUsuli !== "ZAL" && body.olishUsuli !== "OLIB_KETISH") return javobXato("Olish usuli noto'g'ri");
  if (body.tolovUsuli !== "NAQD" && body.tolovUsuli !== "KARTA") return javobXato("To'lov turi noto'g'ri");

  const taomlar = await prisma.taom.findMany({ where: { id: { in: qatorlar.map((q) => q.taomId) } } });
  const yangi = [];
  for (const q of qatorlar) {
    const taom = taomlar.find((x) => x.id === q.taomId);
    if (!taom) return javobXato(`Taom topilmadi: ${q.taomId}`);
    if (taom.tugadi) return javobXato(`"${taom.nom}" tugagan`);
    yangi.push({ taomId: taom.id, nom: taom.nom, narx: taom.narx, soni: q.soni });
  }
  const summa = yangi.reduce((s, q) => s + q.narx * q.soni, 0);

  const zakaz = await prisma.zakaz.create({
    data: {
      holat: "TOLANDI",
      manba: "KASSA",
      olishUsuli: body.olishUsuli,
      tolovUsuli: body.tolovUsuli,
      taomlarSumma: summa,
      jamiSumma: summa,
      xodimId: t.f.xodimId,
      qatorlar: { create: yangi },
      tolovlar: { create: { usul: body.tolovUsuli, summa, holat: "TOLANDI" } },
    },
  });
  return Response.json({ id: zakaz.id, raqam: zakaz.raqam, jami: summa }, { status: 201 });
}
