import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { kunBoshi } from "@/lib/vaqt";
import { harajatMaydonlari, TURKUMLAR, type Turkum } from "@/lib/harajat";

// GET /api/admin/harajatlar?dan=&gacha=&turkum=
export async function GET(request: Request) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const p = new URL(request.url).searchParams;
  const dan = kunBoshi(p.get("dan"));
  const gacha = new Date(kunBoshi(p.get("gacha") ?? p.get("dan")).getTime() + 86_400_000);
  const turkum = p.get("turkum");
  const harajatlar = await prisma.harajat.findMany({
    where: { sana: { gte: dan, lt: gacha }, ...(TURKUMLAR.includes(turkum as Turkum) ? { turkum: turkum as Turkum } : {}) },
    include: { xodim: { select: { ism: true, telefon: true } } },
    orderBy: [{ sana: "desc" }, { id: "desc" }],
  });
  return Response.json(harajatlar);
}

// POST — { sana: YYYY-MM-DD, summa, turkum, izoh? }
export async function POST(request: Request) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const d = harajatMaydonlari(await request.json().catch(() => ({})));
  if (typeof d === "string") return javobXato(d);
  const h = await prisma.harajat.create({ data: { ...d, xodimId: t.f.xodimId } });
  return Response.json(h, { status: 201 });
}
