interface ProfileHeaderProps {
  fullName: string;
  phone: string;
}

export function ProfileHeader({ fullName, phone }: ProfileHeaderProps) {
  return (
    <header className="bg-primary rounded-b-3xl px-5 pt-6 pb-8 text-white shadow-sm">
      <h1 className="mb-4 text-center text-lg font-bold">Profil</h1>
      <div className="flex items-center gap-3">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white text-primary">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
          </svg>
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-bold">{fullName || "Foydalanuvchi"}</h2>
          <p className="mt-0.5 text-sm text-white/80">{phone || "Telefon raqami kiritilmagan"}</p>
        </div>
      </div>
    </header>
  );
}
