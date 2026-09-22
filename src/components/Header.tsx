"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search, Heart, ShoppingBag, User, Menu, X, ChevronRight, Minus, Plus, Trash2, ArrowRight, Truck, Store as StoreIcon, Phone,
} from "lucide-react";
import Logo from "./Logo";
import { useStore } from "@/lib/store-context";
import { formatINR, cn } from "@/lib/utils";

const NAV = [
  { label: "MEN", href: "/men", highlight: false },
  { label: "KIDS", href: "/kids", highlight: false },
  { label: "NEW ARRIVALS", href: "/new-arrivals", highlight: false },
  { label: "TRENDING", href: "/trending", highlight: false },
  { label: "OFFERS", href: "/offers", highlight: true },
];

const SUGGESTIONS = ["black jeans", "oversized shirt", "boxy fit", "combo", "biker jacket", "party shirt", "loose fit", "kids set"];

export default function Header() {
  const {
    cart, cartCount, cartSubtotal, cartMrp, updateQty, removeFromCart,
    wishlist, user, cartOpen, setCartOpen, searchOpen, setSearchOpen, menuOpen, setMenuOpen,
  } = useStore();
  const [stuck, setStuck] = useState(false);
  const [q, setQ] = useState("");
  const [live, setLive] = useState<{ slug: string; name: string; price: number; image: string }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = cartOpen || searchOpen || menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen, searchOpen, menuOpen]);

  const doSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(term.trim())}`);
  }, [router, setSearchOpen]);

  useEffect(() => {
    if (!q.trim() || !searchOpen) return;
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/products?q=${encodeURIComponent(q)}&limit=6`);
        const j = await r.json();
        setLive((j.products ?? []).map((p: { slug: string; name: string; price: number; images: { url: string }[] }) => ({
          slug: p.slug, name: p.name, price: p.price, image: p.images?.[0]?.url ?? "",
        })));
      } catch { setLive([]); }
    }, 220);
    return () => clearTimeout(t);
  }, [q, searchOpen]);

  const savings = cartMrp - cartSubtotal;

  return (
    <>
      {/* Announcement */}
      <div className="bg-black text-center py-2 px-3 relative z-[60]">
        <p className="text-[10.5px] sm:text-[11.5px] font-semibold tracking-[0.18em] text-[#ffffff]">
          RELOAD JODHPUR <span className="mx-1.5 text-neutral-500">•</span> YOUR SEARCH END HERE <span className="mx-1.5 text-neutral-500">•</span> MEN'S WEAR
        </p>
      </div>

      {/* Main header */}
      <header className={cn("sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b transition-shadow", stuck ? "shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] border-neutral-200" : "border-neutral-100")}>
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6">
          <div className="flex items-center gap-2 sm:gap-6 h-[62px] sm:h-[72px]">
            {/* Mobile hamburger */}
            <button className="lg:hidden w-10 h-10 grid place-items-center -ml-1" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>

            <Logo />

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-7 ml-4" aria-label="Primary">
              {NAV.map((n) => (
                <Link
                  key={n.label}
                  href={n.href}
                  className={cn(
                    "relative text-[13px] font-bold tracking-[0.1em] py-2 transition hover:text-[#ff0000]",
                    n.highlight ? "text-[#ff0000]" : "text-neutral-900"
                  )}
                >
                  {n.label}
                  {n.highlight && <span className="absolute -top-0.5 -right-4 text-[8px] bg-red-600 text-white px-1 rounded font-extrabold">HOT</span>}
                </Link>
              ))}
            </nav>

            <div className="flex-1" />

            {/* Desktop search pill */}
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden md:flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200/70 transition rounded-full pl-4 pr-5 py-2.5 text-sm text-neutral-500 w-[210px] xl:w-[260px]"
            >
              <Search size={17} /> <span className="truncate">Search jeans, shirts…</span>
            </button>

            {/* Icons */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button onClick={() => setSearchOpen(true)} className="md:hidden w-10 h-10 grid place-items-center" aria-label="Search">
                <Search size={21} />
              </button>
              <Link href={user ? "/account" : "/auth"} className="w-10 h-10 grid place-items-center relative" aria-label="Account">
                <User size={21} />
                {user && <span className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />}
              </Link>
              <Link href="/wishlist" className="w-10 h-10 grid place-items-center relative" aria-label="Wishlist">
                <Heart size={21} />
                {wishlist.length > 0 && (
                  <span className="absolute top-0.5 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-black text-[#ffffff] text-[10px] font-bold grid place-items-center">
                    {wishlist.length}
                  </span>
                )}
              </Link>
              <button onClick={() => setCartOpen(true)} className="w-10 h-10 grid place-items-center relative" aria-label="Cart">
                <ShoppingBag size={21} />
                {cartCount > 0 && (
                  <span className="absolute top-0.5 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-[#ff0000] text-white text-[10px] font-extrabold grid place-items-center">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile category strip */}
        <nav className="lg:hidden border-t border-neutral-100 overflow-x-auto no-scrollbar" aria-label="Categories">
          <div className="flex gap-6 px-4 py-2.5 w-max">
            {NAV.map((n) => (
              <Link key={n.label} href={n.href} className={cn("text-[12px] font-bold tracking-wider whitespace-nowrap", n.highlight ? "text-[#ff0000]" : "text-neutral-800")}>
                {n.label}
              </Link>
            ))}
            <Link href="/store" className="text-[12px] font-bold tracking-wider text-neutral-800 whitespace-nowrap">STORE</Link>
          </div>
        </nav>
      </header>

      {/* ===== SEARCH DRAWER ===== */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
            <motion.div
              initial={{ y: "-100%" }} animate={{ y: 0 }} exit={{ y: "-100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-white rounded-b-3xl max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
                <div className="flex items-center gap-3">
                  <div className="flex-1 flex items-center gap-3 bg-neutral-100 rounded-2xl px-4 py-3.5">
                    <Search size={20} className="text-neutral-500 shrink-0" />
                    <input
                      autoFocus
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && doSearch(q)}
                      placeholder="Search black jeans, boxy fit, combo…"
                      className="bg-transparent flex-1 text-[15px] border-0 shadow-none"
                    />
                    {q && <button onClick={() => setQ("")} aria-label="Clear"><X size={18} className="text-neutral-400" /></button>}
                  </div>
                  <button onClick={() => setSearchOpen(false)} className="w-11 h-11 grid place-items-center rounded-full bg-black text-white" aria-label="Close search">
                    <X size={20} />
                  </button>
                </div>

                {q.trim() && live.length > 0 ? (
                  <div className="mt-4 divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
                    {live.map((p) => (
                      <button key={p.slug} onClick={() => { setSearchOpen(false); router.push(`/product/${p.slug}`); }} className="w-full flex items-center gap-3 p-3 hover:bg-neutral-50 text-left">
                        <span className="w-12 h-14 rounded-lg overflow-hidden bg-neutral-100 relative shrink-0">
                          {p.image && <Image src={p.image} alt={p.name} fill className="object-cover" />}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm font-semibold truncate">{p.name}</span>
                          <span className="text-sm font-bold text-[#ff0000]">{formatINR(p.price)}</span>
                        </span>
                        <ArrowRight size={18} className="text-neutral-300" />
                      </button>
                    ))}
                    <button onClick={() => doSearch(q)} className="w-full p-3.5 bg-black text-[#ffffff] text-sm font-bold tracking-wide">
                      VIEW ALL RESULTS FOR “{q.toUpperCase()}”
                    </button>
                  </div>
                ) : (
                  <div className="mt-6">
                    <p className="text-[11px] font-bold tracking-[0.2em] text-neutral-400 mb-3">POPULAR SEARCHES</p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTIONS.map((s) => (
                        <button key={s} onClick={() => doSearch(s)} className="px-4 py-2 rounded-full border border-neutral-200 text-sm font-medium hover:border-[#ff0000] hover:text-[#ff0000] transition">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== MOBILE MENU ===== */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60" onClick={() => setMenuOpen(false)}>
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="absolute left-0 top-0 bottom-0 w-[86%] max-w-[360px] bg-white flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-black p-5 flex items-center justify-between">
                <Logo light compact />
                <button onClick={() => setMenuOpen(false)} className="w-9 h-9 grid place-items-center rounded-full bg-white/10 text-white" aria-label="Close menu">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {[
                  { label: "MEN", href: "/men", sub: "Jeans · Shirts · Tees · Jackets" },
                  { label: "KIDS", href: "/kids", sub: "Boys · Girls · Topwear" },
                  { label: "NEW ARRIVALS", href: "/new-arrivals", sub: "Fresh drops weekly" },
                  { label: "TRENDING NOW", href: "/trending", sub: "Most-loved styles" },
                  { label: "OFFERS & COMBOS", href: "/offers", sub: "From ₹999", hot: true },
                ].map((l) => (
                  <Link key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="flex items-center justify-between py-4 border-b border-neutral-100 group">
                    <span>
                      <span className={cn("block font-extrabold tracking-wide text-[15px]", l.hot ? "text-[#ff0000]" : "")}>{l.label} {l.hot && <span className="ml-1 text-[9px] bg-red-600 text-white px-1.5 py-0.5 rounded">HOT</span>}</span>
                      <span className="text-xs text-neutral-500">{l.sub}</span>
                    </span>
                    <ChevronRight size={18} className="text-neutral-300 group-active:translate-x-1 transition" />
                  </Link>
                ))}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <Link href="/account" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-xl bg-neutral-100 text-sm font-semibold"><User size={16} /> Account</Link>
                  <Link href="/wishlist" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-xl bg-neutral-100 text-sm font-semibold"><Heart size={16} /> Wishlist</Link>
                  <Link href="/store" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 p-3 rounded-xl bg-neutral-100 text-sm font-semibold"><StoreIcon size={16} /> Visit Store</Link>
                  <a href="tel:+917262026149" className="flex items-center gap-2 p-3 rounded-xl bg-neutral-100 text-sm font-semibold"><Phone size={16} /> Call Us</a>
                </div>
              </div>
              <div className="p-4 border-t border-neutral-100">
                <a href="https://wa.me/917262026149?text=Hi%20New%20Yash%20Collection!" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-[#25D366] text-white font-bold text-sm">
                  WHATSAPP US
                </a>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== CART DRAWER ===== */}
      <AnimatePresence>
        {cartOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60" onClick={() => setCartOpen(false)}>
            <motion.aside
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 32, stiffness: 320 }}
              className="absolute right-0 top-0 bottom-0 w-full max-w-[420px] bg-white flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
                <h2 className="font-extrabold tracking-wide text-[15px]">YOUR BAG ({cartCount})</h2>
                <button onClick={() => setCartOpen(false)} className="w-9 h-9 grid place-items-center rounded-full bg-neutral-100" aria-label="Close cart">
                  <X size={18} />
                </button>
              </div>

              {cart.length === 0 ? (
                <div className="flex-1 grid place-items-center p-8 text-center">
                  <div>
                    <div className="w-20 h-20 mx-auto rounded-full bg-neutral-100 grid place-items-center mb-4">
                      <ShoppingBag size={30} className="text-neutral-400" />
                    </div>
                    <p className="font-bold text-lg">Your bag is empty</p>
                    <p className="text-sm text-neutral-500 mt-1 mb-5">Looks like you haven&apos;t added anything yet.</p>
                    <button onClick={() => { setCartOpen(false); router.push("/men"); }} className="px-8 py-3 rounded-xl bg-black text-[#ffffff] font-bold text-sm tracking-wide">
                      START SHOPPING
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {savings > 0 && (
                    <div className="mx-4 mt-3 px-3 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 text-[12.5px] font-semibold text-emerald-800 flex items-center gap-2">
                      <Truck size={15} /> You&apos;re saving {formatINR(savings)} on this order
                    </div>
                  )}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {cart.map((item) => (
                      <div key={item.key} className="flex gap-3 p-3 rounded-2xl border border-neutral-100 bg-white">
                        <Link href={`/product/${item.slug}`} onClick={() => setCartOpen(false)} className="w-[72px] h-[92px] rounded-xl overflow-hidden bg-neutral-100 relative shrink-0">
                          {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : null}
                        </Link>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-[13px] leading-snug clamp-2">{item.name}</p>
                          <p className="text-[11.5px] text-neutral-500 mt-0.5">Size: {item.size} · {item.color}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-neutral-200 rounded-full">
                              <button onClick={() => updateQty(item.key, item.qty - 1)} className="w-8 h-8 grid place-items-center" aria-label="Decrease"><Minus size={14} /></button>
                              <span className="w-6 text-center text-sm font-bold">{item.qty}</span>
                              <button onClick={() => updateQty(item.key, item.qty + 1)} className="w-8 h-8 grid place-items-center" aria-label="Increase"><Plus size={14} /></button>
                            </div>
                            <div className="text-right">
                              <p className="font-extrabold text-[14px]">{formatINR(item.price * item.qty)}</p>
                              <p className="text-[11px] text-neutral-400 line-through">{formatINR(item.mrp * item.qty)}</p>
                            </div>
                          </div>
                        </div>
                        <button onClick={() => removeFromCart(item.key)} className="self-start p-1.5 text-neutral-400 hover:text-red-600" aria-label="Remove">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-neutral-100 bg-neutral-50/60">
                    <div className="flex justify-between text-sm mb-1"><span className="text-neutral-500">Subtotal</span><span className="font-bold">{formatINR(cartSubtotal)}</span></div>
                    <div className="flex justify-between text-sm mb-3"><span className="text-neutral-500">Delivery</span><span className="font-bold text-emerald-700">{cartSubtotal >= 1499 ? "FREE" : "Calculated at checkout"}</span></div>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => { setCartOpen(false); router.push("/cart"); }} className="py-3.5 rounded-xl border-2 border-black font-bold text-[13px] tracking-wide">VIEW BAG</button>
                      <button onClick={() => { setCartOpen(false); router.push("/checkout"); }} className="py-3.5 rounded-xl bg-black text-[#ffffff] font-bold text-[13px] tracking-wide">CHECKOUT</button>
                    </div>
                  </div>
                </>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/98 backdrop-blur border-t border-neutral-200 pb-[env(safe-area-inset-bottom)]" aria-label="Mobile">
        <div className="grid grid-cols-5 h-[60px]">
          {[
            { label: "Home", href: "/", icon: <StoreIcon size={20} /> },
            { label: "Men", href: "/men", icon: <ShoppingBag size={20} /> },
            { label: "Search", href: "#", icon: <Search size={20} />, action: () => setSearchOpen(true) },
            { label: "Wishlist", href: "/wishlist", icon: <Heart size={20} />, count: wishlist.length },
            { label: "Bag", href: "/cart", icon: <ShoppingBag size={20} />, count: cartCount },
          ].map((t) =>
            t.action ? (
              <button key={t.label} onClick={t.action} className="flex flex-col items-center justify-center gap-0.5 text-neutral-700">
                {t.icon}<span className="text-[10px] font-semibold">{t.label}</span>
              </button>
            ) : (
              <Link key={t.label} href={t.href} className="flex flex-col items-center justify-center gap-0.5 text-neutral-700 relative">
                {t.icon}
                <span className="text-[10px] font-semibold">{t.label}</span>
                {!!t.count && <span className="absolute top-1 right-1/2 translate-x-5 min-w-[16px] h-4 px-1 rounded-full bg-[#ff0000] text-white text-[9px] font-extrabold grid place-items-center">{t.count}</span>}
              </Link>
            )
          )}
        </div>
      </nav>
      <div className="lg:hidden h-[60px] fixed-spacer" style={{ display: "none" }} />
    </>
  );
}
