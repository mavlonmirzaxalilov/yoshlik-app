import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";

// DELETE /api/men/manzillar/[id] — faqat o'z manzilini o'chira oladi
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = await talabQil();
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return javobXato("Manzil raqami noto'g'ri");
  const { count } = await prisma.manzil.deleteMany({ where: { id, mijozId: t.f.mijoz.id } });
  if (!count) return javobXato("Manzil topilmadi", 404);
  return Response.json({ ok: true });
}
