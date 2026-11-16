import { prisma } from "@/lib/prisma";
import { egami, javobXato, talabQil } from "@/lib/auth";

type P = { params: Promise<{ id: string }> };
const ROLLAR = ["ADMIN", "KASSIR", "OSHPAZ"] as const;

// PATCH — { rol?, faol?, ism? }. Egani va o'zini o'zgartirib bo'lmaydi (o'zini bloklab qo'ymaslik uchun).
export async function PATCH(request: Request, { params }: P) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  const x = await prisma.admin.findUnique({ where: { id } });
  if (!x) return javobXato("Xodim topilmadi", 404);
  if (egami(x.telefon)) return javobXato("Egani o'zgartirib bo'lmaydi");
  if (x.telefon === t.f.mijoz.telefon) return javobXato("O'zingizning rolingizni o'zgartira olmaysiz");

  const body = await request.json().catch(() => ({}));
  const data: { rol?: (typeof ROLLAR)[number]; faol?: boolean; ism?: string | null } = {};
  if (body.rol !== undefined) {
    if (!ROLLAR.includes(body.rol)) return javobXato("Rol noto'g'ri");
    data.rol = body.rol;
  }
  if (typeof body.faol === "boolean") data.faol = body.faol;
  if (typeof body.ism === "string") data.ism = body.ism.trim().slice(0, 60) || null;
  return Response.json(await prisma.admin.update({ where: { id }, data }));
}

// DELETE — xodimni ro'yxatdan olib tashlash (zakaz/harajat tarixida ismi qoladi — xodimId null bo'ladi)
export async function DELETE(_r: Request, { params }: P) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  const x = await prisma.admin.findUnique({ where: { id } });
  if (!x) return javobXato("Xodim topilmadi", 404);
  if (x.telefon === t.f.mijoz.telefon) return javobXato("O'zingizni o'chira olmaysiz");
  await prisma.admin.delete({ where: { id } });
  return Response.json({ ok: true });
}
