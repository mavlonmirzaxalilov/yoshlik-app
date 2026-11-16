// GET /api/sozlamalar — "Yordam" sahifasi uchun ochiq kafe ma'lumotlari (.env'dan).
// Noto'g'ri qiymat sahifani buzmasin: telefon faqat raqamga o'xshasa, username faqat to'g'ri formatda qaytariladi.

const telefonmi = (s: string) => /^\+?[\d\s()-]{9,20}$/.test(s) && s.replace(/\D/g, "").length >= 9;
const usernamemi = (s: string) => /^@?[A-Za-z][A-Za-z0-9_]{4,31}$/.test(s);

export async function GET() {
  const telefon = process.env.KAFE_TELEFON?.trim() ?? "";
  const telegram = process.env.KAFE_TELEGRAM?.trim() ?? "";
  return Response.json({
    telefon: telefonmi(telefon) ? telefon : null,
    // KAFE_TELEGRAM bo'sh, KAFE_TELEFON'da esa username bo'lsa — uni Telegram sifatida ishlatamiz
    telegram: usernamemi(telegram) ? telegram : usernamemi(telefon) ? telefon : null,
  });
}
