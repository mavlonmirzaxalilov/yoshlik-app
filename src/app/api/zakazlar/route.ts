import { prisma } from "@/lib/prisma";
import { talabQil } from "@/lib/auth";
import { promokodTekshir } from "@/lib/promokod";
import { testRejim, tolovManzili } from "@/lib/tolov";
import { hozirgiVaqtToshkent, vaqtTogrimi } from "@/lib/vaqt";
import { yetkazishHisobla } from "@/lib/yetkazish";
import { OLISH_USULLARI, tolovUsullari, type OlishUsuli, type TolovUsuli } from "@/lib/turlar";

type SorovQatori = { taomId: number; soni: number };
type Sorov = {
  qatorlar?: SorovQatori[];
  olishUsuli?: OlishUsuli;
  olishVaqti?: string;
  tolovUsuli?: TolovUsuli;
  promokod?: string;
  yetkazish?: { manzil?: string; lat?: number; lng?: number };
};

const xato = (xabar: string, status = 400) => Response.json({ xato: xabar }, { status });

// POST /api/zakazlar — yangi zakaz.
// Narx, chegirma va yetkazish narxi mijoz yuborganidan emas, serverda hisoblanadi.
export async function POST(request: Request) {
  const t = await talabQil();
  if (t.xato) return t.xato;

  let body: Sorov;
  try {
    body = await request.json();
  } catch {
    return xato("So'rov JSON formatida emas");
  }

  const qatorlar = (body.qatorlar ?? []).filter(
    (q) => Number.isInteger(q.taomId) && Number.isInteger(q.soni) && q.soni > 0 && q.soni <= 50,
  );
  if (qatorlar.length === 0) return xato("Savatcha bo'sh");

  const usul = body.olishUsuli;
  if (!usul || !OLISH_USULLARI.some((u) => u.qiymat === usul)) return xato("Olish usuli noto'g'ri");

  // Olish vaqti uchala usulda majburiy; bugun o'tib ketgan vaqt qabul qilinmaydi
  if (!vaqtTogrimi(body.olishVaqti)) return xato("Olish vaqtini tanlang");
  if (body.olishVaqti <= hozirgiVaqtToshkent()) return xato("Bu vaqt o'tib ketgan — keyingi vaqtni tanlang");

  const tolovUsuli = body.tolovUsuli;
  if (!tolovUsuli || !tolovUsullari(usul).some((u) => u.qiymat === tolovUsuli)) {
    return xato("Bu olish usulida bunday to'lov yo'q");
  }

  const taomlar = await prisma.taom.findMany({ where: { id: { in: qatorlar.map((q) => q.taomId) } } });
  const yangiQatorlar: { taomId: number; nom: string; narx: number; soni: number }[] = [];
  for (const q of qatorlar) {
    const taom = taomlar.find((x) => x.id === q.taomId);
    if (!taom) return xato(`Taom topilmadi: ${q.taomId}`);
    if (taom.tugadi) return xato(`"${taom.nom}" tugadi — savatchadan olib tashlang`);
    yangiQatorlar.push({ taomId: taom.id, nom: taom.nom, narx: taom.narx, soni: q.soni });
  }
  const taomlarSumma = yangiQatorlar.reduce((s, q) => s + q.narx * q.soni, 0);

  let yetkazish: { narx: number; km: number; manzil: string; lat: number; lng: number } | null = null;
  if (usul === "YETKAZISH") {
    const manzil = body.yetkazish?.manzil?.trim().slice(0, 200) ?? "";
    if (manzil.length < 5) return xato("Yetkazish manzilini yozing");
    const n = yetkazishHisobla(body.yetkazish?.lat, body.yetkazish?.lng, taomlarSumma);
    if (!n.mumkin) return xato(n.sabab);
    yetkazish = { narx: n.narx, km: n.km, manzil, lat: body.yetkazish!.lat!, lng: body.yetkazish!.lng! };
  }

  const onlayn = tolovUsuli === "CLICK" || tolovUsuli === "PAYME";
  if (onlayn && !testRejim()) return xato("Onlayn to'lov hali ulanmagan", 503);

  try {
    const natija = await prisma.$transaction(async (tx) => {
      let chegirma = 0;
      let promokodId: number | null = null;
      if (body.promokod?.trim()) {
        const p = await promokodTekshir(tx, body.promokod, taomlarSumma);
        if (!p.ok) throw new Error(p.xato);
        chegirma = p.chegirma;
        promokodId = p.id;
        await tx.promokod.update({ where: { id: p.id }, data: { ishlatildi: { increment: 1 } } });
      }
      const jamiSumma = taomlarSumma - chegirma + (yetkazish?.narx ?? 0);

      const zakaz = await tx.zakaz.create({
        data: {
          holat: onlayn ? "TOLOV_KUTILMOQDA" : "QABUL_QILINDI",
          olishUsuli: usul,
          olishVaqti: body.olishVaqti,
          tolovUsuli,
          taomlarSumma,
          chegirma,
          yetkazishNarxi: yetkazish?.narx ?? 0,
          jamiSumma,
          yetkazishManzil: yetkazish?.manzil,
          lat: yetkazish?.lat,
          lng: yetkazish?.lng,
          masofaKm: yetkazish?.km,
          promokodId,
          mijozId: t.f.mijoz.id,
          qatorlar: { create: yangiQatorlar },
        },
      });
      const tolov = onlayn
        ? await tx.tolov.create({ data: { zakazId: zakaz.id, usul: tolovUsuli, summa: jamiSumma } })
        : null;
      return { zakaz, tolov };
    });

    return Response.json(
      {
        id: natija.zakaz.id,
        raqam: natija.zakaz.raqam,
        tolovUrl: natija.tolov ? tolovManzili(natija.tolov.id) : null,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof Error && !("code" in e)) return xato(e.message);
    throw e;
  }
}
