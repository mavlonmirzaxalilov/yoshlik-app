import { prisma } from "@/lib/prisma";

// GET /api/taomlar/[id] — bitta taom (detal oynasi uchun)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return Response.json({ xato: "Taom raqami noto'g'ri" }, { status: 400 });
  }
  const taom = await prisma.taom.findUnique({
    where: { id },
    include: { kategoriya: { select: { id: true, nom: true, belgi: true } } },
  });
  if (!taom) return Response.json({ xato: "Taom topilmadi" }, { status: 404 });
  return Response.json(taom);
}
