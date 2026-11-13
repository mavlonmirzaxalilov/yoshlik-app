// Yoshlik kafesining menyusi — "menu (2).docx" faylidan ko'chirilgan (2026-11-13).
// Qoidalar (DECISIONS.md): ikki o'lchamli taom — ikki alohida taom;
// bir qatordagi bir nechta mahsulot (Cola/Fanta..., choy ko'k/qora) — har biri alohida.
// Faylda tavsif va rasm yo'q: tavsif bo'sh, rasm o'rnida kategoriya belgisi.

export type MenyuTaomi = { nom: string; hajm: string | null; narx: number };
export type MenyuKategoriyasi = { nom: string; belgi: string; taomlar: MenyuTaomi[] };

const t = (nom: string, hajm: string | null, narx: number): MenyuTaomi => ({ nom, hajm, narx });

// Ikki o'lchamli taom -> ikki alohida taom: "Osh (0,75 pors)", "Osh (1 pors)"
const ikki = (nom: string, h1: string, n1: number, h2: string, n2: number) => [
  t(`${nom} (${h1})`, h1, n1),
  t(`${nom} (${h2})`, h2, n2),
];

// Bir qatordagi bir nechta ichimlik -> har biri alohida
const har = (nomlar: string[], hajm: string, narx: number) =>
  nomlar.map((nom) => t(`${nom} ${hajm}`, hajm, narx));

export const menyu: MenyuKategoriyasi[] = [
  {
    nom: "Nonushta",
    belgi: "🥞",
    taomlar: [
      t("Mannoye kasha", "1 pors", 12000),
      t("Risovaya kasha", "1 pors", 12000),
      t("Ovsyanaya kasha", "1 pors", 12000),
      t("Blinchik tvorog", "1 dona", 5000),
      t("Blinchik go'shtli", "1 dona", 5000),
      t("Tvorog", null, 12000),
      t("Sirnik", null, 5000),
    ],
  },
  {
    nom: "1-taom",
    belgi: "🍲",
    taomlar: [
      t("Vaju", "1 pors", 20000),
      t("Sirniy sup", "1 pors", 20000),
      t("Ko'cha osh", "1 pors", 20000),
      t("Teftel sho'rva", "1 pors", 20000),
      t("Borsh", "1 pors", 20000),
      t("Rassolni", "1 pors", 20000),
    ],
  },
  {
    nom: "2-taom",
    belgi: "🍛",
    taomlar: [
      ...ikki("Osh", "0,75 pors", 16000, "1 pors", 22000),
      ...ikki("Ragu", "0,75 pors", 15000, "1 pors", 25000),
      ...ikki("Lag'mon", "0,75 pors", 16000, "1 pors", 22000),
      t("Chexambili", "1 pors", 22000),
      t("Befshteks", "1 pors", 25000),
      ...ikki("Lo'la kabob", "0,75 pors", 16000, "1 pors", 26000),
      t("Bistrogin", "1 pors", 40000),
      ...ikki("Spagetti", "0,75 pors", 16000, "1 pors", 22000),
      t("Xonim", "1 pors (4 dona)", 20000),
      t("Manti", "1 pors (4 dona)", 20000),
    ],
  },
  {
    nom: "Garnirlar",
    belgi: "🍚",
    taomlar: [
      ...ikki("Kartoshka pyuresi", "1 qoshiq", 3000, "1 pors", 12000),
      ...ikki("Grechka", "1 qoshiq", 3000, "1 pors", 12000),
      ...ikki("Perlovka", "1 qoshiq", 3000, "1 pors", 12000),
      ...ikki("Gurunch", "1 qoshiq", 3000, "1 pors", 12000),
      ...ikki("Makaron rachki", "1 qoshiq", 3000, "1 pors", 12000),
      ...ikki("Garox pyuresi", "1 qoshiq", 3000, "1 pors", 12000),
      ...ikki("Kartoshka fri", "1 qoshiq", 5000, "1 pors", 20000),
      t("Go'shtli podliva", "1 pors", 20000),
      t("Katlet", "1 dona", 10000),
      t("Lo'la kabob", "1 dona", 10000),
      t("Sosiska", "1 dona", 3000),
      t("Kolbasa", "1 dona", 3000),
      t("Tuxum", "1 dona", 3000),
      t("Blinchik", "1 dona", 5000),
    ],
  },
  {
    nom: "Salatlar",
    belgi: "🥗",
    taomlar: [
      t("Mujskoy kapriz", "1 pors", 16000),
      t("Yoshlik salati", "1 pors", 16000),
      t("Gretskiy salat", "1 pors", 16000),
      t("Uyg'ur salat", "1 pors", 16000),
      t("Oliviye salat", "1 pors", 13000),
      t("Vinegret salat", "1 pors", 13000),
      t("Baqlajon salat", "1 pors", 13000),
      t("Bahor salat", "1 pors", 8000),
      t("Svejiy salat", "1 pors", 8000),
      t("Suzma", "1 pors", 5000),
    ],
  },
  {
    nom: "Ichimliklar",
    belgi: "🥤",
    taomlar: [
      t("Choy ko'k", "1 choynak", 3000),
      t("Choy qora", "1 choynak", 3000),
      t("Choy limon", "1 choynak", 8000),
      t("Choy malina", "1 choynak", 8000),
      t("Koffe sutli", "1 stakan", 5000),
      t("Koffe qora", "1 stakan", 5000),
      t("Smetana", "1 stakan", 5000),
      t("Kompot", "1 stakan", 3000),
      ...har(["Cola", "Fanta", "Sprite", "Fusetea"], "0,5 l", 8000),
      ...har(["Cola", "Fanta", "Sprite", "Fusetea"], "1 l", 12000),
      ...har(["Cola", "Fanta", "Sprite"], "1,5 l", 16000),
      t("Sok", "1 l", 16000),
      ...ikki("Ark tea", "0,5 l", 6000, "1 l", 12000),
      t("Gazsiz suv", "0,5 l", 3000),
    ],
  },
];
