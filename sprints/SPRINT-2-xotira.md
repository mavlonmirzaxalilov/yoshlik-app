# SPRINT 2 — xotira

**Maqsad:** PRD'dagi to'liq ma'lumot modeli qurilsin va menyu jiddiy ma'lumotni ko'tarsin.

**Savol:** Eslab qoladimi?

## Tasklar

- [x] Modelni migratsiya bilan kengaytirish: Kategoriyalar, Mijozlar, Manzillar, Zakaz qatorlari, To'lovlar, Promokodlar, Adminlar — S1'dagi zakazlar omon qoladi
- [x] Taomga tavsif, hajm, rasm va "tugadi" maydonlari qo'shiladi
- [ ] Taom rasmini yuklash va saqlash — menyu kartasida rasm ko'rinadi *(S2'da: `rasm` maydoni va ko'rsatish, rasm yo'q bo'lsa kategoriya belgisi; yuklash S6'ga ko'chirildi — DECISIONS.md)*
- [x] Menyu kategoriyalar bo'yicha guruhlanadi va filtrlanadi: `GET /api/taomlar?kategoriya=...`
- [x] Taom detali: tavsif va hajm ko'rinadi
- [x] Zakaz endi zakaz qatorlari orqali saqlanadi (taom, soni, o'sha paytdagi narx)

## Qabul mezoni

- Menyuda kamida 3 ta kategoriya, har birida rasmli taomlar ko'rinadi
- Kategoriya bosilganda faqat shu kategoriya taomlari qoladi
- Taom detalida tavsif va hajm ko'rinadi
- S1'da yaratilgan zakazlar migratsiyadan keyin ham bazada bor

## Hisobot

<!-- hisobotchi to'ldiradi -->
- 2026-11-13: to'liq model va migratsiya (S1 zakazlari ZakazQatori'ga ko'chdi), docx'dan haqiqiy menyu — 6 kategoriya, 82 taom, kategoriya filtri va detal oynasi; rasm o'rnida belgi (prisma/schema.prisma, prisma/menyu.ts, src/app/page.tsx, src/components/TaomDetali.tsx)
- 2026-11-13: jarayon sahifasi — hujjatlar va git'dan progress.html yasaladi, `npm run progress` (scripts/progress.mjs)

## Handoff

Keyingi: S3 — telefon + OTP bilan kirish, sessiya va "Mening zakazlarim"; Mijoz jadvali tayyor.
Ochiq: taom nomlaridagi ehtimoliy xatolar (Mannoye kasha, Rassolni, Gurunch, Garox pyuresi) foydalanuvchi tasdig'ini kutmoqda.
Rasm yuklash S6'ga ko'chirilgan; savatchani ekran pastiga mahkamlash S5'da ko'riladi.

---

*Yoshlik · vibecoding plugin bilan yaratilgan · vibecoding.uz*
