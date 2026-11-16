import { KIRISH_ID, kirishHolati } from "@/lib/botKirish";

// POST /api/auth/bot-kirish/holat — { id, sir }. Botda tasdiqlangan bo'lsa sessiya cookie'si qo'yiladi.
export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const id = typeof body?.id === "string" ? body.id : "";
  const sir = typeof body?.sir === "string" ? body.sir : "";
  if (!KIRISH_ID.test(id) || !sir) return Response.json({ xato: "So'rov noto'g'ri" }, { status: 400 });
  const holat = await kirishHolati(id, sir);
  if (!holat) return Response.json({ xato: "So'rov topilmadi" }, { status: 404 });
  return Response.json(holat);
}
