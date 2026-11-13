import { AuthXato, javobXato, otpYubor, telefonniTozala } from "@/lib/auth";

// POST /api/auth/kod — { telefon, rozilik } — bir martalik kod yuborish
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const telefon = telefonniTozala(body.telefon);
  if (!telefon) return javobXato("Telefon raqami noto'g'ri. Masalan: 90 123 45 67");
  if (body.rozilik !== true) {
    return javobXato("Davom etish uchun ma'lumotlar saqlanishiga rozilik bering");
  }
  try {
    await otpYubor(telefon);
  } catch (e) {
    if (e instanceof AuthXato) return javobXato(e.message, e.status);
    throw e;
  }
  return Response.json({ telefon });
}
