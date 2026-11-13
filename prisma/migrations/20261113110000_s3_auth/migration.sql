-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "telefon" TEXT,
ALTER COLUMN "telegramId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Mijoz" ADD COLUMN     "roziVaqti" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "OtpKod" (
    "id" SERIAL NOT NULL,
    "telefon" TEXT NOT NULL,
    "kodHash" TEXT NOT NULL,
    "muddati" TIMESTAMP(3) NOT NULL,
    "urinish" INTEGER NOT NULL DEFAULT 0,
    "ishlatildi" BOOLEAN NOT NULL DEFAULT false,
    "yaratilgan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OtpKod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sessiya" (
    "id" TEXT NOT NULL,
    "mijozId" INTEGER NOT NULL,
    "muddati" TIMESTAMP(3) NOT NULL,
    "yaratilgan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sessiya_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OtpKod_telefon_idx" ON "OtpKod"("telefon");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_telefon_key" ON "Admin"("telefon");

-- AddForeignKey
ALTER TABLE "Sessiya" ADD CONSTRAINT "Sessiya_mijozId_fkey" FOREIGN KEY ("mijozId") REFERENCES "Mijoz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

