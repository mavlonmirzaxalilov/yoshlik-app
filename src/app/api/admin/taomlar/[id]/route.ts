import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { taomMaydonlari } from "@/lib/taomTekshir";
import { rasmniOchir } from "@/lib/rasm";

type P = { params: Promise<{ id: string }> };

// PATCH — tahrirlash yoki "tugadi" kaliti. "Tugadi"ni kassir ham bosa oladi (taom tugaganini kassa ko'radi).
export async function PATCH(request: Request, { params }: P) {
  const body = await request.json().catch(() => ({}));
  const faqatTugadi = Object.keys(body).length === 1 && typeof body.tugadi === "boolean";
  const t = await talabQil(faqatTugadi ? ["ADMIN", "KASSIR"] : true);
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  const d = taomMaydonlari(body, false);
  if (typeof d === "string") return javobXato(d);
  const taom = await prisma.taom
    .update({ where: { id }, data: d, include: { kategoriya: { select: { id: true, nom: true, belgi: true } } } })
    .catch(() => null);
  return taom ? Response.json(taom) : javobXato("Taom topilmadi", 404);
}

// DELETE — eski zakazlarda nom/narx nusxasi qoladi (ZakazQatori.taomId -> null)
export async function DELETE(_r: Request, { params }: P) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  const taom = await prisma.taom.delete({ where: { id } }).catch(() => null);
  if (!taom) return javobXato("Taom topilmadi", 404);
  if (taom.rasm) await rasmniOchir(taom.rasm);
  return Response.json({ ok: true });
}
