import { Suspense } from "react";
import KirishFormasi from "@/components/KirishFormasi";
import { Sarlavha } from "@/components/ui";

export default function KirishSahifasi() {
  return (
    <>
      <Sarlavha sarlavha="Kirish">
        <p className="mt-1 text-center text-sm text-white/90">Telefon raqamingizga bir martalik kod yuboramiz</p>
      </Sarlavha>
      <main className="mx-auto w-full max-w-md px-4 py-6">
        <Suspense fallback={<p className="text-xira">Yuklanmoqda...</p>}>
          <KirishFormasi />
        </Suspense>
      </main>
    </>
  );
}
