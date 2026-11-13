-- CreateEnum
CREATE TYPE "ZakazHolati" AS ENUM ('TOLOV_KUTILMOQDA', 'TOLANDI', 'QABUL_QILINDI', 'TAYYORLANMOQDA', 'TAYYOR', 'YOLDA', 'BERILDI', 'BEKOR');

-- CreateEnum
CREATE TYPE "TolovHolati" AS ENUM ('KUTILMOQDA', 'TOLANDI', 'BEKOR', 'QAYTARILDI');

-- AlterTable
ALTER TABLE "Promokod" ADD COLUMN     "foiz" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "ishlatildi" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxIshlatish" INTEGER,
ADD COLUMN     "muddati" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Tolov" DROP COLUMN "holat",
ADD COLUMN     "holat" "TolovHolati" NOT NULL DEFAULT 'KUTILMOQDA';

-- AlterTable
ALTER TABLE "Zakaz" ADD COLUMN     "chegirma" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "holat" "ZakazHolati" NOT NULL DEFAULT 'TOLOV_KUTILMOQDA',
ADD COLUMN     "lat" DOUBLE PRECISION,
ADD COLUMN     "lng" DOUBLE PRECISION,
ADD COLUMN     "masofaKm" DOUBLE PRECISION,
ADD COLUMN     "promokodId" INTEGER,
ADD COLUMN     "taomlarSumma" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "tolovUsuli" "TolovUsuli",
ADD COLUMN     "yetkazishManzil" TEXT,
ADD COLUMN     "yetkazishNarxi" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "Zakaz" ADD CONSTRAINT "Zakaz_promokodId_fkey" FOREIGN KEY ("promokodId") REFERENCES "Promokod"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- S1–S3 zakazlari to'lovsiz yaratilgan: ular "qabul qilingan" deb belgilanadi,
-- taomlar summasi esa jami summaga teng (chegirma va yetkazish yo'q edi).
UPDATE "Zakaz" SET "holat" = 'QABUL_QILINDI', "taomlarSumma" = "jamiSumma";
