import { Suspense } from "react";
import ShopClient from "@/components/ShopClient";

export const metadata = { title: "Men's Fashion", description: "Men's jeans, shirts, t-shirts, trousers, jackets & combos in Jodhpur." };

export default function MenPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm text-neutral-500">Loading…</div>}>
      <ShopClient title="Men" subtitle="Jeans · Shirts · T-Shirts · Trousers · Jackets · Combos" audience="men" />
    </Suspense>
  );
}
