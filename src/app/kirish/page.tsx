import { Suspense } from "react";
import KirishFormasi from "@/components/KirishFormasi";

export default function KirishSahifasi() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="text-2xl font-bold">Kirish</h1>
      <p className="mb-6 text-stone-600">Telefon raqamingizga bir martalik kod yuboramiz.</p>
      <Suspense fallback={<p className="text-stone-500">Yuklanmoqda...</p>}>
        <KirishFormasi />
      </Suspense>
    </main>
  );
}
