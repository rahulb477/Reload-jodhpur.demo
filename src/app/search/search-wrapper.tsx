"use client";

import { useSearchParams } from "next/navigation";
import ShopClient from "@/components/ShopClient";

export default function SearchWrapper() {
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  return <ShopClient key={q} title={q ? `Results for “${q}”` : "Search"} subtitle="Search by name, category, fit & keywords." query={q} />;
}
