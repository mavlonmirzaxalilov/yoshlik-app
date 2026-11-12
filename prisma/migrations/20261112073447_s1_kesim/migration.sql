-- CreateEnum
CREATE TYPE "OlishUsuli" AS ENUM ('ZAL', 'OLIB_KETISH', 'YETKAZISH');

-- CreateTable
CREATE TABLE "Taom" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "narx" INTEGER NOT NULL,

    CONSTRAINT "Taom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Zakaz" (
    "id" SERIAL NOT NULL,
    "raqam" SERIAL NOT NULL,
    "olishUsuli" "OlishUsuli" NOT NULL,
    "olishVaqti" TEXT,
    "tarkib" JSONB NOT NULL,
    "jamiSumma" INTEGER NOT NULL,
    "yaratilgan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Zakaz_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Zakaz_raqam_key" ON "Zakaz"("raqam");
