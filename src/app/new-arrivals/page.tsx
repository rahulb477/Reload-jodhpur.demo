import { Suspense } from "react";
import ShopClient from "@/components/ShopClient";

export const metadata = { title: "New Arrivals", description: "Fresh fashion drops every week at Reload Jodhpur, Jodhpur." };

export default function NewArrivalsPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm text-neutral-500">Loading…</div>}>
      <ShopClient title="New Arrivals" subtitle="Fresh drops, updated every week." flag="new" />
    </Suspense>
  );
}
