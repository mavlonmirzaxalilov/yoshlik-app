import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { kunBoshi } from "@/lib/vaqt";

// GET — barcha promokodlar; POST — { kod, foiz, muddati?: YYYY-MM-DD, maxIshlatish? }
export async function GET() {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  return Response.json(await prisma.promokod.findMany({ orderBy: { id: "desc" } }));
}

export async function POST(request: Request) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const body = await request.json().catch(() => ({}));
  const kod = typeof body.kod === "string" ? body.kod.trim().toUpperCase() : "";
  if (!/^[A-Z0-9_-]{3,20}$/.test(kod)) return javobXato("Kod 3–20 belgi: lotin harflari va raqamlar");
  const foiz = Number(body.foiz);
  if (!Number.isInteger(foiz) || foiz < 1 || foiz > 90) return javobXato("Foiz 1 dan 90 gacha");
  const max = body.maxIshlatish === "" || body.maxIshlatish == null ? null : Number(body.maxIshlatish);
  if (max !== null && (!Number.isInteger(max) || max < 1)) return javobXato("Ishlatish limiti musbat son");
  // Muddat — tanlangan kunning oxirigacha amal qiladi
  const muddati = body.muddati ? new Date(kunBoshi(body.muddati).getTime() + 86_400_000 - 1) : null;

  if (await prisma.promokod.findUnique({ where: { kod } })) return javobXato("Bunday kod allaqachon bor");
  const p = await prisma.promokod.create({ data: { kod, foiz, muddati, maxIshlatish: max } });
  return Response.json(p, { status: 201 });
}
