import { prisma } from "@/lib/prisma";
import { javobXato, joriyFoydalanuvchi, talabQil } from "@/lib/auth";

// GET /api/men — joriy foydalanuvchi (kirmagan bo'lsa { mijoz: null })
export async function GET() {
  const f = await joriyFoydalanuvchi();
  return Response.json(f ?? { mijoz: null, admin: false });
}

// PATCH /api/men — { ism }
export async function PATCH(request: Request) {
  const t = await talabQil();
  if (t.xato) return t.xato;
  const body = await request.json().catch(() => ({}));
  const ism = typeof body.ism === "string" ? body.ism.trim().slice(0, 60) : "";
  if (!ism) return javobXato("Ism bo'sh bo'lmasin");
  const mijoz = await prisma.mijoz.update({
    where: { id: t.f.mijoz.id },
    data: { ism },
    select: { id: true, ism: true, telefon: true },
  });
  return Response.json({ mijoz, admin: t.f.admin });
}
