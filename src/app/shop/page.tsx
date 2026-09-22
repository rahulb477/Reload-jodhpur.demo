import { Suspense } from "react";
import ShopClient from "@/components/ShopClient";

export const metadata = { title: "Shop All", description: "Shop all men's fashion and kids wear at Reload Jodhpur, Jodhpur." };

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm text-neutral-500">Loading collection…</div>}>
      <ShopClient title="Shop All" subtitle="Every style from Reload Jodhpur." />
    </Suspense>
  );
}
