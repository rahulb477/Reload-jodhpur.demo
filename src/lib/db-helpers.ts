/**
 * Server data helpers — DB-first with automatic demo fallback.
 * When DATABASE_URL is missing (or the DB errors), every helper returns
 * local demo data so pages ALWAYS render. UI code is unchanged.
 */
import { getDb } from "@/db";
import { isDatabaseConfigured } from "@/lib/database";
import { products, productImages, categories, banners, offers, reels, siteSettings, reviews } from "@/db/schema";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import {
  demoProducts,
  demoGetProductBySlug,
  demoRelated,
  demoQueryProducts,
  demoBanners,
  demoOffers,
  demoReels,
  demoCategories,
  demoSettings,
  demoReviews,
  type DemoProduct,
} from "./demo-catalog";

export type ProductWithImages = typeof products.$inferSelect & {
  images: (typeof productImages.$inferSelect)[];
  categoryName?: string;
};

function demoToProduct(p: DemoProduct): ProductWithImages {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    shortDesc: p.shortDesc,
    description: p.description,
    categorySlug: p.categorySlug,
    audience: p.audience,
    brand: p.brand,
    price: p.price,
    mrp: p.mrp,
    rating: p.rating,
    ratingCount: p.ratingCount,
    tags: p.tags,
    badges: p.badges,
    fits: p.fits,
    colors: p.colors,
    sizes: p.sizes,
    keywords: p.keywords,
    fabric: p.fabric,
    fit: p.fit,
    washCare: p.washCare,
    isNewArrival: p.isNewArrival,
    isTrending: p.isTrending,
    isActive: p.isActive,
    bestsellerScore: p.bestsellerScore,
    stockTotal: p.stockTotal,
    createdAt: p.createdAt,
    images: p.images.map((im) => ({ ...im, alt: im.alt })),
    categoryName: p.categoryName,
  };
}

export async function getProductsWithImages(limit = 100): Promise<ProductWithImages[]> {
  if (!isDatabaseConfigured()) {
    return demoProducts().slice(0, limit).map(demoToProduct);
  }
  try {
    const db = getDb();
    if (!db) throw new Error("no db");
    const rows = await db.select().from(products).where(eq(products.isActive, true)).orderBy(desc(products.bestsellerScore)).limit(limit);
    const out: ProductWithImages[] = [];
    for (const p of rows) {
      const imgs = await db.select().from(productImages).where(eq(productImages.productId, p.id)).orderBy(productImages.sortOrder);
      out.push({ ...p, images: imgs });
    }
    return out.length ? out : demoProducts().slice(0, limit).map(demoToProduct);
  } catch {
    return demoProducts().slice(0, limit).map(demoToProduct);
  }
}

export async function getProductBySlug(slug: string): Promise<ProductWithImages | null> {
  if (!isDatabaseConfigured()) {
    const d = demoGetProductBySlug(slug);
    return d ? demoToProduct(d) : null;
  }
  try {
    const db = getDb();
    if (!db) throw new Error("no db");
    const rows = await db.select().from(products).where(and(eq(products.slug, slug), eq(products.isActive, true))).limit(1);
    if (!rows.length) {
      const d = demoGetProductBySlug(slug);
      return d ? demoToProduct(d) : null;
    }
    const imgs = await db.select().from(productImages).where(eq(productImages.productId, rows[0].id)).orderBy(productImages.sortOrder);
    const cat = await db.select().from(categories).where(eq(categories.slug, rows[0].categorySlug)).limit(1);
    return { ...rows[0], images: imgs, categoryName: cat[0]?.name };
  } catch {
    const d = demoGetProductBySlug(slug);
    return d ? demoToProduct(d) : null;
  }
}

export async function getRelatedProducts(categorySlug: string, excludeId: number, limit = 8): Promise<ProductWithImages[]> {
  if (!isDatabaseConfigured()) {
    return demoRelated(categorySlug, excludeId, limit).map(demoToProduct);
  }
  try {
    const db = getDb();
    if (!db) throw new Error("no db");
    const rows = await db
      .select()
      .from(products)
      .where(and(eq(products.categorySlug, categorySlug), eq(products.isActive, true)))
      .limit(limit + 1);
    const filtered = rows.filter((r) => r.id !== excludeId).slice(0, limit);
    if (!filtered.length) return demoRelated(categorySlug, excludeId, limit).map(demoToProduct);
    const out: ProductWithImages[] = [];
    for (const p of filtered) {
      const imgs = await db.select().from(productImages).where(eq(productImages.productId, p.id)).orderBy(productImages.sortOrder);
      out.push({ ...p, images: imgs });
    }
    return out;
  } catch {
    return demoRelated(categorySlug, excludeId, limit).map(demoToProduct);
  }
}

export async function searchProducts(q: string, limit = 24): Promise<ProductWithImages[]> {
  if (!isDatabaseConfigured()) {
    return demoQueryProducts({ q, limit }).map(demoToProduct);
  }
  try {
    const db = getDb();
    if (!db) throw new Error("no db");
    const like = `%${q}%`;
    const rows = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.isActive, true),
          or(
            ilike(products.name, like),
            ilike(products.keywords, like),
            ilike(products.categorySlug, like),
            ilike(products.description, like)
          )
        )
      )
      .limit(limit);
    const out: ProductWithImages[] = [];
    for (const p of rows) {
      const imgs = await db.select().from(productImages).where(eq(productImages.productId, p.id)).orderBy(productImages.sortOrder);
      out.push({ ...p, images: imgs });
    }
    return out;
  } catch {
    return demoQueryProducts({ q, limit }).map(demoToProduct);
  }
}

export async function getActiveBanners() {
  if (!isDatabaseConfigured()) return demoBanners();
  try {
    const db = getDb();
    if (!db) throw new Error("no db");
    const rows = await db.select().from(banners).where(eq(banners.isActive, true)).orderBy(banners.sortOrder);
    return rows.length ? rows : demoBanners();
  } catch {
    return demoBanners();
  }
}

export async function getActiveOffers() {
  if (!isDatabaseConfigured()) return demoOffers();
  try {
    const db = getDb();
    if (!db) throw new Error("no db");
    const rows = await db.select().from(offers).where(eq(offers.isActive, true)).orderBy(offers.sortOrder);
    return rows.length ? rows : demoOffers();
  } catch {
    return demoOffers();
  }
}

export async function getActiveReels() {
  if (!isDatabaseConfigured()) return demoReels();
  try {
    const db = getDb();
    if (!db) throw new Error("no db");
    const rows = await db.select().from(reels).where(eq(reels.isActive, true)).orderBy(reels.sortOrder);
    return rows.length ? rows : demoReels();
  } catch {
    return demoReels();
  }
}

export async function getCategories() {
  if (!isDatabaseConfigured()) return demoCategories();
  try {
    const db = getDb();
    if (!db) throw new Error("no db");
    const rows = await db.select().from(categories).where(eq(categories.isActive, true)).orderBy(categories.sortOrder);
    return rows.length ? rows : demoCategories();
  } catch {
    return demoCategories();
  }
}

export async function getSettings(): Promise<Record<string, string>> {
  if (!isDatabaseConfigured()) return demoSettings();
  try {
    const db = getDb();
    if (!db) throw new Error("no db");
    const rows = await db.select().from(siteSettings);
    if (!rows.length) return demoSettings();
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  } catch {
    return demoSettings();
  }
}

export async function getReviews(productId: number) {
  if (!isDatabaseConfigured()) {
    return demoReviews().filter((r) => r.productId === productId || productId <= 3);
  }
  try {
    const db = getDb();
    if (!db) throw new Error("no db");
    return await db.select().from(reviews).where(eq(reviews.productId, productId)).orderBy(desc(reviews.createdAt)).limit(10);
  } catch {
    return demoReviews();
  }
}
