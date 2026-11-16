import { prisma } from "@/lib/prisma";
import { javobXato, sessiyaOch, xodimRoli } from "@/lib/auth";
import { loginWidgetTekshir } from "@/lib/telegram";

// POST /api/auth/telegram-login — Telegram Login Widget ma'lumoti (kompyuterda admin panelga kirish).
// Faqat xodimlar: Telegram akkaunti botda raqam ulashib mijozga bog'langan va telefoni xodimlar ro'yxatida bo'lishi kerak.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const user = body ? loginWidgetTekshir(body) : null;
  if (!user) return javobXato("Telegram ma'lumoti tasdiqlanmadi — qaytadan urinib ko'ring", 401);

  const mijoz = await prisma.mijoz.findUnique({ where: { telegramId: BigInt(user.id) } });
  if (!mijoz?.telefon) {
    return javobXato("Avval botda (@yoshlik_kafe_bot) /start bosib, telefon raqamingizni ulashing", 403);
  }
  const { rol } = await xodimRoli(mijoz.telefon);
  if (!rol) return javobXato("Bu akkaunt xodimlar ro'yxatida yo'q", 403);

  await sessiyaOch(mijoz.id);
  return Response.json({ rol });
}
