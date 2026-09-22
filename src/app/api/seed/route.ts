import { NextRequest, NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { getDb } from "@/db";
import { isDatabaseConfigured, databaseUnavailableResponse } from "@/lib/database";
import { categories, products, productImages, banners, offers, reels, siteSettings, reviews } from "@/db/schema";
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_BANNERS, SEED_OFFERS, SEED_REELS, SEED_SETTINGS } from "@/lib/seed-data";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAdminRequest(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      databaseUnavailableResponse({ error: "Seeding requires DATABASE_URL. Demo mode already serves local data." }),
      { status: 503 }
    );
  }
  try {
    const db = getDb();
    if (!db) {
      return NextResponse.json(databaseUnavailableResponse({ error: "Database unavailable." }), { status: 503 });
    }
    for (const c of SEED_CATEGORIES) {
      await db.insert(categories).values({
        slug: c.slug, name: c.name, audience: c.audience,
        parentSlug: c.parentSlug, image: c.image, description: c.description, sortOrder: c.sortOrder,
      }).onConflictDoNothing({ target: categories.slug });
    }
    for (const p of SEED_PRODUCTS) {
      const existing = await db.select({ id: products.id }).from(products).where(eq(products.slug, p.slug)).limit(1);
      let pid: number;
      if (existing.length) {
        pid = existing[0].id;
      } else {
        const ins = await db.insert(products).values({
          slug: p.slug, name: p.name, shortDesc: p.shortDesc, description: p.description,
          categorySlug: p.categorySlug, audience: p.audience, price: p.price, mrp: p.mrp,
          rating: p.rating, ratingCount: p.ratingCount, tags: p.tags, badges: p.badges,
          fits: p.fits, colors: p.colors, sizes: p.sizes, keywords: p.keywords,
          fabric: p.fabric, fit: p.fit, washCare: "Machine wash cold. Do not bleach. Dry in shade.",
          isNewArrival: p.isNewArrival, isTrending: p.isTrending,
          bestsellerScore: p.bestsellerScore, stockTotal: p.stockTotal,
        }).returning({ id: products.id });
        pid = ins[0].id;
        for (let i = 0; i < p.images.length; i++) {
          await db.insert(productImages).values({ productId: pid, url: p.images[i], alt: p.name, sortOrder: i, isPrimary: i === 0 });
        }
      }
    }
    for (const b of SEED_BANNERS) {
      await db.insert(banners).values({ title: b.title, subtitle: b.subtitle, image: b.image, ctaText: b.ctaText, ctaLink: b.ctaLink, sortOrder: b.sortOrder }).onConflictDoNothing();
    }
    for (const o of SEED_OFFERS) {
      await db.insert(offers).values({
        slug: o.slug, title: o.title, subtitle: o.subtitle, priceLabel: o.priceLabel,
        description: o.description, image: o.image, badge: o.badge, ctaText: o.ctaText, ctaLink: o.ctaLink, sortOrder: o.sortOrder,
      }).onConflictDoNothing({ target: offers.slug });
    }
    for (const r of SEED_REELS) {
      await db.insert(reels).values({ caption: r.caption, thumbnail: r.thumbnail, productSlug: r.productSlug, views: r.views, instagramUrl: r.instagramUrl }).onConflictDoNothing();
    }
    for (const [key, value] of Object.entries(SEED_SETTINGS)) {
      await db.insert(siteSettings).values({ key, value }).onConflictDoNothing({ target: siteSettings.key });
    }
    const allProducts = await db.select({ id: products.id }).from(products).limit(6);
    const sampleReviews = [
      { userName: "Rohit S.", rating: 5, title: "Best fitting jeans in Jodhpur", comment: "Fabric is premium and fitting is perfect. Store staff helped me pick the right size." },
      { userName: "Amit K.", rating: 5, title: "Combo is value for money", comment: "Got jeans + tee combo at ₹1149. Quality is genuinely good for the price." },
      { userName: "Yash M.", rating: 4, title: "Trendy boxy tee", comment: "Heavy fabric, nice drop shoulders. Will buy more colours." },
    ];
    for (const pr of allProducts.slice(0, 3)) {
      for (const rv of sampleReviews) {
        await db.insert(reviews).values({ productId: pr.id, ...rv }).onConflictDoNothing();
      }
    }
    return NextResponse.json({ ok: true, message: "Seeded", databaseConfigured: true });
  } catch (e) {
    console.error("seed", e);
    return NextResponse.json({ error: "Seed failed", detail: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return POST(req);
}
