import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { ArrowRight, BadgePercent } from "lucide-react";
import { getActiveOffers, getProductsWithImages } from "@/lib/db-helpers";
import ProductCard from "@/components/ProductCard";

export const metadata = { title: "Offers & Combos", description: "Combo deals from ₹999, special ₹1149 combo & limited-time offers." };
export const revalidate = 60;

export default async function OffersPage() {
  let offers: Awaited<ReturnType<typeof getActiveOffers>> = [];
  let all: Awaited<ReturnType<typeof getProductsWithImages>> = [];
  try {
    [offers, all] = await Promise.all([getActiveOffers(), getProductsWithImages(60)]);
  } catch {}
  const combos = all.filter((p) => p.categorySlug === "men-combo");
  const deals = all.filter((p) => p.mrp > p.price && (p.mrp - p.price) / p.mrp >= 0.4).slice(0, 8);

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center">
        <p className="text-[11px] font-bold tracking-[0.3em] text-[#ff0000] flex items-center justify-center gap-1.5"><BadgePercent size={14} /> LIMITED TIME</p>
        <h1 className="font-display font-black text-3xl sm:text-5xl mt-2">Offers & Combos</h1>
        <p className="text-sm text-neutral-500 mt-2">Jodhpur&apos;s favourite deals — honest prices, premium styles.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mt-8">
        {offers.map((o) => (
          <Link key={o.id} href={o.ctaLink || "/shop"} className="group relative block rounded-3xl overflow-hidden aspect-[4/5] img-zoom">
            {o.image ? <Image src={o.image} alt={o.title} fill sizes="(max-width:640px)100vw,33vw" className="object-cover" /> : <div className="absolute inset-0 bg-neutral-900" />}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            {o.badge && <span className="absolute top-4 left-4 text-[10px] font-extrabold tracking-[0.15em] px-3 py-1.5 rounded-full bg-[#ff0000] text-black">{o.badge}</span>}
            <div className="absolute bottom-0 p-6">
              <p className="text-[#ffffff] text-[11px] font-bold tracking-[0.25em]">{o.subtitle}</p>
              <h3 className="font-display font-black text-white text-3xl mt-1">{o.title}</h3>
              {o.priceLabel && <p className="text-white font-extrabold text-xl mt-1">{o.priceLabel}</p>}
              <span className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-white text-black text-[12px] font-extrabold group-hover:bg-[#ff0000] transition">{o.ctaText || "SHOP NOW"} <ArrowRight size={14} /></span>
            </div>
          </Link>
        ))}
      </div>

      {combos.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl">Combo Bestsellers</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
            {combos.map((p) => (
              <ProductCard key={p.id} p={{ id: p.id, slug: p.slug, name: p.name, shortDesc: p.shortDesc, categorySlug: p.categorySlug, price: p.price, mrp: p.mrp, rating: p.rating, ratingCount: p.ratingCount, badges: p.badges, sizes: p.sizes, audience: p.audience, images: p.images }} />
            ))}
          </div>
        </div>
      )}

      {deals.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display font-extrabold text-2xl sm:text-3xl">40%+ OFF Steals</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
            {deals.map((p) => (
              <ProductCard key={p.id} p={{ id: p.id, slug: p.slug, name: p.name, shortDesc: p.shortDesc, categorySlug: p.categorySlug, price: p.price, mrp: p.mrp, rating: p.rating, ratingCount: p.ratingCount, badges: p.badges, sizes: p.sizes, audience: p.audience, images: p.images }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
