-- AlterTable
ALTER TABLE "Zakaz" ADD COLUMN     "kassaChek" TIMESTAMP(3),
ADD COLUMN     "oshxonaChek" TIMESTAMP(3);

-- Mavjud zakazlar uchun chek chiqarilmaydi (printer ulangan kundan boshlab)
UPDATE "Zakaz" SET "oshxonaChek" = CURRENT_TIMESTAMP, "kassaChek" = CURRENT_TIMESTAMP;
