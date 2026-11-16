import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { CHEK_MUDDATI_MS } from "@/lib/chek";

// POST /api/admin/zakazlar/[id]/chek — { tur: "oshxona" | "kassa" | "ikkalasi" }: chekni qayta chiqarish.
// Dastur keyingi so'rovida (3 soniya ichida) yana chop etadi.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = await talabQil(["ADMIN", "KASSIR"]);
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  const { tur } = await request.json().catch(() => ({}));
  if (!Number.isInteger(id) || !["oshxona", "kassa", "ikkalasi"].includes(tur)) return javobXato("So'rov noto'g'ri");
  const zakaz = await prisma.zakaz.findUnique({ where: { id }, select: { manba: true, holat: true, yaratilgan: true } });
  if (!zakaz) return javobXato("Zakaz topilmadi", 404);
  if (Date.now() - zakaz.yaratilgan.getTime() > CHEK_MUDDATI_MS) {
    return javobXato("Chek faqat oxirgi 24 soatdagi zakazlarga qayta chiqadi");
  }
  if (zakaz.manba !== "ONLAYN") return javobXato("Chek faqat bot zakazlariga chiqadi");
  if (zakaz.holat === "TOLOV_KUTILMOQDA" || zakaz.holat === "BEKOR") return javobXato("Bu zakazga chek chiqmaydi");
  await prisma.zakaz.update({
    where: { id },
    data: {
      ...(tur !== "kassa" && { oshxonaChek: null }),
      ...(tur !== "oshxona" && { kassaChek: null }),
    },
  });
  return Response.json({ ok: true });
}
