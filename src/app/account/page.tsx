"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Package, Heart, User, LogOut, MapPin, Eye } from "lucide-react";
import { useStore } from "@/lib/store-context";
import { formatINR, cn } from "@/lib/utils";

const STATUS_FLOW = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED"];
const STATUS_COLOR: Record<string, string> = {
  PLACED: "bg-amber-100 text-amber-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  PACKED: "bg-violet-100 text-violet-800",
  SHIPPED: "bg-indigo-100 text-indigo-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-700",
};

type Order = {
  id: number; orderNumber: string; status: string; total: number; createdAt: string;
  deliveryMethod: string; paymentMethod: string;
  items: { name: string; image: string | null; size: string | null; qty: number; price: number }[];
};

export default function AccountPage() {
  const { user, logout, wishlist } = useStore();
  const router = useRouter();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [recentlyViewed] = useState<{ slug: string; name: string }[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem("nyc_recent") ?? "[]") as { slug: string; name: string }[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    fetch("/api/orders").then((r) => r.json()).then((j) => setOrders(j.orders ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <span className="inline-grid place-items-center w-20 h-20 rounded-full bg-neutral-100"><User size={32} className="text-neutral-400" /></span>
        <h1 className="font-display font-extrabold text-3xl mt-5">Login required</h1>
        <p className="text-sm text-neutral-500 mt-2">Login to view orders, wishlist & profile.</p>
        <Link href="/auth" className="inline-block mt-6 px-10 py-3.5 rounded-xl bg-black text-[#ffffff] font-extrabold text-[13px]">LOGIN / SIGN UP</Link>
      </div>
    );
  }

  const tabs = [
    { id: "orders", label: "Orders", icon: <Package size={16} /> },
    { id: "wishlist", label: `Wishlist (${wishlist.length})`, icon: <Heart size={16} /> },
    { id: "profile", label: "Profile", icon: <User size={16} /> },
  ];

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-full bg-black text-[#ffffff] grid place-items-center font-display font-black text-lg">{user.name[0]?.toUpperCase()}</span>
          <div>
            <h1 className="font-display font-extrabold text-xl sm:text-2xl">Hi, {user.name.split(" ")[0]}</h1>
            <p className="text-[12.5px] text-neutral-500">{user.email}</p>
          </div>
        </div>
        <button onClick={async () => { await logout(); router.push("/"); }} className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl border border-neutral-200 text-[13px] font-bold hover:border-red-300 hover:text-red-600">
          <LogOut size={15} /> Logout
        </button>
      </div>

      <div className="flex gap-2 mt-6 border-b border-neutral-200 overflow-x-auto no-scrollbar">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-2 px-5 py-3 text-[13px] font-extrabold tracking-wide whitespace-nowrap border-b-2 -mb-px", tab === t.id ? "border-black text-black" : "border-transparent text-neutral-400")}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === "orders" && (
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-36 bg-neutral-100 rounded-2xl animate-pulse" />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-14 border border-dashed border-neutral-300 rounded-3xl">
              <Package size={36} className="mx-auto text-neutral-300" />
              <p className="font-bold text-lg mt-3">No orders yet</p>
              <p className="text-sm text-neutral-500">Your orders will appear here.</p>
              <Link href="/men" className="inline-block mt-4 px-8 py-3 rounded-xl bg-black text-[#ffffff] text-[13px] font-extrabold">START SHOPPING</Link>
            </div>
          ) : (
            orders.map((o) => (
              <div key={o.id} className="border border-neutral-200 rounded-3xl p-4 sm:p-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-extrabold text-[15px]">#{o.orderNumber}</p>
                    <p className="text-[12px] text-neutral-500">{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {o.deliveryMethod === "STORE_PICKUP" ? "Store Pickup" : "Home Delivery"} · {o.paymentMethod}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[11px] font-extrabold px-3 py-1.5 rounded-full tracking-wide", STATUS_COLOR[o.status] ?? "bg-neutral-100")}>{o.status}</span>
                    <span className="font-extrabold">{formatINR(o.total)}</span>
                  </div>
                </div>
                {o.status !== "CANCELLED" && (
                  <div className="flex items-center gap-0 mt-4 mb-1">
                    {STATUS_FLOW.map((s, i) => {
                      const reached = STATUS_FLOW.indexOf(o.status) >= i;
                      return (
                        <div key={s} className="flex-1 flex items-center last:flex-none">
                          <div className="flex flex-col items-center">
                            <span className={cn("w-6 h-6 rounded-full grid place-items-center text-[10px] font-extrabold", reached ? "bg-black text-[#ffffff]" : "bg-neutral-100 text-neutral-400")}>{reached ? "✓" : i + 1}</span>
                            <span className="text-[8px] sm:text-[9px] font-bold mt-1 hidden sm:block">{s}</span>
                          </div>
                          {i < STATUS_FLOW.length - 1 && <span className={cn("flex-1 h-0.5 mx-1 mb-0 sm:mb-4", STATUS_FLOW.indexOf(o.status) > i ? "bg-black" : "bg-neutral-100")} />}
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-2.5 mt-3">
                  {o.items.map((it, i) => (
                    <div key={i} className="flex gap-2.5 items-center bg-neutral-50 rounded-xl p-2">
                      <span className="w-11 h-14 rounded-lg overflow-hidden bg-neutral-200 relative shrink-0">
                        {it.image && <Image src={it.image} alt={it.name} fill className="object-cover" />}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[12.5px] font-bold truncate">{it.name}</p>
                        <p className="text-[11.5px] text-neutral-500">Size {it.size} · Qty {it.qty}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "wishlist" && (
        <div className="mt-6 text-center py-10 border border-dashed border-neutral-300 rounded-3xl">
          <Heart size={32} className="mx-auto text-neutral-300" />
          <p className="font-bold mt-3">You have {wishlist.length} saved styles</p>
          <Link href="/wishlist" className="inline-block mt-4 px-8 py-3 rounded-xl bg-black text-[#ffffff] text-[13px] font-extrabold">OPEN WISHLIST</Link>
        </div>
      )}

      {tab === "profile" && (
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="border border-neutral-200 rounded-3xl p-5">
            <h3 className="font-extrabold text-[14px]">PROFILE</h3>
            <div className="mt-3 space-y-2 text-[14px]">
              <p><span className="text-neutral-500 text-[12px] font-bold block">NAME</span>{user.name}</p>
              <p><span className="text-neutral-500 text-[12px] font-bold block">EMAIL</span>{user.email}</p>
            </div>
          </div>
          <div className="border border-neutral-200 rounded-3xl p-5">
            <h3 className="font-extrabold text-[14px] flex items-center gap-1.5"><MapPin size={15} /> STORE</h3>
            <p className="text-[13.5px] text-neutral-600 mt-3">Opp. Manu Computer, C Sector, Saraswati Nagar, Madhuban Main Road, Jodhpur</p>
            <Link href="/store" className="inline-block mt-3 text-[12.5px] font-extrabold text-[#ff0000]">GET DIRECTIONS →</Link>
          </div>
          {recentlyViewed.length > 0 && (
            <div className="border border-neutral-200 rounded-3xl p-5 sm:col-span-2">
              <h3 className="font-extrabold text-[14px] flex items-center gap-1.5"><Eye size={15} /> RECENTLY VIEWED</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {recentlyViewed.slice(0, 8).map((r) => (
                  <Link key={r.slug} href={`/product/${r.slug}`} className="px-4 py-2 rounded-full bg-neutral-100 text-[13px] font-semibold hover:bg-black hover:text-[#ffffff] transition">{r.name}</Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
