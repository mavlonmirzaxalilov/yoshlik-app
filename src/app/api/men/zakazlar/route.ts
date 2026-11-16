import { muddatiOtganlarniYop } from "@/lib/muddat";
import { prisma } from "@/lib/prisma";
import { talabQil } from "@/lib/auth";

// GET /api/men/zakazlar — faqat o'z zakazlari, yangilari birinchi
export async function GET() {
  const t = await talabQil();
  if (t.xato) return t.xato;
  await muddatiOtganlarniYop(); // 15 daqiqalik to'lov muddati (cron zaxirasi bilan)
  const zakazlar = await prisma.zakaz.findMany({
    where: { mijozId: t.f.mijoz.id },
    include: {
      qatorlar: { orderBy: { id: "asc" } },
      tolovlar: { select: { id: true, holat: true }, orderBy: { id: "asc" } },
    },
    orderBy: { yaratilgan: "desc" },
  });
  return Response.json(zakazlar);
}
