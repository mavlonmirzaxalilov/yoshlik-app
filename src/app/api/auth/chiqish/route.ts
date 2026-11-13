import { chiqish } from "@/lib/auth";

// POST /api/auth/chiqish — sessiyani yopish
export async function POST() {
  await chiqish();
  return Response.json({ ok: true });
}
