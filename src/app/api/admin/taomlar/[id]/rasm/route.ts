import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { rasmniOchir, rasmTekshir, rasmYoqilganmi, rasmYukla } from "@/lib/rasm";

type P = { params: Promise<{ id: string }> };

// POST multipart/form-data { rasm: File } — rasm yuklash yoki almashtirish
export async function POST(request: Request, { params }: P) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  if (!rasmYoqilganmi()) return javobXato("Rasm yuklash faqat production'da ishlaydi (Vercel Blob)", 503);
  const id = Number((await params).id);
  const taom = await prisma.taom.findUnique({ where: { id } });
  if (!taom) return javobXato("Taom topilmadi", 404);

  const forma = await request.formData().catch(() => null);
  const fayl = forma?.get("rasm");
  if (!(fayl instanceof File)) return javobXato("Rasm tanlanmagan");
  const xato = rasmTekshir(fayl);
  if (xato) return javobXato(xato);

  const url = await rasmYukla(id, fayl);
  await prisma.taom.update({ where: { id }, data: { rasm: url } });
  if (taom.rasm) await rasmniOchir(taom.rasm);
  return Response.json({ rasm: url });
}

// DELETE — rasmni olib tashlash (menyuda yana kategoriya belgisi chiqadi)
export async function DELETE(_r: Request, { params }: P) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const id = Number((await params).id);
  const taom = await prisma.taom.findUnique({ where: { id } });
  if (!taom) return javobXato("Taom topilmadi", 404);
  await prisma.taom.update({ where: { id }, data: { rasm: null } });
  if (taom.rasm) await rasmniOchir(taom.rasm);
  return Response.json({ ok: true });
}
