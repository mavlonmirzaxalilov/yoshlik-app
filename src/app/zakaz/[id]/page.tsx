import { Suspense } from "react";
import ZakazTasdiq from "@/components/ZakazTasdiq";

// Tasdiq ekrani: zakaz ma'lumoti /api/zakazlar/[id] orqali klientda yuklanadi.
export default function TasdiqSahifasi() {
  return (
    <Suspense fallback={<p className="mx-auto max-w-2xl px-4 py-6 text-stone-500">Yuklanmoqda...</p>}>
      <ZakazTasdiq />
    </Suspense>
  );
}
