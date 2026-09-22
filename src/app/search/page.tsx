import { Suspense } from "react";
import ShopClient from "@/components/ShopClient";
import SearchWrapper from "./search-wrapper";

export const metadata = { title: "Search", description: "Search styles at Reload Jodhpur." };

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="p-16 text-center text-sm text-neutral-500">Searching…</div>}>
      <SearchWrapper />
    </Suspense>
  );
}
