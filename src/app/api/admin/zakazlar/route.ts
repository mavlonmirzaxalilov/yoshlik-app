import { bugunBoshiToshkent } from "@/lib/vaqt";
import { muddatiOtganlarniYop } from "@/lib/muddat";
import { prisma } from "@/lib/prisma";
import { talabQil } from "@/lib/auth";

// GET /api/admin/zakazlar — bugungi zakazlar (faqat admin). To'liq panel S6'da.
export async function GET() {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  await muddatiOtganlarniYop(); // 15 daqiqalik to'lov muddati (cron zaxirasi bilan)
  const bugun = bugunBoshiToshkent(); // server UTC bo'lsa ham Toshkent kuni
  const zakazlar = await prisma.zakaz.findMany({
    where: { yaratilgan: { gte: bugun } },
    include: {
      qatorlar: { orderBy: { id: "asc" } },
      mijoz: { select: { ism: true, telefon: true } },
    },
    orderBy: { yaratilgan: "desc" },
  });
  return Response.json(zakazlar);
}
