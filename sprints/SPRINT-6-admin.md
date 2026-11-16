# SPRINT 6 — admin

**Maqsad:** Kafe admini zakazlar, menyu va hisobotni kod yozmasdan boshqara olsin.

**Savol:** Boshqarib bo'ladimi?

## Tasklar

- [ ] Admin Telegram akkaunti orqali panelga kiradi (faqat Adminlar jadvalidagi akkaunt) *(Mini App ichida ishlaydi; kompyuterdagi Telegram Login — BotFather /setdomain dan keyin sinaladi)*
- [x] Zakazlar oqimi: yangi zakazlar ro'yxati, holat va olish usuli bo'yicha filtr, raqam/telefon bo'yicha qidiruv
- [x] Zakaz holatini bir bosishda keyingisiga o'tkazish; shikoyat uchun qo'lda bekor qilish
- [x] Menyu boshqaruvi: kategoriya va taom qo'shish/tahrirlash (nom, narx, rasm, tavsif, hajm)
- [ ] Taom rasmini yuklash va saqlash (S2'dan ko'chirilgan) — menyu kartasida belgi o'rniga rasm ko'rinadi *(Vercel Blob ulangan; production'da sinalmagan)*
- [x] "Tugadi" tugmasi — taom menyuda "mavjud emas" bo'ladi va savatchaga qo'shilmaydi
- [x] Hisobot: kunlik zakazlar soni va savdo summasi, olish usullari bo'yicha
- [x] Promokod yaratish va o'chirish
- [x] Kassa: kassir zakaz kiritadi, naqd/karta, qaytim (2026-11-16 qo'shildi)
- [x] Harajatlar: turkumlar bilan, hisobotda foyda (2026-11-16 qo'shildi)
- [x] Xodimlar: Admin, Kassir, Oshpaz rollari (2026-11-16 qo'shildi)
- [x] Sozlamalar: kafe aloqasi, koordinata, yetkazish tarifi (2026-11-16 qo'shildi)

## Qabul mezoni

- Admin panelida yangi zakaz paydo bo'ladi va holatini "tayyorlanmoqda"ga o'tkaza olaman
- Taom narxini o'zgartirsam, botdagi menyuda yangi narx ko'rinadi
- "Tugadi" qilingan taomni mijoz savatchaga qo'sha olmaydi
- Hisobot sahifasida bugungi zakazlar soni va summasi ko'rinadi

## Hisobot

<!-- hisobotchi to'ldiradi -->
- 2026-11-16: POS uslubidagi admin panel — Kassa, Zakazlar doskasi, Menyu (Blob rasm), Hisobotlar, Harajatlar, Xodimlar (rollar), Promokodlar, Sozlamalar; Telegram Login; lokal sinovdan o'tdi (src/app/admin, src/components/admin, src/app/api/admin, src/lib/auth.ts)
- 2026-11-16: kompyuterda kirish — raqam ulashilmagan bo'lsa botga havola (/start admin) va avtomatik qayta tekshirish, "Siz admin emassiz" (src/components/admin/TelegramKirish.tsx, src/lib/botOqimi.ts)

## Handoff

Ochiq: BotFather /setdomain → kompyuterda Telegram Login sinovi; production'da rasm yuklash sinovi; eski yoshlik-admin repo arxivlanishi (foydalanuvchi qaroriga ko'ra).
Production'da xodimlar ro'yxati bo'sh — kassir/oshpazlar Xodimlar bo'limidan qo'shiladi; egalar ADMIN_TELEFONLAR'da.
Ishga tushirishdan oldin: Click/Payme, haqiqiy tarif va koordinata (endi Sozlamalar bo'limida), Vercel Pro.

---

*Yoshlik · vibecoding plugin bilan yaratilgan · vibecoding.uz*
