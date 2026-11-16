import { chekChiqdi, kalitTekshir } from "@/lib/chek";

// POST /api/chek/[id] — { tur: "oshxona" | "kassa" }: chek chop etildi.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await kalitTekshir(request))) return Response.json({ xato: "Kalit noto'g'ri" }, { status: 401 });
  const id = Number((await params).id);
  const body = await request.json().catch(() => ({}));
  if (!Number.isInteger(id) || (body.tur !== "oshxona" && body.tur !== "kassa")) {
    return Response.json({ xato: "So'rov noto'g'ri" }, { status: 400 });
  }
  return Response.json({ ok: await chekChiqdi(id, body.tur) });
}
