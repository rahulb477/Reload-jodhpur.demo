"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ArrowRight, Truck, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const { cart, updateQty, removeFromCart, cartSubtotal, cartMrp, cartCount, saveForLater, moveToSaveLater, moveToCart } = useStore();
  const savings = cartMrp - cartSubtotal;
  const delivery = cartSubtotal >= 1499 || cartSubtotal === 0 ? 0 : 49;
  const total = cartSubtotal + delivery;

  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-neutral-100 grid place-items-center text-4xl">🛍️</div>
        <h1 className="font-display font-extrabold text-3xl mt-6">Your bag is empty</h1>
        <p className="text-neutral-500 text-sm mt-2">Discover trending styles from Reload Jodhpur.</p>
        <div className="flex gap-2 justify-center mt-6">
          <Link href="/men" className="px-8 py-3.5 rounded-xl bg-black text-[#ffffff] font-extrabold text-[13px] tracking-wider">SHOP MEN</Link>
          <Link href="/offers" className="px-8 py-3.5 rounded-xl gold-bg text-white font-extrabold text-[13px] tracking-wider">VIEW OFFERS</Link>
        </div>
        {saveForLater.length > 0 && (
          <div className="mt-10 text-left">
            <h2 className="font-extrabold">Saved for later ({saveForLater.length})</h2>
            <div className="space-y-3 mt-4">
              {saveForLater.map((item) => (
                <div key={item.key} className="flex gap-3 p-3 rounded-2xl border border-neutral-200">
                  <span className="w-16 h-20 rounded-xl overflow-hidden bg-neutral-100 relative shrink-0">
                    {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.name}</p>
                    <p className="text-xs text-neutral-500">Size {item.size}</p>
                    <button onClick={() => moveToCart(item.key)} className="mt-1.5 text-[12px] font-extrabold text-[#ff0000]">MOVE TO BAG</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl">Shopping Bag ({cartCount})</h1>
      <div className="grid lg:grid-cols-[1fr_380px] gap-6 mt-6 items-start">
        <div className="space-y-3">
          {savings > 0 && (
            <div className="px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-[13px] font-bold text-emerald-800 flex items-center gap-2">
              <Truck size={16} /> You save {formatINR(savings)} on this order
            </div>
          )}
          {cart.map((item) => (
            <div key={item.key} className="flex gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl border border-neutral-200">
              <Link href={`/product/${item.slug}`} className="w-[92px] h-[120px] sm:w-[110px] sm:h-[140px] rounded-xl overflow-hidden bg-neutral-100 relative shrink-0">
                {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${item.slug}`} className="font-bold text-[14px] sm:text-[15px] leading-snug hover:text-[#ff0000]">{item.name}</Link>
                <p className="text-[12px] text-neutral-500 mt-1">Size: <b className="text-black">{item.size}</b> · {item.color}</p>
                <div className="flex items-baseline gap-2 mt-1.5">
                  <span className="font-extrabold text-[16px]">{formatINR(item.price)}</span>
                  <span className="text-[12.5px] text-neutral-400 line-through">{formatINR(item.mrp)}</span>
                </div>
                <div className="flex items-center justify-between mt-2.5 flex-wrap gap-2">
                  <div className="flex items-center border border-neutral-200 rounded-full">
                    <button onClick={() => updateQty(item.key, item.qty - 1)} className="w-9 h-9 grid place-items-center" aria-label="Decrease"><Minus size={14} /></button>
                    <span className="w-7 text-center text-sm font-extrabold">{item.qty}</span>
                    <button onClick={() => updateQty(item.key, item.qty + 1)} className="w-9 h-9 grid place-items-center" aria-label="Increase"><Plus size={14} /></button>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => moveToSaveLater(item.key)} className="text-[11.5px] font-extrabold tracking-wide text-neutral-500 hover:text-black">SAVE FOR LATER</button>
                    <button onClick={() => removeFromCart(item.key)} className="flex items-center gap-1 text-[11.5px] font-extrabold tracking-wide text-neutral-500 hover:text-red-600"><Trash2 size={13} /> REMOVE</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {saveForLater.length > 0 && (
            <div className="pt-2">
              <h2 className="font-extrabold text-[15px]">Saved for later ({saveForLater.length})</h2>
              <div className="grid sm:grid-cols-2 gap-3 mt-3">
                {saveForLater.map((item) => (
                  <div key={item.key} className="flex gap-3 p-3 rounded-2xl border border-dashed border-neutral-300">
                    <span className="w-14 h-[72px] rounded-lg overflow-hidden bg-neutral-100 relative shrink-0">
                      {item.image && <Image src={item.image} alt={item.name} fill className="object-cover" />}
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[13px] truncate">{item.name}</p>
                      <p className="text-[12px] font-bold">{formatINR(item.price)}</p>
                      <button onClick={() => moveToCart(item.key)} className="text-[11px] font-extrabold text-[#ff0000]">MOVE TO BAG</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="border border-neutral-200 rounded-3xl p-5 sm:p-6 lg:sticky lg:top-32 bg-white">
          <h2 className="font-extrabold tracking-wide text-[14px]">ORDER SUMMARY</h2>
          <div className="space-y-2.5 mt-4 text-[14px]">
            <div className="flex justify-between"><span className="text-neutral-500">Subtotal (MRP)</span><span>{formatINR(cartMrp)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Discount</span><span className="text-emerald-700 font-bold">− {formatINR(savings)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Delivery</span><span className={delivery === 0 ? "text-emerald-700 font-bold" : ""}>{delivery === 0 ? "FREE" : formatINR(delivery)}</span></div>
            {delivery > 0 && <p className="text-[12px] text-neutral-500">Add {formatINR(1499 - cartSubtotal)} more for FREE delivery</p>}
            <div className="border-t border-dashed border-neutral-200 pt-3 flex justify-between font-extrabold text-[17px]"><span>Total</span><span>{formatINR(total)}</span></div>
          </div>
          <Link href="/checkout" className="mt-5 flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-black text-[#ffffff] font-extrabold text-[13px] tracking-[0.12em]">
            PROCEED TO CHECKOUT <ArrowRight size={16} />
          </Link>
          <Link href="/men" className="mt-2 block text-center text-[12px] font-bold text-neutral-500 hover:text-black py-2">Continue shopping</Link>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11.5px] text-neutral-500"><ShieldCheck size={14} className="text-emerald-600" /> Secure checkout · COD available · Easy exchange</div>
        </div>
      </div>
    </div>
  );
}
