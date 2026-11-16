import { talabQil } from "@/lib/auth";
import { chekHolati } from "@/lib/chek";

// GET /api/admin/chek — chek dasturi holati: kalit yaratilganmi, dastur oxirgi marta qachon so'radi.
export async function GET() {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  return Response.json(await chekHolati());
}
