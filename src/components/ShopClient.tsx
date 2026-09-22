"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, ArrowUpDown, X, ChevronDown, Search } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import ProductCard, { CardProduct } from "./ProductCard";
import { SIZES_KIDS, SIZES_MEN } from "@/lib/utils";

const SORTS = [
  { v: "relevance", l: "Relevance" },
  { v: "newest", l: "Newest" },
  { v: "price-asc", l: "Price: Low to High" },
  { v: "price-desc", l: "Price: High to Low" },
  { v: "rating", l: "Bestselling" },
  { v: "discount", l: "Discount" },
];

const CATS_MEN = [
  { slug: "men-jeans", name: "Jeans" },
  { slug: "men-shirts", name: "Shirts" },
  { slug: "men-tshirts", name: "T-Shirts" },
  { slug: "men-trousers", name: "Trousers" },
  { slug: "men-jackets", name: "Jackets" },
  { slug: "men-casual", name: "Casual Wear" },
  { slug: "men-combo", name: "Combo Offers" },
];
const CATS_KIDS = [
  { slug: "kids-boys", name: "Boys" },
  { slug: "kids-girls", name: "Girls" },
  { slug: "kids-topwear", name: "Kids Topwear" },
  { slug: "kids-bottomwear", name: "Kids Bottomwear" },
];
const FITS = ["Slim Fit", "Regular Fit", "Loose Fit", "Boxy Fit", "Oversized", "Straight Fit"];
const COLORS = ["Black", "White", "Blue", "Green", "Red", "Orange", "Beige", "Grey", "Brown", "Multi"];

export default function ShopClient({
  title, subtitle, audience, fixedCategory, flag, query,
}: {
  title: string; subtitle?: string;
  audience?: string; fixedCategory?: string; flag?: string; query?: string;
}) {
  const sp = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);

  const [category, setCategory] = useState(fixedCategory ?? sp.get("category") ?? "");
  const [sort, setSort] = useState("relevance");
  const [sizes, setSizes] = useState<string[]>([]);
  const [fits, setFits] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(2500);
  const [minDiscount, setMinDiscount] = useState(0);
  const [search, setSearch] = useState(query ?? "");

  useEffect(() => {
    const c = sp.get("category");
    if (c && !fixedCategory) setCategory(c);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const activeQuery = query?.trim() ? query : search;
    const params = new URLSearchParams();
    if (activeQuery.trim()) params.set("q", activeQuery.trim());
    if (category) params.set("category", category);
    if (audience) params.set("audience", audience);
    if (flag) params.set("flag", flag);
    params.set("sort", sort);
    params.set("limit", "60");
    if (maxPrice < 2500) params.set("maxPrice", String(maxPrice));
    if (sizes[0]) params.set("size", sizes[0]);
    if (fits[0]) params.set("fit", fits[0]);
    if (colors[0]) params.set("color", colors[0]);
    if (minDiscount) params.set("minDiscount", String(minDiscount));
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/products?${params.toString()}`, { signal: controller.signal });
        const j = await r.json();
        let list: CardProduct[] = j.products ?? [];
        // multi-select refinements client-side
        if (sizes.length > 1) list = list.filter((p) => p.sizes?.some((s) => sizes.includes(s)));
        if (fits.length > 1) list = list.filter((p) => (p as unknown as { fits?: string[] }).fits?.some((f) => fits.includes(f)));
        if (colors.length > 1) list = list.filter((p) => (p as unknown as { colors?: string[] }).colors?.some((c) => colors.some((x) => c.toLowerCase().includes(x.toLowerCase()))));
        setProducts(list);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setProducts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [category, audience, flag, sort, maxPrice, minDiscount, sizes, fits, colors, query, search]);

  const toggle = (arr: string[], v: string, set: (x: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const activeCount = sizes.length + fits.length + colors.length + (category ? 1 : 0) + (minDiscount ? 1 : 0) + (maxPrice < 2500 ? 1 : 0);
  const sizeOptions = audience === "kids" ? SIZES_KIDS : [...SIZES_MEN, "28", "30", "32", "34", "36"];

  const cats = useMemo(() => {
    if (audience === "kids") return CATS_KIDS;
    if (audience === "men") return CATS_MEN;
    return [...CATS_MEN, ...CATS_KIDS];
  }, [audience]);

  const FilterBody = (
    <div className="space-y-6">
      {!fixedCategory && (
        <div>
          <p className="text-[11px] font-extrabold tracking-[0.2em] text-neutral-500 mb-3">CATEGORY</p>
          <div className="space-y-1">
            <button onClick={() => setCategory("")} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${!category ? "bg-black text-[#ffffff]" : "hover:bg-neutral-100"}`}>All</button>
            {cats.map((c) => (
              <button key={c.slug} onClick={() => setCategory(category === c.slug ? "" : c.slug)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold ${category === c.slug ? "bg-black text-[#ffffff]" : "hover:bg-neutral-100"}`}>{c.name}</button>
            ))}
          </div>
        </div>
      )}
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.2em] text-neutral-500 mb-3">SIZE</p>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((s) => (
            <button key={s} onClick={() => toggle(sizes, s, setSizes)} className={`min-w-[44px] h-9 px-2.5 rounded-lg border text-[13px] font-bold ${sizes.includes(s) ? "border-black bg-black text-[#ffffff]" : "border-neutral-200"}`}>{s}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.2em] text-neutral-500 mb-3">FIT</p>
        <div className="flex flex-wrap gap-2">
          {FITS.map((f) => (
            <button key={f} onClick={() => toggle(fits, f, setFits)} className={`px-3.5 h-9 rounded-full border text-[13px] font-semibold ${fits.includes(f) ? "border-black bg-black text-white" : "border-neutral-200"}`}>{f}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.2em] text-neutral-500 mb-3">COLOUR</p>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button key={c} onClick={() => toggle(colors, c, setColors)} className={`px-3.5 h-9 rounded-full border text-[13px] font-semibold ${colors.includes(c) ? "border-black bg-black text-white" : "border-neutral-200"}`}>{c}</button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.2em] text-neutral-500 mb-2">MAX PRICE: <span className="text-black">₹{maxPrice}</span></p>
        <input type="range" min={299} max={2500} step={50} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-black" />
      </div>
      <div>
        <p className="text-[11px] font-extrabold tracking-[0.2em] text-neutral-500 mb-3">DISCOUNT</p>
        <div className="flex flex-wrap gap-2">
          {[0, 20, 30, 40, 50].map((d) => (
            <button key={d} onClick={() => setMinDiscount(d)} className={`px-3.5 h-9 rounded-full border text-[13px] font-semibold ${minDiscount === d ? "border-black bg-black text-white" : "border-neutral-200"}`}>{d === 0 ? "All" : `${d}%+`}</button>
          ))}
        </div>
      </div>
      {activeCount > 0 && (
        <button onClick={() => { setSizes([]); setFits([]); setColors([]); setCategory(fixedCategory ?? ""); setMinDiscount(0); setMaxPrice(2500); }} className="w-full py-3 rounded-xl border-2 border-black text-[12px] font-extrabold tracking-wider">CLEAR ALL FILTERS</button>
      )}
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Breadcrumb */}
      <nav className="text-[12px] text-neutral-500 mb-3" aria-label="Breadcrumb">
        <span className="hover:text-black cursor-pointer" onClick={() => router.push("/")}>Home</span>
        <span className="mx-1.5">/</span>
        <span className="font-bold text-black">{title}</span>
      </nav>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl">{title}</h1>
          {subtitle && <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>}
          <p className="text-[12px] text-neutral-400 mt-1">{loading ? "Loading…" : `${products.length} styles`}</p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          <span className="text-[12px] font-bold text-neutral-500">SORT:</span>
          <div className="relative">
            <button onClick={() => setSortOpen(!sortOpen)} className="flex items-center gap-2 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-bold">
              {SORTS.find((s) => s.v === sort)?.l} <ChevronDown size={15} />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-12 w-56 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden z-20">
                {SORTS.map((s) => (
                  <button key={s.v} onClick={() => { setSort(s.v); setSortOpen(false); }} className={`w-full text-left px-4 py-3 text-sm font-semibold hover:bg-neutral-50 ${sort === s.v ? "bg-neutral-900 text-[#ffffff]" : ""}`}>{s.l}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-8 mt-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-[240px] shrink-0">
          <div className="sticky top-32 border border-neutral-200 rounded-2xl p-5 max-h-[calc(100vh-160px)] overflow-y-auto">
            <p className="font-extrabold tracking-wide text-sm mb-5 flex items-center gap-2"><SlidersHorizontal size={16} /> FILTERS</p>
            {FilterBody}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 min-w-0">
          {!query && (
            <div className="md:hidden flex items-center gap-2 bg-neutral-100 rounded-xl px-3.5 py-2.5 mb-4">
              <Search size={16} className="text-neutral-400" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search in this collection…" className="bg-transparent text-sm flex-1 border-0 shadow-none" />
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="rounded-2xl overflow-hidden border border-neutral-100">
                  <div className="aspect-[3/4] bg-neutral-100 animate-pulse" />
                  <div className="p-3 space-y-2"><div className="h-3 bg-neutral-100 rounded animate-pulse" /><div className="h-3 w-2/3 bg-neutral-100 rounded animate-pulse" /></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display font-bold text-2xl">No styles found</p>
              <p className="text-sm text-neutral-500 mt-2">Try clearing filters or searching something else.</p>
              <button onClick={() => { setSizes([]); setFits([]); setColors([]); setCategory(""); setSearch(""); setMinDiscount(0); setMaxPrice(2500); }} className="mt-5 px-8 py-3 rounded-xl bg-black text-[#ffffff] text-sm font-bold">CLEAR FILTERS</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {products.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </div>
      </div>

      {/* Mobile filter + sort bar */}
      <div className="md:hidden fixed bottom-[60px] inset-x-0 z-30 px-4 pb-3">
        <div className="grid grid-cols-2 gap-2 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] border border-neutral-200 p-2">
          <button onClick={() => setFiltersOpen(true)} className="flex items-center justify-center gap-2 py-3 rounded-xl bg-black text-white text-[13px] font-extrabold tracking-wide">
            <SlidersHorizontal size={16} /> FILTER {activeCount > 0 && <span className="w-5 h-5 rounded-full bg-[#ff0000] text-black text-[10px] grid place-items-center">{activeCount}</span>}
          </button>
          <button onClick={() => setSortOpen(true)} className="flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black text-[13px] font-extrabold tracking-wide">
            <ArrowUpDown size={16} /> SORT
          </button>
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60" onClick={() => setFiltersOpen(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }} className="absolute bottom-0 inset-x-0 max-h-[88vh] bg-white rounded-t-3xl flex flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-neutral-100">
                <p className="font-extrabold tracking-wide">FILTERS {activeCount > 0 && <span className="text-[#ff0000]">({activeCount})</span>}</p>
                <button onClick={() => setFiltersOpen(false)} className="w-9 h-9 grid place-items-center rounded-full bg-neutral-100" aria-label="Close"><X size={18} /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">{FilterBody}</div>
              <div className="p-4 border-t border-neutral-100">
                <button onClick={() => setFiltersOpen(false)} className="w-full py-4 rounded-xl bg-black text-[#ffffff] font-extrabold text-sm tracking-wider">SHOW {products.length} STYLES</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        {sortOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="md:hidden fixed inset-0 z-[70] bg-black/60" onClick={() => setSortOpen(false)}>
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="absolute bottom-0 inset-x-0 bg-white rounded-t-3xl p-4" onClick={(e) => e.stopPropagation()}>
              <p className="font-extrabold tracking-wide mb-3">SORT BY</p>
              {SORTS.map((s) => (
                <button key={s.v} onClick={() => { setSort(s.v); setSortOpen(false); }} className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-bold ${sort === s.v ? "bg-black text-[#ffffff]" : "hover:bg-neutral-100"}`}>{s.l}</button>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
