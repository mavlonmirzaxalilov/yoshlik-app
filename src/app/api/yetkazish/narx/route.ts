import { yetkazishHisobla } from "@/lib/yetkazish";

// POST /api/yetkazish/narx — { lat, lng, summa } — narxni oldindan ko'rsatish uchun.
// Zakaz yaratilganda server baribir qayta hisoblaydi.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const summa = Number.isFinite(body.summa) ? Number(body.summa) : 0;
  return Response.json(yetkazishHisobla(body.lat, body.lng, summa));
}
