import { useMemo, useState } from "react";
import { Header } from "../components/Header";
import { SearchBar } from "../components/SearchBar";
import { CategoryChips } from "../components/CategoryChips";
import { ProductCard } from "../components/ProductCard";
import { CartBar } from "../components/CartBar";
import { useCategories, useProducts } from "../lib/queries";

export function MenuScreen({ onOpenCart }: { onOpenCart: () => void }) {
  const { categories, loading: categoriesLoading } = useCategories();
  const { products, loading: productsLoading, error } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
  const [search, setSearch] = useState("");

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "all" || product.category_id === selectedCategory;
      const matchesSearch = product.name
        .toLowerCase()
        .includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, search]);

  const loading = categoriesLoading || productsLoading;

  return (
    <div className="pb-40">
      <Header />
      <SearchBar value={search} onChange={setSearch} />
      <CategoryChips
        categories={categories}
        selectedId={selectedCategory}
        onSelect={setSelectedCategory}
      />

      <div className="flex flex-col gap-3 px-5">
        {loading && (
          <p className="py-10 text-center text-sm text-gray-400">Yuklanmoqda...</p>
        )}

        {!loading && error && (
          <p className="py-10 text-center text-sm text-red-500">
            Ma'lumotlarni yuklashda xatolik: {error}
          </p>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">
            Hech narsa topilmadi
          </p>
        )}

        {!loading &&
          !error &&
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </div>

      <CartBar onOpenCart={onOpenCart} />
    </div>
  );
}
