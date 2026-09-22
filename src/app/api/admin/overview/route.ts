import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { isDatabaseConfigured, databaseUnavailableResponse } from "@/lib/database";
import { products, orders, users, offers, banners, reels, categories } from "@/db/schema";
import { desc, eq, count, sum } from "drizzle-orm";
import { demoProducts, demoOffers, demoBanners, demoReels, demoCategories } from "@/lib/demo-catalog";
import { isAdminRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function demoOverview() {
  const prods = demoProducts();
  return {
    stats: {
      products: prods.length,
      orders: 0,
      users: 0,
      revenue: 0,
    },
    recentOrders: [],
    allProducts: prods.map((p) => ({
      id: p.id, slug: p.slug, name: p.name, price: p.price, mrp: p.mrp,
      stockTotal: p.stockTotal ?? 50, isActive: true,
      isNewArrival: !!p.isNewArrival, isTrending: !!p.isTrending,
      categorySlug: p.categorySlug, badges: p.badges ?? [],
    })),
    allOffers: demoOffers(),
    allBanners: demoBanners(),
    allReels: demoReels(),
    allCats: demoCategories(),
    ...databaseUnavailableResponse(),
  };
}

export async function GET(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!isDatabaseConfigured()) {
    return NextResponse.json(demoOverview());
  }
  try {
    const db = getDb();
    if (!db) return NextResponse.json(demoOverview());
    const [pc] = await db.select({ c: count() }).from(products);
    const [oc] = await db.select({ c: count() }).from(orders);
    const [uc] = await db.select({ c: count() }).from(users);
    const rev = await db.select({ s: sum(orders.total) }).from(orders);
    const recentOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(20);
    const allProducts = await db.select().from(products).orderBy(desc(products.createdAt)).limit(100);
    const allOffers = await db.select().from(offers);
    const allBanners = await db.select().from(banners);
    const allReels = await db.select().from(reels);
    const allCats = await db.select().from(categories);
    return NextResponse.json({
      stats: {
        products: Number(pc.c), orders: Number(oc.c), users: Number(uc.c),
        revenue: Number(rev[0]?.s ?? 0),
      },
      recentOrders, allProducts, allOffers, allBanners, allReels, allCats,
      databaseConfigured: true,
    });
  } catch (e) {
    console.error("admin overview (demo fallback)", e);
    return NextResponse.json(demoOverview());
  }
}

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // Demo mode: acknowledge writes so the panel stays usable (local/demo state).
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: true, ...databaseUnavailableResponse() });
  }
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ ok: true, ...databaseUnavailableResponse() });
    const body = await req.json();
    const { action } = body as { action: string };
    if (action === "update-order-status") {
      await db.update(orders).set({ status: body.status }).where(eq(orders.id, body.id));
      return NextResponse.json({ ok: true, databaseConfigured: true });
    }
    if (action === "update-offer") {
      await db.update(offers).set({
        title: body.title, subtitle: body.subtitle, priceLabel: body.priceLabel,
        description: body.description, ctaLink: body.ctaLink, isActive: body.isActive,
      }).where(eq(offers.id, body.id));
      return NextResponse.json({ ok: true, databaseConfigured: true });
    }
    if (action === "update-product") {
      await db.update(products).set({
        name: body.name, price: Number(body.price), mrp: Number(body.mrp),
        stockTotal: Number(body.stockTotal ?? 50), isActive: body.isActive,
        isNewArrival: body.isNewArrival, isTrending: body.isTrending,
        badges: body.badges ?? [],
      }).where(eq(products.id, body.id));
      return NextResponse.json({ ok: true, databaseConfigured: true });
    }
    if (action === "create-product") {
      const slug = (body.name as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 100) + "-" + Date.now().toString(36);
      const ins = await db.insert(products).values({
        slug, name: body.name, shortDesc: body.shortDesc ?? "", description: body.description ?? "",
        categorySlug: body.categorySlug ?? "men-casual", audience: body.audience ?? "men",
        price: Number(body.price ?? 999), mrp: Number(body.mrp ?? 1999),
        sizes: body.sizes ?? ["M", "L", "XL"], colors: body.colors ?? ["Black"],
        isNewArrival: true, stockTotal: Number(body.stockTotal ?? 50),
      }).returning({ id: products.id });
      if (body.image) {
        const { productImages } = await import("@/db/schema");
        await db.insert(productImages).values({ productId: ins[0].id, url: body.image, alt: body.name, sortOrder: 0, isPrimary: true });
      }
      return NextResponse.json({ ok: true, slug, databaseConfigured: true });
    }
    if (action === "toggle-product") {
      const rows = await db.select().from(products).where(eq(products.id, body.id)).limit(1);
      if (rows.length) await db.update(products).set({ isActive: !rows[0].isActive }).where(eq(products.id, body.id));
      return NextResponse.json({ ok: true, databaseConfigured: true });
    }
    if (action === "add-reel") {
      await db.insert(reels).values({ caption: body.caption, thumbnail: body.thumbnail, videoUrl: body.videoUrl ?? null, instagramUrl: body.instagramUrl ?? null, productSlug: body.productSlug ?? null, views: body.views ?? "1K" });
      return NextResponse.json({ ok: true, databaseConfigured: true });
    }
    if (action === "delete-reel") {
      const { reels: reelsT } = await import("@/db/schema");
      await db.delete(reelsT).where(eq(reelsT.id, body.id));
      return NextResponse.json({ ok: true, databaseConfigured: true });
    }
    if (action === "add-banner") {
      await db.insert(banners).values({ title: body.title, subtitle: body.subtitle ?? "", image: body.image ?? null, ctaText: body.ctaText ?? "SHOP NOW", ctaLink: body.ctaLink ?? "/men" });
      return NextResponse.json({ ok: true, databaseConfigured: true });
    }
    if (action === "delete-banner") {
      await db.delete(banners).where(eq(banners.id, body.id));
      return NextResponse.json({ ok: true, databaseConfigured: true });
    }
    if (action === "add-offer") {
      const slug = (body.title as string).toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60) + "-" + Date.now().toString(36);
      await db.insert(offers).values({ slug, title: body.title, subtitle: body.subtitle ?? "", priceLabel: body.priceLabel ?? "", description: body.description ?? "", image: body.image ?? null, badge: body.badge ?? null, ctaLink: body.ctaLink ?? "/offers" });
      return NextResponse.json({ ok: true, databaseConfigured: true });
    }
    if (action === "delete-offer") {
      await db.delete(offers).where(eq(offers.id, body.id));
      return NextResponse.json({ ok: true, databaseConfigured: true });
    }
    if (action === "update-settings") {
      const { siteSettings } = await import("@/db/schema");
      for (const [k, v] of Object.entries(body.settings as Record<string, string>)) {
        const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, k)).limit(1);
        if (existing.length) await db.update(siteSettings).set({ value: String(v) }).where(eq(siteSettings.key, k));
        else await db.insert(siteSettings).values({ key: k, value: String(v) });
      }
      return NextResponse.json({ ok: true, databaseConfigured: true });
    }
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (e) {
    console.error("admin post", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
