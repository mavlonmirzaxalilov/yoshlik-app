-- CreateEnum
CREATE TYPE "TolovUsuli" AS ENUM ('CLICK', 'PAYME', 'NAQD', 'KASSA');

-- AlterTable
ALTER TABLE "Taom" ADD COLUMN     "hajm" TEXT,
ADD COLUMN     "kategoriyaId" INTEGER,
ADD COLUMN     "rasm" TEXT,
ADD COLUMN     "tartib" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tavsif" TEXT,
ADD COLUMN     "tugadi" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
-- "tarkib" hozircha qoladi: pastda undan ZakazQatori to'ldiriladi, keyin o'chiriladi.
ALTER TABLE "Zakaz" ADD COLUMN     "mijozId" INTEGER;

-- CreateTable
CREATE TABLE "Kategoriya" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "belgi" TEXT NOT NULL,
    "tartib" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Kategoriya_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZakazQatori" (
    "id" SERIAL NOT NULL,
    "zakazId" INTEGER NOT NULL,
    "taomId" INTEGER,
    "nom" TEXT NOT NULL,
    "narx" INTEGER NOT NULL,
    "soni" INTEGER NOT NULL,

    CONSTRAINT "ZakazQatori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mijoz" (
    "id" SERIAL NOT NULL,
    "telegramId" BIGINT,
    "ism" TEXT,
    "telefon" TEXT,
    "yaratilgan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Mijoz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manzil" (
    "id" SERIAL NOT NULL,
    "mijozId" INTEGER NOT NULL,
    "matn" TEXT NOT NULL,
    "lat" DOUBLE PRECISION,
    "lng" DOUBLE PRECISION,

    CONSTRAINT "Manzil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tolov" (
    "id" SERIAL NOT NULL,
    "zakazId" INTEGER NOT NULL,
    "usul" "TolovUsuli" NOT NULL,
    "summa" INTEGER NOT NULL,
    "holat" TEXT NOT NULL,
    "yaratilgan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tolov_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promokod" (
    "id" SERIAL NOT NULL,
    "kod" TEXT NOT NULL,
    "faol" BOOLEAN NOT NULL DEFAULT true,
    "yaratilgan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promokod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "telegramId" BIGINT NOT NULL,
    "ism" TEXT,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Mijoz_telegramId_key" ON "Mijoz"("telegramId");

-- CreateIndex
CREATE UNIQUE INDEX "Mijoz_telefon_key" ON "Mijoz"("telefon");

-- CreateIndex
CREATE UNIQUE INDEX "Promokod_kod_key" ON "Promokod"("kod");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_telegramId_key" ON "Admin"("telegramId");

-- AddForeignKey
ALTER TABLE "Taom" ADD CONSTRAINT "Taom_kategoriyaId_fkey" FOREIGN KEY ("kategoriyaId") REFERENCES "Kategoriya"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Zakaz" ADD CONSTRAINT "Zakaz_mijozId_fkey" FOREIGN KEY ("mijozId") REFERENCES "Mijoz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZakazQatori" ADD CONSTRAINT "ZakazQatori_zakazId_fkey" FOREIGN KEY ("zakazId") REFERENCES "Zakaz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ZakazQatori" ADD CONSTRAINT "ZakazQatori_taomId_fkey" FOREIGN KEY ("taomId") REFERENCES "Taom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manzil" ADD CONSTRAINT "Manzil_mijozId_fkey" FOREIGN KEY ("mijozId") REFERENCES "Mijoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tolov" ADD CONSTRAINT "Tolov_zakazId_fkey" FOREIGN KEY ("zakazId") REFERENCES "Zakaz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- S1 zakazlarini saqlash: Zakaz.tarkib (JSON) -> ZakazQatori qatorlari
INSERT INTO "ZakazQatori" ("zakazId", "taomId", "nom", "narx", "soni")
SELECT z."id",
       t."id",
       q->>'nom',
       (q->>'narx')::int,
       (q->>'soni')::int
FROM "Zakaz" z
CROSS JOIN LATERAL jsonb_array_elements(z."tarkib") AS q
LEFT JOIN "Taom" t ON t."id" = (q->>'taomId')::int;

-- AlterTable
ALTER TABLE "Zakaz" DROP COLUMN "tarkib";
