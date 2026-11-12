# QOVURDOQ XULOSASI

**Sana:** 2026-11-12

**G'oya:** Talabalar va ofis xodimlari uchun kassadagi navbat va kafening yangi mijozlarga yetib bormasligi muammosini hal qiladigan Telegram-bot: mijoz menyudan tanlab, savatchaga solib, onlayn to'laydi va ovqatni zalda yeydi, olib ketadi yoki yetkazib berishni so'raydi; kafe zakazlarni admin panelda qabul qiladi va boshqaradi. (O'z-o'ziga xizmat ko'rsatadigan umumiy ovqatlanish shahobchasi, stol band qilish yo'q.)

## 1. Mahsulot mohiyati
- Yurak amal: **zakaz berish**.
- Muvaffaqiyat o'lchovi: kunlik bot zakazlari soni; 3 oyda maqsad — **kuniga 100+ zakaz**.
- Hozir: zakazlar faqat kassada qabul qilinadi (telefon, yetkazish yo'q).
- Birinchi foydalanuvchilar: talabalarning Telegram guruhlari.
- Olish usullari: zalda yeyish, olib ketish, yetkazib berish — uchalasi V1'da.

## 2. Foydalanuvchilar va rollar
- Rollar: **mijoz + admin** (admin — bitta odam).
- Mijoz: Telegram orqali kiradi, telefonni "raqamni ulashish" tugmasi bilan beradi. Telefon sababi: zakazni aniqlashtirish va mijoz bazasi.
- Admin: Telegram orqali kiradi; zakazlarni boshqaradi, menyu va narxlarni tahrirlaydi, hisobotlarni ko'radi.
- Yetkazishni kafening o'z kuryeri bajaradi — tizimda rol emas, admin unga tashqaridan topshiradi.
- Mijoz profili: ism, telefon, saqlangan manzillar, zakazlar tarixi.

## 3. Asosiy oqim
- Mijoz oqimi: /start -> telefon -> menyu (kategoriyalar) -> savatcha -> olish usuli (zal / olib ketish / yetkazish + manzil) -> to'lov -> holat xabarlari.
- Onlayn to'langan zakaz **avtomatik qabul** qilinadi.
- Holatlar: to'landi -> tayyorlanmoqda -> tayyor -> yo'lda -> yetkazildi/berildi; + bekor qilindi.
- Tayyor bo'lganda bot "Zakaz #N tayyor" deb yozadi, mijoz kassadan raqam bilan oladi.
- Taom tugasa admin uni "tugadi" deb belgilaydi.
- Menyu taomi: kategoriya, nom, narx, rasm, tavsif, hajm.

## 4. Pul va qoidalar
- To'lov: onlayn (bot ichida) yoki kassada; yetkazishda — onlayn yoki kuryerga naqd.
- Yetkazish narxi: km bo'yicha (bazaviy + har km), lokatsiyadan hisoblanadi.
- Yetkazish cheklovlari: maksimal radius va minimal zakaz summasi.
- Bekor qilish: mijoz "tayyorlanmoqda" holatigacha bekor qila oladi; onlayn to'lov avtomatik qaytariladi.
- Promokod V1'ga kiradi.

## 5. Chegaralar va xavflar
- V1'ga kirmaydi: kuryer ilovasi/roli, ko'p filial, reyting va sharhlar.
- Eng katta xavf: mijozlar botni ishlatmaydi, odatga ko'ra kassaga boraveradi.
- Maxfiy ma'lumotlar: telefon, manzil, zakaz tarixi.
- Nizo/shikoyat: admin qo'lda hal qiladi.
- Zaxira: bot yoki to'lov ishlamasa, kassa odatdagidek ishlayveradi.

## OCHIQ SAVOLLAR (keyin hal qilamiz)
- Kassada to'lanadigan zakaz qachon tayyorlana boshlaydi ("to'lov kutilmoqda" holati kerakmi)? — to'lov va holatlar sprintida.
- Yetkazish tariflari raqamlari: bazaviy narx, km narxi, maksimal radius, minimal summa — yetkazish sprintidan oldin.
- Promokod qoidalari (foiz/summa, muddat, bir martalikmi) — promokod sprintida.
- Onlayn to'lov tizimi tanlovi va kafe bilan shartnoma (yuridik shaxs talablari) — to'lov sprintidan oldin.
- Kuniga 100+ zakazni bitta admin va bitta kuryer ko'tara oladimi — ishga tushirishdan oldin.
- Hisobot tarkibi (qaysi ko'rsatkichlar) — admin panel sprintida.
