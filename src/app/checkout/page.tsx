"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Truck, Store as StoreIcon, Banknote, QrCode, CreditCard, CheckCircle2, ChevronLeft, ShieldCheck } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR, STORE } from "@/lib/utils";

type Step = "details" | "success";

export default function CheckoutPage() {
  const { cart, cartSubtotal, cartMrp, clearCart, user } = useStore();
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState("");

  const [name, setName] = useState(user?.name ?? "");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState(user?.email ?? "");
  const [house, setHouse] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Jodhpur");
  const [state, setState] = useState("Rajasthan");
  const [pincode, setPincode] = useState("");
  const [delivery, setDelivery] = useState<"HOME_DELIVERY" | "STORE_PICKUP">("HOME_DELIVERY");
  const [payment, setPayment] = useState("COD");

  const savings = cartMrp - cartSubtotal;
  const deliveryCharge = useMemo(() => {
    if (delivery === "STORE_PICKUP") return 0;
    return cartSubtotal >= 1499 || cartSubtotal === 0 ? 0 : 49;
  }, [delivery, cartSubtotal]);
  const total = cartSubtotal + deliveryCharge;

  const placeOrder = async () => {
    setError("");
    if (!cart.length) { setError("Your bag is empty."); return; }
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!/^[6-9]\d{9}$/.test(mobile.replace(/\D/g, "").slice(-10))) { setError("Please enter a valid 10-digit mobile number."); return; }
    if (delivery === "HOME_DELIVERY") {
      if (!house.trim() || !area.trim() || !pincode.trim()) { setError("Please complete your delivery address."); return; }
      if (!/^\d{6}$/.test(pincode.trim())) { setError("Please enter a valid 6-digit pincode."); return; }
    }
    setPlacing(true);
    try {
      const r = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name, mobile: mobile.replace(/\D/g, "").slice(-10), email,
          address: { house, area, city, state, pincode },
          deliveryMethod: delivery, paymentMethod: payment,
          items: cart.map((c) => ({ productId: c.productId, name: c.name, image: c.image, size: c.size, color: c.color, qty: c.qty, price: c.price, mrp: c.mrp })),
          subtotal: cartSubtotal, discount: savings, deliveryCharge, total,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Could not place order");
      setOrderNumber(j.orderNumber);
      clearCart();
      setStep("success");
      window.scrollTo({ top: 0 });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not place order");
    } finally {
      setPlacing(false);
    }
  };

  if (step === "success") {
    return (
      <div className="max-w-xl mx-auto px-4 py-14 text-center">
        <span className="inline-grid place-items-center w-20 h-20 rounded-full bg-emerald-50"><CheckCircle2 size={44} className="text-emerald-600" /></span>
        <h1 className="font-display font-black text-3xl mt-5">Order Placed!</h1>
        <p className="text-sm text-neutral-500 mt-2">Thank you for shopping with Reload Jodhpur.</p>
        <div className="mt-5 rounded-2xl border-2 border-dashed border-[#ff0000] bg-[#f7f7f7] p-5">
          <p className="text-[11px] font-extrabold tracking-[0.25em] text-neutral-500">ORDER NUMBER</p>
          <p className="font-display font-black text-2xl mt-1">{orderNumber}</p>
          <p className="text-[13px] text-neutral-600 mt-2">
            {delivery === "STORE_PICKUP"
              ? `Pick up from: ${STORE.address1}, ${STORE.address2}, ${STORE.city}. We'll call you when ready.`
              : `We'll deliver to ${city} – ${pincode} in 2–5 days. Pay ${formatINR(total)} on delivery.`}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-6">
          <Link href="/account" className="py-3.5 rounded-xl bg-black text-[#ffffff] font-extrabold text-[12.5px] tracking-wider">TRACK ORDER</Link>
          <Link href="/men" className="py-3.5 rounded-xl border-2 border-black font-extrabold text-[12.5px] tracking-wider">CONTINUE SHOPPING</Link>
        </div>
        <a href={`https://wa.me/917262026149?text=${encodeURIComponent(`Hi! I just placed order ${orderNumber} on your website.`)}`} target="_blank" rel="noreferrer" className="mt-2.5 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] text-white font-extrabold text-[12.5px]">
          CONFIRM ON WHATSAPP
        </a>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h1 className="font-display font-extrabold text-3xl">Your bag is empty</h1>
        <p className="text-sm text-neutral-500 mt-2">Add some styles before checkout.</p>
        <Link href="/men" className="inline-block mt-6 px-8 py-3.5 rounded-xl bg-black text-[#ffffff] font-extrabold text-[13px]">SHOP MEN</Link>
      </div>
    );
  }

  const input = "w-full border border-neutral-200 rounded-xl px-4 py-3 text-[14px] bg-white";

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-[13px] font-bold text-neutral-500 hover:text-black mb-3"><ChevronLeft size={16} /> Back</button>
      <h1 className="font-display font-extrabold text-2xl sm:text-3xl">Checkout</h1>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6 mt-6 items-start">
        <div className="space-y-5">
          {/* Contact */}
          <section className="border border-neutral-200 rounded-3xl p-5 sm:p-6">
            <h2 className="font-extrabold tracking-wide text-[14px]">1 · CONTACT DETAILS</h2>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <div className="sm:col-span-1"><label className="text-[12px] font-bold text-neutral-600">Full name *</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Yash Sharma" className={`${input} mt-1`} /></div>
              <div><label className="text-[12px] font-bold text-neutral-600">Mobile *</label><input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="10-digit mobile" inputMode="numeric" maxLength={10} className={`${input} mt-1`} /></div>
              <div className="sm:col-span-2"><label className="text-[12px] font-bold text-neutral-600">Email (for order updates)</label><input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" className={`${input} mt-1`} /></div>
            </div>
          </section>

          {/* Delivery method */}
          <section className="border border-neutral-200 rounded-3xl p-5 sm:p-6">
            <h2 className="font-extrabold tracking-wide text-[14px]">2 · DELIVERY METHOD</h2>
            <div className="grid sm:grid-cols-2 gap-3 mt-4">
              <button onClick={() => setDelivery("HOME_DELIVERY")} className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition ${delivery === "HOME_DELIVERY" ? "border-black bg-neutral-900 text-white" : "border-neutral-200"}`}>
                <Truck size={22} className={delivery === "HOME_DELIVERY" ? "text-[#ffffff]" : "text-neutral-400"} />
                <span><span className="block font-extrabold text-[14px]">HOME DELIVERY</span><span className={`text-[12px] ${delivery === "HOME_DELIVERY" ? "text-neutral-300" : "text-neutral-500"}`}>2–5 days · {cartSubtotal >= 1499 ? "FREE" : "₹49"}</span></span>
              </button>
              <button onClick={() => setDelivery("STORE_PICKUP")} className={`flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition ${delivery === "STORE_PICKUP" ? "border-black bg-neutral-900 text-white" : "border-neutral-200"}`}>
                <StoreIcon size={22} className={delivery === "STORE_PICKUP" ? "text-[#ffffff]" : "text-neutral-400"} />
                <span><span className="block font-extrabold text-[14px]">STORE PICKUP · FREE</span><span className={`text-[12px] ${delivery === "STORE_PICKUP" ? "text-neutral-300" : "text-neutral-500"}`}>Same-day · Madhuban Main Road</span></span>
              </button>
            </div>
            {delivery === "HOME_DELIVERY" ? (
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <div className="sm:col-span-2"><label className="text-[12px] font-bold text-neutral-600">House / Flat *</label><input value={house} onChange={(e) => setHouse(e.target.value)} placeholder="House no, building, street" className={`${input} mt-1`} /></div>
                <div className="sm:col-span-2"><label className="text-[12px] font-bold text-neutral-600">Area / Landmark *</label><input value={area} onChange={(e) => setArea(e.target.value)} placeholder="Area, landmark" className={`${input} mt-1`} /></div>
                <div><label className="text-[12px] font-bold text-neutral-600">City</label><input value={city} onChange={(e) => setCity(e.target.value)} className={`${input} mt-1`} /></div>
                <div><label className="text-[12px] font-bold text-neutral-600">State</label><input value={state} onChange={(e) => setState(e.target.value)} className={`${input} mt-1`} /></div>
                <div><label className="text-[12px] font-bold text-neutral-600">Pincode *</label><input value={pincode} onChange={(e) => setPincode(e.target.value)} placeholder="e.g. 342001" inputMode="numeric" maxLength={6} className={`${input} mt-1`} /></div>
              </div>
            ) : (
              <div className="mt-4 rounded-2xl bg-[#f7f7f7] border border-[#e5e5e5] p-4 text-[13px] text-neutral-700">
                <p className="font-extrabold">Pick up from our store — FREE</p>
                <p className="mt-1">{STORE.address1}, {STORE.address2}, {STORE.city}</p>
                <p className="text-neutral-500 mt-0.5">Open {STORE.hours} · We&apos;ll call {mobile || "you"} when your order is ready.</p>
              </div>
            )}
          </section>

          {/* Payment */}
          <section className="border border-neutral-200 rounded-3xl p-5 sm:p-6">
            <h2 className="font-extrabold tracking-wide text-[14px]">3 · PAYMENT</h2>
            <div className="space-y-2.5 mt-4">
              {[
                { id: "COD", icon: <Banknote size={20} />, t: "Cash on Delivery", s: "Pay cash/UPI when you receive · Available", enabled: true },
                { id: "UPI", icon: <QrCode size={20} />, t: "UPI", s: "Coming soon — pay via link on WhatsApp for now", enabled: false },
                { id: "CARD", icon: <CreditCard size={20} />, t: "Cards / Netbanking", s: "Online payments launching soon", enabled: false },
              ].map((m) => (
                <button key={m.id} disabled={!m.enabled} onClick={() => setPayment(m.id)} className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition ${payment === m.id ? "border-black bg-neutral-900 text-white" : "border-neutral-200"} ${!m.enabled ? "opacity-50" : ""}`}>
                  <span className={payment === m.id ? "text-[#ffffff]" : "text-neutral-400"}>{m.icon}</span>
                  <span className="flex-1"><span className="block font-extrabold text-[14px]">{m.t} {!m.enabled && <span className="ml-1 text-[9px] bg-neutral-200 text-neutral-600 px-1.5 py-0.5 rounded align-middle">SOON</span>}</span><span className={`text-[12px] ${payment === m.id ? "text-neutral-300" : "text-neutral-500"}`}>{m.s}</span></span>
                  <span className={`w-5 h-5 rounded-full border-2 grid place-items-center ${payment === m.id ? "border-[#ffffff]" : "border-neutral-300"}`}>{payment === m.id && <span className="w-2.5 h-2.5 rounded-full bg-[#ffffff]" />}</span>
                </button>
              ))}
            </div>
            <p className="text-[12px] text-neutral-500 mt-3 flex items-center gap-1.5"><ShieldCheck size={14} /> Online payments (UPI/cards) are architected and will be enabled soon. COD works today.</p>
          </section>

          {error && <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 text-[13px] font-semibold p-4">{error}</div>}
        </div>

        {/* Summary */}
        <div className="border border-neutral-200 rounded-3xl p-5 sm:p-6 lg:sticky lg:top-32">
          <h2 className="font-extrabold tracking-wide text-[14px]">ORDER SUMMARY ({cart.length} items)</h2>
          <div className="space-y-3 mt-4 max-h-[280px] overflow-y-auto pr-1">
            {cart.map((c) => (
              <div key={c.key} className="flex gap-3">
                <span className="w-14 h-[72px] rounded-lg overflow-hidden bg-neutral-100 relative shrink-0">
                  {c.image && <Image src={c.image} alt={c.name} fill className="object-cover" />}
                  <span className="absolute top-0 right-0 bg-black text-white text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">{c.qty}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold truncate">{c.name}</p>
                  <p className="text-[11.5px] text-neutral-500">Size {c.size}</p>
                  <p className="text-[13px] font-extrabold">{formatINR(c.price * c.qty)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 mt-4 text-[14px] border-t border-dashed border-neutral-200 pt-4">
            <div className="flex justify-between"><span className="text-neutral-500">Subtotal (MRP)</span><span>{formatINR(cartMrp)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Discount</span><span className="text-emerald-700 font-bold">− {formatINR(savings)}</span></div>
            <div className="flex justify-between"><span className="text-neutral-500">Delivery</span><span className={deliveryCharge === 0 ? "text-emerald-700 font-bold" : ""}>{deliveryCharge === 0 ? "FREE" : formatINR(deliveryCharge)}</span></div>
            <div className="flex justify-between font-extrabold text-[18px] pt-2"><span>Total</span><span>{formatINR(total)}</span></div>
          </div>
          <button onClick={placeOrder} disabled={placing} className="mt-5 w-full py-4 rounded-xl bg-black text-[#ffffff] font-extrabold text-[13px] tracking-[0.12em] disabled:opacity-60">
            {placing ? "PLACING ORDER…" : `PLACE ORDER · ${formatINR(total)}`}
          </button>
          <p className="text-center text-[11.5px] text-neutral-500 mt-2">By placing this order you agree to our exchange policy.</p>
        </div>
      </div>
    </div>
  );
}
