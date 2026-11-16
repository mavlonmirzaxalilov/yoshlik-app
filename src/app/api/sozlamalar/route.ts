// GET /api/sozlamalar — "Yordam" sahifasi uchun ochiq kafe ma'lumotlari (.env'dan).
export async function GET() {
  return Response.json({
    telefon: process.env.KAFE_TELEFON || null,
    telegram: process.env.KAFE_TELEGRAM || null, // admin username, masalan "yoshlik_admin"
  });
}
