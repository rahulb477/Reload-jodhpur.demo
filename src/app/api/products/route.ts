import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { isDatabaseConfigured } from "@/lib/database";
import { products, productImages } from "@/db/schema";
import { eq, and, desc, asc, ilike, or, gte, lte, sql, SQL } from "drizzle-orm";
import { demoQueryProducts } from "@/lib/demo-catalog";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const q = sp.get("q")?.trim() ?? "";
  const slug = sp.get("slug") ?? "";
  const category = sp.get("category") ?? "";
  const audience = sp.get("audience") ?? "";
  const flag = sp.get("flag") ?? "";
  const sort = sp.get("sort") ?? "relevance";
  const limit = Math.min(Number(sp.get("limit") ?? 48), 100);
  const offset = Number(sp.get("offset") ?? 0);
  const minPrice = sp.get("minPrice") ? Number(sp.get("minPrice")) : null;
  const maxPrice = sp.get("maxPrice") ? Number(sp.get("maxPrice")) : null;
  const size = sp.get("size") ?? "";
  const fit = sp.get("fit") ?? "";
  const color = sp.get("color") ?? "";
  const minDiscount = sp.get("minDiscount") ? Number(sp.get("minDiscount")) : 0;

  // ---- DEMO MODE: no DATABASE_URL → local data, full search/filter/sort ----
  if (!isDatabaseConfigured()) {
    const out = demoQueryProducts({
      q, slug, category, audience, flag, sort, limit, offset,
      minPrice, maxPrice, size, fit, color, minDiscount,
    });
    return NextResponse.json({ products: out, total: out.length, databaseConfigured: false, demo: true });
  }

  try {
    const db = getDb();
    if (!db) throw new Error("Database not available");

    const conds: SQL[] = [eq(products.isActive, true)];
    if (slug) conds.push(eq(products.slug, slug));
    if (category) conds.push(eq(products.categorySlug, category));
    if (audience) conds.push(eq(products.audience, audience));
    if (flag === "new") conds.push(eq(products.isNewArrival, true));
    if (flag === "trending") conds.push(eq(products.isTrending, true));
    if (minPrice != null) conds.push(gte(products.price, minPrice));
    if (maxPrice != null) conds.push(lte(products.price, maxPrice));
    if (q) {
      const like = `%${q}%`;
      conds.push(
        or(
          ilike(products.name, like),
          ilike(products.keywords, like),
          ilike(products.categorySlug, like),
          ilike(products.description, like),
          ilike(products.shortDesc, like)
        ) as SQL
      );
    }

    let orderBy: SQL = desc(products.bestsellerScore);
    if (sort === "price-asc") orderBy = asc(products.price);
    else if (sort === "price-desc") orderBy = desc(products.price);
    else if (sort === "newest") orderBy = desc(products.createdAt);
    else if (sort === "rating") orderBy = desc(products.rating);
    else if (sort === "discount") orderBy = sql`(((${products.mrp} - ${products.price}) * 100.0 / NULLIF(${products.mrp},0))) DESC`;

    const rows = await db
      .select()
      .from(products)
      .where(and(...conds))
      .orderBy(orderBy)
      .limit(limit + 50)
      .offset(offset);

    let filtered = rows;
    if (size) filtered = filtered.filter((p) => (p.sizes as string[] | null)?.includes(size));
    if (fit) filtered = filtered.filter((p) => (p.fits as string[] | null)?.includes(fit) || p.fit === fit);
    if (color) filtered = filtered.filter((p) => (p.colors as string[] | null)?.some((c) => c.toLowerCase().includes(color.toLowerCase())));
    if (minDiscount > 0) filtered = filtered.filter((p) => p.mrp > p.price && ((p.mrp - p.price) / p.mrp) * 100 >= minDiscount);
    filtered = filtered.slice(0, limit);

    const out = [];
    for (const p of filtered) {
      const imgs = await db.select().from(productImages).where(eq(productImages.productId, p.id)).orderBy(productImages.sortOrder);
      out.push({ ...p, images: imgs });
    }
    return NextResponse.json({ products: out, total: out.length, databaseConfigured: true });
  } catch (e) {
    // DB error → graceful demo fallback (never 500 the storefront)
    console.error("products api (falling back to demo)", e);
    const out = demoQueryProducts({
      q, slug, category, audience, flag, sort, limit, offset,
      minPrice, maxPrice, size, fit, color, minDiscount,
    });
    return NextResponse.json({ products: out, total: out.length, databaseConfigured: false, demo: true });
  }
}
