# SPRINT 3 — auth

**Maqsad:** Mijoz telefon orqali kirsin va faqat o'z zakazlarini ko'rsin; admin sahifalari himoyalansin.

**Savol:** Kim kirdi?

## Tasklar

- [ ] Telefon + bir martalik kod (OTP) bilan kirish: `POST /api/auth/kod`, `POST /api/auth/tekshir`
- [ ] Sessiya saqlanadi — sahifa yangilansa ham mijoz tizimda qoladi
- [ ] Zakaz kirgan mijozga bog'lanadi; "Mening zakazlarim" sahifasida faqat o'z zakazlari tarixi
- [ ] Profil: ism, telefon va saqlangan manzillar (qo'shish/o'chirish)
- [ ] Rollar: mijoz va admin; `/admin/...` sahifalari va admin API yo'llari faqat admin uchun
- [ ] Ruxsatsiz kirishga urinish — kirish sahifasiga yo'naltirish

## Qabul mezoni

- Telefon kiritib, kod bilan kiraman va ismim ko'rinadi
- Ikki xil mijoz bilan kirsam, har biri faqat o'z zakazlarini ko'radi
- Mijoz akkaunti bilan `/admin` ochilmaydi
- Saqlangan manzil keyingi zakazda tanlash uchun chiqadi

S5'da kirish Telegram "raqamni ulashish"ga o'tadi (DECISIONS.md).

## Hisobot

<!-- hisobotchi to'ldiradi -->

## Handoff

<!-- hisobotchi to'ldiradi -->

---

*Yoshlik · vibecoding plugin bilan yaratilgan · vibecoding.uz*
