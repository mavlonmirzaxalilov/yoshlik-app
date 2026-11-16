# SPRINT 5 — telegram

**Maqsad:** Mijoz butun zakaz oqimini Telegram bot ichida o'tsin va holat xabarlarini botdan olsin.

**Savol:** Qo'lda turadimi?

## Tasklar

- [x] Bot: /start bosilganda "Menyuni ochish" tugmasi bilan Telegram Mini App ochiladi *(tartib: avval "Raqamni ulashish", keyin "Xush kelibsiz!" + "Taom buyurtma qilish")*
- [x] Telegram akkaunt bilan bog'lanish: "Raqamni ulashish" tugmasi orqali telefon olinadi va mijoz yaratiladi
- [x] Mini App ichida menyu, savatcha, olish usuli va to'lov ishlaydi (mavjud API orqali)
- [x] Holat xabarlari: har holat o'zgarishida botga xabar; tayyor bo'lganda "Zakaz #N tayyor"
- [ ] Yetkazish manzili Telegram lokatsiyasi orqali yuborilishi mumkin *(kod tayyor — Telegram LocationManager, bo'lmasa geolokatsiya; Telegram ichida hali sinalmagan)*
- [x] Fon vazifasi: to'lanmay qolgan onlayn zakazlar muddatdan keyin avtomatik yopiladi

## Qabul mezoni

- Telefonimda botga /start bosib, raqamni ulashib, Mini App'da zakaz beraman
- Admin holatni "tayyor" qilganda botga "Zakaz #N tayyor" xabari keladi
- Lokatsiya yuborilganda yetkazish narxi avtomatik hisoblanadi

## Hisobot

<!-- hisobotchi to'ldiradi -->
- 2026-11-16: @yoshlik_kafe_bot (raqam → xush kelibsiz → Mini App), initData header orqali kirish, holat xabarlari, 15 daqiqa qoidasi; Vercel + Neon'da ishga tushdi, Telegram'da foydalanuvchi tasdiqladi (src/lib/botOqimi.ts, src/lib/telegram.ts, src/lib/xabar.ts, src/lib/muddat.ts)

## Handoff

Ochiq: Telegram ichida lokatsiya bilan yetkazish narxi sinalmagan; Click/Payme yo'q — bot mijozlarga e'lon qilinmasin; tarif va kafe koordinatasi test qiymatlarda.
Production: https://yoshlik-app.vercel.app, `main`ga push = avtomatik deploy; admin raqamlari Vercel'dagi ADMIN_TELEFONLAR'dan o'qiladi.
Keyingi: S6 — admin panel (zakazlar oqimi, menyu boshqaruvi, "tugadi", rasm yuklash, hisobot).

---

*Yoshlik · vibecoding plugin bilan yaratilgan · vibecoding.uz*
