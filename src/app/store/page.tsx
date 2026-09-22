import Link from "next/link";
import Image from "next/image";
import { MapPin, Phone, MessageCircle, Navigation, Clock, Store as StoreIcon, BadgeCheck } from "lucide-react";
import { STORE } from "@/lib/utils";

export const metadata = { title: "Visit Our Store", description: "Reload Jodhpur men's wear store at Opp. Manu Computer, Saraswati Nagar, Madhuban Main Road, Jodhpur." };

export default function StorePage() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div className="text-center">
        <p className="text-[11px] font-bold tracking-[0.3em] text-[#ff0000] flex items-center justify-center gap-1.5"><StoreIcon size={14} /> OUR FLAGSHIP</p>
        <h1 className="font-display font-black text-3xl sm:text-5xl mt-2">Visit the Store</h1>
        <p className="text-sm text-neutral-500 mt-2">Try it on. Feel the fabric. Grab exclusive in-store combos.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="rounded-3xl overflow-hidden border border-neutral-200 relative min-h-[300px]">
          <iframe
            title="Reload Jodhpur store map"
            src="https://www.google.com/maps?q=Opp.+Manu+Computer+C+Sector+Saraswati+Nagar+Madhuban+Main+Road+Jodhpur+Rajasthan&output=embed"
            className="w-full h-[340px] sm:h-[440px] border-0"
            loading="lazy"
          />
        </div>
        <div className="bg-black rounded-3xl p-6 sm:p-9 text-white hero-grain relative overflow-hidden">
          <h2 className="font-display font-black text-2xl sm:text-3xl">RELOAD <span className="gold-text">JODHPUR</span></h2>
          <div className="space-y-3.5 mt-6 text-[14px]">
            <p className="flex gap-3"><MapPin size={19} className="text-[#ffffff] shrink-0" /><span>{STORE.address1},<br />{STORE.address2},<br />{STORE.city}</span></p>
            <p className="flex gap-3 items-center"><Clock size={19} className="text-[#ffffff] shrink-0" />{STORE.hours}</p>
            <p className="flex gap-3 items-center"><Phone size={19} className="text-[#ffffff] shrink-0" /><a href={`tel:${STORE.phoneRaw}`} className="hover:text-[#ffffff]">{STORE.phone}</a></p>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-7">
            <a href={STORE.mapsUrl} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3.5 rounded-xl gold-bg text-white text-[12px] font-extrabold"><Navigation size={15} /> GET DIRECTIONS</a>
            <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[#25D366] text-white text-[12px] font-extrabold"><MessageCircle size={15} /> WHATSAPP</a>
            <a href={`tel:${STORE.phoneRaw}`} className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-white/25 text-[12px] font-extrabold"><Phone size={15} /> CALL NOW</a>
            <Link href="/shop" className="flex items-center justify-center gap-2 py-3.5 rounded-xl border border-[#ff0000] text-[#ffffff] text-[12px] font-extrabold">SHOP ONLINE</Link>
          </div>
          <div className="mt-6 space-y-2 text-[12.5px] text-neutral-400">
            <p className="flex items-center gap-2"><BadgeCheck size={15} className="text-[#ffffff]" /> Free trial rooms · honest staff picks</p>
            <p className="flex items-center gap-2"><BadgeCheck size={15} className="text-[#ffffff]" /> Online orders? Choose store pickup at checkout</p>
            <p className="flex items-center gap-2"><BadgeCheck size={15} className="text-[#ffffff]" /> 7-day size exchange with bill</p>
          </div>
        </div>
      </div>
    </div>
  );
}
