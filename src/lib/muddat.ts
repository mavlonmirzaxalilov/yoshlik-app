import { prisma } from "@/lib/prisma";
import { holatXabari } from "@/lib/xabar";

// To'lanmagan onlayn zakaz 15 daqiqadan keyin avtomatik bekor (DECISIONS.md).
// Vercel Hobby'da cron kuniga bir marta ishlaydi, shuning uchun bu funksiya
// zakaz ro'yxatlari va zakaz ochilganda ham chaqiriladi; cron — zaxira.
export const TOLOV_MUDDATI_DAQIQA = 15;

export async function muddatiOtganlarniYop(): Promise<number> {
  const chegara = new Date(Date.now() - TOLOV_MUDDATI_DAQIQA * 60_000);
  const eskilar = await prisma.zakaz.findMany({
    where: { holat: "TOLOV_KUTILMOQDA", yaratilgan: { lt: chegara } },
    select: { id: true, promokodId: true },
  });

  let yopildi = 0;
  for (const z of eskilar) {
    const ok = await prisma.$transaction(async (tx) => {
      // Shartli: shu orada to'lov o'tgan bo'lsa tegmaymiz
      const { count } = await tx.zakaz.updateMany({
        where: { id: z.id, holat: "TOLOV_KUTILMOQDA" },
        data: { holat: "BEKOR" },
      });
      if (!count) return false;
      await tx.tolov.updateMany({ where: { zakazId: z.id, holat: "KUTILMOQDA" }, data: { holat: "BEKOR" } });
      if (z.promokodId) {
        await tx.promokod.update({ where: { id: z.promokodId }, data: { ishlatildi: { decrement: 1 } } });
      }
      return true;
    });
    if (ok) {
      yopildi++;
      await holatXabari(z.id, `To'lov ${TOLOV_MUDDATI_DAQIQA} daqiqa ichida o'tmadi.`);
    }
  }
  return yopildi;
}
