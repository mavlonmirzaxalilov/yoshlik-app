import { prisma } from "@/lib/prisma";
import { javobXato, talabQil } from "@/lib/auth";
import { taomMaydonlari } from "@/lib/taomTekshir";

// POST /api/admin/taomlar — { nom, narx, hajm?, tavsif?, kategoriyaId }
export async function POST(request: Request) {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  const body = await request.json().catch(() => ({}));
  const d = taomMaydonlari(body, true);
  if (typeof d === "string") return javobXato(d);
  const oxirgi = await prisma.taom.aggregate({ where: { kategoriyaId: d.kategoriyaId }, _max: { tartib: true } });
  const taom = await prisma.taom.create({
    // toliq=true: nom, narx, kategoriyaId tekshirilgan
    data: {
      nom: d.nom!,
      narx: d.narx!,
      hajm: d.hajm ?? null,
      tavsif: d.tavsif ?? null,
      kategoriyaId: d.kategoriyaId!,
      tartib: (oxirgi._max.tartib ?? -1) + 1,
    },
    include: { kategoriya: { select: { id: true, nom: true, belgi: true } } },
  });
  return Response.json(taom, { status: 201 });
}
