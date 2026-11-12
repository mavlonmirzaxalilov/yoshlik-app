import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Test qiymatlar — haqiqiy menyu va narxlar S6'da admin paneldan kiritiladi.
const taomlar = [
  { nom: "Osh", narx: 38000 },
  { nom: "Lag'mon", narx: 35000 },
  { nom: "Manti", narx: 32000 },
  { nom: "Sho'rva", narx: 30000 },
];

async function main() {
  const soni = await prisma.taom.count();
  if (soni > 0) {
    console.log(`Bazada allaqachon ${soni} ta taom bor — seed o'tkazib yuborildi.`);
    return;
  }
  await prisma.taom.createMany({ data: taomlar });
  console.log(`${taomlar.length} ta taom qo'shildi.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
