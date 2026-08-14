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
    const wa = WebApp;
    console.log("initData:", wa.initData);
    console.log("initDataUnsafe:", JSON.stringify(wa.initDataUnsafe));
    console.log("user:", wa.initDataUnsafe?.user);
    return wa.initDataUnsafe?.user ?? null;
  } catch (e) {
    console.log("Xato:", e);
    return null;
  }
}

export { WebApp };
