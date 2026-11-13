# ROADMAP — Yoshlik

## 1. Magistral

| Sprint | Savol | Natija (shu loyihada) |
|--------|-------|------------------------|
| ✅ S1 — kesim | Ishlaydimi? | Menyuda 4 ta taom ko'rinadi, savatchaga qo'shiladi, olish usuli va vaqti tanlanadi, zakaz bazaga yoziladi va tasdiq ekrani chiqadi |
| S2 — xotira | Eslab qoladimi? | Kategoriyalar, taom rasmlari, manzillar, zakaz qatorlari — to'liq model; menyu kategoriya bo'yicha filtrlanadi |
| ✅ S3 — auth | Kim kirdi? | Mijoz telefon orqali kiradi va faqat o'z zakazlarini ko'radi; admin sahifalari himoyalangan |
| S4 — chuqurlik | Haqiqiy hayotda chidaydimi? | Holatlar zanjiri, uch olish usuli, km bo'yicha yetkazish narxi, onlayn to'lov, bekor qilish va pul qaytarish, promokod |
| S5 — telegram | Qo'lda turadimi? | Bot ichida Mini App ochiladi, telefon "raqamni ulashish" bilan olinadi, holat xabarlari botga keladi |
| S6 — admin | Boshqarib bo'ladimi? | Admin Telegram orqali panelga kiradi, zakaz holatini o'zgartiradi, menyuni tahrirlaydi, "tugadi" qiladi, hisobotni ko'radi |

## 2. Tarmoqlar

- **Yetkazish narxi kalkulyatori** — lokatsiyadan km hisoblanadi, radius va minimal summa tekshiriladi
  *Sabab:* Blok 4'da narx km bo'yicha, maksimal radius va minimal summa bilan deb aytilgan.
- **Avtomatik pul qaytarish** — bekor qilingan onlayn zakaz puli to'lov tizimi orqali qaytadi
  *Sabab:* Blok 4'da bekor qilish "tayyorlanmoqda"gacha va qaytarish avtomatik deb aytilgan.
- **Kassa to'lovi oqimi** — kassada to'lanadigan zakazning alohida yo'li
  *Sabab:* Blok 4'da to'lov "onlayn + kassada" deb aytilgan; boshlanish vaqti ochiq savol.
- **Promokod** — savatchada kod kiritish va chegirma
  *Sabab:* Blok 5'da promokod V1'ga kiradi deb aytilgan.
- **"Tugadi" belgisi** — admin taomni menyudan vaqtincha yopadi
  *Sabab:* Blok 3'da tugagan taomni admin belgilaydi deb aytilgan.
- **Zakazlar tarixi va qayta zakaz uchun tarix** — mijoz profilida saqlanadi
  *Sabab:* Blok 2'da profilga zakazlar tarixi kiradi deb aytilgan.
- **Hisobot** — admin uchun kunlik zakazlar va savdo
  *Sabab:* Blok 2'da admin huquqiga hisobot kiradi; muvaffaqiyat o'lchovi — kunlik zakazlar soni.

- **Olish vaqti** — mijoz zal va olib ketishda vaqt tanlaydi, oshxona shu vaqtga tayyorlaydi
  *Sabab:* Savalada asosiy qiymat sifatida aniqlandi — 11:20 cho'qqisini botga ko'chirish.

## 3. Kelajak (v2+)

- Fiskal chek va soliq integratsiyasi
- Kuryer ilovasi/roli va yetkazish kuzatuvi
- Ko'p filial
- Reyting va sharhlar
- Kafedagi tayyor zakazlar ekrani (qovurdoqda tanlanmagan, kerak bo'lsa)

---

*Yoshlik · vibecoding plugin bilan yaratilgan · vibecoding.uz*
