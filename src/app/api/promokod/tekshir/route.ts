import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { promokodTekshir } from "@/lib/promokod";

// POST /api/promokod/tekshir — { kod, summa } — chegirmani oldindan ko'rsatish
export async function POST(request: Request) {
  const t = await talabQil();
  if (t.xato) return t.xato;
  const body = await request.json().catch(() => ({}));
  const summa = Number.isFinite(body.summa) ? Number(body.summa) : 0;
  const n = await promokodTekshir(prisma, body.kod, summa);
  if (!n.ok) return javobXato(n.xato);
  return Response.json({ foiz: n.foiz, chegirma: n.chegirma });
}
