import WebApp from "@twa-dev/sdk";

export function initTelegram() {
  try {
    WebApp.ready();
    WebApp.expand();
  } catch {
    // Telegram tashqarisida (brauzerda) ishga tushirilganda jim o'tkazib yuboriladi
  }
}

export { WebApp };
