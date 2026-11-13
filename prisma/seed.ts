import { PrismaClient } from "@prisma/client";
import { menyu } from "./menyu";

const prisma = new PrismaClient();

async function main() {
  const kategoriyalarSoni = await prisma.kategoriya.count();
  if (kategoriyalarSoni > 0) {
    console.log(`Bazada allaqachon ${kategoriyalarSoni} ta kategoriya bor — seed o'tkazib yuborildi.`);
    return;
  }

  // S1'dagi test taomlari (kategoriyasiz) o'chiriladi. Eski zakaz qatorlarida
  // nom va narx nusxasi qoladi, taomId esa null bo'ladi (onDelete: SetNull).
  const ochirildi = await prisma.taom.deleteMany({ where: { kategoriyaId: null } });
  if (ochirildi.count) console.log(`${ochirildi.count} ta S1 test taomi o'chirildi.`);

  let jami = 0;
  for (const [ki, k] of menyu.entries()) {
    await prisma.kategoriya.create({
      data: {
        nom: k.nom,
        belgi: k.belgi,
        tartib: ki,
        taomlar: { create: k.taomlar.map((taom, ti) => ({ ...taom, tartib: ti })) },
      },
    });
    jami += k.taomlar.length;
  }
  console.log(`${menyu.length} ta kategoriya va ${jami} ta taom qo'shildi.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
