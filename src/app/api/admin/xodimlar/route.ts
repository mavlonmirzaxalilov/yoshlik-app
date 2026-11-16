import { prisma } from "@/lib/prisma";
import { egami, javobXato, talabQil, telefonniTozala } from "@/lib/auth";

const ROLLAR = ["ADMIN", "KASSIR", "OSHPAZ"] as const;

// GET /api/admin/xodimlar — jadvaldagi xodimlar + egalar (ADMIN_TELEFONLAR), Telegram bog'langanmi
export async function GET() {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const xodimlar = await prisma.admin.findMany({ orderBy: { id: "asc" } });
  const egaTelefonlar = (process.env.ADMIN_TELEFONLAR ?? "")
    .split(",")
    .map((x) => telefonniTozala(x.trim()))
    .filter((x): x is string => Boolean(x));
  const barchaTelefonlar = [...new Set([...egaTelefonlar, ...xodimlar.map((x) => x.telefon).filter(Boolean)])] as string[];
  const mijozlar = await prisma.mijoz.findMany({
    where: { telefon: { in: barchaTelefonlar } },
    select: { telefon: true, ism: true, telegramId: true },
  });
  const mijoz = (tel: string | null) => mijozlar.find((m) => m.telefon === tel);

  const natija = [
    ...egaTelefonlar
      .filter((tel) => !xodimlar.some((x) => x.telefon === tel))
      .map((tel) => ({ id: null, telefon: tel, ism: mijoz(tel)?.ism ?? null, rol: "ADMIN", faol: true })),
    ...xodimlar.map((x) => ({ id: x.id, telefon: x.telefon, ism: x.ism ?? mijoz(x.telefon)?.ism ?? null, rol: x.rol, faol: x.faol })),
  ].map((x) => ({
    ...x,
    ega: egami(x.telefon),
    telegram: Boolean(mijoz(x.telefon)?.telegramId),
    menmi: x.telefon === t.f.mijoz.telefon,
  }));
  return Response.json(natija);
}

// POST — { telefon, ism?, rol }
export async function POST(request: Request) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const body = await request.json().catch(() => ({}));
  const telefon = telefonniTozala(body.telefon);
  if (!telefon) return javobXato("Telefon raqami noto'g'ri. Masalan: 90 123 45 67");
  if (!ROLLAR.includes(body.rol)) return javobXato("Rolni tanlang");
  if (egami(telefon)) return javobXato("Bu raqam — ega, u doim admin");
  const ism = typeof body.ism === "string" && body.ism.trim() ? body.ism.trim().slice(0, 60) : null;
  const x = await prisma.admin.upsert({
    where: { telefon },
    update: { rol: body.rol, faol: true, ...(ism ? { ism } : {}) },
    create: { telefon, rol: body.rol, ism },
  });
  return Response.json(x, { status: 201 });
}
