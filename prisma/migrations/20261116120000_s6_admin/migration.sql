-- CreateEnum
CREATE TYPE "ZakazManbasi" AS ENUM ('ONLAYN', 'KASSA');

-- CreateEnum
CREATE TYPE "XodimRoli" AS ENUM ('ADMIN', 'KASSIR', 'OSHPAZ');

-- CreateEnum
CREATE TYPE "HarajatTurkumi" AS ENUM ('MAHSULOT', 'ISH_HAQI', 'KOMMUNAL', 'IJARA', 'BOSHQA');

-- AlterEnum
ALTER TYPE "TolovUsuli" ADD VALUE 'KARTA';

-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "faol" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "rol" "XodimRoli" NOT NULL DEFAULT 'ADMIN',
ADD COLUMN     "yaratilgan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Zakaz" ADD COLUMN     "bekorSababi" TEXT,
ADD COLUMN     "manba" "ZakazManbasi" NOT NULL DEFAULT 'ONLAYN',
ADD COLUMN     "xodimId" INTEGER;

-- CreateTable
CREATE TABLE "Harajat" (
    "id" SERIAL NOT NULL,
    "sana" TIMESTAMP(3) NOT NULL,
    "summa" INTEGER NOT NULL,
    "turkum" "HarajatTurkumi" NOT NULL,
    "izoh" TEXT,
    "xodimId" INTEGER,
    "yaratilgan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Harajat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sozlama" (
    "kalit" TEXT NOT NULL,
    "qiymat" TEXT NOT NULL,

    CONSTRAINT "Sozlama_pkey" PRIMARY KEY ("kalit")
);

-- CreateIndex
CREATE INDEX "Harajat_sana_idx" ON "Harajat"("sana");

-- AddForeignKey
ALTER TABLE "Zakaz" ADD CONSTRAINT "Zakaz_xodimId_fkey" FOREIGN KEY ("xodimId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Harajat" ADD CONSTRAINT "Harajat_xodimId_fkey" FOREIGN KEY ("xodimId") REFERENCES "Admin"("id") ON DELETE SET NULL ON UPDATE CASCADE;

