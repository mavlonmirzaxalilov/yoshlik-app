import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { BEKOR_MUMKIN, type ZakazHolati } from "@/lib/holatlar";
import { pulniQaytar } from "@/lib/tolov";

// POST /api/zakazlar/[id]/bekor — mijoz "tayyorlanmoqda"gacha bekor qila oladi.
// Onlayn to'langan bo'lsa pul qaytariladi; promokod ishlatilishi qaytariladi.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = await talabQil();
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return javobXato("Zakaz raqami noto'g'ri");

  const zakaz = await prisma.zakaz.findUnique({ where: { id }, include: { tolovlar: true } });
  if (!zakaz || zakaz.mijozId !== t.f.mijoz.id) return javobXato("Zakaz topilmadi", 404);
  if (!BEKOR_MUMKIN.includes(zakaz.holat as ZakazHolati)) {
    return javobXato("Zakaz tayyorlanmoqda — endi bekor qilib bo'lmaydi");
  }

  const tolangan = zakaz.tolovlar.filter((x) => x.holat === "TOLANDI");

  // Avval holat sharti bilan bekor qilinadi (shu orada admin "tayyorlanmoqda" qilgan bo'lsa, bekor bo'lmaydi),
  // pul faqat shundan keyin qaytariladi.
  const natija = await prisma.$transaction(async (tx) => {
    const { count } = await tx.zakaz.updateMany({
      where: { id, holat: { in: BEKOR_MUMKIN } },
      data: { holat: "BEKOR" },
    });
    if (!count) return false;
    await tx.tolov.updateMany({ where: { zakazId: id, holat: "TOLANDI" }, data: { holat: "QAYTARILDI" } });
    await tx.tolov.updateMany({ where: { zakazId: id, holat: "KUTILMOQDA" }, data: { holat: "BEKOR" } });
    if (zakaz.promokodId) {
      await tx.promokod.update({ where: { id: zakaz.promokodId }, data: { ishlatildi: { decrement: 1 } } });
    }
    return true;
  });
  if (!natija) return javobXato("Zakaz tayyorlanmoqda — endi bekor qilib bo'lmaydi");
  // Click/Payme ulanganda: qaytarish xato bersa admin qo'lda qaytaradi (PRD: nizo — admin)
  for (const tolov of tolangan) await pulniQaytar(tolov.id);
  return Response.json({ ok: true, qaytarildi: tolangan.length > 0 });
}
