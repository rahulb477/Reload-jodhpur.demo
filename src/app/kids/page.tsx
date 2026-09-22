import { Suspense } from "react";
import ShopClient from "@/components/ShopClient";

export const metadata = { title: "Kids Wear", description: "Trendy kids wear — boys, girls, topwear & bottomwear at Reload Jodhpur." };

export default function KidsPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm text-neutral-500">Loading…</div>}>
      <ShopClient title="Kids" subtitle="Boys · Girls · Topwear · Bottomwear" audience="kids" />
    </Suspense>
  );
}
