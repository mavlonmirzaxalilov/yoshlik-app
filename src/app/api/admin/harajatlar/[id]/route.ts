import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { harajatMaydonlari } from "@/lib/harajat";

type P = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: P) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const d = harajatMaydonlari(await request.json().catch(() => ({})));
  if (typeof d === "string") return javobXato(d);
  const h = await prisma.harajat.update({ where: { id: Number((await params).id) }, data: d }).catch(() => null);
  return h ? Response.json(h) : javobXato("Harajat topilmadi", 404);
}

export async function DELETE(_r: Request, { params }: P) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  await prisma.harajat.delete({ where: { id: Number((await params).id) } }).catch(() => null);
  return Response.json({ ok: true });
}
