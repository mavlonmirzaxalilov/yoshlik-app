import { talabQil } from "@/lib/auth";
import { yangiKalit } from "@/lib/chek";

// POST /api/admin/chek/kalit — yangi kalit (eskisi ishlamay qoladi). Kalit faqat shu javobda ko'rinadi.
export async function POST() {
  const t = await talabQil(true);
  if (t.xato) return t.xato;
  return Response.json({ kalit: await yangiKalit() });
}
