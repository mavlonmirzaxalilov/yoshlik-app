import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { testRejim } from "@/lib/tolov";

// POST /api/tolov/[id]/test — { natija: "tolandi" | "bekor" }
// Faqat test rejimida: Click/Payme o'rnida to'lov natijasini qo'lda belgilaydi.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!testRejim()) return javobXato("Test to'lov o'chirilgan", 404);
  const t = await talabQil();
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  const body = await request.json().catch(() => ({}));
  if (body.natija !== "tolandi" && body.natija !== "bekor") return javobXato("Natija noto'g'ri");

  const tolov = await prisma.tolov.findUnique({ where: { id }, include: { zakaz: true } });
  if (!tolov || tolov.zakaz.mijozId !== t.f.mijoz.id) return javobXato("To'lov topilmadi", 404);
  if (tolov.holat !== "KUTILMOQDA" || tolov.zakaz.holat !== "TOLOV_KUTILMOQDA") {
    return javobXato("Bu to'lov allaqachon yakunlangan");
  }

  if (body.natija === "tolandi") {
    await prisma.$transaction([
      prisma.tolov.update({ where: { id }, data: { holat: "TOLANDI" } }),
      prisma.zakaz.update({ where: { id: tolov.zakazId }, data: { holat: "TOLANDI" } }),
    ]);
  } else {
    // To'lov rad etildi — zakaz to'lov kutilmoqda holatida qoladi, mijoz qayta urinishi yoki bekor qilishi mumkin
    await prisma.tolov.update({ where: { id }, data: { holat: "BEKOR" } });
    await prisma.tolov.create({ data: { zakazId: tolov.zakazId, usul: tolov.usul, summa: tolov.summa } });
  }
  return Response.json({ zakazId: tolov.zakazId });
}
