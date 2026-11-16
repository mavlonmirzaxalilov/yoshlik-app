import { kirishSorovi } from "@/lib/botKirish";

// POST /api/auth/bot-kirish — kompyuterda kirish so'rovini ochadi: { id, sir, havola, muddati }.
// sir faqat shu sahifada qoladi; holat so'rovi sir bilan yuboriladi.
export async function POST() {
  return Response.json(await kirishSorovi());
}
