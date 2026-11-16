import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";

// GET /api/admin/kategoriyalar — taomlar soni bilan; POST — { nom, belgi }
export async function GET() {
  const t = await talabQil(["ADMIN", "KASSIR"]);
  if (t.xato) return t.xato;
  const k = await prisma.kategoriya.findMany({
    orderBy: { tartib: "asc" },
    include: { _count: { select: { taomlar: true } } },
  });
  return Response.json(k);
}

export async function POST(request: Request) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const body = await request.json().catch(() => ({}));
  const nom = typeof body.nom === "string" ? body.nom.trim().slice(0, 40) : "";
  const belgi = typeof body.belgi === "string" && body.belgi.trim() ? body.belgi.trim().slice(0, 8) : "🍽️";
  if (nom.length < 2) return javobXato("Kategoriya nomini yozing");
  const oxirgi = await prisma.kategoriya.aggregate({ _max: { tartib: true } });
  const k = await prisma.kategoriya.create({ data: { nom, belgi, tartib: (oxirgi._max.tartib ?? -1) + 1 } });
  return Response.json(k, { status: 201 });
}
