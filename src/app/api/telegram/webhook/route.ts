import { timingSafeEqual } from "node:crypto";
import { kirishTasdigi } from "@/lib/botKirish";
import { botXabari } from "@/lib/botOqimi";

// POST /api/telegram/webhook — Telegram yangiliklari. Secret token tekshiriladi (setWebhook'da berilgan).
export async function POST(request: Request) {
  const kutilgan = process.env.TELEGRAM_WEBHOOK_SECRET ?? "";
  const kelgan = request.headers.get("x-telegram-bot-api-secret-token") ?? "";
  const a = Buffer.from(kelgan);
  const b = Buffer.from(kutilgan);
  if (!kutilgan || a.length !== b.length || !timingSafeEqual(a, b)) {
    return new Response("ruxsat yo'q", { status: 401 });
  }

  const update = await request.json().catch(() => null);
  try {
    if (update?.message) await botXabari(update.message);
    else if (update?.callback_query) await kirishTasdigi(update.callback_query);
  } catch (e) {
    // Telegram 200 olmasa qayta-qayta yuboradi — xatoni logga yozib, 200 qaytaramiz
    console.error("[telegram] webhook xatosi:", e);
  }
  return Response.json({ ok: true });
}
