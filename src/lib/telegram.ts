import WebApp from "@twa-dev/sdk";

export function initTelegram() {
  try {
    WebApp.ready();
    WebApp.expand();
  } catch {
    // Telegram tashqarisida (brauzerda) ishga tushirilganda jim o'tkazib yuboriladi
  }
}

export function getTelegramUser() {
  try {
    return WebApp.initDataUnsafe?.user ?? null;
  } catch {
    return null;
  }
}

export { WebApp };
