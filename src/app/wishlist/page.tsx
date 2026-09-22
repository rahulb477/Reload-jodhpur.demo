"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useStore } from "@/lib/store-context";
import ProductCard, { CardProduct } from "@/components/ProductCard";

export default function WishlistPage() {
  const { wishlist, user } = useStore();
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const loadWishlist = async () => {
      if (!wishlist.length) {
        setProducts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const r = await fetch("/api/products?limit=100");
        const j = await r.json();
        if (!cancelled) {
          const all: CardProduct[] = j.products ?? [];
          setProducts(all.filter((p) => wishlist.includes(p.id)));
        }
      } catch {
        if (!cancelled) setProducts([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void loadWishlist();
    return () => { cancelled = true; };
  }, [wishlist]);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl flex items-center gap-2.5">
        <Heart size={26} className="fill-[#ff0000] text-[#ff0000]" /> Wishlist
      </h1>
      <p className="text-sm text-neutral-500 mt-1">
        {user ? `Saved to your account (${wishlist.length})` : "Saved on this device — login to sync across devices."}
        {!user && <Link href="/auth" className="ml-2 font-bold text-[#ff0000] underline">Login</Link>}
      </p>
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="aspect-[3/4] bg-neutral-100 rounded-2xl animate-pulse" />)}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto rounded-full bg-neutral-100 grid place-items-center"><Heart size={30} className="text-neutral-300" /></div>
          <p className="font-display font-bold text-2xl mt-5">Nothing saved yet</p>
          <p className="text-sm text-neutral-500 mt-1">Tap the heart on any style to save it here.</p>
          <Link href="/trending" className="inline-block mt-5 px-8 py-3.5 rounded-xl bg-black text-[#ffffff] font-extrabold text-[13px]">EXPLORE TRENDING</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">
          {products.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}
