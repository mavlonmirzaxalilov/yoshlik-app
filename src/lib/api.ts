"use client";

// Klientdagi barcha API so'rovlari shu o'ram orqali: Telegram Mini App ichida
// "Authorization: tma <initData>" qo'shiladi (cookie'ga tayanmaymiz), vebda — oddiy fetch (cookie sessiya).

type TelegramWebApp = {
  initData: string;
  ready: () => void;
  expand: () => void;
  requestContact?: (cb?: (ok: boolean) => void) => void;
  LocationManager?: {
    isInited: boolean;
    isLocationAvailable: boolean;
    init: (cb?: () => void) => void;
    getLocation: (cb: (data: { latitude: number; longitude: number } | null) => void) => void;
  };
};

export function telegramWebApp(): TelegramWebApp | null {
  if (typeof window === "undefined") return null;
  const wa = (window as unknown as { Telegram?: { WebApp?: TelegramWebApp } }).Telegram?.WebApp;
  return wa?.initData ? wa : null;
}

export function api(url: string, init: RequestInit = {}) {
  const wa = telegramWebApp();
  if (!wa) return fetch(url, init);
  const sarlavhalar = new Headers(init.headers);
  sarlavhalar.set("Authorization", `tma ${wa.initData}`);
  return fetch(url, { ...init, headers: sarlavhalar });
}
