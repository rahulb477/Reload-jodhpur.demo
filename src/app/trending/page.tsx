import { Suspense } from "react";
import ShopClient from "@/components/ShopClient";

export const metadata = { title: "Trending Now", description: "Styles everyone's talking about — trending men's fashion in Jodhpur." };

export default function TrendingPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm text-neutral-500">Loading…</div>}>
      <ShopClient title="Trending Now" subtitle="Styles everyone's talking about." flag="trending" />
    </Suspense>
  );
}
