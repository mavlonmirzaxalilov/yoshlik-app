-- CreateTable
CREATE TABLE "BotKirish" (
    "id" TEXT NOT NULL,
    "sirHash" TEXT NOT NULL,
    "telegramId" BIGINT,
    "mijozId" INTEGER,
    "tasdiqlandi" BOOLEAN NOT NULL DEFAULT false,
    "ishlatildi" BOOLEAN NOT NULL DEFAULT false,
    "muddati" TIMESTAMP(3) NOT NULL,
    "yaratilgan" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BotKirish_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BotKirish_telegramId_idx" ON "BotKirish"("telegramId");
