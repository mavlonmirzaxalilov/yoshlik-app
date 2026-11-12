# SPRINT 1 — kesim

**Maqsad:** Zakaz berishni boshidan oxirigacha bitta vertikal kesimda ishlatib ko'rish — menyu ekrani → savatcha → zakaz bazaga yoziladi → tasdiq.

**Savol:** Ishlaydimi?

## Tasklar

- [x] Taomlar jadvali (minimal: nom, narx) va 4 ta seed taom — lokal PostgreSQL, Prisma
- [x] Menyu sahifasi: `GET /api/taomlar` dan 4 ta taom ro'yxati chiqadi
- [x] Taom kartasi va "Savatchaga qo'shish" tugmasi — savatcha brauzer holatida, soni va jami summa ko'rinadi
- [x] Olish usuli tanlovi: zalda / olib ketish / yetkazish (tekshiruvsiz)
- [x] Olish vaqti tanlovi (zal va olib ketishda), tekshiruvsiz
- [x] Zakaz yaratish API yo'li: `POST /api/zakazlar` — taomlar, soni, olish usuli va vaqtini bazaga yozadi
- [x] Tasdiq ekrani: "Zakaz #N qabul qilindi", olish vaqti va zakaz tarkibi

## Qabul mezoni

- Menyu sahifasida 4 ta taom nom va narxi bilan ko'rinadi
- 2 ta taomni savatchaga qo'shsam, jami summa to'g'ri hisoblanadi
- Olib ketishni va 11:20 ni tanlab "Zakaz berish" bossam, tasdiq ekranida zakaz raqami va 11:20 chiqadi
- Zakaz bazada ko'rinadi (Prisma Studio)

Bu sprintda YO'Q: ro'yxatdan o'tish va rollar · to'lov · holatlar zanjiri · rasm yuklash · to'liq model · dizayn nafisligi.

## Hisobot

<!-- hisobotchi to'ldiradi -->
- 2026-11-12: S1 kesimi tayyor — menyu, savatcha, olish usuli va vaqti, zakaz API va tasdiq ekrani; qabul mezoni brauzerda tekshirildi (src/app/page.tsx, src/components/Savatcha.tsx, src/app/api/zakazlar/route.ts, prisma/schema.prisma)

## Handoff

Keyingi: S2 — to'liq model migratsiyasi; zakaz tarkibi JSON'dan Zakaz qatorlari jadvaliga ko'chiriladi.
Ishga tushirish: `npm run db:up`, `npm run db:migrate`, `npm run db:seed`, `npm run dev`.

---

*Yoshlik · vibecoding plugin bilan yaratilgan · vibecoding.uz*
