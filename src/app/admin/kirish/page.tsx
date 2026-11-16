import { Suspense } from "react";
import TelegramKirish from "@/components/admin/TelegramKirish";

export default function AdminKirishSahifasi() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-panel p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-faol text-2xl font-extrabold text-white">
          Y
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-panel">Yoshlik — boshqaruv</h1>
        <p className="mt-1 text-sm text-stone-500">Xodimlar Telegram bot orqali kiradi</p>
        <Suspense fallback={<p className="mt-6 text-stone-500">Yuklanmoqda...</p>}>
          <TelegramKirish />
        </Suspense>
      </div>
    </div>
  );
}
