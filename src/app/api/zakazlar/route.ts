import { prisma } from "@/lib/prisma";
import { OLISH_USULLARI, vaqtKerak, type OlishUsuli } from "@/lib/turlar";

type SorovQatori = { taomId: number; soni: number };

const xato = (xabar: string, status = 400) => Response.json({ xato: xabar }, { status });

// POST /api/zakazlar — yangi zakaz yaratish.
// Narx va jami summa mijoz yuborganidan emas, bazadagi narxdan hisoblanadi.
export async function POST(request: Request) {
  let body: { qatorlar?: SorovQatori[]; olishUsuli?: OlishUsuli; olishVaqti?: string };
  try {
    body = await request.json();
  } catch {
    return xato("So'rov JSON formatida emas");
  }

  const qatorlar = (body.qatorlar ?? []).filter(
    (q) => Number.isInteger(q.taomId) && Number.isInteger(q.soni) && q.soni > 0,
  );
  if (qatorlar.length === 0) return xato("Savatcha bo'sh");

  const usul = body.olishUsuli;
  if (!usul || !OLISH_USULLARI.some((u) => u.qiymat === usul)) {
    return xato("Olish usuli noto'g'ri");
  }
  const olishVaqti = vaqtKerak(usul) ? (body.olishVaqti || null) : null;

  const taomlar = await prisma.taom.findMany({
    where: { id: { in: qatorlar.map((q) => q.taomId) } },
  });

  const yangiQatorlar = [];
  for (const q of qatorlar) {
    const taom = taomlar.find((t) => t.id === q.taomId);
    if (!taom) return xato(`Taom topilmadi: ${q.taomId}`);
    if (taom.tugadi) return xato(`"${taom.nom}" tugadi — savatchadan olib tashlang`);
    yangiQatorlar.push({ taomId: taom.id, nom: taom.nom, narx: taom.narx, soni: q.soni });
  }
  const jamiSumma = yangiQatorlar.reduce((s, q) => s + q.narx * q.soni, 0);

  const zakaz = await prisma.zakaz.create({
    data: { olishUsuli: usul, olishVaqti, jamiSumma, qatorlar: { create: yangiQatorlar } },
  });

  return Response.json({ id: zakaz.id, raqam: zakaz.raqam }, { status: 201 });
}
