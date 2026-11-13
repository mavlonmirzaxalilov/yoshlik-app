import type { Taom } from "@/lib/turlar";

// Rasm bo'lsa rasm, bo'lmasa kategoriya belgisi (DECISIONS.md: rasm yuklash S6'da).
export default function TaomRasmi({ taom, katta = false }: { taom: Taom; katta?: boolean }) {
  const olcham = katta ? "h-40 w-full text-7xl" : "h-14 w-14 shrink-0 text-3xl";
  if (taom.rasm) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={taom.rasm} alt={taom.nom} className={`${olcham} rounded-lg object-cover`} />;
  }
  return (
    <div className={`${olcham} flex items-center justify-center rounded-lg bg-stone-100`} aria-hidden>
      {taom.kategoriya?.belgi ?? "🍽️"}
    </div>
  );
}
