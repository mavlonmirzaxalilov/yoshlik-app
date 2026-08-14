export function SuccessScreen({ onBackToMenu }: { onBackToMenu: () => void }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
        ✅
      </div>
      <h1 className="text-xl font-bold text-gray-900">Buyurtma qabul qilindi!</h1>
      <p className="text-sm text-gray-500">
        Buyurtmangiz muvaffaqiyatli rasmiylashtirildi. Tez orada siz bilan bog'lanamiz.
      </p>
      <button
        onClick={onBackToMenu}
        className="mt-4 w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white shadow-lg shadow-primary/30 active:scale-[0.98] transition-transform"
      >
        Menyuga qaytish
      </button>
    </div>
  );
}
