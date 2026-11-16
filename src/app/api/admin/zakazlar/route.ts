import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { talabQil, XODIMLAR } from "@/lib/auth";
import { muddatiOtganlarniYop } from "@/lib/muddat";
import { kunOraligi } from "@/lib/vaqt";

// GET /api/admin/zakazlar?sana=YYYY-MM-DD&holat=&usul=&manba=&q= — zakazlar oqimi (barcha xodimlar)
export async function GET(request: Request) {
  const t = await talabQil(XODIMLAR);
  if (t.xato) return t.xato;
  await muddatiOtganlarniYop(); // 15 daqiqalik to'lov muddati (cron zaxirasi bilan)

  const p = new URL(request.url).searchParams;
  const { dan, gacha } = kunOraligi(p.get("sana"));
  const where: Prisma.ZakazWhereInput = { yaratilgan: { gte: dan, lt: gacha } };
  const holat = p.get("holat");
  if (holat) where.holat = holat as Prisma.ZakazWhereInput["holat"];
  const usul = p.get("usul");
  if (usul) where.olishUsuli = usul as Prisma.ZakazWhereInput["olishUsuli"];
  const manba = p.get("manba");
  if (manba) where.manba = manba as Prisma.ZakazWhereInput["manba"];
  const q = p.get("q")?.trim();
  if (q) {
    const raqam = Number(q.replace(/^#/, ""));
    const raqamlar = q.replace(/\D/g, "");
    where.OR = [
      ...(Number.isInteger(raqam) && raqam > 0 ? [{ raqam }] : []),
      ...(raqamlar.length >= 4 ? [{ mijoz: { telefon: { contains: raqamlar } } }] : []),
      { mijoz: { ism: { contains: q, mode: "insensitive" as const } } },
    ];
  }

  const zakazlar = await prisma.zakaz.findMany({
    where,
    include: {
      qatorlar: { orderBy: { id: "asc" } },
      mijoz: { select: { ism: true, telefon: true } },
      xodim: { select: { ism: true } },
      tolovlar: { select: { id: true, holat: true } },
    },
    orderBy: { yaratilgan: "desc" },
    take: 300,
  });
  return Response.json(zakazlar);
}
