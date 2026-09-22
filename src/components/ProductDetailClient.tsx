"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, Zap, MessageCircle, Truck, Store, RotateCcw, ShieldCheck, ChevronDown, MapPin, Ruler, Minus, Plus, Star } from "lucide-react";
import { formatINR, discountPct, whatsappEnquiry, cn } from "@/lib/utils";
import { useStore } from "@/lib/store-context";
import { Stars } from "./ProductCard";
import ProductCard, { CardProduct } from "./ProductCard";

type P = {
  id: number; slug: string; name: string; shortDesc: string | null; description: string | null;
  categorySlug: string; categoryName?: string; audience: string; price: number; mrp: number;
  rating: number | null; ratingCount: number | null; badges: string[] | null;
  colors: string[] | null; sizes: string[] | null; fabric: string | null; fit: string | null; washCare: string | null;
  images: { url: string; alt: string | null }[];
};

export default function ProductDetailClient({ product, related, completeLook }: { product: P; related: CardProduct[]; completeLook: CardProduct[] }) {
  const router = useRouter();
  const { addToCart, toggleWishlist, isWishlisted, setCartOpen } = useStore();
  const [imgIdx, setImgIdx] = useState(0);
  const [size, setSize] = useState("");
  const [color, setColor] = useState(product.colors?.[0] ?? "As shown");
  const [qty, setQty] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [openAcc, setOpenAcc] = useState<string | null>("details");
  const [sizeGuide, setSizeGuide] = useState(false);
  const [reviewName, setReviewName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewDone, setReviewDone] = useState(false);
  const [reviews, setReviews] = useState<{ userName: string; rating: number; title: string | null; comment: string | null }[]>([]);

  const pct = discountPct(product.mrp, product.price);
  const wished = isWishlisted(product.id);

  useEffect(() => {
    fetch(`/api/reviews?productId=${product.id}`).then((r) => r.json()).then((j) => setReviews(j.reviews ?? [])).catch(() => {});
    try {
      const raw = JSON.parse(localStorage.getItem("nyc_recent") ?? "[]") as { slug: string; name: string }[];
      const next = [{ slug: product.slug, name: product.name }, ...raw.filter((r) => r.slug !== product.slug)].slice(0, 10);
      localStorage.setItem("nyc_recent", JSON.stringify(next));
    } catch {}
  }, [product.id, product.slug, product.name]);

  const needSize = () => {
    if (!size) { setSizeError(true); return true; }
    return false;
  };

  const handleAdd = () => {
    if (needSize()) return;
    addToCart({ productId: product.id, slug: product.slug, name: product.name, image: product.images[0]?.url ?? "", price: product.price, mrp: product.mrp, size, color }, qty);
  };
  const handleBuy = () => {
    if (needSize()) return;
    addToCart({ productId: product.id, slug: product.slug, name: product.name, image: product.images[0]?.url ?? "", price: product.price, mrp: product.mrp, size, color }, qty);
    setCartOpen(false);
    router.push("/checkout");
  };

  const acc = (id: string, title: string, body: React.ReactNode) => (
    <div className="border-b border-neutral-200">
      <button onClick={() => setOpenAcc(openAcc === id ? null : id)} className="w-full flex items-center justify-between py-4 text-left font-bold text-[13.5px] tracking-wide">
        {title}
        <ChevronDown size={17} className={cn("transition", openAcc === id && "rotate-180")} />
      </button>
      {openAcc === id && <div className="pb-5 text-[13.5px] text-neutral-600 leading-relaxed">{body}</div>}
    </div>
  );

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-28 lg:pb-8">
      {/* Breadcrumb */}
      <nav className="text-[12px] text-neutral-500 mb-4 flex items-center gap-1.5 flex-wrap" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-black">Home</Link><span>/</span>
        <Link href={product.audience === "kids" ? "/kids" : "/men"} className="hover:text-black capitalize">{product.audience}</Link><span>/</span>
        <Link href={`/shop?category=${product.categorySlug}`} className="hover:text-black">{product.categoryName ?? product.categorySlug}</Link><span>/</span>
        <span className="font-semibold text-black truncate max-w-[180px] sm:max-w-none">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-6 lg:gap-12">
        {/* Gallery */}
        <div>
          <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-neutral-100">
            {product.images[imgIdx]?.url ? (
              <Image key={imgIdx} src={product.images[imgIdx].url} alt={product.images[imgIdx].alt ?? product.name} fill priority sizes="(max-width:1024px)100vw,50vw" className="object-cover" />
            ) : (
              <div className="absolute inset-0 grid place-items-center bg-neutral-900 text-[#ffffff] font-display">{product.name}</div>
            )}
            {pct > 0 && <span className="absolute top-4 left-4 text-xs font-extrabold px-3 py-1.5 rounded-full bg-[#ff0000] text-black">{pct}% OFF</span>}
            <div className="absolute top-4 right-4 flex flex-col gap-1.5">
              {(product.badges ?? []).map((b) => (
                <span key={b} className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-black/85 text-[#ffffff] border border-[#ff0000]/50">{b}</span>
              ))}
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2.5 mt-3">
              {product.images.map((im, i) => (
                <button key={i} onClick={() => setImgIdx(i)} className={cn("relative w-20 h-24 rounded-xl overflow-hidden border-2 bg-neutral-100", i === imgIdx ? "border-black" : "border-transparent")} aria-label={`View image ${i + 1}`}>
                  <Image src={im.url} alt={`${product.name} ${i + 1}`} fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p className="text-[11px] font-bold tracking-[0.22em] text-[#ff0000] uppercase">{product.categoryName ?? product.categorySlug.replace(/-/g, " ")} · RJ</p>
          <h1 className="font-display font-extrabold text-2xl sm:text-[32px] leading-tight mt-1.5">{product.name}</h1>
          {product.shortDesc && <p className="text-neutral-500 text-sm mt-1">{product.shortDesc}</p>}
          <div className="flex items-center gap-2 mt-3">
            <Stars rating={product.rating} size={15} />
            <span className="text-[13px] font-bold">{product.rating?.toFixed(1)}</span>
            <a href="#reviews" className="text-[13px] text-neutral-500 underline underline-offset-2">({product.ratingCount ?? 0} reviews)</a>
          </div>
          <div className="flex items-baseline gap-2.5 mt-4">
            <span className="text-[28px] font-extrabold">{formatINR(product.price)}</span>
            <span className="text-neutral-400 line-through text-lg">{formatINR(product.mrp)}</span>
            {pct > 0 && <span className="text-emerald-700 font-extrabold text-sm">{pct}% OFF</span>}
          </div>
          <p className="text-[12px] text-neutral-500 mt-1">Inclusive of all taxes · <span className="font-semibold text-emerald-700">You save {formatINR(product.mrp - product.price)}</span></p>

          {/* Offers strip */}
          <div className="mt-4 rounded-2xl border border-[#e5e5e5] bg-[#f7f7f7] p-3.5 space-y-1.5 text-[12.5px]">
            <p className="font-bold text-[12px] tracking-wider text-[#ff0000]">AVAILABLE OFFERS</p>
            <p>• Combo deals starting ₹999 — mix & match in store</p>
            <p>• Free shipping on orders above ₹1499</p>
            <p>• Easy store pickup at Saraswati Nagar, Jodhpur</p>
          </div>

          {/* Color */}
          {!!product.colors?.length && (
            <div className="mt-5">
              <p className="text-[12px] font-extrabold tracking-[0.15em] text-neutral-600">COLOUR: <span className="text-black">{color}</span></p>
              <div className="flex gap-2 mt-2">
                {product.colors.map((c) => (
                  <button key={c} onClick={() => setColor(c)} className={cn("px-4 h-10 rounded-lg border text-[13px] font-bold", color === c ? "border-black bg-black text-[#ffffff]" : "border-neutral-200")}>{c}</button>
                ))}
              </div>
            </div>
          )}

          {/* Size */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <p className="text-[12px] font-extrabold tracking-[0.15em] text-neutral-600">SELECT SIZE {sizeError && <span className="text-red-600">— please choose</span>}</p>
              <button onClick={() => setSizeGuide(true)} className="flex items-center gap-1 text-[12px] font-bold text-[#ff0000] underline underline-offset-2"><Ruler size={14} /> SIZE GUIDE</button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {(product.sizes?.length ? product.sizes : ["S", "M", "L", "XL", "XXL"]).map((s) => (
                <button key={s} onClick={() => { setSize(s); setSizeError(false); }} className={cn("min-w-[52px] h-11 px-3 rounded-xl border-2 text-sm font-extrabold transition", size === s ? "border-black bg-black text-[#ffffff]" : sizeError ? "border-red-300" : "border-neutral-200 hover:border-black")}>{s}</button>
              ))}
            </div>
          </div>

          {/* Qty */}
          <div className="mt-5 flex items-center gap-3">
            <p className="text-[12px] font-extrabold tracking-[0.15em] text-neutral-600">QTY</p>
            <div className="flex items-center border-2 border-neutral-200 rounded-xl">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 grid place-items-center" aria-label="Decrease"><Minus size={15} /></button>
              <span className="w-8 text-center font-extrabold">{qty}</span>
              <button onClick={() => setQty(Math.min(10, qty + 1))} className="w-10 h-10 grid place-items-center" aria-label="Increase"><Plus size={15} /></button>
            </div>
            <span className="text-[12px] text-emerald-700 font-bold flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> In stock</span>
          </div>

          {/* CTAs */}
          <div className="hidden lg:flex gap-2.5 mt-6">
            <button onClick={() => toggleWishlist(product.id)} className={cn("w-[52px] h-[52px] grid place-items-center rounded-xl border-2 shrink-0", wished ? "border-black bg-black text-[#ffffff]" : "border-neutral-200")} aria-label="Wishlist">
              <Heart size={20} className={wished ? "fill-[#ffffff]" : ""} />
            </button>
            <button onClick={handleAdd} className="flex-1 h-[52px] rounded-xl border-2 border-black font-extrabold text-[13px] tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-100"><ShoppingBag size={18} /> ADD TO CART</button>
            <button onClick={handleBuy} className="flex-1 h-[52px] rounded-xl bg-black text-[#ffffff] font-extrabold text-[13px] tracking-wider flex items-center justify-center gap-2 hover:bg-neutral-900"><Zap size={18} /> BUY NOW</button>
          </div>
          <a href={whatsappEnquiry(product.name, product.price)} target="_blank" rel="noreferrer" className="hidden lg:flex mt-2.5 h-[52px] rounded-xl bg-[#25D366] text-white font-extrabold text-[13px] tracking-wider items-center justify-center gap-2">
            <MessageCircle size={18} /> WHATSAPP ENQUIRY
          </a>

          {/* Delivery info */}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center">
            {[
              { icon: <Truck size={18} />, t: "Home Delivery", s: "2–5 days" },
              { icon: <Store size={18} />, t: "Store Pickup", s: "Same day" },
              { icon: <RotateCcw size={18} />, t: "Easy Exchange", s: "7 days" },
            ].map((x) => (
              <div key={x.t} className="rounded-xl bg-neutral-50 border border-neutral-100 p-3">
                <span className="inline-grid place-items-center text-[#ff0000]">{x.icon}</span>
                <p className="text-[11.5px] font-extrabold mt-1">{x.t}</p>
                <p className="text-[11px] text-neutral-500">{x.s}</p>
              </div>
            ))}
          </div>

          {/* Accordions */}
          <div className="mt-5 border-t border-neutral-200">
            {acc("details", "PRODUCT DETAILS", <p>{product.description ?? product.shortDesc}</p>)}
            {acc("fabric", "FABRIC · FIT · WASH CARE", (
              <ul className="space-y-1.5">
                <li><b>Fabric:</b> {product.fabric ?? "Premium cotton blend"}</li>
                <li><b>Fit:</b> {product.fit ?? "Regular Fit"}</li>
                <li><b>Wash care:</b> {product.washCare ?? "Machine wash cold. Do not bleach. Dry in shade."}</li>
              </ul>
            ))}
            {acc("delivery", "DELIVERY & STORE PICKUP", (
              <ul className="space-y-1.5">
                <li>• Home delivery across Jodhpur in 2–5 days. COD available.</li>
                <li>• Free shipping on orders above ₹1499.</li>
                <li>• Store pickup: Opp. Manu Computer, C Sector, Saraswati Nagar, Madhuban Main Road, Jodhpur. Same-day pickup available.</li>
              </ul>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky mobile CTA */}
      <div className="lg:hidden fixed bottom-[60px] inset-x-0 z-30 px-3 pb-2">
        <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.45)] border border-neutral-200 p-2 flex gap-2">
          <button onClick={() => toggleWishlist(product.id)} className={cn("w-12 grid place-items-center rounded-xl border-2 shrink-0", wished ? "border-black bg-black text-[#ffffff]" : "border-neutral-200")} aria-label="Wishlist"><Heart size={19} className={wished ? "fill-[#ffffff]" : ""} /></button>
          <button onClick={handleAdd} className="flex-1 py-3 rounded-xl border-2 border-black font-extrabold text-[12px]">ADD TO CART</button>
          <button onClick={handleBuy} className="flex-1 py-3 rounded-xl bg-black text-[#ffffff] font-extrabold text-[12px]">BUY NOW</button>
        </div>
      </div>

      {/* Reviews */}
      <div id="reviews" className="mt-12 grid lg:grid-cols-2 gap-8">
        <div>
          <h2 className="font-display font-extrabold text-xl sm:text-2xl">Ratings & Reviews</h2>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-4xl font-extrabold">{product.rating?.toFixed(1)}</span>
            <div>
              <Stars rating={product.rating} size={16} />
              <p className="text-xs text-neutral-500 mt-0.5">{product.ratingCount ?? 0} verified ratings</p>
            </div>
          </div>
          <div className="space-y-3 mt-5">
            {reviews.length === 0 && <p className="text-sm text-neutral-500">Be the first to review this style.</p>}
            {reviews.slice(0, 5).map((r, i) => (
              <div key={i} className="border border-neutral-200 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-black text-[#ffffff] grid place-items-center text-xs font-extrabold">{r.userName[0]}</span>
                  <div>
                    <p className="text-[13px] font-bold">{r.userName}</p>
                    <Stars rating={r.rating} size={11} />
                  </div>
                </div>
                {r.title && <p className="text-[13px] font-bold mt-2">{r.title}</p>}
                {r.comment && <p className="text-[13px] text-neutral-600 mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
        <div className="border border-neutral-200 rounded-3xl p-5 sm:p-7 h-fit bg-neutral-50/50">
          <h3 className="font-extrabold text-[15px]">Write a review</h3>
          {reviewDone ? (
            <p className="text-sm text-emerald-700 font-semibold mt-3">Thank you! Your review has been submitted.</p>
          ) : (
            <div className="space-y-3 mt-4">
              <input value={reviewName} onChange={(e) => setReviewName(e.target.value)} placeholder="Your name" className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm bg-white" />
              <div className="flex items-center gap-1.5">
                <span className="text-[13px] font-bold mr-1">Rating:</span>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} onClick={() => setReviewRating(i)} aria-label={`${i} stars`}><Star size={22} className={i <= reviewRating ? "fill-[#ff0000] text-[#ff0000]" : "text-neutral-300"} /></button>
                ))}
              </div>
              <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="How was the fit, fabric, quality?" rows={3} className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm bg-white" />
              <button
                onClick={async () => {
                  setReviewError("");
                  if (!reviewName.trim() || !reviewText.trim()) {
                    setReviewError("Please add your name and review.");
                    return;
                  }
                  try {
                    const r = await fetch("/api/reviews", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ productId: product.id, userName: reviewName.trim(), rating: reviewRating, comment: reviewText.trim() }),
                    });
                    const j = await r.json().catch(() => ({}));
                    if (!r.ok) throw new Error(j.error || "Could not submit review.");
                    setReviewDone(true);
                  } catch (error) {
                    setReviewError(error instanceof Error ? error.message : "Could not submit review.");
                  }
                }}
                className="w-full py-3.5 rounded-xl bg-black text-[#ffffff] font-extrabold text-[13px] tracking-wider"
              >
                SUBMIT REVIEW
              </button>
              {reviewError && <p className="text-[12px] font-semibold text-red-600">{reviewError}</p>}
            </div>
          )}
          <div className="mt-5 flex items-start gap-2 text-[12px] text-neutral-500">
            <MapPin size={15} className="shrink-0 mt-0.5 text-[#ff0000]" />
            <p>Bought at our Saraswati Nagar store? Mention your experience — it helps Jodhpur shoppers.</p>
          </div>
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-12">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl">You may also like</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
            {related.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      )}
      {completeLook.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display font-extrabold text-xl sm:text-2xl">Complete the look</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5">
            {completeLook.slice(0, 4).map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </div>
      )}

      {/* Size guide modal */}
      {sizeGuide && (
        <div className="fixed inset-0 z-[80] bg-black/70 grid place-items-center p-4" onClick={() => setSizeGuide(false)}>
          <div className="bg-white rounded-3xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-lg flex items-center gap-2"><Ruler size={19} /> Size Guide</h3>
              <button onClick={() => setSizeGuide(false)} className="w-9 h-9 grid place-items-center rounded-full bg-neutral-100 font-bold">✕</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead><tr className="bg-black text-[#ffffff]"><th className="p-2.5 text-left rounded-l-lg">Size</th><th className="p-2.5">Chest (in)</th><th className="p-2.5">Waist (in)</th><th className="p-2.5 text-right rounded-r-lg">Length</th></tr></thead>
                <tbody>
                  {[["XS", "34", "28", "26"], ["S", "36", "30", "27"], ["M", "38", "32", "28"], ["L", "40", "34", "29"], ["XL", "42", "36", "30"], ["XXL", "44", "38", "30.5"], ["3XL", "46", "40", "31"]].map((r) => (
                    <tr key={r[0]} className="border-b border-neutral-100"><td className="p-2.5 font-extrabold">{r[0]}</td><td className="p-2.5 text-center">{r[1]}</td><td className="p-2.5 text-center">{r[2]}</td><td className="p-2.5 text-right">{r[3]}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[12px] text-neutral-500 mt-3">Between sizes? We recommend sizing up for oversized/boxy fits. Visit our store for a free trial.</p>
            <div className="flex items-center gap-2 mt-3 text-[12px] font-bold text-[#ff0000]"><ShieldCheck size={15} /> Easy 7-day size exchange at store</div>
          </div>
        </div>
      )}
    </div>
  );
}
