import { muddatiOtganlarniYop } from "@/lib/muddat";

// GET /api/cron/muddat — Vercel Cron (zaxira). Vercel CRON_SECRET'ni Authorization header'da yuboradi.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("ruxsat yo'q", { status: 401 });
  }
  return Response.json({ yopildi: await muddatiOtganlarniYop() });
}
