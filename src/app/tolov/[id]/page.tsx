import { Suspense } from "react";
import TestTolov from "@/components/TestTolov";

export default function TolovSahifasi() {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-8">
      <Suspense fallback={<p className="text-stone-500">Yuklanmoqda...</p>}>
        <TestTolov />
      </Suspense>
    </main>
  );
}
