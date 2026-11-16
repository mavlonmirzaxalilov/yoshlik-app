import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { SOZLAMA_KALITLARI, sozlamalar, type SozlamaKaliti } from "@/lib/sozlamalar";

const RAQAMLI: SozlamaKaliti[] = [
  "KAFE_LAT",
  "KAFE_LNG",
  "YETKAZISH_BAZAVIY",
  "YETKAZISH_KM_NARXI",
  "YETKAZISH_RADIUS_KM",
  "YETKAZISH_MIN_SUMMA",
];

// GET — joriy qiymatlar (baza yoki .env)
export async function GET() {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  return Response.json(await sozlamalar());
}

// PUT — { KALIT: qiymat, ... }; bo'sh qiymat bazadagini o'chiradi (.env qiymati ishlaydi)
export async function PUT(request: Request) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const body = await request.json().catch(() => ({}));
  for (const k of SOZLAMA_KALITLARI) {
    if (!(k in body)) continue;
    const v = String(body[k] ?? "").trim().slice(0, 200);
    if (v && RAQAMLI.includes(k) && !Number.isFinite(Number(v))) return javobXato(`${k} — son bo'lishi kerak`);
    if (v && (k === "KAFE_LAT" ? Math.abs(Number(v)) > 90 : k === "KAFE_LNG" ? Math.abs(Number(v)) > 180 : false)) {
      return javobXato("Koordinata noto'g'ri");
    }
    if (v) await prisma.sozlama.upsert({ where: { kalit: k }, update: { qiymat: v }, create: { kalit: k, qiymat: v } });
    else await prisma.sozlama.deleteMany({ where: { kalit: k } });
  }
  return Response.json(await sozlamalar());
}
