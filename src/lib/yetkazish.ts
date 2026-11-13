// Yetkazish narxi: kafe nuqtasidan to'g'ri chiziq masofasi (haversine).
// Tarif va kafe nuqtasi .env'dan — hozircha test qiymatlar (DECISIONS.md).

const son = (nom: string) => Number(process.env[nom]);

export const yetkazishSozlamalari = () => ({
  kafeLat: son("KAFE_LAT"),
  kafeLng: son("KAFE_LNG"),
  bazaviy: son("YETKAZISH_BAZAVIY"),
  kmNarxi: son("YETKAZISH_KM_NARXI"),
  radiusKm: son("YETKAZISH_RADIUS_KM"),
  minSumma: son("YETKAZISH_MIN_SUMMA"),
});

function masofaKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = (g: number) => (g * Math.PI) / 180;
  const a =
    Math.sin(r(lat2 - lat1) / 2) ** 2 + Math.cos(r(lat1)) * Math.cos(r(lat2)) * Math.sin(r(lng2 - lng1) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export type YetkazishNatija =
  | { mumkin: true; km: number; narx: number }
  | { mumkin: false; km: number | null; sabab: string };

/** taomlarSumma — chegirmadan oldingi summa (minimal summa shunga qarab tekshiriladi). */
export function yetkazishHisobla(lat: unknown, lng: unknown, taomlarSumma: number): YetkazishNatija {
  const s = yetkazishSozlamalari();
  if (Object.values(s).some((v) => !Number.isFinite(v))) {
    return { mumkin: false, km: null, sabab: "Yetkazish sozlanmagan" };
  }
  if (typeof lat !== "number" || typeof lng !== "number" || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return { mumkin: false, km: null, sabab: "Joylashuvingizni yuboring" };
  }
  const km = Math.round(masofaKm(s.kafeLat, s.kafeLng, lat, lng) * 10) / 10;
  if (km > s.radiusKm) {
    return { mumkin: false, km, sabab: `Bu manzilga yetkazib bo'lmaydi (${km} km, chegara ${s.radiusKm} km)` };
  }
  if (taomlarSumma < s.minSumma) {
    return { mumkin: false, km, sabab: `Yetkazish uchun minimal zakaz ${s.minSumma.toLocaleString("ru-RU")} so'm` };
  }
  return { mumkin: true, km, narx: s.bazaviy + Math.ceil(km) * s.kmNarxi };
}
