import { prisma } from "@/lib/prisma";
import { AuthXato, javobXato, otpTekshir, telefonniTozala } from "@/lib/auth";

// POST /api/auth/tekshir — { telefon, kod } — kodni tekshirib sessiya ochish
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const telefon = telefonniTozala(body.telefon);
  const kod = typeof body.kod === "string" ? body.kod.replace(/\D/g, "") : "";
  if (!telefon) return javobXato("Telefon raqami noto'g'ri");
  if (kod.length !== 6) return javobXato("Kod 6 ta raqamdan iborat");

  try {
    const mijoz = await otpTekshir(telefon, kod);
    const admin = (await prisma.admin.count({ where: { telefon } })) > 0;
    return Response.json({ mijoz: { id: mijoz.id, ism: mijoz.ism, telefon: mijoz.telefon }, admin });
  } catch (e) {
    if (e instanceof AuthXato) return javobXato(e.message, e.status);
    throw e;
  }
}
