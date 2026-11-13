import { prisma } from "@/lib/prisma";

// GET /api/kategoriyalar — menyu bo'limlari, tartib bo'yicha
export async function GET() {
  const kategoriyalar = await prisma.kategoriya.findMany({ orderBy: { tartib: "asc" } });
  return Response.json(kategoriyalar);
}
