import { prisma } from "@/lib/prisma";
import { sessiyaOch, xodimRoli } from "@/lib/auth";
import { loginWidgetTekshir } from "@/lib/telegram";

const xato = (kod: string, xabar: string, status: number) => Response.json({ kod, xato: xabar }, { status });

// POST /api/auth/telegram-login — Telegram Login Widget ma'lumoti (kompyuterda admin panelga kirish).
// Javob kodlari sahifa uchun: RAQAM_YOQ — botda raqam ulashilmagan (sahifa botga yo'naltiradi va kutadi),
// XODIM_EMAS — raqam xodimlar ro'yxatida yo'q.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const user = body ? loginWidgetTekshir(body) : null;
  if (!user) return xato("IMZO", "Telegram ma'lumoti tasdiqlanmadi — qaytadan urinib ko'ring", 401);

  const mijoz = await prisma.mijoz.findUnique({ where: { telegramId: BigInt(user.id) } });
  if (!mijoz?.telefon) {
    return xato("RAQAM_YOQ", "Botda telefon raqamingizni ulashing — keyin sahifa o'zi kiritadi", 403);
  }
  const { rol } = await xodimRoli(mijoz.telefon);
  if (!rol) return xato("XODIM_EMAS", "Siz admin emassiz", 403);

  await sessiyaOch(mijoz.id);
  return Response.json({ rol });
}
