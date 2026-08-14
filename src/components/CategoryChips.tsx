import type { Category } from "../types";

interface CategoryChipsProps {
  categories: Category[];
  selectedId: number | "all";
  onSelect: (id: number | "all") => void;
}

export function CategoryChips({ categories, selectedId, onSelect }: CategoryChipsProps) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-4">
      <button
        onClick={() => onSelect("all")}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          selectedId === "all"
            ? "bg-primary text-white"
            : "bg-white text-gray-600 shadow-sm"
        }`}
      >
        Hammasi
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          onClick={() => onSelect(category.id)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selectedId === category.id
              ? "bg-primary text-white"
              : "bg-white text-gray-600 shadow-sm"
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
