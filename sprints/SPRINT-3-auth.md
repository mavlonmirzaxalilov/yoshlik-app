# SPRINT 3 — auth

**Maqsad:** Mijoz telefon orqali kirsin va faqat o'z zakazlarini ko'rsin; admin sahifalari himoyalansin.

**Savol:** Kim kirdi?

## Tasklar

- [x] Telefon + bir martalik kod (OTP) bilan kirish: `POST /api/auth/kod`, `POST /api/auth/tekshir`
- [x] Sessiya saqlanadi — sahifa yangilansa ham mijoz tizimda qoladi
- [x] Zakaz kirgan mijozga bog'lanadi; "Mening zakazlarim" sahifasida faqat o'z zakazlari tarixi
- [x] Profil: ism, telefon va saqlangan manzillar (qo'shish/o'chirish)
- [x] Rollar: mijoz va admin; `/admin/...` sahifalari va admin API yo'llari faqat admin uchun
- [x] Ruxsatsiz kirishga urinish — kirish sahifasiga yo'naltirish

## Qabul mezoni

- Telefon kiritib, kod bilan kiraman va ismim ko'rinadi
- Ikki xil mijoz bilan kirsam, har biri faqat o'z zakazlarini ko'radi
- Mijoz akkaunti bilan `/admin` ochilmaydi
- Saqlangan manzil keyingi zakazda tanlash uchun chiqadi

S5'da kirish Telegram "raqamni ulashish"ga o'tadi (DECISIONS.md).

## Hisobot

<!-- hisobotchi to'ldiradi -->
- 2026-11-13: telefon + OTP (test rejimi, kod logda), rozilik katagi, sessiya cookie, Zakazlarim, profil va manzillar, admin himoyasi va bugungi zakazlar; brauzerda tekshirildi (src/lib/auth.ts, src/proxy.ts, src/app/api/auth/, src/app/kirish/, src/app/admin/)

## Handoff

Ochiq: 4-qabul mezoni — saqlangan manzil zakazda tanlanmaydi (savatchada yetkazish manzili maydoni yo'q); S4'da yetkazish narxi bilan birga qilinadi.
Haqiqiy 2 ta admin raqami `.env` ADMIN_TELEFONLAR'ga yozilib, `npm run db:seed` ishga tushirilishi kerak.
Keyingi: S4 — holatlar zanjiri, Click/Payme, yetkazish narxi; avval PRD 9-bo'limidagi S4 savollari hal qilinsin.

---

*Yoshlik · vibecoding plugin bilan yaratilgan · vibecoding.uz*
