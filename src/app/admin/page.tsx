"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LayoutDashboard, Package, Tag, Image as ImageIcon, Play, Settings, ShoppingBag, Users, RefreshCw, Plus, Trash2, Lock, Check } from "lucide-react";
import { formatINR, cn } from "@/lib/utils";

const TABS = [
  { id: "overview", label: "Overview", icon: <LayoutDashboard size={16} /> },
  { id: "orders", label: "Orders", icon: <ShoppingBag size={16} /> },
  { id: "products", label: "Products", icon: <Package size={16} /> },
  { id: "offers", label: "Offers", icon: <Tag size={16} /> },
  { id: "banners", label: "Banners", icon: <ImageIcon size={16} /> },
  { id: "reels", label: "Reels", icon: <Play size={16} /> },
  { id: "settings", label: "Settings", icon: <Settings size={16} /> },
];

type Data = {
  stats: { products: number; orders: number; users: number; revenue: number };
  recentOrders: { id: number; orderNumber: string; customerName: string; mobile: string; total: number; status: string; createdAt: string; deliveryMethod: string }[];
  allProducts: { id: number; slug: string; name: string; price: number; mrp: number; stockTotal: number; isActive: boolean; isNewArrival: boolean; isTrending: boolean; categorySlug: string; badges: string[] | null }[];
  allOffers: { id: number; slug: string; title: string; subtitle: string | null; priceLabel: string | null; description: string | null; image: string | null; ctaLink: string | null; badge: string | null; isActive: boolean }[];
  allBanners: { id: number; title: string; subtitle: string | null; image: string | null; ctaLink: string | null; isActive: boolean }[];
  allReels: { id: number; caption: string; thumbnail: string; productSlug: string | null; views: string | null; instagramUrl: string | null }[];
  allCats: { slug: string; name: string }[];
};

const ORDER_STATUS = ["PLACED", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminPage() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [seedBusy, setSeedBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nyc_admin_key");
    if (saved) { setKey(saved); setAuthed(true); }
  }, []);

  const load = async (k: string) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/admin/overview?key=${encodeURIComponent(k)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      setData(j);
    } catch {
      setData(null);
      localStorage.removeItem("nyc_admin_key");
      setAuthed(false);
      setMsg("Access denied. Check the configured admin key.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authed && key) load(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed]);

  const act = async (action: string, payload: Record<string, unknown> = {}) => {
    setMsg("");
    try {
      const r = await fetch(`/api/admin/overview?key=${encodeURIComponent(key)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed");
      setMsg("Saved ✓");
      setTimeout(() => setMsg(""), 2000);
      load(key);
    } catch (e) {
      setMsg("Action failed");
    }
  };

  const seed = async () => {
    setSeedBusy(true);
    try {
      const r = await fetch("/api/seed", {
        method: "POST",
        headers: key ? { "x-admin-key": key } : undefined,
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Seed failed");
      setMsg("Database seeded ✓");
      if (authed) load(key);
    } catch {
      setMsg("Seed failed or access was denied");
    } finally {
      setSeedBusy(false);
    }
  };

  if (!authed) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="border border-neutral-200 rounded-3xl p-8 text-center">
          <span className="inline-grid place-items-center w-14 h-14 rounded-full bg-black text-[#ffffff]"><Lock size={24} /></span>
          <h1 className="font-display font-extrabold text-2xl mt-4">Admin Panel</h1>
          <p className="text-[13px] text-neutral-500 mt-1">Enter the configured admin key to manage Reload Jodhpur.</p>
          <input value={key} onChange={(e) => setKey(e.target.value)} onKeyDown={(e) => e.key === "Enter" && key && (localStorage.setItem("nyc_admin_key", key), setAuthed(true))} type="password" placeholder="Admin key" className="mt-5 w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm" />
          <button onClick={() => { if (key) { localStorage.setItem("nyc_admin_key", key); setAuthed(true); } }} className="mt-3 w-full py-3.5 rounded-xl bg-black text-[#ffffff] font-extrabold text-[13px]">UNLOCK PANEL</button>
          <button onClick={seed} disabled={seedBusy} className="mt-2 w-full py-3 rounded-xl border border-neutral-200 text-[12px] font-bold">{seedBusy ? "SEEDING…" : "SEED DEMO DATA"}</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="text-[11px] font-bold tracking-[0.25em] text-[#ff0000]">RELOAD JODHPUR</p>
          <h1 className="font-display font-black text-2xl sm:text-3xl flex items-center gap-2.5">
            Admin Panel
            {data && (data as unknown as { databaseConfigured?: boolean }).databaseConfigured === false && (
              <span className="text-[10px] font-extrabold tracking-[0.15em] px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 align-middle">DEMO MODE</span>
            )}
          </h1>
          {data && (data as unknown as { databaseConfigured?: boolean }).databaseConfigured === false && (
            <p className="text-[12px] text-amber-800 mt-1">Database not configured — showing demo catalog. Edits are temporary until PostgreSQL is connected.</p>
          )}
        </div>
        <div className="flex gap-2">
          {msg && <span className="px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[12px] font-bold flex items-center gap-1"><Check size={13} /> {msg}</span>}
          <button onClick={seed} disabled={seedBusy} className="px-4 py-2.5 rounded-xl border border-neutral-200 text-[12px] font-extrabold">{seedBusy ? "…" : "RE-SEED"}</button>
          <button onClick={() => load(key)} className="px-4 py-2.5 rounded-xl border border-neutral-200 text-[12px] font-extrabold flex items-center gap-1.5"><RefreshCw size={13} /> REFRESH</button>
          <button onClick={() => { localStorage.removeItem("nyc_admin_key"); setAuthed(false); }} className="px-4 py-2.5 rounded-xl bg-black text-white text-[12px] font-extrabold">LOCK</button>
        </div>
      </div>

      <div className="flex gap-2 mt-5 overflow-x-auto no-scrollbar border-b border-neutral-200 pb-px">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn("flex items-center gap-1.5 px-4 py-2.5 text-[12.5px] font-extrabold whitespace-nowrap rounded-t-xl border-b-2 -mb-px", tab === t.id ? "border-black bg-neutral-100" : "border-transparent text-neutral-500")}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {loading || !data ? (
        <div className="py-16 text-center text-sm text-neutral-500">Loading dashboard…</div>
      ) : (
        <div className="py-6">
          {tab === "overview" && (
            <div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { l: "Products", v: data.stats.products, icon: <Package size={20} /> },
                  { l: "Orders", v: data.stats.orders, icon: <ShoppingBag size={20} /> },
                  { l: "Customers", v: data.stats.users, icon: <Users size={20} /> },
                  { l: "Revenue", v: formatINR(data.stats.revenue), icon: <Tag size={20} /> },
                ].map((s) => (
                  <div key={s.l} className="rounded-2xl border border-neutral-200 p-5 bg-white">
                    <span className="inline-grid place-items-center w-10 h-10 rounded-xl bg-black text-[#ffffff]">{s.icon}</span>
                    <p className="font-black text-2xl mt-2">{s.v}</p>
                    <p className="text-[12px] text-neutral-500 font-bold">{s.l}</p>
                  </div>
                ))}
              </div>
              <h3 className="font-extrabold mt-7 mb-3">Recent orders</h3>
              <OrdersTable orders={data.recentOrders} onStatus={(id, status) => act("update-order-status", { id, status })} />
            </div>
          )}

          {tab === "orders" && <OrdersTable orders={data.recentOrders} onStatus={(id, status) => act("update-order-status", { id, status })} />}

          {tab === "products" && <ProductsManager products={data.allProducts} cats={data.allCats} onAct={act} />}

          {tab === "offers" && (
            <div className="space-y-4">
              <AddOfferForm onAdd={(f) => act("add-offer", f)} />
              <div className="grid md:grid-cols-2 gap-4">
                {data.allOffers.map((o) => (
                  <OfferEditor key={o.id} offer={o} onSave={(f) => act("update-offer", { id: o.id, ...f })} onDelete={() => act("delete-offer", { id: o.id })} />
                ))}
              </div>
              {data.allOffers.length === 0 && <Empty label="No offers yet" />}
            </div>
          )}

          {tab === "banners" && (
            <div className="space-y-4">
              <AddBannerForm onAdd={(f) => act("add-banner", f)} />
              <div className="grid md:grid-cols-2 gap-4">
                {data.allBanners.map((b) => (
                  <div key={b.id} className="border border-neutral-200 rounded-2xl overflow-hidden">
                    {b.image && <span className="block relative h-44 bg-neutral-100"><Image src={b.image} alt={b.title} fill className="object-cover" /></span>}
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div><p className="font-extrabold text-[14px]">{b.title}</p><p className="text-[12px] text-neutral-500">{b.subtitle}</p></div>
                      <button onClick={() => act("delete-banner", { id: b.id })} className="p-2.5 rounded-lg bg-red-50 text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "reels" && (
            <div className="space-y-4">
              <AddReelForm onAdd={(f) => act("add-reel", f)} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.allReels.map((r) => (
                  <div key={r.id} className="border border-neutral-200 rounded-2xl overflow-hidden">
                    <span className="block relative aspect-[9/14] bg-neutral-100"><Image src={r.thumbnail} alt={r.caption} fill className="object-cover" /></span>
                    <div className="p-3">
                      <p className="text-[12px] font-bold line-clamp-2">{r.caption}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[11px] text-neutral-500">{r.views} · {r.productSlug ?? "no product"}</span>
                        <button onClick={() => act("delete-reel", { id: r.id })} className="p-1.5 rounded-lg bg-red-50 text-red-600" aria-label="Delete"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === "settings" && <SettingsForm onSave={(settings) => act("update-settings", { settings })} />}
        </div>
      )}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div className="border border-dashed border-neutral-300 rounded-2xl p-10 text-center text-sm text-neutral-500">{label}</div>;
}

function OrdersTable({ orders, onStatus }: { orders: Data["recentOrders"]; onStatus: (id: number, s: string) => void }) {
  if (!orders.length) return <Empty label="No orders yet — share your store link to get the first order!" />;
  return (
    <div className="border border-neutral-200 rounded-2xl overflow-hidden overflow-x-auto">
      <table className="w-full text-[13px] min-w-[720px]">
        <thead><tr className="bg-neutral-900 text-[#ffffff] text-left"><th className="p-3">Order</th><th className="p-3">Customer</th><th className="p-3">Total</th><th className="p-3">Type</th><th className="p-3">Status</th><th className="p-3">Date</th></tr></thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t border-neutral-100">
              <td className="p-3 font-extrabold">#{o.orderNumber}</td>
              <td className="p-3">{o.customerName}<span className="block text-[11px] text-neutral-500">{o.mobile}</span></td>
              <td className="p-3 font-bold">{formatINR(o.total)}</td>
              <td className="p-3 text-[12px]">{o.deliveryMethod === "STORE_PICKUP" ? "Pickup" : "Delivery"}</td>
              <td className="p-3">
                <select value={o.status} onChange={(e) => onStatus(o.id, e.target.value)} className="border border-neutral-200 rounded-lg px-2 py-1.5 text-[12px] font-bold bg-white">
                  {ORDER_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </td>
              <td className="p-3 text-[12px] text-neutral-500">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProductsManager({ products, cats, onAct }: { products: Data["allProducts"]; cats: Data["allCats"]; onAct: (a: string, p: Record<string, unknown>) => void }) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", price: 0, mrp: 0, stockTotal: 50, isActive: true, isNewArrival: false, isTrending: false });
  const [showAdd, setShowAdd] = useState(false);
  const [add, setAdd] = useState({ name: "", price: "999", mrp: "1999", categorySlug: "men-casual", audience: "men", image: "", stockTotal: "50" });

  const list = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  const inp = "border border-neutral-200 rounded-lg px-2.5 py-1.5 text-[13px] w-full bg-white";

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products…" className="flex-1 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm" />
        <button onClick={() => setShowAdd(!showAdd)} className="px-5 py-2.5 rounded-xl bg-black text-[#ffffff] text-[12px] font-extrabold flex items-center gap-1.5"><Plus size={14} /> ADD</button>
      </div>
      {showAdd && (
        <div className="border-2 border-dashed border-[#ff0000] rounded-2xl p-4 mb-4 grid sm:grid-cols-3 gap-2.5 bg-[#f7f7f7]">
          <input value={add.name} onChange={(e) => setAdd({ ...add, name: e.target.value })} placeholder="Product name" className={inp} />
          <input value={add.price} onChange={(e) => setAdd({ ...add, price: e.target.value })} placeholder="Price" type="number" className={inp} />
          <input value={add.mrp} onChange={(e) => setAdd({ ...add, mrp: e.target.value })} placeholder="MRP" type="number" className={inp} />
          <select value={add.categorySlug} onChange={(e) => setAdd({ ...add, categorySlug: e.target.value })} className={inp}>
            {cats.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
          <input value={add.image} onChange={(e) => setAdd({ ...add, image: e.target.value })} placeholder="Image URL" className={inp} />
          <input value={add.stockTotal} onChange={(e) => setAdd({ ...add, stockTotal: e.target.value })} placeholder="Stock" type="number" className={inp} />
          <button onClick={() => { onAct("create-product", { ...add, audience: add.categorySlug.startsWith("kids") ? "kids" : "men" }); setShowAdd(false); }} className="sm:col-span-3 py-2.5 rounded-xl gold-bg text-white text-[12px] font-extrabold">CREATE PRODUCT</button>
        </div>
      )}
      <div className="border border-neutral-200 rounded-2xl overflow-hidden overflow-x-auto">
        <table className="w-full text-[13px] min-w-[760px]">
          <thead><tr className="bg-neutral-900 text-[#ffffff] text-left"><th className="p-3">Product</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Flags</th><th className="p-3">Active</th><th className="p-3">Actions</th></tr></thead>
          <tbody>
            {list.map((p) => (
              <tr key={p.id} className="border-t border-neutral-100">
                <td className="p-3">
                  {editing === p.id ? (
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inp} />
                  ) : (
                    <><span className="font-bold">{p.name}</span><span className="block text-[11px] text-neutral-500">{p.categorySlug}</span></>
                  )}
                </td>
                <td className="p-3">
                  {editing === p.id ? (
                    <span className="flex gap-1"><input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={cn(inp, "w-20")} /><input type="number" value={form.mrp} onChange={(e) => setForm({ ...form, mrp: Number(e.target.value) })} className={cn(inp, "w-20")} /></span>
                  ) : (
                    <><span className="font-bold">{formatINR(p.price)}</span> <span className="text-neutral-400 line-through text-[12px]">{formatINR(p.mrp)}</span></>
                  )}
                </td>
                <td className="p-3">{editing === p.id ? <input type="number" value={form.stockTotal} onChange={(e) => setForm({ ...form, stockTotal: Number(e.target.value) })} className={cn(inp, "w-20")} /> : p.stockTotal}</td>
                <td className="p-3 text-[11px]">
                  {editing === p.id ? (
                    <span className="flex gap-2">
                      <label className="flex items-center gap-1"><input type="checkbox" checked={form.isNewArrival} onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })} /> NEW</label>
                      <label className="flex items-center gap-1"><input type="checkbox" checked={form.isTrending} onChange={(e) => setForm({ ...form, isTrending: e.target.checked })} /> TREND</label>
                    </span>
                  ) : (
                    <span className="flex gap-1">{p.isNewArrival && <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">NEW</span>}{p.isTrending && <span className="bg-black text-[#ffffff] px-1.5 py-0.5 rounded font-bold">TREND</span>}</span>
                  )}
                </td>
                <td className="p-3">
                  {editing === p.id ? (
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                  ) : (
                    <span className={cn("text-[11px] font-extrabold px-2 py-1 rounded", p.isActive ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-700")}>{p.isActive ? "LIVE" : "HIDDEN"}</span>
                  )}
                </td>
                <td className="p-3">
                  {editing === p.id ? (
                    <span className="flex gap-1.5">
                      <button onClick={() => { onAct("update-product", { id: p.id, ...form }); setEditing(null); }} className="px-3 py-1.5 rounded-lg bg-black text-white text-[11px] font-extrabold">SAVE</button>
                      <button onClick={() => setEditing(null)} className="px-3 py-1.5 rounded-lg border text-[11px] font-bold">X</button>
                    </span>
                  ) : (
                    <span className="flex gap-1.5">
                      <button onClick={() => { setEditing(p.id); setForm({ name: p.name, price: p.price, mrp: p.mrp, stockTotal: p.stockTotal, isActive: p.isActive, isNewArrival: p.isNewArrival, isTrending: p.isTrending }); }} className="px-3 py-1.5 rounded-lg border text-[11px] font-extrabold">EDIT</button>
                      <button onClick={() => onAct("toggle-product", { id: p.id })} className="px-3 py-1.5 rounded-lg border text-[11px] font-bold">{p.isActive ? "HIDE" : "SHOW"}</button>
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OfferEditor({ offer, onSave, onDelete }: { offer: Data["allOffers"][number]; onSave: (f: Record<string, unknown>) => void; onDelete: () => void }) {
  const [f, setF] = useState({ title: offer.title, subtitle: offer.subtitle ?? "", priceLabel: offer.priceLabel ?? "", description: offer.description ?? "", ctaLink: offer.ctaLink ?? "/offers", isActive: offer.isActive });
  const inp = "border border-neutral-200 rounded-lg px-3 py-2 text-[13px] w-full bg-white";
  return (
    <div className="border border-neutral-200 rounded-2xl overflow-hidden">
      {offer.image && <span className="block relative h-40 bg-neutral-100"><Image src={offer.image} alt={offer.title} fill className="object-cover" /></span>}
      <div className="p-4 space-y-2">
        <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title" className={inp} />
        <div className="grid grid-cols-2 gap-2">
          <input value={f.subtitle} onChange={(e) => setF({ ...f, subtitle: e.target.value })} placeholder="Subtitle" className={inp} />
          <input value={f.priceLabel} onChange={(e) => setF({ ...f, priceLabel: e.target.value })} placeholder="Price label (₹1149)" className={cn(inp, "font-extrabold")} />
        </div>
        <input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Description" className={inp} />
        <input value={f.ctaLink} onChange={(e) => setF({ ...f, ctaLink: e.target.value })} placeholder="Link" className={inp} />
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-1.5 text-[12px] font-bold"><input type="checkbox" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} /> Active</label>
          <span className="flex gap-2">
            <button onClick={onDelete} className="p-2 rounded-lg bg-red-50 text-red-600" aria-label="Delete"><Trash2 size={15} /></button>
            <button onClick={() => onSave(f)} className="px-5 py-2 rounded-lg bg-black text-white text-[12px] font-extrabold">SAVE</button>
          </span>
        </div>
      </div>
    </div>
  );
}

function AddOfferForm({ onAdd }: { onAdd: (f: Record<string, string>) => void }) {
  const [f, setF] = useState({ title: "", subtitle: "", priceLabel: "", description: "", image: "", badge: "", ctaLink: "/offers" });
  const [open, setOpen] = useState(false);
  if (!open) return <button onClick={() => setOpen(true)} className="px-5 py-2.5 rounded-xl bg-black text-[#ffffff] text-[12px] font-extrabold flex items-center gap-1.5"><Plus size={14} /> NEW OFFER</button>;
  const inp = "border border-neutral-200 rounded-lg px-3 py-2 text-[13px] w-full bg-white";
  return (
    <div className="border-2 border-dashed border-[#ff0000] rounded-2xl p-4 grid sm:grid-cols-3 gap-2 bg-[#f7f7f7]">
      <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title (COMBO DEALS)" className={inp} />
      <input value={f.subtitle} onChange={(e) => setF({ ...f, subtitle: e.target.value })} placeholder="Subtitle" className={inp} />
      <input value={f.priceLabel} onChange={(e) => setF({ ...f, priceLabel: e.target.value })} placeholder="Price label (FROM ₹999)" className={inp} />
      <input value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} placeholder="Image URL" className={inp} />
      <input value={f.badge} onChange={(e) => setF({ ...f, badge: e.target.value })} placeholder="Badge (LIMITED)" className={inp} />
      <input value={f.ctaLink} onChange={(e) => setF({ ...f, ctaLink: e.target.value })} placeholder="Link" className={inp} />
      <input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="Description" className={cn(inp, "sm:col-span-3")} />
      <button onClick={() => { onAdd(f); setOpen(false); }} className="sm:col-span-3 py-2.5 rounded-xl gold-bg text-white text-[12px] font-extrabold">ADD OFFER</button>
    </div>
  );
}

function AddBannerForm({ onAdd }: { onAdd: (f: Record<string, string>) => void }) {
  const [f, setF] = useState({ title: "", subtitle: "", image: "", ctaText: "SHOP NOW", ctaLink: "/men" });
  const [open, setOpen] = useState(false);
  if (!open) return <button onClick={() => setOpen(true)} className="px-5 py-2.5 rounded-xl bg-black text-[#ffffff] text-[12px] font-extrabold flex items-center gap-1.5"><Plus size={14} /> NEW BANNER</button>;
  const inp = "border border-neutral-200 rounded-lg px-3 py-2 text-[13px] w-full bg-white";
  return (
    <div className="border-2 border-dashed border-[#ff0000] rounded-2xl p-4 grid sm:grid-cols-2 gap-2 bg-[#f7f7f7]">
      <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title" className={inp} />
      <input value={f.subtitle} onChange={(e) => setF({ ...f, subtitle: e.target.value })} placeholder="Subtitle" className={inp} />
      <input value={f.image} onChange={(e) => setF({ ...f, image: e.target.value })} placeholder="Image URL (replaceable banner slot)" className={inp} />
      <input value={f.ctaLink} onChange={(e) => setF({ ...f, ctaLink: e.target.value })} placeholder="Link (/men)" className={inp} />
      <button onClick={() => { onAdd(f); setOpen(false); }} className="sm:col-span-2 py-2.5 rounded-xl gold-bg text-white text-[12px] font-extrabold">ADD BANNER</button>
    </div>
  );
}

function AddReelForm({ onAdd }: { onAdd: (f: Record<string, string>) => void }) {
  const [f, setF] = useState({ caption: "", thumbnail: "", videoUrl: "", instagramUrl: "", productSlug: "", views: "1K" });
  const [open, setOpen] = useState(false);
  if (!open) return <button onClick={() => setOpen(true)} className="px-5 py-2.5 rounded-xl bg-black text-[#ffffff] text-[12px] font-extrabold flex items-center gap-1.5"><Plus size={14} /> ADD REEL</button>;
  const inp = "border border-neutral-200 rounded-lg px-3 py-2 text-[13px] w-full bg-white";
  return (
    <div className="border-2 border-dashed border-[#ff0000] rounded-2xl p-4 grid sm:grid-cols-3 gap-2 bg-[#f7f7f7]">
      <input value={f.caption} onChange={(e) => setF({ ...f, caption: e.target.value })} placeholder="Caption" className={inp} />
      <input value={f.thumbnail} onChange={(e) => setF({ ...f, thumbnail: e.target.value })} placeholder="Thumbnail image URL (9:16)" className={inp} />
      <input value={f.videoUrl} onChange={(e) => setF({ ...f, videoUrl: e.target.value })} placeholder="Video URL (optional)" className={inp} />
      <input value={f.instagramUrl} onChange={(e) => setF({ ...f, instagramUrl: e.target.value })} placeholder="Instagram reel URL" className={inp} />
      <input value={f.productSlug} onChange={(e) => setF({ ...f, productSlug: e.target.value })} placeholder="Linked product slug" className={inp} />
      <input value={f.views} onChange={(e) => setF({ ...f, views: e.target.value })} placeholder="Views (10K)" className={inp} />
      <button onClick={() => { onAdd(f); setOpen(false); }} className="sm:col-span-3 py-2.5 rounded-xl gold-bg text-white text-[12px] font-extrabold">ADD REEL</button>
    </div>
  );
}

function SettingsForm({ onSave }: { onSave: (s: Record<string, string>) => void }) {
  const [s, setS] = useState({ announcement: "RELOAD JODHPUR • YOUR SEARCH END HERE • MEN'S WEAR", delivery_charge: "49", free_shipping_above: "1499", store_phone: "+91 72620 26149", store_address: "Opp. Manu Computer, C Sector, Saraswati Nagar, Madhuban Main Road, Jodhpur, Rajasthan", instagram_url: "https://instagram.com/reloadjodhpur__0072" });
  const inp = "border border-neutral-200 rounded-lg px-3 py-2.5 text-[13px] w-full bg-white";
  return (
    <div className="max-w-2xl border border-neutral-200 rounded-2xl p-5 space-y-3">
      <p className="text-[13px] text-neutral-500">Store info, announcement bar & charges — editable anytime.</p>
      {Object.entries({ announcement: "Announcement bar", delivery_charge: "Delivery charge (₹)", free_shipping_above: "Free shipping above (₹)", store_phone: "Store phone", store_address: "Store address", instagram_url: "Instagram URL" }).map(([k, label]) => (
        <div key={k}><label className="text-[12px] font-bold text-neutral-600">{label}</label><input value={s[k as keyof typeof s]} onChange={(e) => setS({ ...s, [k]: e.target.value })} className={`${inp} mt-1`} /></div>
      ))}
      <button onClick={() => onSave(s)} className="w-full py-3 rounded-xl bg-black text-[#ffffff] text-[13px] font-extrabold">SAVE SETTINGS</button>
    </div>
  );
}
