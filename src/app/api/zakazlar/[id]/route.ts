import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";

// GET /api/zakazlar/[id] — bitta zakaz; faqat egasi yoki admin ko'radi
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = await talabQil();
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return javobXato("Zakaz raqami noto'g'ri");

  const zakaz = await prisma.zakaz.findUnique({
    where: { id },
    include: { qatorlar: { orderBy: { id: "asc" } } },
  });
  // Boshqa mijozning zakazi borligini ham oshkor qilmaymiz — 404
  if (!zakaz || (!t.f.admin && zakaz.mijozId !== t.f.mijoz.id)) {
    return javobXato("Zakaz topilmadi", 404);
  }
  return Response.json(zakaz);
}
