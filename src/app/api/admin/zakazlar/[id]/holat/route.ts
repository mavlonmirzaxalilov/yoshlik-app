import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { HOLAT_NOMLARI, keyingiHolat, type ZakazHolati } from "@/lib/holatlar";

// PATCH /api/admin/zakazlar/[id]/holat — { holat } — zakazni faqat keyingi holatga o'tkazish
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  const body = await request.json().catch(() => ({}));

  const zakaz = await prisma.zakaz.findUnique({ where: { id } });
  if (!zakaz) return javobXato("Zakaz topilmadi", 404);
  const kutilgan = keyingiHolat(zakaz.holat as ZakazHolati, zakaz.olishUsuli);
  if (!kutilgan || body.holat !== kutilgan) {
    return javobXato(
      kutilgan ? `Bu zakaz faqat "${HOLAT_NOMLARI[kutilgan]}" holatiga o'tishi mumkin` : "Bu zakaz holatini o'zgartirib bo'lmaydi",
    );
  }

  // Shartli yangilash: shu orada mijoz bekor qilgan bo'lsa o'tish bajarilmaydi
  const { count } = await prisma.zakaz.updateMany({ where: { id, holat: zakaz.holat }, data: { holat: kutilgan } });
  if (!count) return javobXato("Zakaz holati o'zgargan — sahifani yangilang", 409);
  return Response.json({ id, holat: kutilgan });
}
