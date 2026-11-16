import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sozlamalar } from "@/lib/sozlamalar";
import { tolovNomi, usulNomi } from "@/lib/turlar";

// Chek printeri. Kassa kompyuteridagi dastur (public/chek/chek-dasturi.mjs) navbatni so'raydi
// va USB printerlarga chop etadi. Faqat bot zakazlari: oshxona (narxsiz) va kassa (narxlari bilan).
// Chek matnini server tuzadi — dastur faqat qatorlarni ESC/POS'ga o'giradi (chek ko'rinishini
// o'zgartirish uchun kassa kompyuteridagi dasturni yangilash shart emas).

/** Chek qatori: m — matn; k — katta (2x); q — qalin; x — tekislash (c markaz, r o'ng). */
export type Qator = { m: string; k?: 1; q?: 1; x?: "c" | "r" } | { chiziq: 1 } | { kesish: 1 };
export type ChekTuri = "oshxona" | "kassa";

const KALIT_HASH = "CHEK_KALIT_HASH";
const AGENT_VAQT = "CHEK_AGENT_VAQT";
const xesh = (s: string) => createHash("sha256").update(s).digest("hex");

// ---------- Kalit (dastur serverga shu bilan kiradi) ----------

/** Yangi kalit — faqat bir marta ko'rsatiladi, bazada xeshi saqlanadi. */
export async function yangiKalit() {
  const kalit = `chek_${randomBytes(24).toString("base64url")}`;
  await prisma.sozlama.upsert({
    where: { kalit: KALIT_HASH },
    update: { qiymat: xesh(kalit) },
    create: { kalit: KALIT_HASH, qiymat: xesh(kalit) },
  });
  return kalit;
}

/** "Authorization: Bearer <kalit>" to'g'rimi; to'g'ri bo'lsa dastur oxirgi ko'ringan vaqtni yangilaydi. */
export async function kalitTekshir(request: Request) {
  const auth = request.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return false;
  const saqlangan = await prisma.sozlama.findUnique({ where: { kalit: KALIT_HASH } });
  if (!saqlangan) return false;
  const a = Buffer.from(xesh(auth.slice(7).trim()));
  const b = Buffer.from(saqlangan.qiymat);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;

  const hozir = new Date();
  const oxirgi = await prisma.sozlama.findUnique({ where: { kalit: AGENT_VAQT } });
  if (!oxirgi || hozir.getTime() - Number(oxirgi.qiymat) > 30_000) {
    await prisma.sozlama.upsert({
      where: { kalit: AGENT_VAQT },
      update: { qiymat: String(hozir.getTime()) },
      create: { kalit: AGENT_VAQT, qiymat: String(hozir.getTime()) },
    });
  }
  return true;
}

export async function chekHolati() {
  const [kalit, vaqt] = await Promise.all([
    prisma.sozlama.findUnique({ where: { kalit: KALIT_HASH } }),
    prisma.sozlama.findUnique({ where: { kalit: AGENT_VAQT } }),
  ]);
  return { kalitBor: Boolean(kalit), dasturVaqti: vaqt ? new Date(Number(vaqt.qiymat)).toISOString() : null };
}

// ---------- Navbat ----------

// Chek chiqadigan zakazlar: bot zakazi, to'langan yoki qabul qilingan (to'lov kutilayotgan va bekor emas)
const chekKerak: Prisma.ZakazWhereInput = {
  manba: "ONLAYN",
  holat: { notIn: ["TOLOV_KUTILMOQDA", "BEKOR"] },
  OR: [{ oshxonaChek: null }, { kassaChek: null }],
};

/** Shundan eski zakazga chek chiqmaydi (dastur uzoq o'chiq tursa, oshxonaga eski cheklar to'kilmasin). */
export const CHEK_MUDDATI_MS = 24 * 3600_000;

export async function chekNavbati(kenglik: number) {
  const zakazlar = await prisma.zakaz.findMany({
    where: { ...chekKerak, yaratilgan: { gte: new Date(Date.now() - CHEK_MUDDATI_MS) } },
    orderBy: { yaratilgan: "asc" },
    take: 10,
    include: {
      qatorlar: { orderBy: { id: "asc" } },
      mijoz: { select: { ism: true, telefon: true } },
      promokod: { select: { kod: true } },
    },
  });
  const s = zakazlar.length ? await sozlamalar() : null;
  return zakazlar.map((z) => ({
    id: z.id,
    raqam: z.raqam,
    ...(z.oshxonaChek ? {} : { oshxona: oshxonaCheki(z, kenglik) }),
    ...(z.kassaChek ? {} : { kassa: kassaCheki(z, kenglik, s?.KAFE_TELEFON ?? "") }),
  }));
}

export async function chekChiqdi(id: number, tur: ChekTuri) {
  const maydon = tur === "oshxona" ? "oshxonaChek" : "kassaChek";
  const r = await prisma.zakaz.updateMany({ where: { id, [maydon]: null }, data: { [maydon]: new Date() } });
  return r.count > 0;
}

// ---------- Chek matni ----------

type ChekZakaz = Prisma.ZakazGetPayload<{
  include: { qatorlar: true; mijoz: { select: { ism: true; telefon: true } }; promokod: { select: { kod: true } } };
}>;

/** Termal printer kodlash jadvali — faqat ASCII: o'zbek apostroflari va maxsus belgilar almashtiriladi. */
export function ascii(s: string) {
  return s
    .replace(/[ʻʼ‘’`´]/g, "'")
    .replace(/[“”«»]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/×/g, "x")
    .replace(/№/g, "N")
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const pul = (n: number) => n.toLocaleString("ru-RU").replace(/\s/g, " ");

const vaqtMatn = (d: Date) => {
  const f = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Tashkent",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const q = (t: string) => f.find((p) => p.type === t)?.value ?? "";
  return `${q("day")}.${q("month")}.${q("year")} ${q("hour")}:${q("minute")}`;
};

/** Uzun matnni kenglikka bo'ladi (so'z bo'yicha). */
function bol(matn: string, kenglik: number): string[] {
  const natija: string[] = [];
  let joriy = "";
  for (const soz of ascii(matn).split(" ")) {
    if (!soz) continue;
    if ((joriy ? joriy.length + 1 : 0) + soz.length <= kenglik) joriy = joriy ? `${joriy} ${soz}` : soz;
    else {
      if (joriy) natija.push(joriy);
      joriy = soz.length > kenglik ? soz.slice(0, kenglik) : soz;
    }
  }
  if (joriy) natija.push(joriy);
  return natija.length ? natija : [""];
}

/** Chapda matn, o'ngda summa — bir qatorda. */
function ikkiUstun(chap: string, ong: string, kenglik: number, opts: { q?: 1; k?: 1 } = {}): Qator[] {
  const w = opts.k ? Math.floor(kenglik / 2) : kenglik;
  const o = ascii(ong);
  const chekinish = /^ */.exec(chap)![0];
  const qatorlar = bol(chap, Math.max(8, w - o.length - 1 - chekinish.length)).map((m) => chekinish + m);
  const oxirgi = qatorlar.pop()!;
  return [
    ...qatorlar.map((m) => ({ m, ...opts })),
    { m: oxirgi + " ".repeat(Math.max(1, w - oxirgi.length - o.length)) + o, ...opts },
  ];
}

const matnlar = (matn: string, kenglik: number, opts: { q?: 1; k?: 1; x?: "c" | "r" } = {}): Qator[] =>
  bol(matn, opts.k ? Math.floor(kenglik / 2) : kenglik).map((m) => ({ m, ...opts }));

function mijozQatorlari(z: ChekZakaz, kenglik: number): Qator[] {
  const q: Qator[] = [];
  if (z.mijoz) q.push(...matnlar(`Mijoz: ${[z.mijoz.ism, z.mijoz.telefon].filter(Boolean).join(", ")}`, kenglik));
  if (z.yetkazishManzil) q.push(...matnlar(`Manzil: ${z.yetkazishManzil}`, kenglik));
  return q;
}

/** Oshxona cheki: narxsiz, katta harflar — raqam, olish usuli va vaqti, taomlar soni. */
export function oshxonaCheki(z: ChekZakaz, kenglik: number): Qator[] {
  return [
    { m: "OSHXONA", x: "c", q: 1 },
    { m: `#${z.raqam}`, x: "c", k: 1, q: 1 },
    ...matnlar(`${usulNomi(z.olishUsuli)}${z.olishVaqti ? ` - ${z.olishVaqti}` : ""}`, kenglik, { x: "c", k: 1 }),
    { chiziq: 1 },
    ...z.qatorlar.flatMap((t) => matnlar(`${t.soni} x ${t.nom}`, kenglik, { k: 1 })),
    { chiziq: 1 },
    { m: `Bot zakazi - ${vaqtMatn(z.yaratilgan)}` },
    ...mijozQatorlari(z, kenglik),
    { kesish: 1 },
  ];
}

/** Kassa cheki: mijoz uchun, narxlari bilan. Fiskal chek emas (fiskal V1'da yo'q — DECISIONS.md). */
export function kassaCheki(z: ChekZakaz, kenglik: number, telefon: string): Qator[] {
  const tolandi = z.holat !== "QABUL_QILINDI"; // QABUL_QILINDI — naqd yetkazish, pul hali olinmagan
  return [
    { m: "YOSHLIK", x: "c", k: 1, q: 1 },
    ...(telefon ? [{ m: ascii(telefon), x: "c" as const }] : []),
    { m: `Zakaz #${z.raqam}`, x: "c", q: 1 },
    { m: vaqtMatn(z.yaratilgan), x: "c" },
    { chiziq: 1 },
    ...matnlar(`Olish: ${usulNomi(z.olishUsuli)}${z.olishVaqti ? `, ${z.olishVaqti}` : ""}`, kenglik),
    ...mijozQatorlari(z, kenglik),
    { chiziq: 1 },
    ...z.qatorlar.flatMap((t) => [
      ...matnlar(t.nom, kenglik),
      ...ikkiUstun(`   ${t.soni} x ${pul(t.narx)}`, pul(t.narx * t.soni), kenglik),
    ]),
    { chiziq: 1 },
    ...ikkiUstun("Taomlar", pul(z.taomlarSumma), kenglik),
    ...(z.chegirma ? ikkiUstun(`Chegirma${z.promokod ? ` (${z.promokod.kod})` : ""}`, `-${pul(z.chegirma)}`, kenglik) : []),
    ...(z.yetkazishNarxi ? ikkiUstun("Yetkazish", pul(z.yetkazishNarxi), kenglik) : []),
    ...ikkiUstun("JAMI", `${pul(z.jamiSumma)} so'm`, kenglik, { q: 1 }),
    ...matnlar(`To'lov: ${tolovNomi(z.tolovUsuli)} - ${tolandi ? "to'langan" : "to'lanmagan"}`, kenglik),
    { chiziq: 1 },
    { m: "Fiskal chek emas", x: "c" },
    { m: "Rahmat! Yoqimli ishtaha!", x: "c", q: 1 },
    { kesish: 1 },
  ];
}
