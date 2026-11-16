// Yetkazish narxi: kafe nuqtasidan to'g'ri chiziq masofasi (haversine).
// Tarif va kafe nuqtasi admin "Sozlamalar"idan, bo'lmasa .env'dan (src/lib/sozlamalar.ts).
import { sozlamalar } from "@/lib/sozlamalar";

export async function yetkazishSozlamalari() {
  const s = await sozlamalar();
  const son = (v: string) => (v === "" ? NaN : Number(v));
  return {
    kafeLat: son(s.KAFE_LAT),
    kafeLng: son(s.KAFE_LNG),
    bazaviy: son(s.YETKAZISH_BAZAVIY),
    kmNarxi: son(s.YETKAZISH_KM_NARXI),
    radiusKm: son(s.YETKAZISH_RADIUS_KM),
    minSumma: son(s.YETKAZISH_MIN_SUMMA),
  };
}

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
export async function yetkazishHisobla(lat: unknown, lng: unknown, taomlarSumma: number): Promise<YetkazishNatija> {
  const s = await yetkazishSozlamalari();
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
