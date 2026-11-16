import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";

type P = { params: Promise<{ id: string }> };

// PATCH — { nom?, belgi?, tartib? }
export async function PATCH(request: Request, { params }: P) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  const body = await request.json().catch(() => ({}));
  const data: { nom?: string; belgi?: string; tartib?: number } = {};
  if (typeof body.nom === "string") {
    if (body.nom.trim().length < 2) return javobXato("Kategoriya nomini yozing");
    data.nom = body.nom.trim().slice(0, 40);
  }
  if (typeof body.belgi === "string" && body.belgi.trim()) data.belgi = body.belgi.trim().slice(0, 8);
  if (Number.isInteger(body.tartib)) data.tartib = body.tartib;
  const k = await prisma.kategoriya.update({ where: { id }, data }).catch(() => null);
  return k ? Response.json(k) : javobXato("Kategoriya topilmadi", 404);
}

// DELETE — faqat bo'sh kategoriya
export async function DELETE(_r: Request, { params }: P) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  const soni = await prisma.taom.count({ where: { kategoriyaId: id } });
  if (soni) return javobXato(`Kategoriyada ${soni} ta taom bor — avval ularni boshqa kategoriyaga o'tkazing yoki o'chiring`);
  await prisma.kategoriya.delete({ where: { id } }).catch(() => null);
  return Response.json({ ok: true });
}
