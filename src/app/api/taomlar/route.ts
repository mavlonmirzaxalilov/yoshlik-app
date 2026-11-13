import { prisma } from "@/lib/prisma";

// GET /api/taomlar?kategoriya=<id> — menyudagi taomlar; kategoriya filtri ixtiyoriy
export async function GET(request: Request) {
  const param = new URL(request.url).searchParams.get("kategoriya");
  const kategoriyaId = param ? Number(param) : undefined;
  if (param && !Number.isInteger(kategoriyaId)) {
    return Response.json({ xato: "Kategoriya noto'g'ri" }, { status: 400 });
  }

  const taomlar = await prisma.taom.findMany({
    where: kategoriyaId ? { kategoriyaId } : undefined,
    include: { kategoriya: { select: { id: true, nom: true, belgi: true } } },
    orderBy: [{ kategoriya: { tartib: "asc" } }, { tartib: "asc" }],
  });
  return Response.json(taomlar);
}
