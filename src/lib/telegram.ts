declare global {
  interface Window {
    Telegram?: { WebApp?: any };
  }
}

function getWebApp() {
  return typeof window !== "undefined" ? window.Telegram?.WebApp : undefined;
}

export function initTelegram() {
  try {
    const wa = getWebApp();
    if (wa) {
      wa.ready();
      wa.expand();
    }
  } catch {
    // Telegram tashqarisida (brauzerda) ishga tushirilganda jim o'tkazib yuboriladi
  }
}

export function getTelegramUser() {
  try {
    return getWebApp()?.initDataUnsafe?.user ?? null;
  } catch {
    return null;
  }
}
