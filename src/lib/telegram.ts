import { createHash, createHmac, timingSafeEqual } from "node:crypto";

// Telegram Bot API va Mini App initData tekshiruvi.
// Token faqat .env'da (TELEGRAM_BOT_TOKEN) — kodga yoki logga yozilmaydi.

const token = () => process.env.TELEGRAM_BOT_TOKEN ?? "";

/** Mini App manzili (bot tugmalari shu yerga ochadi). */
export const miniAppUrl = () => process.env.MINI_APP_URL ?? "";

/** Bot API chaqiruvi. Xato bo'lsa log yozadi va null qaytaradi — zakaz oqimi buzilmasligi uchun. */
export async function botApi<T = unknown>(metod: string, body: object): Promise<T | null> {
  if (!token()) {
    console.warn(`[telegram] TELEGRAM_BOT_TOKEN yo'q — ${metod} yuborilmadi`);
    return null;
  }
  try {
    const javob = await fetch(`https://api.telegram.org/bot${token()}/${metod}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await javob.json();
    if (!data.ok) {
      console.warn(`[telegram] ${metod} xato: ${data.description}`);
      return null;
    }
    return data.result as T;
  } catch (e) {
    console.warn(`[telegram] ${metod} yuborilmadi:`, e instanceof Error ? e.message : e);
    return null;
  }
}

export const xabarYubor = (chatId: number | bigint, matn: string, qoshimcha: object = {}) =>
  botApi("sendMessage", { chat_id: chatId.toString(), text: matn, parse_mode: "HTML", ...qoshimcha });

export type TelegramUser = { id: number; first_name?: string; last_name?: string; username?: string };

const INIT_DATA_MUDDATI_SONIYA = 24 * 60 * 60;

/**
 * Telegram Login Widget ma'lumotini tekshiradi (kompyuterda admin kirishi).
 * Telegram hujjati: secret = SHA256(bot_token); hash = HMAC_SHA256(key=secret, msg=data_check_string).
 */
export function loginWidgetTekshir(data: Record<string, unknown>, botToken = token()): TelegramUser | null {
  if (!botToken || typeof data.hash !== "string") return null;
  const maydonlar = Object.entries(data)
    .filter(([k, v]) => k !== "hash" && v !== undefined && v !== null)
    .map(([k, v]) => [k, String(v)] as const)
    .sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = maydonlar.map(([k, v]) => `${k}=${v}`).join("\n");
  const secret = createHash("sha256").update(botToken).digest();
  const kutilgan = createHmac("sha256", secret).update(dataCheckString).digest();
  const kelgan = Buffer.from(data.hash, "hex");
  if (kelgan.length !== kutilgan.length || !timingSafeEqual(kelgan, kutilgan)) return null;

  const authDate = Number(data.auth_date);
  if (!authDate || Date.now() / 1000 - authDate > INIT_DATA_MUDDATI_SONIYA) return null;
  const id = Number(data.id);
  if (!Number.isInteger(id)) return null;
  return {
    id,
    first_name: typeof data.first_name === "string" ? data.first_name : undefined,
    last_name: typeof data.last_name === "string" ? data.last_name : undefined,
    username: typeof data.username === "string" ? data.username : undefined,
  };
}

/**
 * Mini App initData imzosini tekshiradi (Telegram hujjati: "Validating data received via the Mini App").
 * secret = HMAC_SHA256(key="WebAppData", msg=bot_token); hash = HMAC_SHA256(key=secret, msg=data_check_string).
 */
export function initDataTekshir(initData: string, botToken = token()): TelegramUser | null {
  if (!initData || !botToken) return null;
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  params.delete("hash");

  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const kutilgan = createHmac("sha256", secret).update(dataCheckString).digest();
  const kelgan = Buffer.from(hash, "hex");
  if (kelgan.length !== kutilgan.length || !timingSafeEqual(kelgan, kutilgan)) return null;

  const authDate = Number(params.get("auth_date"));
  if (!authDate || Date.now() / 1000 - authDate > INIT_DATA_MUDDATI_SONIYA) return null;

  try {
    const user = JSON.parse(params.get("user") ?? "null") as TelegramUser | null;
    return user && Number.isInteger(user.id) ? user : null;
  } catch {
    return null;
  }
}
