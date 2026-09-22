"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, ArrowRight, MapPin, Phone, MessageCircle,
  Navigation, BadgeCheck, Flame, Tag, Store as StoreIcon, Play, Star, Truck,
} from "lucide-react";
import ProductCard, { CardProduct } from "./ProductCard";
import Reveal from "./Reveal";
import { STORE } from "@/lib/utils";

type Banner = { id: number; title: string; subtitle: string | null; image: string | null; ctaText: string | null; ctaLink: string | null };
type Cat = { slug: string; name: string; audience: string; image: string | null; parentSlug: string | null };
type Offer = { id: number; slug: string; title: string; subtitle: string | null; priceLabel: string | null; description: string | null; image: string | null; ctaText: string | null; ctaLink: string | null; badge: string | null };
type Reel = { id: number; caption: string; thumbnail: string; productSlug: string | null; views: string | null; instagramUrl: string | null };

/* ---------- HERO ---------- */
export function Hero({ banners }: { banners: Banner[] }) {
  const [idx, setIdx] = useState(0);
  const slides = banners.length ? banners : [{ id: 0, title: "NEW SEASON. NEW STYLE.", subtitle: "Discover the latest men's fashion from Reload Jodhpur.", image: null, ctaText: "SHOP MEN", ctaLink: "/men" }];
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 5500);
    return () => clearInterval(t);
  }, [slides.length]);
  const s = slides[idx % slides.length];
  return (
    <section className="relative bg-black overflow-hidden hero-grain" aria-label="Featured">
      <div className="absolute inset-0">
        <AnimatePresence mode="popLayout">
          <motion.div key={s.id + s.title} initial={{ opacity: 0, scale: 1.06 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.9 }} className="absolute inset-0">
            {s.image ? (
              <Image src={s.image} alt={s.title} fill priority sizes="100vw" className="object-cover object-top opacity-50" />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-neutral-950 via-neutral-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-black/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="relative max-w-[1400px] mx-auto px-4 sm:px-8 min-h-[480px] sm:min-h-[560px] lg:min-h-[600px] flex items-center py-16">
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.55 }} className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.3em] text-[#ffffff] border border-[#ff0000]/50 rounded-full px-4 py-1.5 bg-black/40 backdrop-blur">
              <Flame size={13} /> MEN'S WEAR · JODHPUR
            </p>
            <h1 className="font-display font-black text-white text-[42px] sm:text-6xl lg:text-7xl leading-[1.02] mt-5">
              {s.title.split(".").filter(Boolean).map((part, i, arr) => (
                <span key={i} className="block">{part.trim()}{i < arr.length - 1 ? "." : ""}{i === 0 && <span className="gold-text">.</span>}</span>
              ))}
            </h1>
            <p className="text-neutral-300 text-[15px] sm:text-lg mt-4 max-w-xl">{s.subtitle}</p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link href="/men" className="px-8 py-4 rounded-xl gold-bg text-white font-extrabold text-[13px] tracking-[0.12em] hover:brightness-110 transition shadow-[0_10px_40px_-10px_rgba(255,0,0,0.55)]">
                SHOP MEN
              </Link>
              <Link href="/new-arrivals" className="px-8 py-4 rounded-xl border border-white/30 text-white font-extrabold text-[13px] tracking-[0.12em] hover:bg-white hover:text-black transition backdrop-blur">
                EXPLORE NEW ARRIVALS
              </Link>
            </div>
            <div className="flex items-center gap-5 mt-8 text-[12px] text-neutral-400 font-medium">
              <span className="flex items-center gap-1.5"><BadgeCheck size={15} className="text-[#ffffff]" /> Quality assured</span>
              <span className="flex items-center gap-1.5"><Truck size={15} className="text-[#ffffff]" /> COD available</span>
              <span className="flex items-center gap-1.5"><StoreIcon size={15} className="text-[#ffffff]" /> Store pickup</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      {/* dots + arrows */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} aria-label={`Slide ${i + 1}`} className={`h-1.5 rounded-full transition-all ${i === idx % slides.length ? "w-8 bg-[#ffffff]" : "w-1.5 bg-white/40"}`} />
        ))}
      </div>
      {slides.length > 1 && (
        <>
          <button onClick={() => setIdx((idx - 1 + slides.length) % slides.length)} aria-label="Previous" className="hidden sm:grid absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 backdrop-blur text-white place-items-center hover:bg-[#ff0000] hover:text-white transition"><ChevronLeft size={22} /></button>
          <button onClick={() => setIdx((idx + 1) % slides.length)} aria-label="Next" className="hidden sm:grid absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 backdrop-blur text-white place-items-center hover:bg-[#ff0000] hover:text-white transition"><ChevronRight size={22} /></button>
        </>
      )}
    </section>
  );
}

/* ---------- MARQUEE ---------- */
export function Marquee() {
  const items = ["COMBO FROM ₹999", "NEW DROPS EVERY WEEK", "EASY STORE PICKUP", "COD AVAILABLE", "TRENDING BOXY FITS", "MADHUBAN MAIN ROAD · JODHPUR"];
  return (
    <div className="bg-[#ff0000] overflow-hidden py-2.5" aria-hidden>
      <div className="flex w-max animate-marquee gap-0">
        {[0, 1].map((k) => (
          <div key={k} className="flex shrink-0">
            {items.map((t, i) => (
              <span key={i} className="flex items-center gap-3 px-6 text-[12px] font-extrabold tracking-[0.2em] text-white whitespace-nowrap">
                <Star size={12} className="fill-white text-white" /> {t}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- CATEGORY SHORTCUTS ---------- */
export function CategoryShortcuts({ categories }: { categories: Cat[] }) {
  const menSubs = categories.filter((c) => c.parentSlug === "men");
  const kidsSubs = categories.filter((c) => c.parentSlug === "kids");
  const Card = ({ c, big = false }: { c: Cat; big?: boolean }) => (
    <Link href={c.parentSlug ? `/shop?category=${c.slug}` : `/${c.slug}`} className={`group relative rounded-2xl overflow-hidden img-zoom shrink-0 ${big ? "w-[240px] sm:w-[300px] aspect-[4/5]" : "w-[150px] sm:w-[180px] aspect-[3/4]"}`}>
      {c.image ? <Image src={c.image} alt={c.name} fill sizes="300px" className="object-cover" loading="lazy" /> : <div className="absolute inset-0 bg-neutral-900" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />
      <div className="absolute bottom-0 inset-x-0 p-3 sm:p-4">
        <p className="text-white font-extrabold tracking-wide text-[13px] sm:text-base">{c.name.toUpperCase()}</p>
        <p className="text-[#ffffff] text-[11px] font-semibold flex items-center gap-1 mt-0.5">SHOP NOW <ArrowRight size={12} className="group-hover:translate-x-1 transition" /></p>
      </div>
    </Link>
  );
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <Reveal>
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-[11px] font-bold tracking-[0.25em] text-[#ff0000]">START HERE</p>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl mt-1">Shop by Category</h2>
          </div>
          <Link href="/shop" className="hidden sm:flex items-center gap-1.5 text-sm font-bold hover:text-[#ff0000]">VIEW ALL <ArrowRight size={16} /></Link>
        </div>
      </Reveal>
      <Reveal delay={100}>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
          {[categories.find((c) => c.slug === "men"), categories.find((c) => c.slug === "kids")].filter(Boolean).map((c) => (
            <Link key={c!.slug} href={`/${c!.slug}`} className="group relative rounded-2xl overflow-hidden img-zoom aspect-[16/10] sm:aspect-[21/9]">
              {c!.image ? <Image src={c!.image} alt={c!.name} fill sizes="(max-width:640px) 50vw, 700px" className="object-cover" loading="lazy" /> : <div className="absolute inset-0 bg-neutral-900" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="absolute bottom-0 p-4 sm:p-7">
                <p className="text-[#ffffff] text-[10px] sm:text-xs font-bold tracking-[0.3em]">{c!.slug === "men" ? "PRIMARY COLLECTION" : "LITTLE STARS"}</p>
                <p className="font-display font-black text-white text-3xl sm:text-5xl mt-1">{c!.name.toUpperCase()}</p>
                <span className="inline-flex items-center gap-2 mt-2 sm:mt-3 px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg bg-white text-black text-[11px] sm:text-xs font-extrabold tracking-wider group-hover:bg-[#ff0000] group-hover:text-white transition">EXPLORE <ArrowRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </Reveal>
      <p className="text-[11px] font-bold tracking-[0.25em] text-neutral-400 mb-3">MEN&apos;S ESSENTIALS</p>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {menSubs.map((c) => <Card key={c.slug} c={c} />)}
      </div>
      <p className="text-[11px] font-bold tracking-[0.25em] text-neutral-400 mb-3 mt-6">KIDS CAPSULE</p>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {kidsSubs.map((c) => <Card key={c.slug} c={c} />)}
      </div>
    </section>
  );
}

/* ---------- PRODUCT RAIL ---------- */
export function ProductRail({ title, sub, products, link, linkLabel, dark = false }: { title: string; sub?: string; products: CardProduct[]; link: string; linkLabel: string; dark?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) => ref.current?.scrollBy({ left: dir * 560, behavior: "smooth" });
  return (
    <section className={dark ? "bg-black py-12 sm:py-16" : "py-10 sm:py-14"}>
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between mb-6">
            <div>
              {dark ? <p className="text-[11px] font-bold tracking-[0.25em] text-[#ffffff] flex items-center gap-1.5"><Flame size={13} /> MOST WANTED</p>
                : <p className="text-[11px] font-bold tracking-[0.25em] text-[#ff0000]">FRESH DROPS</p>}
              <h2 className={`font-display font-extrabold text-2xl sm:text-4xl mt-1 ${dark ? "text-white" : ""}`}>{title}</h2>
              {sub && <p className={`text-sm mt-1 ${dark ? "text-neutral-400" : "text-neutral-500"}`}>{sub}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Link href={link} className={`hidden sm:inline-flex items-center gap-1.5 text-sm font-bold mr-2 ${dark ? "text-[#ffffff]" : "hover:text-[#ff0000]"}`}>{linkLabel} <ArrowRight size={16} /></Link>
              <button onClick={() => scroll(-1)} aria-label="Scroll left" className={`w-10 h-10 rounded-full grid place-items-center border transition ${dark ? "border-white/20 text-white hover:bg-[#ff0000] hover:text-white" : "border-neutral-200 hover:bg-black hover:text-white"}`}><ChevronLeft size={19} /></button>
              <button onClick={() => scroll(1)} aria-label="Scroll right" className={`w-10 h-10 rounded-full grid place-items-center border transition ${dark ? "border-white/20 text-white hover:bg-[#ff0000] hover:text-white" : "border-neutral-200 hover:bg-black hover:text-white"}`}><ChevronRight size={19} /></button>
            </div>
          </div>
        </Reveal>
        <div ref={ref} className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar snap-x pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {products.map((p) => (
            <div key={p.id} className="w-[168px] sm:w-[240px] shrink-0 snap-start">
              <ProductCard p={p} large={dark} />
            </div>
          ))}
        </div>
        <div className="sm:hidden mt-4 text-center">
          <Link href={link} className={`inline-flex items-center gap-1.5 text-[13px] font-extrabold tracking-wider px-6 py-3 rounded-xl ${dark ? "bg-[#ff0000] text-white" : "bg-black text-[#ffffff]"}`}>{linkLabel} <ArrowRight size={15} /></Link>
        </div>
      </div>
    </section>
  );
}

/* ---------- OFFERS ---------- */
export function OffersSection({ offers }: { offers: Offer[] }) {
  if (!offers.length) return null;
  return (
    <section className="bg-[#f7f7f7] py-12 sm:py-16 border-y border-[#e5e5e5]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="text-center mb-8">
            <p className="text-[11px] font-bold tracking-[0.3em] text-[#ff0000] flex items-center justify-center gap-1.5"><Tag size={13} /> SPECIAL OFFERS</p>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl mt-2">Combos Jodhpur Loves</h2>
            <p className="text-sm text-neutral-500 mt-1">Famous in-store deals, now online. Limited stock daily.</p>
          </div>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-4">
          {offers.map((o, i) => (
            <Reveal key={o.id} delay={i * 100}>
              <Link href={o.ctaLink || "/offers"} className="group relative block rounded-3xl overflow-hidden aspect-[4/5] sm:aspect-[3/4] img-zoom">
                {o.image ? <Image src={o.image} alt={o.title} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" loading="lazy" /> : <div className="absolute inset-0 bg-neutral-900" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                {o.badge && <span className="absolute top-4 left-4 text-[10px] font-extrabold tracking-[0.15em] px-3 py-1.5 rounded-full bg-[#ff0000] text-white">{o.badge}</span>}
                <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6">
                  <p className="text-[#ffffff] text-[11px] font-bold tracking-[0.25em]">{o.subtitle}</p>
                  <h3 className="font-display font-black text-white text-2xl sm:text-3xl mt-1">{o.title}</h3>
                  {o.priceLabel && <p className="text-white font-extrabold text-lg mt-1">{o.priceLabel}</p>}
                  {o.description && <p className="text-neutral-300 text-[13px] mt-1 line-clamp-2">{o.description}</p>}
                  <span className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-white text-black text-[12px] font-extrabold tracking-wider group-hover:bg-[#ff0000] group-hover:text-white transition">
                    {o.ctaText || "SHOP NOW"} <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- SHOP BY CATEGORY TILES ---------- */
export function ShopByCategory({ categories }: { categories: Cat[] }) {
  const tiles = ["men-jeans", "men-shirts", "men-tshirts", "men-trousers", "men-jackets", "men-casual", "men-combo", "kids-boys"]
    .map((s) => categories.find((c) => c.slug === s)).filter(Boolean) as Cat[];
  const labels: Record<string, string> = { "men-jeans": "JEANS", "men-shirts": "SHIRTS", "men-tshirts": "T-SHIRTS", "men-trousers": "TROUSERS", "men-jackets": "JACKETS", "men-casual": "CASUAL WEAR", "men-combo": "COMBO OFFERS", "kids-boys": "KIDS" };
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <Reveal>
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.25em] text-[#ff0000]">CURATED FOR YOU</p>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl mt-1">Shop by Category</h2>
          </div>
        </div>
      </Reveal>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {tiles.map((c, i) => (
          <Reveal key={c.slug} delay={(i % 4) * 80}>
            <Link href={`/shop?category=${c.slug}`} className="group relative block rounded-2xl overflow-hidden aspect-square img-zoom">
              {c.image ? <Image src={c.image} alt={c.name} fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover" loading="lazy" /> : <div className="absolute inset-0 bg-neutral-900" />}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-4 flex items-center justify-between">
                <span className="text-white font-extrabold tracking-wide text-sm sm:text-base">{labels[c.slug] ?? c.name.toUpperCase()}</span>
                <span className="w-9 h-9 rounded-full bg-white/15 backdrop-blur grid place-items-center text-white group-hover:bg-[#ff0000] group-hover:text-black transition"><ArrowRight size={16} /></span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- REELS ---------- */
export function ReelsSection({ reels }: { reels: Reel[] }) {
  if (!reels.length) return null;
  return (
    <section className="bg-black py-12 sm:py-16 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[11px] font-bold tracking-[0.25em] text-[#ffffff]">FOLLOW THE HYPE</p>
              <h2 className="font-display font-extrabold text-2xl sm:text-4xl mt-1 text-white">As Seen on Instagram</h2>
              <p className="text-sm text-neutral-400 mt-1">@reloadjodhpur__0072 · Reels, drops & store videos</p>
            </div>
            <a href={STORE.instagram} target="_blank" rel="noreferrer" className="hidden sm:inline-flex items-center gap-2 px-6 py-3 rounded-xl gold-bg text-white text-[12px] font-extrabold tracking-wider">FOLLOW US <ArrowRight size={15} /></a>
          </div>
        </Reveal>
        <div className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {reels.map((r, i) => (
            <Reveal key={r.id} delay={i * 60}>
              <div className="relative w-[168px] sm:w-[210px] aspect-[9/16] rounded-2xl overflow-hidden shrink-0 group border border-white/10">
                <Image src={r.thumbnail} alt={r.caption} fill sizes="220px" className="object-cover group-hover:scale-105 transition duration-700" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/30" />
                <span className="absolute top-3 left-3 flex items-center gap-1 text-[10px] font-bold text-white bg-black/50 backdrop-blur px-2 py-1 rounded-full"><Play size={10} className="fill-white" /> {r.views ?? "10K"}</span>
                <div className="absolute bottom-0 inset-x-0 p-3">
                  <p className="text-white text-[12px] font-medium leading-snug line-clamp-2">{r.caption}</p>
                  {r.productSlug ? (
                    <Link href={`/product/${r.productSlug}`} className="mt-2 flex items-center justify-center gap-1 w-full py-2 rounded-lg bg-white text-black text-[10.5px] font-extrabold tracking-wider hover:bg-[#ff0000] transition">SHOP THIS LOOK</Link>
                  ) : r.instagramUrl ? (
                    <a href={r.instagramUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-center justify-center gap-1 w-full py-2 rounded-lg bg-white text-black text-[10.5px] font-extrabold tracking-wider">WATCH REEL</a>
                  ) : null}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- WHY SHOP ---------- */
export function WhyShop() {
  const items = [
    { icon: <BadgeCheck size={26} />, t: "QUALITY PRODUCTS", s: "Handpicked fabrics, checked stitching" },
    { icon: <Flame size={26} />, t: "TRENDING STYLES", s: "New drops inspired by Instagram trends" },
    { icon: <Tag size={26} />, t: "SPECIAL OFFERS", s: "Combos from ₹999, honest pricing" },
    { icon: <StoreIcon size={26} />, t: "LOCAL STORE PICKUP", s: "Saraswati Nagar · easy exchange" },
  ];
  return (
    <section className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <Reveal>
        <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-center">Why Shop Reload Jodhpur</h2>
      </Reveal>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-7">
        {items.map((x, i) => (
          <Reveal key={x.t} delay={i * 80}>
            <div className="h-full rounded-2xl border border-neutral-200 bg-white p-5 sm:p-7 text-center hover:border-[#ff0000] hover:shadow-[0_16px_40px_-20px_rgba(255,0,0,0.35)] transition">
              <span className="inline-grid place-items-center w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-black text-[#ffffff] p-3.5">{x.icon}</span>
              <p className="font-extrabold text-[12px] sm:text-sm tracking-wider mt-3">{x.t}</p>
              <p className="text-[12px] sm:text-[13px] text-neutral-500 mt-1">{x.s}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ---------- STORE LOCATION ---------- */
export function StoreLocation() {
  return (
    <section className="bg-[#f7f7f7] border-t border-[#e5e5e5]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16 grid lg:grid-cols-2 gap-8 items-center">
        <Reveal>
          <div>
            <p className="text-[11px] font-bold tracking-[0.3em] text-[#ff0000] flex items-center gap-1.5"><MapPin size={13} /> VISIT OUR STORE</p>
            <h2 className="font-display font-black text-3xl sm:text-5xl mt-2 leading-tight">RELOAD<br />JODHPUR</h2>
            <p className="text-neutral-600 mt-4 leading-relaxed text-[14px] sm:text-[15px]">
              {STORE.address1}<br />{STORE.address2}<br />{STORE.city}
            </p>
            <p className="text-[13px] text-neutral-500 mt-2">Open {STORE.hours}</p>
            <div className="grid grid-cols-2 gap-2.5 mt-6 max-w-md">
              <Link href="/store" className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-black text-[#ffffff] text-[12px] font-extrabold tracking-wider"><StoreIcon size={15} /> VISIT STORE</Link>
              <a href={STORE.mapsUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3.5 rounded-xl border-2 border-black text-[12px] font-extrabold tracking-wider"><Navigation size={15} /> DIRECTIONS</a>
              <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] text-white text-[12px] font-extrabold tracking-wider"><MessageCircle size={15} /> WHATSAPP</a>
              <a href={`tel:${STORE.phoneRaw}`} className="flex items-center justify-center gap-2 py-3.5 rounded-xl gold-bg text-white text-[12px] font-extrabold tracking-wider"><Phone size={15} /> CALL NOW</a>
            </div>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="relative rounded-3xl overflow-hidden border border-[#e5e5e5] bg-white shadow-xl">
            <iframe
              title="Reload Jodhpur store map"
              src="https://www.google.com/maps?q=Opp.+Manu+Computer+C+Sector+Saraswati+Nagar+Madhuban+Main+Road+Jodhpur+Rajasthan&output=embed"
              className="w-full h-[320px] sm:h-[420px] border-0"
              loading="lazy"
            />
            <div className="absolute bottom-4 left-4 right-4 sm:right-auto bg-black/90 backdrop-blur rounded-2xl p-4 flex items-center gap-3">
              <span className="w-10 h-10 rounded-full gold-bg grid place-items-center shrink-0"><MapPin size={18} className="text-black" /></span>
              <div>
                <p className="text-white font-bold text-[13px]">Saraswati Nagar, Sector 2 Market</p>
                <p className="text-neutral-400 text-[12px]">Madhuban Main Road · Jodhpur</p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
