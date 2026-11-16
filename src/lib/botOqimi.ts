import { prisma } from "@/lib/prisma";
import { telefonniTozala, xodimRoli } from "@/lib/auth";
import { kirishEskirgan, kirishgaBogla, kirishTaklifi, ochiqKirish } from "@/lib/botKirish";
import { miniAppUrl, xabarYubor, type TelegramUser } from "@/lib/telegram";

// Bot oqimi (foydalanuvchi belgilagan tartib, DECISIONS.md):
// 1) /start — raqam yo'q bo'lsa faqat "Raqamni ulashish" tugmasi;
// 2) raqam ulashilgach — "Xush kelibsiz!" va "Taom buyurtma qilish" tugmasi.
// /start k_<id> — kompyuterda admin panelga kirish (src/lib/botKirish.ts).

type Xabar = {
  chat: { id: number; type: string };
  from?: TelegramUser;
  text?: string;
  contact?: { phone_number: string; user_id?: number; first_name?: string };
};

const raqamSora = (chatId: number, kirish = false) =>
  xabarYubor(
    chatId,
    kirish
      ? "🔐 Boshqaruv paneliga kirish uchun telefon raqamingizni ulashing 👇"
      : "Assalomu alaykum! Zakaz berish uchun telefon raqamingizni ulashing 👇",
    {
      reply_markup: {
        keyboard: [[{ text: "📱 Raqamni ulashish", request_contact: true }]],
        resize_keyboard: true,
        one_time_keyboard: true,
      },
    },
  );

const menyuTugmasi = () => ({ inline_keyboard: [[{ text: "🍽 Taom buyurtma qilish", web_app: { url: miniAppUrl() } }]] });

const xushKelibsiz = async (chatId: number) => {
  // Avval raqam klaviaturasini yopamiz, keyin Mini App tugmasini yuboramiz
  await xabarYubor(chatId, "✅ Raqamingiz saqlandi.", { reply_markup: { remove_keyboard: true } });
  return xabarYubor(chatId, "<b>Xush kelibsiz!</b>\nYoshlik kafesi — navbatsiz, issiq ovqat.", {
    reply_markup: menyuTugmasi(),
  });
};

const ROL_NOMI = { ADMIN: "admin", KASSIR: "kassir", OSHPAZ: "oshpaz" } as const;

/** Xodim bo'lsa — boshqaruv paneli havolasi bilan xabar; bo'lmasa (faqat admin so'rovida) — "admin emassiz". */
async function xodimHolati(chatId: number, telefon: string, adminSorovi: boolean) {
  const { rol } = await xodimRoli(telefon);
  if (rol) {
    const panel = `${miniAppUrl().replace(/\/$/, "")}/admin`;
    const matn = `🔐 Siz <b>${ROL_NOMI[rol]}</b> sifatida ro'yxatdasiz.\nBoshqaruv paneli pastdagi tugmada.`;
    return xabarYubor(chatId, matn, {
      reply_markup: { inline_keyboard: [[{ text: "🔐 Boshqaruv paneli", web_app: { url: panel } }]] },
    });
  }
  if (adminSorovi) return xabarYubor(chatId, "⛔️ Siz admin emassiz. Raqamingiz xodimlar ro'yxatida yo'q.");
}

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
  const tgId = x.from.id;

  if (x.contact) {
    // Faqat o'z raqami: boshqa odamning kontaktini yuborish rad etiladi
    if (x.contact.user_id !== tgId) {
      return xabarYubor(chatId, "Iltimos, pastdagi tugma orqali <b>o'zingizning</b> raqamingizni ulashing.");
    }
    const telefon = telefonniTozala(x.contact.phone_number);
    if (!telefon) return xabarYubor(chatId, "Hozircha faqat O'zbekiston raqamlari (+998) qabul qilinadi.");
    const natija = await raqamniSaqla(x.from, telefon);
    if (natija === "band") {
      return xabarYubor(chatId, "Bu raqam boshqa Telegram akkauntiga bog'langan. Kafe administratoriga murojaat qiling.");
    }

    // Kompyuterda kirish kutilayotgan bo'lsa — to'g'ridan-to'g'ri o'shani davom ettiramiz
    const kirishId = await ochiqKirish(tgId);
    const mijoz = await prisma.mijoz.findUnique({ where: { telegramId: BigInt(tgId) }, select: { id: true } });
    if (kirishId && mijoz) {
      await xabarYubor(chatId, "✅ Raqamingiz saqlandi.", { reply_markup: { remove_keyboard: true } });
      return kirishTaklifi(chatId, kirishId, { id: mijoz.id, telefon });
    }

    await xushKelibsiz(chatId);
    // Xodim bo'lsa rolini ham aytamiz (oddiy mijozga qo'shimcha xabar yo'q)
    return xodimHolati(chatId, telefon, false);
  }

  const matn = x.text?.trim() ?? "";
  const kirish = /^\/start k_([A-Za-z0-9_-]+)$/.exec(matn);
  const mijoz = await prisma.mijoz.findUnique({ where: { telegramId: BigInt(tgId) } });

  if (kirish) {
    if (!(await kirishgaBogla(kirish[1], tgId))) return kirishEskirgan(chatId);
    if (!mijoz?.telefon) return raqamSora(chatId, true);
    return kirishTaklifi(chatId, kirish[1], { id: mijoz.id, telefon: mijoz.telefon });
  }

  if (!mijoz?.telefon) return raqamSora(chatId);
  if (matn === "/start admin") return xodimHolati(chatId, mijoz.telefon, true);
  if (matn.startsWith("/start")) {
    return xabarYubor(chatId, "<b>Xush kelibsiz!</b>\nYoshlik kafesi — navbatsiz, issiq ovqat.", {
      reply_markup: menyuTugmasi(),
    });
  }
  return xabarYubor(chatId, "Zakaz berish uchun pastdagi tugmani bosing 👇", { reply_markup: menyuTugmasi() });
}
