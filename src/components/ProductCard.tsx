"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, Eye, ShoppingBag, Star } from "lucide-react";
import { discountPct, formatINR, cn } from "@/lib/utils";
import { useStore } from "@/lib/store-context";
import { useState } from "react";

export type CardProduct = {
  id: number;
  slug: string;
  name: string;
  shortDesc?: string | null;
  categorySlug: string;
  price: number;
  mrp: number;
  rating?: number | null;
  ratingCount?: number | null;
  badges?: string[] | null;
  sizes?: string[] | null;
  audience: string;
  images: { url: string; alt?: string | null }[];
};

const badgeStyle: Record<string, string> = {
  NEW: "bg-emerald-600 text-white",
  TRENDING: "bg-black text-white border border-[#ff0000]",
  BESTSELLER: "bg-[#ff0000] text-white",
  LIMITED: "bg-red-700 text-white",
};

export function Stars({ rating = 4.2, size = 12 }: { rating?: number | null; size?: number }) {
  const r = rating ?? 4.2;
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Rated ${r} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(r) ? "fill-[#ff0000] text-[#ff0000]" : "fill-neutral-200 text-neutral-200"}
        />
      ))}
    </span>
  );
}

export default function ProductCard({ p, large = false }: { p: CardProduct; large?: boolean }) {
  const { toggleWishlist, isWishlisted, addToCart, setQuickViewSlug } = useStore();
  const [hover, setHover] = useState(false);
  const wished = isWishlisted(p.id);
  const pct = discountPct(p.mrp, p.price);
  const img1 = p.images?.[0]?.url;
  const img2 = p.images?.[1]?.url;

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-neutral-100 card-lift flex flex-col"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={cn("relative overflow-hidden bg-neutral-100", large ? "aspect-[3/4]" : "aspect-[3/4]")}>
        <Link href={`/product/${p.slug}`} aria-label={p.name}>
          {img1 ? (
            <Image
              src={hover && img2 ? img2 : img1}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-opacity duration-500"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 grid place-items-center bg-gradient-to-br from-neutral-900 to-neutral-700 text-[#ffffff] font-display text-lg p-4 text-center">
              {p.name}
            </div>
          )}
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {(p.badges ?? []).slice(0, 2).map((b) => (
            <span key={b} className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide", badgeStyle[b] ?? "bg-black text-white")}>
              {b}
            </span>
          ))}
          {pct > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/95 text-red-700 shadow">{pct}% OFF</span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(p.id)}
          aria-label="Toggle wishlist"
          className={cn(
            "absolute top-2 right-2 w-9 h-9 rounded-full grid place-items-center shadow-md transition active:scale-90",
            wished ? "bg-black text-white" : "bg-white/95 text-neutral-700 hover:text-black"
          )}
        >
          <Heart size={17} className={wished ? "fill-white" : ""} />
        </button>

        {/* Hover actions */}
        <div className="absolute inset-x-2 bottom-2 flex gap-2 opacity-100 sm:opacity-0 sm:translate-y-2 sm:group-hover:opacity-100 sm:group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={() => setQuickViewSlug(p.slug)}
            className="flex-1 h-10 rounded-xl bg-white/95 backdrop-blur text-[12px] font-bold tracking-wide flex items-center justify-center gap-1.5 hover:bg-white shadow"
          >
            <Eye size={15} /> QUICK VIEW
          </button>
          <button
            onClick={() =>
              addToCart({
                productId: p.id,
                slug: p.slug,
                name: p.name,
                image: img1 ?? "",
                price: p.price,
                mrp: p.mrp,
                size: (p.sizes ?? ["M"])[1] ?? (p.sizes ?? ["M"])[0] ?? "M",
                color: "As shown",
              })
            }
            className="flex-1 h-10 rounded-xl bg-black text-[#ffffff] text-[12px] font-bold tracking-wide flex items-center justify-center gap-1.5 hover:bg-neutral-900 shadow"
            aria-label={`Add ${p.name} to cart`}
          >
            <ShoppingBag size={15} /> ADD
          </button>
        </div>
      </div>

      <div className="p-3 flex flex-col gap-1 flex-1">
        <p className="text-[10px] font-semibold tracking-[0.14em] text-[#ff0000] uppercase">{p.categorySlug.replace("men-", "").replace("kids-", "").replace(/-/g, " ")}</p>
        <Link href={`/product/${p.slug}`} className="font-semibold text-[13.5px] leading-snug clamp-2 hover:text-[#ff0000] transition">
          {p.name}
        </Link>
        {p.shortDesc && <p className="text-[11.5px] text-neutral-500 clamp-1">{p.shortDesc}</p>}
        <div className="flex items-center gap-1.5 mt-0.5">
          <Stars rating={p.rating} />
          <span className="text-[11px] text-neutral-500">({p.ratingCount ?? 0})</span>
        </div>
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="font-extrabold text-[15px]">{formatINR(p.price)}</span>
          <span className="text-[12px] text-neutral-400 line-through">{formatINR(p.mrp)}</span>
          {pct > 0 && <span className="text-[11px] font-bold text-emerald-700">{pct}% off</span>}
        </div>
        {!!p.sizes?.length && (
          <p className="text-[11px] text-neutral-500 mt-0.5">Sizes: {p.sizes.slice(0, 5).join(" · ")}{p.sizes.length > 5 ? " +" : ""}</p>
        )}
      </div>
    </div>
  );
}
