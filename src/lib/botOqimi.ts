import { prisma } from "@/lib/prisma";
import { telefonniTozala } from "@/lib/auth";
import { miniAppUrl, xabarYubor, type TelegramUser } from "@/lib/telegram";

// Bot oqimi (foydalanuvchi belgilagan tartib, DECISIONS.md):
// 1) /start — raqam yo'q bo'lsa faqat "Raqamni ulashish" tugmasi;
// 2) raqam ulashilgach — "Xush kelibsiz!" va "Taom buyurtma qilish" tugmasi.

type Xabar = {
  chat: { id: number; type: string };
  from?: TelegramUser;
  text?: string;
  contact?: { phone_number: string; user_id?: number; first_name?: string };
};

const raqamSora = (chatId: number) =>
  xabarYubor(chatId, "Assalomu alaykum! Zakaz berish uchun telefon raqamingizni ulashing 👇", {
    reply_markup: {
      keyboard: [[{ text: "📱 Raqamni ulashish", request_contact: true }]],
      resize_keyboard: true,
      one_time_keyboard: true,
    },
  });

const xushKelibsiz = async (chatId: number) => {
  // Avval raqam klaviaturasini yopamiz, keyin Mini App tugmasini yuboramiz
  await xabarYubor(chatId, "✅ Raqamingiz saqlandi.", { reply_markup: { remove_keyboard: true } });
  return xabarYubor(chatId, "<b>Xush kelibsiz!</b>\nYoshlik kafesi — navbatsiz, issiq ovqat.", {
    reply_markup: { inline_keyboard: [[{ text: "🍽 Taom buyurtma qilish", web_app: { url: miniAppUrl() } }]] },
  });
};

/** Telegram'dan kelgan raqamni mijozga yozadi; veb orqali shu raqam bilan yaratilgan mijoz bo'lsa birlashtiradi. */
async function raqamniSaqla(tgUser: TelegramUser, telefon: string): Promise<"ok" | "band"> {
  const telegramId = BigInt(tgUser.id);
  const ism = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(" ") || null;

  return prisma.$transaction(async (tx) => {
    const raqamli = await tx.mijoz.findUnique({ where: { telefon } });
    const tgMijoz = await tx.mijoz.findUnique({ where: { telegramId } });

    if (raqamli && raqamli.telegramId !== null && raqamli.telegramId !== telegramId) return "band";
    // Telegram akkauntida boshqa raqam va zakazlar bor — ikki tarixni avtomatik qo'shmaymiz (admin hal qiladi)
    if (raqamli && tgMijoz?.telefon && raqamli.id !== tgMijoz.id) return "band";

    if (raqamli && raqamli.id !== tgMijoz?.id) {
      // Raqam veb orqali kirgan mijozniki — Telegram akkauntini o'shanga bog'laymiz.
      // Telegram'dagi bo'sh yozuvda zakaz bo'lmaydi (raqamsiz zakaz berib bo'lmaydi), u o'chiriladi.
      if (tgMijoz) await tx.mijoz.delete({ where: { id: tgMijoz.id } });
      await tx.mijoz.update({
        where: { id: raqamli.id },
        data: { telegramId, ism: raqamli.ism ?? ism, roziVaqti: raqamli.roziVaqti ?? new Date() },
      });
      return "ok";
    }

    // Raqamni ulashish — ma'lumot saqlanishiga rozilik (PRD 8-bo'lim)
    await tx.mijoz.upsert({
      where: { telegramId },
      update: { telefon, roziVaqti: new Date() },
      create: { telegramId, telefon, ism, roziVaqti: new Date() },
    });
    return "ok";
  });
}

export async function botXabari(x: Xabar) {
  if (x.chat.type !== "private" || !x.from) return;
  const chatId = x.chat.id;

  if (x.contact) {
    // Faqat o'z raqami: boshqa odamning kontaktini yuborish rad etiladi
    if (x.contact.user_id !== x.from.id) {
      return xabarYubor(chatId, "Iltimos, pastdagi tugma orqali <b>o'zingizning</b> raqamingizni ulashing.");
    }
    const telefon = telefonniTozala(x.contact.phone_number);
    if (!telefon) return xabarYubor(chatId, "Hozircha faqat O'zbekiston raqamlari (+998) qabul qilinadi.");
    const natija = await raqamniSaqla(x.from, telefon);
    if (natija === "band") {
      return xabarYubor(chatId, "Bu raqam boshqa Telegram akkauntiga bog'langan. Kafe administratoriga murojaat qiling.");
    }
    return xushKelibsiz(chatId);
  }

  const mijoz = await prisma.mijoz.findUnique({ where: { telegramId: BigInt(x.from.id) } });
  if (!mijoz?.telefon) return raqamSora(chatId);
  if (x.text?.startsWith("/start")) {
    return xabarYubor(chatId, "<b>Xush kelibsiz!</b>\nYoshlik kafesi — navbatsiz, issiq ovqat.", {
      reply_markup: { inline_keyboard: [[{ text: "🍽 Taom buyurtma qilish", web_app: { url: miniAppUrl() } }]] },
    });
  }
  return xabarYubor(chatId, "Zakaz berish uchun pastdagi tugmani bosing 👇", {
    reply_markup: { inline_keyboard: [[{ text: "🍽 Taom buyurtma qilish", web_app: { url: miniAppUrl() } }]] },
  });
}
