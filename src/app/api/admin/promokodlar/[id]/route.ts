import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";

type P = { params: Promise<{ id: string }> };

// PATCH — { faol } yoqish/o'chirish
export async function PATCH(request: Request, { params }: P) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const body = await request.json().catch(() => ({}));
  if (typeof body.faol !== "boolean") return javobXato("faol qiymati kerak");
  const p = await prisma.promokod.update({ where: { id: Number((await params).id) }, data: { faol: body.faol } }).catch(() => null);
  return p ? Response.json(p) : javobXato("Promokod topilmadi", 404);
}

// DELETE — ishlatilmagan kod o'chiriladi; ishlatilgan kod zakaz tarixida qolishi uchun faqat o'chirib qo'yiladi
export async function DELETE(_r: Request, { params }: P) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  const zakazlar = await prisma.zakaz.count({ where: { promokodId: id } });
  if (zakazlar) {
    await prisma.promokod.update({ where: { id }, data: { faol: false } });
    return Response.json({ ok: true, faolsizlantirildi: true });
  }
  await prisma.promokod.delete({ where: { id } }).catch(() => null);
  return Response.json({ ok: true });
}
