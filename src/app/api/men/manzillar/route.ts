import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";

// GET /api/men/manzillar — mijozning saqlangan manzillari
export async function GET() {
  const t = await talabQil();
  if (t.xato) return t.xato;
  const manzillar = await prisma.manzil.findMany({ where: { mijozId: t.f.mijoz.id }, orderBy: { id: "asc" } });
  return Response.json(manzillar);
}

// POST /api/men/manzillar — { matn }
export async function POST(request: Request) {
  const t = await talabQil();
  if (t.xato) return t.xato;
  const body = await request.json().catch(() => ({}));
  const matn = typeof body.matn === "string" ? body.matn.trim().slice(0, 200) : "";
  if (matn.length < 5) return javobXato("Manzilni to'liqroq yozing");
  const manzil = await prisma.manzil.create({ data: { mijozId: t.f.mijoz.id, matn } });
  return Response.json(manzil, { status: 201 });
}
