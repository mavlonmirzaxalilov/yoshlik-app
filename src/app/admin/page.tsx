import { Suspense } from "react";
import { redirect } from "next/navigation";
import { joriyFoydalanuvchi } from "@/lib/auth";
import AdminZakazlar from "@/components/AdminZakazlar";

// Server tomonda rol tekshiruvi: admin bo'lmasa sahifa ko'rsatilmaydi.
async function AdminTekshiruv() {
  const f = await joriyFoydalanuvchi();
  if (!f) redirect("/kirish?qaytish=/admin");
  if (!f.admin) redirect("/");
  return <AdminZakazlar />;
}

export default function AdminSahifasi() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mb-4 text-stone-600">Bugungi zakazlar. To&apos;liq boshqaruv paneli S6&apos;da.</p>
      <Suspense fallback={<p className="text-stone-500">Yuklanmoqda...</p>}>
        <AdminTekshiruv />
      </Suspense>
    </main>
  );
}
