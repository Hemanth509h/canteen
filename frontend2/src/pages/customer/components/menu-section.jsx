import { useState, useMemo } from "react";
import { Search, Plus, CheckCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/layout/reveal";

export default function MenuSection({ foodItems, isLoading, onSelectItem, addToCart, cartItems }) {
  const [type, setType] = useState("All");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const categories = useMemo(() => {
    if (!foodItems) return ["All"];
    const cats = foodItems.filter((i) => type === "All" || i.type === type).map((i) => i.category);
    return ["All", ...Array.from(new Set(cats)).sort()];
  }, [foodItems, type]);

  const filtered = useMemo(() => {
    return (foodItems || []).filter((item) => {
      const matchType = type === "All" || item.type === type;
      const matchCat = category === "All" || item.category === category;
      const matchSearch = !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        (item.description || "").toLowerCase().includes(search.toLowerCase());
      return matchType && matchCat && matchSearch;
    });
  }, [foodItems, type, category, search]);

  return (
    <section id="menu" className="bg-zinc-50 px-4 py-14 transition-colors duration-300 dark:bg-zinc-950 sm:px-6 sm:py-20">
      <div className="max-w-7xl mx-auto">
        <Reveal className="mb-10 text-center sm:mb-12">
          <p className="text-amber-600 dark:text-amber-400 text-xs font-jakarta font-bold uppercase tracking-[0.3em] mb-3">Our Menu</p>
          <h2 className="text-3xl font-playfair font-bold text-zinc-900 transition-colors dark:text-white sm:text-5xl">Seasonal Selections</h2>
          <p className="text-zinc-500 dark:text-zinc-400 font-jakarta max-w-lg mx-auto">Curated dishes made with the freshest seasonal ingredients.</p>
        </Reveal>

        {/* Filters */}
        <Reveal delay={100} className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="grid grid-cols-3 overflow-hidden rounded-lg border border-zinc-200 bg-white transition-colors dark:border-zinc-800 dark:bg-zinc-900 sm:flex sm:shrink-0">
            {["All", "Veg", "Non-Veg"].map((t) => (
              <button
                key={t}
                onClick={() => { setType(t); setCategory("All"); }}
                className={cn(
                  "px-4 py-2.5 text-sm font-jakarta font-semibold transition-colors sm:px-5",
                  type === t
                    ? "bg-amber-500 text-white"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                )}
              >{t}</button>
            ))}
          </div>

          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-11 w-full rounded-lg border border-zinc-200 bg-white pl-11 pr-4 text-sm font-jakarta text-zinc-900 transition-colors placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
            />
          </div>
        </Reveal>

        {/* Category pills */}
        <Reveal delay={200} className="mb-8 flex gap-2 overflow-x-auto pb-2 sm:mb-10 sm:flex-wrap sm:overflow-visible">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "shrink-0 rounded-full border px-4 py-1.5 text-xs font-jakarta font-bold transition-all",
                category === cat
                  ? "bg-amber-500 text-white border-amber-500"
                  : "border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-900 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400"
              )}
            >{cat}</button>
          ))}
        </Reveal>

        {/* Grid */}
        <div className="-m-2 grid grid-cols-1 gap-4 p-2 sm:grid-cols-2 lg:max-h-[520px] lg:grid-cols-3 lg:overflow-y-auto xl:grid-cols-4">
          {isLoading
            ? Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-5 space-y-3 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <Skeleton className="h-6 w-3/4 bg-zinc-100 dark:bg-zinc-800" />
                  <Skeleton className="h-5 w-14 rounded-full bg-zinc-100 dark:bg-zinc-800" />
                </div>
                <Skeleton className="h-4 w-full bg-zinc-100 dark:bg-zinc-800" />
                <Skeleton className="h-4 w-2/3 bg-zinc-100 dark:bg-zinc-800" />
                <div className="flex items-center justify-between pt-2">
                  <Skeleton className="h-6 w-16 bg-zinc-100 dark:bg-zinc-800" />
                  <Skeleton className="h-9 w-20 rounded-xl bg-zinc-100 dark:bg-zinc-800" />
                </div>
              </div>
            ))
            : filtered.map((item, index) => {
              const inCart = cartItems.find((c) => c.id === item.id);
              return (
                <Reveal key={item.id} delay={(index % 4) * 100}>
                <div
                  onClick={() => !inCart && onSelectItem(item)}
                  className={cn(
                    "group rounded-lg border bg-white transition-all duration-300 cursor-pointer hover:-translate-y-1 dark:bg-zinc-900",
                    inCart
                      ? "border-amber-400 dark:border-amber-500 shadow-lg shadow-amber-500/10"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-zinc-700 hover:shadow-lg dark:hover:shadow-zinc-900"
                  )}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-playfair font-bold text-zinc-900 dark:text-white text-lg line-clamp-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex-1 min-w-0">
                        {item.name}
                      </h3>
                      <span className={cn(
                        "shrink-0 px-2.5 py-0.5 rounded-full text-[10px] font-jakarta font-bold uppercase tracking-wide border",
                        item.type === "Veg"
                          ? "bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30 text-green-700 dark:text-green-400"
                          : "bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400"
                      )}>
                        {item.type}
                      </span>
                    </div>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm font-jakarta line-clamp-2 mb-5 leading-relaxed">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      {item.price && (
                        <span className="font-playfair font-bold text-amber-600 dark:text-amber-400 text-lg">₹{item.price}</span>
                      )}
                      {inCart ? (
                        <span className="ml-auto flex items-center gap-1.5 text-amber-600 dark:text-amber-400 font-jakarta font-bold text-sm">
                          <CheckCircle size={15} /> In Cart
                        </span>
                      ) : (
                        <button
                          onClick={(e) => { e.stopPropagation(); addToCart(item); }}
                          className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white font-jakarta font-bold text-sm transition-all hover:scale-105 shadow-md shadow-amber-500/20"
                        >
                          <Plus size={15} /> Add
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                </Reveal>
              );
            })}
        </div>
      </div>
    </section>
  );
}
