import { createHash, randomBytes, randomInt } from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

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

  const token = randomBytes(32).toString("base64url");
  const muddati = new Date(Date.now() + SESSIYA_KUN * 86_400_000);
  await prisma.sessiya.create({ data: { id: xesh(token), mijozId: mijoz.id, muddati } });

  (await cookies()).set(SESSIYA_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: muddati,
  });
  return mijoz;
}

export async function chiqish() {
  const jar = await cookies();
  const token = jar.get(SESSIYA_COOKIE)?.value;
  if (token) await prisma.sessiya.deleteMany({ where: { id: xesh(token) } });
  jar.delete(SESSIYA_COOKIE);
}

export type Foydalanuvchi = {
  mijoz: { id: number; ism: string | null; telefon: string | null };
  admin: boolean;
};

/** Cookie'dagi sessiya bo'yicha joriy foydalanuvchi; kirmagan bo'lsa null. */
export async function joriyFoydalanuvchi(): Promise<Foydalanuvchi | null> {
  const token = (await cookies()).get(SESSIYA_COOKIE)?.value;
  if (!token) return null;
  const sessiya = await prisma.sessiya.findUnique({
    where: { id: xesh(token) },
    include: { mijoz: { select: { id: true, ism: true, telefon: true } } },
  });
  if (!sessiya || sessiya.muddati < new Date()) return null;
  const admin = sessiya.mijoz.telefon
    ? (await prisma.admin.count({ where: { telefon: sessiya.mijoz.telefon } })) > 0
    : false;
  return { mijoz: sessiya.mijoz, admin };
}

export const javobXato = (xabar: string, status = 400) => Response.json({ xato: xabar }, { status });

/** API yo'llari uchun: kirmagan bo'lsa 401 javobini qaytaradi. */
export async function talabQil(adminKerak = false) {
  const f = await joriyFoydalanuvchi();
  if (!f) return { xato: javobXato("Avval tizimga kiring", 401) } as const;
  if (adminKerak && !f.admin) return { xato: javobXato("Ruxsat yo'q", 403) } as const;
  return { f } as const;
}
