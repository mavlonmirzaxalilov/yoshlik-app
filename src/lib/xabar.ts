import { prisma } from "@/lib/prisma";
import { xabarYubor } from "@/lib/telegram";
import type { ZakazHolati } from "@/lib/holatlar";

// Holat o'zgarganda mijozga bot orqali xabar. Xabar ketmasa ham zakaz oqimi davom etadi.

const MATN: Partial<Record<ZakazHolati, (raqam: number, vaqt: string | null) => string>> = {
  TOLANDI: (r, v) => `✅ Zakaz #${r} to'landi.${v ? ` Olish vaqti: <b>${v}</b>.` : ""}`,
  QABUL_QILINDI: (r, v) => `✅ Zakaz #${r} qabul qilindi.${v ? ` Vaqt: <b>${v}</b>.` : ""}`,
  TAYYORLANMOQDA: (r) => `👨‍🍳 Zakaz #${r} tayyorlanmoqda.`,
  TAYYOR: (r) => `🔔 <b>Zakaz #${r} tayyor!</b> Kassada raqamni ayting.`,
  YOLDA: (r) => `🛵 Zakaz #${r} yo'lda.`,
  BERILDI: (r) => `🙏 Zakaz #${r} berildi. Yoqimli ishtaha!`,
  BEKOR: (r) => `❌ Zakaz #${r} bekor qilindi.`,
};

// Yetkazishda "tayyor" — kuryer kutilmoqda, kassadan olinmaydi
const TAYYOR_YETKAZISH = (r: number) => `🔔 Zakaz #${r} tayyor, kuryer tez orada yo'lga chiqadi.`;

export async function holatXabari(zakazId: number, qoshimcha?: string) {
  const z = await prisma.zakaz.findUnique({
    where: { id: zakazId },
    select: { raqam: true, holat: true, olishUsuli: true, olishVaqti: true, mijoz: { select: { telegramId: true } } },
  });
  if (!z?.mijoz?.telegramId) return;
  const shablon =
    z.holat === "TAYYOR" && z.olishUsuli === "YETKAZISH" ? TAYYOR_YETKAZISH : MATN[z.holat as ZakazHolati];
  if (!shablon) return;
  const matn = shablon(z.raqam, z.olishVaqti) + (qoshimcha ? `\n${qoshimcha}` : "");
  await xabarYubor(z.mijoz.telegramId, matn);
}
