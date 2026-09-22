"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X, Heart, ShoppingBag } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR, discountPct, SIZES_MEN } from "@/lib/utils";
import { Stars } from "./ProductCard";

type QV = {
  id: number; slug: string; name: string; price: number; mrp: number;
  rating: number; ratingCount: number; sizes: string[]; colors: string[];
  images: { url: string }[];
};

export default function QuickView() {
  const { quickViewSlug, setQuickViewSlug, addToCart, toggleWishlist, isWishlisted } = useStore();
  const [p, setP] = useState<QV | null>(null);
  const [size, setSize] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!quickViewSlug) return;
    setLoading(true);
    fetch(`/api/products?slug=${quickViewSlug}`)
      .then((r) => r.json())
      .then((j) => {
        const prod = j.products?.[0];
        setP(prod ?? null);
        if (prod?.sizes?.length) setSize(prod.sizes[Math.min(1, prod.sizes.length - 1)]);
      })
      .catch(() => setP(null))
      .finally(() => setLoading(false));
  }, [quickViewSlug]);

  return (
    <AnimatePresence>
      {quickViewSlug && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm grid place-items-center p-4" onClick={() => setQuickViewSlug(null)}>
          <motion.div
            initial={{ scale: 0.92, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.92, y: 24 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="bg-white rounded-3xl w-full max-w-3xl max-h-[92vh] overflow-y-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setQuickViewSlug(null)} className="absolute top-3 right-3 z-10 w-9 h-9 grid place-items-center rounded-full bg-black text-white" aria-label="Close">
              <X size={18} />
            </button>
            {loading || !p ? (
              <div className="p-16 text-center text-sm text-neutral-500">Loading preview…</div>
            ) : (
              <div className="grid sm:grid-cols-2">
                <div className="relative aspect-[3/4] bg-neutral-100 sm:rounded-l-3xl overflow-hidden">
                  {p.images?.[0]?.url && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />}
                  {discountPct(p.mrp, p.price) > 0 && (
                    <span className="absolute top-3 left-3 text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#ff0000] text-black">{discountPct(p.mrp, p.price)}% OFF</span>
                  )}
                </div>
                <div className="p-6 sm:p-8 flex flex-col">
                  <h3 className="font-display font-bold text-xl leading-tight">{p.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Stars rating={p.rating} size={14} />
                    <span className="text-xs text-neutral-500">({p.ratingCount} reviews)</span>
                  </div>
                  <div className="flex items-baseline gap-2 mt-3">
                    <span className="text-2xl font-extrabold">{formatINR(p.price)}</span>
                    <span className="text-neutral-400 line-through">{formatINR(p.mrp)}</span>
                  </div>
                  <p className="text-[11px] font-bold tracking-[0.18em] text-neutral-500 mt-5 mb-2">SELECT SIZE</p>
                  <div className="flex flex-wrap gap-2">
                    {(p.sizes?.length ? p.sizes : SIZES_MEN.slice(1, 6)).map((s) => (
                      <button key={s} onClick={() => setSize(s)} className={`min-w-[46px] h-10 px-3 rounded-lg border text-sm font-bold transition ${size === s ? "border-black bg-black text-[#ffffff]" : "border-neutral-200 hover:border-black"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={() => toggleWishlist(p.id)}
                      className={`w-12 h-12 shrink-0 grid place-items-center rounded-xl border-2 ${isWishlisted(p.id) ? "border-black bg-black text-[#ffffff]" : "border-neutral-200"}`}
                      aria-label="Wishlist"
                    >
                      <Heart size={19} className={isWishlisted(p.id) ? "fill-[#ffffff]" : ""} />
                    </button>
                    <button
                      onClick={() => {
                        addToCart({ productId: p.id, slug: p.slug, name: p.name, image: p.images?.[0]?.url ?? "", price: p.price, mrp: p.mrp, size: size || "M", color: p.colors?.[0] ?? "As shown" });
                        setQuickViewSlug(null);
                      }}
                      className="flex-1 h-12 rounded-xl bg-black text-[#ffffff] font-bold text-sm tracking-wide flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={18} /> ADD TO BAG
                    </button>
                  </div>
                  <Link href={`/product/${p.slug}`} onClick={() => setQuickViewSlug(null)} className="mt-3 text-center text-[13px] font-bold text-[#ff0000] underline underline-offset-4">
                    View full details
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
