import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { testRejim } from "@/lib/tolov";

// GET /api/tolov/[id] — to'lov sahifasi uchun (faqat zakaz egasi)
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = await talabQil();
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return javobXato("To'lov raqami noto'g'ri");
  const tolov = await prisma.tolov.findUnique({
    where: { id },
    include: { zakaz: { select: { id: true, raqam: true, mijozId: true, holat: true } } },
  });
  if (!tolov || tolov.zakaz.mijozId !== t.f.mijoz.id) return javobXato("To'lov topilmadi", 404);
  return Response.json({
    id: tolov.id,
    usul: tolov.usul,
    summa: tolov.summa,
    holat: tolov.holat,
    zakaz: { id: tolov.zakaz.id, raqam: tolov.zakaz.raqam, holat: tolov.zakaz.holat },
    testRejim: testRejim(),
  });
}
