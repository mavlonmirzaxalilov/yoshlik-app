import { createHash, randomBytes, randomInt } from "node:crypto";
import { cookies, headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { initDataTekshir, type TelegramUser } from "@/lib/telegram";

export const SESSIYA_COOKIE = "sessiya";
const SESSIYA_KUN = 30;
const OTP_DAQIQA = 5;
const OTP_MAX_URINISH = 5;
const OTP_QAYTA_SONIYA = 60;

const xesh = (s: string) => createHash("sha256").update(s).digest("hex");

/** Telefonni +998XXXXXXXXX ko'rinishiga keltiradi; noto'g'ri bo'lsa null. */
export function telefonniTozala(kiritilgan: unknown): string | null {
  if (typeof kiritilgan !== "string") return null;
  const raqamlar = kiritilgan.replace(/\D/g, "");
  const toliq = raqamlar.length === 9 ? `998${raqamlar}` : raqamlar;
  return /^998\d{9}$/.test(toliq) ? `+${toliq}` : null;
}

export class AuthXato extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}

/** Yangi OTP yaratadi va "yuboradi". Test rejimida kod server logiga chiqadi. */
export async function otpYubor(telefon: string) {
  const oxirgi = await prisma.otpKod.findFirst({ where: { telefon }, orderBy: { yaratilgan: "desc" } });
  if (oxirgi && Date.now() - oxirgi.yaratilgan.getTime() < OTP_QAYTA_SONIYA * 1000) {
    throw new AuthXato("Kod yaqinda yuborildi — bir daqiqadan keyin qayta urinib ko'ring", 429);
  }

  // SMS provayder hali ulanmagan (DECISIONS.md). Productionda kodni jim yutib yubormaymiz.
  if (process.env.NODE_ENV === "production" && process.env.OTP_REJIM !== "test") {
    throw new AuthXato("SMS provayder ulanmagan", 503);
  }

  const kod = randomInt(0, 1_000_000).toString().padStart(6, "0");
  await prisma.otpKod.updateMany({ where: { telefon, ishlatildi: false }, data: { ishlatildi: true } });
  await prisma.otpKod.create({
    data: { telefon, kodHash: xesh(`${telefon}:${kod}`), muddati: new Date(Date.now() + OTP_DAQIQA * 60_000) },
  });
  console.log(`[OTP] ${telefon} -> ${kod}`);
}

/** Kodni tekshiradi; to'g'ri bo'lsa mijozni yaratadi/topadi va sessiya ochadi. */
export async function otpTekshir(telefon: string, kod: string) {
  const otp = await prisma.otpKod.findFirst({
    where: { telefon, ishlatildi: false },
    orderBy: { yaratilgan: "desc" },
  });
  if (!otp || otp.muddati < new Date() || otp.urinish >= OTP_MAX_URINISH) {
    throw new AuthXato("Kod eskirgan yoki yaroqsiz — yangi kod so'rang");
  }
  if (otp.kodHash !== xesh(`${telefon}:${kod}`)) {
    const urinish = otp.urinish + 1;
    await prisma.otpKod.update({
      where: { id: otp.id },
      data: { urinish, ishlatildi: urinish >= OTP_MAX_URINISH },
    });
    const qoldi = OTP_MAX_URINISH - urinish;
    throw new AuthXato(qoldi > 0 ? `Kod noto'g'ri. Yana ${qoldi} ta urinish qoldi` : "Kod noto'g'ri — yangi kod so'rang");
  }
  await prisma.otpKod.update({ where: { id: otp.id }, data: { ishlatildi: true } });

  // Rozilik kod so'ralganda berilgan (POST /api/auth/kod), shu yerda vaqti yoziladi.
  const mijoz = await prisma.mijoz.upsert({
    where: { telefon },
    update: { roziVaqti: new Date() },
    create: { telefon, roziVaqti: new Date() },
  });

  await sessiyaOch(mijoz.id);
  return mijoz;
}

/** Sessiya ochadi va httpOnly cookie qo'yadi (OTP va Telegram Login uchun umumiy). */
export async function sessiyaOch(mijozId: number) {
  const token = randomBytes(32).toString("base64url");
  const muddati = new Date(Date.now() + SESSIYA_KUN * 86_400_000);
  await prisma.sessiya.create({ data: { id: xesh(token), mijozId, muddati } });
  (await cookies()).set(SESSIYA_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: muddati,
  });
}

export async function chiqish() {
  const jar = await cookies();
  const token = jar.get(SESSIYA_COOKIE)?.value;
  if (token) await prisma.sessiya.deleteMany({ where: { id: xesh(token) } });
  jar.delete(SESSIYA_COOKIE);
}

export type Rol = "ADMIN" | "KASSIR" | "OSHPAZ";

export type Foydalanuvchi = {
  mijoz: { id: number; ism: string | null; telefon: string | null };
  rol: Rol | null; // xodim roli; mijoz bo'lsa null
  xodimId: number | null; // Admin jadvalidagi yozuv (egalar uchun bo'lmasligi mumkin)
  ega: boolean; // ADMIN_TELEFONLAR'da — o'chirib bo'lmaydigan ega
  admin: boolean; // rol === "ADMIN" (eski kod uchun)
};

const MIJOZ_MAYDONLARI = { id: true, ism: true, telefon: true } as const;

// Admin: telefoni ADMIN_TELEFONLAR (Vercel'da maxfiy sozlama) ro'yxatida yoki Admin jadvalida bo'lsa.
const envAdminlar = () =>
  (process.env.ADMIN_TELEFONLAR ?? "")
    .split(",")
    .map((t) => telefonniTozala(t.trim()))
    .filter(Boolean);

export const egami = (telefon: string | null) => Boolean(telefon && envAdminlar().includes(telefon));

/** Telefon bo'yicha xodim roli: egalar doim ADMIN; jadvaldagi faol xodim — o'z roli. */
export async function xodimRoli(telefon: string | null) {
  if (!telefon) return { rol: null, xodimId: null, ega: false } as const;
  const ega = egami(telefon);
  const x = await prisma.admin.findUnique({ where: { telefon }, select: { id: true, rol: true, faol: true } });
  const rol: Rol | null = ega ? "ADMIN" : x?.faol ? x.rol : null;
  return { rol, xodimId: x?.id ?? null, ega };
}

export async function adminmi(telefon: string | null) {
  return (await xodimRoli(telefon)).rol === "ADMIN";
}

async function toldir(mijoz: Foydalanuvchi["mijoz"]): Promise<Foydalanuvchi> {
  const r = await xodimRoli(mijoz.telefon);
  return { mijoz, ...r, admin: r.rol === "ADMIN" };
}

/** Telegram foydalanuvchisi bo'yicha mijozni topadi yoki yaratadi (telefon keyin bot orqali keladi). */
export async function telegramMijoz(user: TelegramUser) {
  const ism = [user.first_name, user.last_name].filter(Boolean).join(" ") || null;
  return prisma.mijoz.upsert({
    where: { telegramId: BigInt(user.id) },
    update: {},
    create: { telegramId: BigInt(user.id), ism },
    select: MIJOZ_MAYDONLARI,
  });
}

/**
 * Joriy foydalanuvchi; kirmagan bo'lsa null.
 * 1) Telegram Mini App: "Authorization: tma <initData>" (cookie'siz — Telegram Web iframe'ida cookie bloklanishi mumkin).
 * 2) Veb: S3 cookie sessiyasi.
 */
export async function joriyFoydalanuvchi(): Promise<Foydalanuvchi | null> {
  const auth = (await headers()).get("authorization");
  if (auth?.startsWith("tma ")) {
    const user = initDataTekshir(auth.slice(4));
    if (!user) return null;
    return toldir(await telegramMijoz(user));
  }

  const token = (await cookies()).get(SESSIYA_COOKIE)?.value;
  if (!token) return null;
  const sessiya = await prisma.sessiya.findUnique({
    where: { id: xesh(token) },
    include: { mijoz: { select: MIJOZ_MAYDONLARI } },
  });
  if (!sessiya || sessiya.muddati < new Date()) return null;
  return toldir(sessiya.mijoz);
}

export const javobXato = (xabar: string, status = 400) => Response.json({ xato: xabar }, { status });

/**
 * API yo'llari uchun: kirmagan bo'lsa 401, ruxsat yo'q bo'lsa 403.
 * talabQil() — har kim; talabQil(true) — faqat ADMIN; talabQil(["ADMIN","KASSIR"]) — sanalgan rollar.
 */
export async function talabQil(ruxsat: boolean | Rol[] = false) {
  const f = await joriyFoydalanuvchi();
  if (!f) return { xato: javobXato("Avval tizimga kiring", 401) } as const;
  const rollar: Rol[] | null = ruxsat === true ? ["ADMIN"] : Array.isArray(ruxsat) ? ruxsat : null;
  if (rollar && (!f.rol || !rollar.includes(f.rol))) return { xato: javobXato("Ruxsat yo'q", 403) } as const;
  return { f } as const;
}

export const XODIMLAR: Rol[] = ["ADMIN", "KASSIR", "OSHPAZ"];
