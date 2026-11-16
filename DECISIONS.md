# DECISIONS — Yoshlik

Format: `sana · qaror · sabab`

## Jurnal

- 2026-11-12 · Stack: Next.js + TypeScript + PostgreSQL + Prisma + Tailwind + Caddy + GitHub Actions + Hetzner + Telegram Mini App · kurs pozitsiyasi, stack qotirilgan ([STACK.md](STACK.md))
- 2026-11-12 · API-first arxitektura · bot (Mini App) va admin panel bitta API'ga ulanadi
- 2026-11-12 · Yurak amal — zakaz berish · mahsulotning butun o'qi shu harakat
- 2026-11-12 · V1 chegarasi: kuryer roli, ko'p filial, reyting/sharh, stol band qilish kirmaydi · v1'ni yengil saqlash; o'z-o'ziga xizmat shahobchasi
- 2026-11-12 · Uch olish usuli (zal, olib ketish, yetkazish) V1'da birga · foydalanuvchi qarori, navbat va yangi mijoz og'riqlarini birga yopish
- 2026-11-12 · Rollar: mijoz + bitta admin · kafe kichik, kuryer tizimdan tashqarida
- 2026-11-12 · Mijoz Telegram + telefon bilan kiradi · telefon zakazni aniqlashtirish va mijoz bazasi uchun
- 2026-11-12 · Admin Telegram orqali kiradi · alohida parol boshqarmaslik
- 2026-11-12 · S3'da web uchun telefon + OTP, S5'da Telegram "raqamni ulashish"ga o'tiladi · sprint tartibi qotirilgan, Telegram S5'da keladi
- 2026-11-12 · Onlayn to'langan zakaz avtomatik qabul qilinadi · adminni qo'shimcha tasdiqdan ozod qilish
- 2026-11-12 · To'lov: onlayn yoki kassada; yetkazishda onlayn yoki kuryerga naqd · mijozga tanlov
- 2026-11-12 · Yetkazish narxi km bo'yicha, radius va minimal summa bilan · masofaga mos adolatli narx
- 2026-11-12 · Bekor qilish "tayyorlanmoqda"gacha, onlayn pul avtomatik qaytadi · oshxona boshlagan ovqat yo'qotilmasin
- 2026-11-12 · Promokod V1'ga kiradi · foydalanuvchi qarori
- 2026-11-12 · Muvaffaqiyat: 3 oyda kuniga 100+ bot zakazi · o'lchanadigan maqsad
- 2026-11-12 · Asosiy maqsad — 11:20 dagi tushlik tirbandligini botga ko'chirish · savalada aniqlandi, yo'lak navbatini chetlab o'tish
- 2026-11-12 · Admin panelga 2 nafar admin kiradi · savalada aniqlandi, jamoa: 2 admin, 3 oshpaz, 2 yordamchi
- 2026-11-12 · Kafe YaTT sifatida ishlaydi · onlayn to'lov shartnomasi YaTT nomidan tuziladi
- 2026-11-12 · Olib ketish zakazi oldindan onlayn to'lanadi · kelmaslik xavfini oshxona emas, mijoz ko'taradi
- 2026-11-12 · To'lov tizimlari: Click va Payme · savalada tanlandi
- 2026-11-12 · Mijoz kechiksa, oshxona taomni isitib beradi · "issiq ovqat" va'dasi saqlanadi
- 2026-11-12 · Reklama kanallari: Instagram va Telegram kanal · birinchi foydalanuvchilarni jalb qilish uchun
- 2026-11-12 · Fiskal chek va soliq integratsiyasi v2'da · v1'ni yengil saqlash; qonuniy talab S4 dan oldin tekshiriladi
- 2026-11-12 · Olish vaqti V1'ga kiradi; avtomatik qabul qilingan zakaz shu vaqtga mo'ljallab tayyorlanadi · savaladagi ziddiyat shu tarzda yopildi
- 2026-11-12 · PRD yakunlandi, S1 boshlanadi · savala SHARTLI GO, qolgan ochiq savollar S4 dan oldin hal qilinadi
- 2026-11-12 · Lokal PostgreSQL 17 Docker'da (docker-compose.yml), Prisma 6 · kompyuterda Postgres yo'q, Docker bor; Prisma 6 sozlashi oddiyroq
- 2026-11-12 · S1'da zakaz tarkibi Zakaz jadvalida JSON sifatida, narx serverda bazadan hisoblanadi · kesim uchun minimal model; alohida jadval S2'da
- 2026-11-13 · Menyu "menu (2).docx" faylidan olindi (6 kategoriya, 82 taom), taom nomlari fayldagidek · kafening haqiqiy menyusi
- 2026-11-13 · Ikki o'lchamli taom ikki alohida taom sifatida saqlanadi ("Osh (0,75 pors)", "Osh (1 pors)") · foydalanuvchi qarori; model variantlarsiz sodda qoladi
- 2026-11-13 · Bir qatordagi bir nechta ichimlik (Cola/Fanta/Sprite/Fusetea, choy ko'k/qora, koffe sutli/qora) har biri alohida taom · foydalanuvchi qarori
- 2026-11-13 · Rasm o'rnida vaqtincha kategoriya belgisi (emoji); rasm yuklash S6 (admin)ga ko'chirildi · faylda rasm yo'q, admin panel va hosting hali yo'q
- 2026-11-13 · S1 zakazlari migratsiyada Zakaz.tarkib JSON'idan ZakazQatori jadvaliga ko'chirildi · S2 qabul mezoni: eski zakazlar omon qolsin
- 2026-11-13 · OTP test rejimida: kod server logiga chiqadi, SMS provayder ulanmagan; productionda kod yuborilmaydi (503) · S5'da Telegram "raqamni ulashish"ga o'tiladi
- 2026-11-13 · Admin telefon raqami bo'yicha aniqlanadi (`.env` ADMIN_TELEFONLAR → Admin jadvali), mijoz bilan bir xil OTP orqali kiradi · Telegram S5'da keladi; S6'da Telegram ID'ga o'tiladi
- 2026-11-13 · Kirishda rozilik katagi majburiy, rozilik vaqti Mijoz.roziVaqti'da saqlanadi · PRD'dagi ochiq savol shu bilan yopildi
- 2026-11-13 · Zakaz berish uchun kirish majburiy; savatcha localStorage'da saqlanadi va kirgandan keyin tiklanadi · zakaz mijozga bog'lanishi kerak
- 2026-11-13 · Sessiya: httpOnly cookie, bazada token xeshi, 30 kun; OTP 5 daqiqa, 5 urinish, 60 soniyada bitta kod · oddiy va xavfsiz, tashqi kutubxonasiz
- 2026-11-13 · Click/Payme kalitlari yo'q — vaqtincha test to'lov sahifasi (`TOLOV_REJIM=test`); provayder `src/lib/tolov.ts` interfeysiga keyin ulanadi · oqim to'liq ishlaydi, productionda test o'chiq
- 2026-11-13 · Zal va olib ketish faqat oldindan onlayn; yetkazishda onlayn yoki kuryerga naqd · foydalanuvchi qarori; kassa to'lovi savoli yopildi
- 2026-11-13 · Holatlar: TOLOV_KUTILMOQDA → TOLANDI / QABUL_QILINDI (naqd) → TAYYORLANMOQDA → TAYYOR → YOLDA (yetkazish) → BERILDI; BEKOR · PRD zanjiri + to'lovdan oldingi va naqd holatlari
- 2026-11-13 · Olish vaqtiga zakaz limiti yo'q; vaqt uchala usulda majburiy, o'tgan vaqt (Toshkent vaqti) rad etiladi · foydalanuvchi qarori
- 2026-11-13 · Yetkazish narxi = bazaviy + yaxlitlangan km × km narxi, masofa brauzer geolokatsiyasidan to'g'ri chiziq; tarif va kafe nuqtasi vaqtincha test qiymatlar (.env) · foydalanuvchi qarori, haqiqiy raqamlar keyin
- 2026-11-13 · Promokod foizli, chegirma faqat taomlar summasiga; bekor qilinsa ishlatish qaytariladi · foydalanuvchi qarori
- 2026-11-13 · Bekor qilishda avval holat shartli o'zgartiriladi, pul keyin qaytariladi; admin faqat keyingi holatga o'tkaza oladi · admin va mijoz bir vaqtda bossa to'qnashuv bo'lmasin
- 2026-11-16 · Hosting: Vercel + Neon (STACK.md'dagi Hetzner + Caddy + GitHub Actions o'rniga) · Mini App HTTPS talab qiladi, server boshqaruvi kerak emas; foydalanuvchi qarori
- 2026-11-16 · Bot oqimi: /start → faqat "Raqamni ulashish" → "Xush kelibsiz!" + "Taom buyurtma qilish" (Mini App) · foydalanuvchi belgilagan tartib
- 2026-11-16 · Mini App'da kirish: initData imzosi `Authorization: tma` header orqali (cookie emas), telefon bot orqali kontakt bilan · Telegram Web iframe'ida cookie bloklanishi mumkin
- 2026-11-16 · Telegram raqami veb orqali kirgan mijozniki bo'lsa — akkauntlar birlashtiriladi; raqam boshqa Telegram akkauntida bo'lsa — rad · zakaz tarixi yo'qolmasin, begona raqam olinmasin
- 2026-11-16 · To'lanmagan onlayn zakaz 15 daqiqadan keyin avtomatik bekor; tekshiruv zakaz ochilganda + kunlik Vercel Cron · foydalanuvchi qarori; Hobby'da cron kuniga bir marta
- 2026-11-16 · Productionda test to'lovni faqat admin bosa oladi; Click/Payme ulanmaguncha bot mijozlarga e'lon qilinmaydi · soxta "to'landi" xavfi
- 2026-11-16 · Dizayn foydalanuvchi maketidan (Profil, 1-variant): to'q sariq uslub, pastki menyu (Asosiy · Buyurtmalar · Savat · Profil), qolgan sahifalar shu uslubda; ikonalar lucide-react · foydalanuvchi qarori
- 2026-11-16 · Maketdan "Til" va ⚙️ olib tashlandi, "Manzillarim" qo'shildi, bosqichlar holatlarimizga moslandi, "Yordam"da kafe telefoni va admin Telegram (KAFE_TELEFON, KAFE_TELEGRAM) · PRD'da faqat o'zbek tili, sozlama yo'q; foydalanuvchi rozi bo'ldi
- 2026-11-16 · Savat alohida /savat sahifasida, holat butun ilova uchun umumiy (SavatchaProvider) · pastki menyudagi Savat bo'limi uchun
- 2026-11-16 · src/proxy.ts olib tashlandi; admin tekshiruvi klientda, ma'lumotni admin API himoyalaydi · proxy cookie'ga qaraydi, Telegram Mini App esa header bilan kiradi — Telegram'da Profil/Buyurtmalar/Admin kirish sahifasiga otib yuborardi
- 2026-11-16 · Admin panel yoshlik-app ichida /admin (eski yoshlik-admin repo — Vite + Supabase — o'rniga), POS uslubida: chapda to'q ko'k menyu, rasmli taomlar to'ri, o'ngda buyurtma paneli · foydalanuvchi qarori; bitta baza, API va deploy
- 2026-11-16 · Admin bo'limlari: Kassa, Zakazlar, Menyu, Hisobotlar, Harajatlar, Xodimlar, Promokodlar, Sozlamalar; Ombor kechiktirildi, stol tanlovi yo'q · foydalanuvchi qarori (PRD: o'z-o'ziga xizmat)
- 2026-11-16 · Rollar: Admin (hammasi), Kassir (Kassa, Zakazlar, "tugadi"), Oshpaz (Zakazlar — holat); ADMIN_TELEFONLAR — o'chirib bo'lmaydigan egalar · foydalanuvchi qarori
- 2026-11-16 · Kassa: kassir zakaz kiritadi, naqd yoki karta (terminal), zakaz darhol "to'landi", manba=KASSA, qaytim hisoblanadi · foydalanuvchi qarori
- 2026-11-16 · Harajatlar tayyor turkumlar bilan (Mahsulot, Ish haqi, Kommunal, Ijara, Boshqa); hisobotda foyda = savdo − harajat · foydalanuvchi qarori
- 2026-11-16 · Hisobot: savdo, soni, o'rtacha chek, olish usuli, to'lov turi, manba, top-5 taom, bekorlar, harajat, foyda, kunlik grafik · PRD'dagi "hisobot tarkibi" savoli yopildi
- 2026-11-16 · Kompyuterda kirish — Telegram Login Widget (BotFather /setdomain kerak); Mini App ichida — hozirgidek · SMS yo'q, xodimlar baribir Telegram'da
- 2026-11-16 · Sozlamalar (kafe aloqasi, koordinata, yetkazish tarifi) bazadagi Sozlama jadvalida, bo'sh bo'lsa .env · kafe egasi Vercel'ga kirmasdan o'zgartira olsin
- 2026-11-16 · Taom rasmlari Vercel Blob'da (ochiq store), JPG/PNG/WebP ≤ 2 MB; lokalda yuklash o'chiq · production omboriga lokal sinovdan yozilmasin
- 2026-11-13 · Jarayon progress.html orqali kuzatiladi; sahifa hujjatlardan avtomatik yasaladi (`npm run progress`, `npm run dev` oldidan) · qo'lda yuritiladigan sahifa eskiradi, manba — sprint fayllari

## OCHIQ SAVOLLAR

- Kassada to'lanadigan zakaz qachon tayyorlana boshlaydi? — S4, holatlar sprintida
- Yetkazish raqamlari (bazaviy narx, km narxi, radius, minimal summa) — S4
- Promokod qoidalari — S4
- Onlayn to'lov tizimi va kafe bilan shartnoma — S4 boshlanishidan oldin
- 100+ zakaz/kunni bitta admin va bitta kuryer ko'tara oladimi — ishga tushirishdan oldin
- Hisobot tarkibi — S6, admin sprintida

---

*Yoshlik · vibecoding plugin bilan yaratilgan · vibecoding.uz*
