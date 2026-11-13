# SPRINT 4 — chuqurlik

**Maqsad:** Holatlar zanjiri, to'lov, yetkazish narxi va bekor qilish qoidalari haqiqiy hayotdagidek ishlasin.

**Savol:** Haqiqiy hayotda chidaydimi?

## Tasklar

- [x] Holatlar zanjiri: to'landi → tayyorlanmoqda → tayyor → yo'lda → yetkazildi/berildi + bekor qilindi; "yo'lda" faqat yetkazishda; noto'g'ri o'tish API'da rad etiladi
- [ ] Onlayn to'lov integratsiyasi: to'lov o'tgach zakaz avtomatik "to'landi" bo'ladi *(test provayder bilan ishlaydi; Click/Payme ulanishi merchant kalitlari kelganda — DECISIONS.md)*
- [x] Kassa to'lovi va kuryerga naqd varianti (yetkazishda) — to'lov usuli zakazda saqlanadi *(kassa to'lovi olib tashlandi: zal va olib ketish faqat onlayn)*
- [x] Yetkazish narxi: lokatsiyadan km hisoblanadi (bazaviy + har km), maksimal radiusdan uzoq va minimal summadan kam zakaz rad etiladi
- [x] Bekor qilish: mijoz "tayyorlanmoqda"gacha bekor qiladi, onlayn to'lov avtomatik qaytariladi
- [x] Promokod: savatchada kod kiritiladi, chegirma jami summaga qo'llanadi, noto'g'ri kodda xabar
- [x] Chegaraviy holatlar: bo'sh savatcha, "tugadi" taom savatchada, ruxsatsiz holat o'zgartirish

## Qabul mezoni

- Onlayn to'lagan zakaz darhol "to'landi" holatida ko'rinadi
- Radiusdan tashqaridagi manzil kiritilsa, "Bu manzilga yetkazib bo'lmaydi" xabari chiqadi
- Yetkazish narxi masofaga qarab o'zgaradi va jami summaga qo'shiladi
- "Tayyorlanmoqda" holatidagi zakazda "Bekor qilish" tugmasi yo'q
- Bekor qilingan onlayn zakazning to'lovi "qaytarildi" deb belgilanadi

Ochiq savollar bu sprintdan oldin hal qilinadi: kassa to'lovi zakazi qachon tayyorlanadi, yetkazish raqamlari, promokod qoidalari, to'lov tizimi tanlovi.

## Hisobot

<!-- hisobotchi to'ldiradi -->
- 2026-11-13: holatlar zanjiri, test to'lov, km bo'yicha yetkazish (geolokatsiya, saqlangan manzil — S3 ochiq mezoni yopildi), bekor qilish va qaytarish, foizli promokod; brauzer va API orqali tekshirildi (src/lib/holatlar.ts, src/lib/tolov.ts, src/lib/yetkazish.ts, src/components/Savatcha.tsx)

## Handoff

Ochiq: Click/Payme haqiqiy ulanishi (merchant kalitlari kerak); tarif va kafe koordinatasi hozir test qiymatlar (.env).
Admin sahifasidagi "→ keyingi holat" tugmalari ko'zda ko'rilmadi (panel yashirin edi) — API'si sinalgan.
Keyingi: S5 — bot + Mini App, Telegram lokatsiyasi, holat xabarlari, to'lanmagan zakazlarni muddatidan keyin yopish.

---

*Yoshlik · vibecoding plugin bilan yaratilgan · vibecoding.uz*
