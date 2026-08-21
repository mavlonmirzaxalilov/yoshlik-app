type Tab = "menu" | "profile";

interface TabBarProps {
  active: Tab;
  onNavigate: (tab: Tab) => void;
}

function MenuIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5Z" />
    </svg>
  );
}

function PersonIcon({ filled }: { filled: boolean }) {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={filled ? 0 : 2}>
      <circle cx="12" cy="8" r="4" strokeLinecap="round" strokeLinejoin="round" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-4 3.5-6 8-6s8 2 8 6" />
    </svg>
  );
}

const TABS: { key: Tab; label: string; Icon: typeof MenuIcon }[] = [
  { key: "menu", label: "Menyu", Icon: MenuIcon },
  { key: "profile", label: "Profil", Icon: PersonIcon },
];

export function TabBar({ active, onNavigate }: TabBarProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 justify-center border-t border-gray-100 bg-white/95 backdrop-blur">
      <div className="flex w-full max-w-[390px] items-center justify-around px-4">
        {TABS.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <button
              key={key}
              onClick={() => onNavigate(key)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 transition-colors active:scale-95 ${
                isActive ? "text-primary" : "text-gray-400"
              }`}
            >
              <Icon filled={isActive} />
              <span className="text-[11px] font-semibold">{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
