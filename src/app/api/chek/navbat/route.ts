import { chekNavbati, kalitTekshir } from "@/lib/chek";

// GET /api/chek/navbat?kenglik=48 — kassa kompyuteridagi chek dasturi uchun (Authorization: Bearer <kalit>).
export async function GET(request: Request) {
  if (!(await kalitTekshir(request))) return Response.json({ xato: "Kalit noto'g'ri" }, { status: 401 });
  const k = Number(new URL(request.url).searchParams.get("kenglik"));
  const kenglik = Number.isInteger(k) && k >= 24 && k <= 64 ? k : 48;
  return Response.json(await chekNavbati(kenglik));
}
