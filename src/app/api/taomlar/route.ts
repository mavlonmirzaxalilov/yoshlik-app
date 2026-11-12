import { prisma } from "@/lib/prisma";

// GET /api/taomlar — menyudagi barcha taomlar
export async function GET() {
  const taomlar = await prisma.taom.findMany({ orderBy: { id: "asc" } });
  return Response.json(taomlar);
}
