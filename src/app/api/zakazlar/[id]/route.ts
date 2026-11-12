import { prisma } from "@/lib/prisma";

// GET /api/zakazlar/[id] — bitta zakaz (tasdiq ekrani uchun)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) {
    return Response.json({ xato: "Zakaz raqami noto'g'ri" }, { status: 400 });
  }
  const zakaz = await prisma.zakaz.findUnique({ where: { id } });
  if (!zakaz) return Response.json({ xato: "Zakaz topilmadi" }, { status: 404 });
  return Response.json(zakaz);
}
