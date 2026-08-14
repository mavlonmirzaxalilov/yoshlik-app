interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative -mt-5 px-5">
      <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-md shadow-black/5">
        <svg
          className="h-5 w-5 shrink-0 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-4.35-4.35M18 11a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Taom qidirish..."
          className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
        />
      </div>
    </div>
  );
}
