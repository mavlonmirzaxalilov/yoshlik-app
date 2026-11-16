import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sessiyaOch, xodimRoli, type Rol } from "@/lib/auth";
import { botApi, xabarYubor, type TelegramUser } from "@/lib/telegram";

// Kompyuterda bot orqali kirish (Telegram Login oynasisiz):
// 1) sahifa so'rov ochadi (id + sir) va t.me/<bot>?start=k_<id> havolasini / QR kodini ko'rsatadi;
// 2) botda /start k_<id> — raqam yo'q bo'lsa so'raladi; xodim bo'lsa "Tasdiqlash" tugmasi, bo'lmasa "Siz admin emassiz";
// 3) tugma bosilgach sahifa (har 2 soniyada so'raydi) sessiya cookie'sini oladi.
// Sessiyani faqat sir egasi — so'rovni ochgan sahifa oladi; id esa havolada ochiq.

const MUDDAT_DAQIQA = 10;
const xesh = (s: string) => createHash("sha256").update(s).digest("hex");
export const KIRISH_ID = /^[A-Za-z0-9_-]{16}$/;

export const botNomi = () => process.env.TELEGRAM_BOT_USERNAME || "yoshlik_kafe_bot";

export async function kirishSorovi() {
  // Eski so'rovlarni tozalaymiz
  await prisma.botKirish.deleteMany({ where: { muddati: { lt: new Date(Date.now() - 86_400_000) } } });
  const id = randomBytes(12).toString("base64url"); // 16 belgi, Telegram start parametriga mos
  const sir = randomBytes(32).toString("base64url");
  const muddati = new Date(Date.now() + MUDDAT_DAQIQA * 60_000);
  await prisma.botKirish.create({ data: { id, sirHash: xesh(sir), muddati } });
  return { id, sir, muddati, havola: `https://t.me/${botNomi()}?start=k_${id}` };
}

export type KirishHolati =
  | { holat: "KUTISH" } // bot hali ochilmagan
  | { holat: "BOTDA" } // botda ochildi: raqam yoki tasdiq kutilmoqda
  | { holat: "MUDDAT" }
  | { holat: "EMAS" } // raqam xodimlar ro'yxatida yo'q
  | { holat: "KIRDI"; rol: Rol };

/** Sahifa so'raydi. Sir noto'g'ri bo'lsa null. Tasdiqlangan bo'lsa sessiya ochadi (bir marta). */
export async function kirishHolati(id: string, sir: string): Promise<KirishHolati | null> {
  const s = await prisma.botKirish.findUnique({ where: { id } });
  if (!s) return null;
  const a = Buffer.from(xesh(sir));
  const b = Buffer.from(s.sirHash);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  if (s.ishlatildi) return { holat: "MUDDAT" };

  if (!s.mijozId) {
    if (s.muddati < new Date()) return { holat: "MUDDAT" };
    return { holat: s.telegramId ? "BOTDA" : "KUTISH" };
  }

  const mijoz = await prisma.mijoz.findUnique({ where: { id: s.mijozId }, select: { telefon: true } });
  const { rol } = await xodimRoli(mijoz?.telefon ?? null);
  if (!rol) return { holat: "EMAS" };
  if (!s.tasdiqlandi) return s.muddati < new Date() ? { holat: "MUDDAT" } : { holat: "BOTDA" };

  // Bir so'rov — bitta sessiya (parallel so'rovlar ikkinchisini ochmaydi)
  const band = await prisma.botKirish.updateMany({ where: { id, ishlatildi: false }, data: { ishlatildi: true } });
  if (band.count === 0) return { holat: "MUDDAT" };
  await sessiyaOch(s.mijozId);
  return { holat: "KIRDI", rol };
}

// ---------- Bot tomoni ----------

const ROL_NOMI = { ADMIN: "admin", KASSIR: "kassir", OSHPAZ: "oshpaz" } as const;
const ESKIRGAN = "⌛️ Bu kirish havolasi eskirgan. Kompyuterdagi sahifani yangilab, qaytadan urinib ko'ring.";

/** /start k_<id>: so'rovni shu Telegram akkauntiga bog'laydi. Eskirgan yoki begona bo'lsa false. */
export async function kirishgaBogla(id: string, tgId: number) {
  if (!KIRISH_ID.test(id)) return false;
  const s = await prisma.botKirish.findUnique({ where: { id } });
  if (!s || s.ishlatildi || s.tasdiqlandi || s.muddati < new Date()) return false;
  if (s.telegramId !== null && s.telegramId !== BigInt(tgId)) return false;
  await prisma.botKirish.update({ where: { id }, data: { telegramId: BigInt(tgId) } });
  return true;
}

export const kirishEskirgan = (chatId: number) => xabarYubor(chatId, ESKIRGAN);

/** Raqam ulashilgach davom etish uchun: shu akkauntning ochiq kirish so'rovi. */
export async function ochiqKirish(tgId: number) {
  const s = await prisma.botKirish.findFirst({
    where: { telegramId: BigInt(tgId), ishlatildi: false, tasdiqlandi: false, muddati: { gt: new Date() } },
    orderBy: { yaratilgan: "desc" },
    select: { id: true },
  });
  return s?.id ?? null;
}

/** Raqami ma'lum foydalanuvchi: xodim bo'lsa tasdiqlash tugmasi, bo'lmasa "Siz admin emassiz". */
export async function kirishTaklifi(chatId: number, id: string, mijoz: { id: number; telefon: string }) {
  await prisma.botKirish.update({ where: { id }, data: { mijozId: mijoz.id } });
  const { rol } = await xodimRoli(mijoz.telefon);
  if (!rol) {
    return xabarYubor(chatId, "⛔️ <b>Siz admin emassiz.</b>\nTelefon raqamingiz xodimlar ro'yxatida yo'q.");
  }
  return xabarYubor(
    chatId,
    `🔐 Siz <b>${ROL_NOMI[rol]}</b> sifatida ro'yxatdasiz.\n\nKompyuterda boshqaruv paneliga kirishni tasdiqlang.\n<i>Sahifani o'zingiz ochmagan bo'lsangiz, tasdiqlamang.</i>`,
    { reply_markup: { inline_keyboard: [[{ text: "✅ Kirishni tasdiqlash", callback_data: `k:${id}` }]] } },
  );
}

export type CallbackQuery = {
  id: string;
  from: TelegramUser;
  data?: string;
  message?: { chat: { id: number }; message_id: number };
};

/** "Kirishni tasdiqlash" tugmasi. */
export async function kirishTasdigi(cb: CallbackQuery) {
  const id = cb.data?.startsWith("k:") ? cb.data.slice(2) : null;
  if (!id || !KIRISH_ID.test(id)) return botApi("answerCallbackQuery", { callback_query_id: cb.id });

  const s = await prisma.botKirish.findUnique({ where: { id } });
  let matn: string;
  if (s?.tasdiqlandi) {
    matn = "✅ Allaqachon tasdiqlangan.";
  } else if (!s || s.ishlatildi || s.muddati < new Date() || s.telegramId !== BigInt(cb.from.id) || !s.mijozId) {
    matn = ESKIRGAN;
  } else {
    const mijoz = await prisma.mijoz.findUnique({ where: { id: s.mijozId }, select: { telefon: true, telegramId: true } });
    const { rol } = await xodimRoli(mijoz?.telegramId === BigInt(cb.from.id) ? mijoz.telefon : null);
    if (!rol) {
      matn = "⛔️ <b>Siz admin emassiz.</b>";
    } else {
      await prisma.botKirish.update({ where: { id }, data: { tasdiqlandi: true } });
      matn = "✅ <b>Tasdiqlandi.</b> Kompyuterda boshqaruv paneli ochilmoqda.";
    }
  }

  await botApi("answerCallbackQuery", { callback_query_id: cb.id });
  if (cb.message) {
    await botApi("editMessageText", {
      chat_id: cb.message.chat.id,
      message_id: cb.message.message_id,
      text: matn,
      parse_mode: "HTML",
    });
  }
}
