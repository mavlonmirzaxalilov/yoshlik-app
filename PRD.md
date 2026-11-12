# PRD — Yoshlik

**Holat:** yakunlangan (savala natijalari kiritilgan) · 2026-11-12

## 1. G'oya bir jumlada

Talabalar va ofis xodimlari uchun kassadagi navbat va kafening yangi mijozlarga yetib bormasligi muammosini hal qiladigan Telegram-bot: mijoz menyudan tanlab, savatchaga solib, onlayn to'laydi va ovqatni zalda yeydi, olib ketadi yoki yetkazib berishni so'raydi; kafe zakazlarni admin panelda qabul qiladi va boshqaradi.

## 2. Muammo va auditoriya

**Auditoriya:** o'z-o'ziga xizmat ko'rsatadigan umumiy ovqatlanish shahobchasi atrofidagi talabalar va ofis xodimlari. Tanaffus va tushlik soatida bir vaqtda keladi.

**Hozir qanday ishlaydi:** mijoz yo'lak bo'ylab o'tib ovqatini o'zi tanlaydi, oxirida kassada to'laydi va stolga o'tiradi. Zakaz faqat kassada qabul qilinadi; telefon yoki yetkazish kanali yo'q.

**Muammo:**
- **11:20 dagi tushlik cho'qqisi** — yo'lak va kassada tirbandlik, mijoz vaqt yo'qotadi.
- Kafe faqat yonidan o'tganlarga sotadi — uzoqdagi yangi mijozga yetib bormaydi.

**Asosiy maqsad:** 11:20 cho'qqisini botga ko'chirish — mijoz yo'lakni chetlab o'tadi, o'zi tanlagan vaqtda kassadan issiq, yangi tayyorlangan ovqatni oladi.

Stol band qilish kerak emas.

## 3. Yurak amal

> **Zakaz berish.**
> Mijoz menyudan taom tanlab, savatchani to'ldiradi, olish usuli va vaqtini belgilaydi va zakazni yuboradi.

**Muvaffaqiyat o'lchovi:** kunlik bot zakazlari soni. 3 oydagi maqsad — **kuniga 100+ zakaz**.
O'rtacha chek 35-40 ming so'm — maqsadda bot orqali kuniga 3.5-4.0 mln so'm savdo.

## 4. Rollar va huquqlar

| Rol | Ko'radi | Qila oladi |
|-----|---------|------------|
| **Mijoz** | Menyu, savatcha, o'z zakazlari tarixi va holati, o'z profili | Telegram orqali kirish va telefon ulashish, zakaz berish, olish vaqtini tanlash, to'lash, "tayyorlanmoqda"gacha bekor qilish, manzil saqlash, promokod qo'llash |
| **Admin** (2 nafar, teng huquq) | Barcha zakazlar, menyu, mijozlar telefoni va manzili, hisobotlar | Telegram orqali kirish, zakaz holatini o'zgartirish, menyu va narxni tahrirlash, taomni "tugadi" qilish, shikoyatlarni hal qilish |

Oshxona jamoasi (3 oshpaz, 2 yordamchi) va kuryer tizimda rol emas — admin ularga zakazni tashqaridan topshiradi.

## 5. Asosiy oqim

1. Mijoz botda /start bosadi.
2. "Raqamni ulashish" tugmasi bilan telefonini beradi (birinchi marta).
3. Menyuni kategoriyalar bo'yicha ko'radi.
4. Taomlarni savatchaga qo'shadi.
5. Olish usulini tanlaydi: zalda / olib ketish / yetkazish (+ manzil).
6. Zal va olib ketishda **olish vaqtini** tanlaydi (masalan 11:20).
7. To'laydi (qoidalar 8-bo'limda).
8. Zakaz holati haqida botdan xabar oladi; tayyor bo'lganda "Zakaz #N tayyor" xabari keladi va mijoz kassadan raqam bilan oladi.

## 6. Funksiyalar (v1)

1. **Menyu va savatcha** — kategoriyalar, taom kartasi (nom, narx, rasm, tavsif, hajm), savatcha, promokod.
2. **Zakaz va to'lov** — uch olish usuli, olish vaqti, km bo'yicha yetkazish narxi, Click va Payme orqali onlayn to'lov, holat xabarlari, bekor qilish va avtomatik pul qaytarish.
3. **Admin panel** — zakazlar oqimi va holatlar (olish vaqti bo'yicha tartiblangan), menyu boshqaruvi ("tugadi" belgisi bilan), hisobot.

## 7. Ma'lumot modeli

| Jadval | Izoh |
|--------|------|
| Mijozlar | Telegram akkaunt, ism, telefon |
| Manzillar | Mijozning saqlangan yetkazish manzillari |
| Kategoriyalar | Menyu bo'limlari |
| Taomlar | Nom, narx, rasm, tavsif, hajm, "tugadi" belgisi |
| Zakazlar | Mijoz, olish usuli, olish vaqti, holat, summa, to'lov usuli |
| Zakaz qatorlari | Zakazdagi har bir taom, soni va o'sha paytdagi narxi |
| To'lovlar | Click/Payme to'lov va qaytarish yozuvlari |
| Promokodlar | Chegirma kodlari |
| Adminlar | Panelga kira oladigan Telegram akkauntlar (2 ta) |

## 8. Qoidalar

**Holatlar zanjiri:**
`to'landi -> tayyorlanmoqda -> tayyor -> yo'lda -> yetkazildi/berildi` + `bekor qilindi`
("yo'lda" faqat yetkazishda.)

**Zakaz qabuli:** onlayn to'langan zakaz avtomatik qabul qilinadi. Oshxona uni mijoz tanlagan **olish vaqtiga** mo'ljallab tayyorlaydi — ovqat shu vaqtga issiq va yangi bo'ladi.

**To'lov:**
- Olib ketish — faqat **oldindan onlayn** (Click yoki Payme).
- Yetkazish — onlayn yoki kuryerga naqd.
- Zalda — ochiq savol (9-bo'lim).

**Kechikish:** mijoz olish vaqtidan kechiksa, oshxona taomni isitib beradi. To'lov oldindan bo'lgani uchun kelmaslik xavfini mijoz ko'taradi.

**Yetkazish narxi:** km bo'yicha — bazaviy narx + har km uchun summa, mijoz lokatsiyasidan hisoblanadi. Maksimal radius va minimal zakaz summasi bor.

**Bekor qilish:** mijoz "tayyorlanmoqda" holatigacha bekor qila oladi. Onlayn to'lov avtomatik qaytariladi.

**Tugagan taom:** admin "tugadi" qiladi.

**Nizo:** admin qo'lda hal qiladi.

**Zaxira:** bot yoki to'lov ishlamasa, kassa odatdagidek ishlayveradi.

**Maxfiy ma'lumot:** telefon, manzil, zakaz tarixi — faqat admin va mijozning o'zi ko'radi.

**Yuridik:** kafe YaTT; Click va Payme bilan shartnoma YaTT nomidan.

## 9. Ochiq savollar

**Mahsulot qarorlari**
- Bitta olish vaqtiga nechta zakaz qabul qilinadi (vaqt sloti limiti)? — S4
- Zalda yeyiladigan zakaz ham faqat oldindan onlayn to'lanadimi yoki kassada to'lash qoladimi? — S4
- Yetkazishda ham olish vaqti tanlanadimi? — S4
- Uch olish usuli to'qnashsa, qaysi biri ustun? — S4
- Yetkazish raqamlari: bazaviy narx, km narxi, maksimal radius, minimal summa — S4
- Promokod qoidalari (foiz yoki summa, muddat, bir martalikmi) — S4
- Hisobot tarkibi — S6
- Kuryerlar soni — ishga tushirishdan oldin

**Tekshiriladigan faktlar**
- 11:20 navbati necha daqiqa va necha kishi ketib qoladi — S1 bilan parallel, 5 kun kuzatuv
- Bot savdosining qancha qismi yangi mijozdan — S4 dan oldin
- Click/Payme komissiyasi foizi — S4 dan oldin
- Fiskal chekni v2'ga qoldirish qonuniy jihatdan mumkinmi — S4 dan oldin
- Telefon va zakaz tarixi uchun mijoz roziligi kerakmi — S3
- Reklama byudjeti (Instagram, Telegram kanal) va ilmoq — S5 dan oldin

## 10. V1'ga kirmaydiganlar

- Fiskal chek va soliq integratsiyasi (v2)
- Kuryer ilovasi yoki roli, kuryer kuzatuvi
- Ko'p filial
- Reyting va sharhlar
- Stol band qilish

---

*Yoshlik · vibecoding plugin bilan yaratilgan · vibecoding.uz*
