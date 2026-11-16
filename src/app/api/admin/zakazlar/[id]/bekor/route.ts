import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { pulniQaytar } from "@/lib/tolov";
import { holatXabari } from "@/lib/xabar";

// POST /api/admin/zakazlar/[id]/bekor — { sabab } — admin/kassir yakunlanmagan zakazni bekor qiladi
// (shikoyat, taom tugagan va h.k.). To'langan bo'lsa pul qaytariladi, promokod qaytariladi, mijozga xabar.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const t = await talabQil(["ADMIN", "KASSIR"]);
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  const body = await request.json().catch(() => ({}));
  const sabab = typeof body.sabab === "string" ? body.sabab.trim().slice(0, 200) : "";
  if (sabab.length < 3) return javobXato("Bekor qilish sababini yozing");

  const zakaz = await prisma.zakaz.findUnique({ where: { id }, include: { tolovlar: true } });
  if (!zakaz) return javobXato("Zakaz topilmadi", 404);
  if (zakaz.holat === "BERILDI" || zakaz.holat === "BEKOR") return javobXato("Bu zakaz allaqachon yakunlangan");

  const tolangan = zakaz.tolovlar.filter((x) => x.holat === "TOLANDI");
  const ok = await prisma.$transaction(async (tx) => {
    const { count } = await tx.zakaz.updateMany({
      where: { id, holat: zakaz.holat },
      data: { holat: "BEKOR", bekorSababi: sabab },
    });
    if (!count) return false;
    await tx.tolov.updateMany({ where: { zakazId: id, holat: "TOLANDI" }, data: { holat: "QAYTARILDI" } });
    await tx.tolov.updateMany({ where: { zakazId: id, holat: "KUTILMOQDA" }, data: { holat: "BEKOR" } });
    if (zakaz.promokodId) {
      await tx.promokod.update({ where: { id: zakaz.promokodId }, data: { ishlatildi: { decrement: 1 } } });
    }
    return true;
  });
  if (!ok) return javobXato("Zakaz holati o'zgargan — sahifani yangilang", 409);

  for (const tolov of tolangan) await pulniQaytar(tolov.id);
  await holatXabari(id, `Sabab: ${sabab}${tolangan.length ? "\nPul kartangizga qaytariladi." : ""}`);
  return Response.json({ ok: true, qaytarildi: tolangan.length > 0 });
}
