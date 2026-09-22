/**
 * DEMO / LOCAL-DATA MODE
 * ----------------------
 * When DATABASE_URL is missing, the entire storefront runs from this module.
 * Data mirrors the PostgreSQL seed (src/lib/seed-data.ts) so the UI is identical.
 * No network, no database, fully deterministic — safe for Vercel builds.
 */
import {
  SEED_PRODUCTS,
  SEED_CATEGORIES,
  SEED_BANNERS,
  SEED_OFFERS,
  SEED_REELS,
  SEED_SETTINGS,
} from "./seed-data";

export type DemoImage = {
  id: number;
  productId: number;
  url: string;
  alt: string | null;
  sortOrder: number;
  isPrimary: boolean;
};

export type DemoProduct = {
  id: number;
  slug: string;
  name: string;
  shortDesc: string | null;
  description: string | null;
  categorySlug: string;
  categoryName?: string;
  audience: string;
  brand: string | null;
  price: number;
  mrp: number;
  rating: number | null;
  ratingCount: number | null;
  tags: string[] | null;
  badges: string[] | null;
  fits: string[] | null;
  colors: string[] | null;
  sizes: string[] | null;
  keywords: string | null;
  fabric: string | null;
  fit: string | null;
  washCare: string | null;
  isNewArrival: boolean | null;
  isTrending: boolean | null;
  isActive: boolean | null;
  bestsellerScore: number | null;
  stockTotal: number | null;
  createdAt: Date;
  images: DemoImage[];
};

const catNameBySlug = new Map(SEED_CATEGORIES.map((c) => [c.slug, c.name]));

function toDemoProduct(p: (typeof SEED_PRODUCTS)[number], idx: number): DemoProduct {
  const id = idx + 1;
  return {
    id,
    slug: p.slug,
    name: p.name,
    shortDesc: p.shortDesc,
    description: p.description,
    categorySlug: p.categorySlug,
    categoryName: catNameBySlug.get(p.categorySlug) ?? p.categorySlug,
    audience: p.audience,
    brand: "RJ",
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
    washCare: "Machine wash cold. Do not bleach. Dry in shade.",
    isNewArrival: p.isNewArrival,
    isTrending: p.isTrending,
    isActive: true,
    bestsellerScore: p.bestsellerScore,
    stockTotal: p.stockTotal,
    createdAt: new Date(Date.now() - idx * 86400000),
    images: p.images.map((url, i) => ({
      id: id * 100 + i,
      productId: id,
      url,
      alt: p.name,
      sortOrder: i,
      isPrimary: i === 0,
    })),
  };
}

let _products: DemoProduct[] | null = null;
export function demoProducts(): DemoProduct[] {
  if (!_products) _products = SEED_PRODUCTS.map(toDemoProduct);
  return _products;
}

export function demoCategories() {
  return SEED_CATEGORIES.map((c, i) => ({
    id: i + 1,
    slug: c.slug,
    name: c.name,
    audience: c.audience,
    parentSlug: c.parentSlug,
    image: c.image,
    description: c.description,
    sortOrder: c.sortOrder,
    isActive: true,
  }));
}

export function demoBanners() {
  return SEED_BANNERS.map((b, i) => ({
    id: i + 1,
    title: b.title,
    subtitle: b.subtitle,
    image: b.image,
    mobileImage: null as string | null,
    ctaText: b.ctaText,
    ctaLink: b.ctaLink,
    sortOrder: b.sortOrder,
    isActive: true,
  }));
}

export function demoOffers() {
  return SEED_OFFERS.map((o, i) => ({
    id: i + 1,
    slug: o.slug,
    title: o.title,
    subtitle: o.subtitle,
    priceLabel: o.priceLabel,
    description: o.description,
    image: o.image,
    ctaText: o.ctaText,
    ctaLink: o.ctaLink,
    badge: o.badge,
    isActive: true,
    sortOrder: o.sortOrder,
  }));
}

export function demoReels() {
  return SEED_REELS.map((r, i) => ({
    id: i + 1,
    caption: r.caption,
    thumbnail: r.thumbnail,
    videoUrl: null as string | null,
    instagramUrl: r.instagramUrl,
    productSlug: r.productSlug,
    views: r.views,
    sortOrder: i,
    isActive: true,
  }));
}

export function demoSettings(): Record<string, string> {
  return { ...SEED_SETTINGS };
}

export function demoReviews() {
  return [
    { id: 1, productId: 1, userName: "Rohit S.", rating: 5, title: "Best fitting jeans in Jodhpur", comment: "Fabric is premium and fitting is perfect. Store staff helped me pick the right size.", createdAt: new Date() },
    { id: 2, productId: 1, userName: "Amit K.", rating: 5, title: "Combo is value for money", comment: "Got jeans + tee combo at ₹1149. Quality is genuinely good for the price.", createdAt: new Date() },
    { id: 3, productId: 1, userName: "Yash M.", rating: 4, title: "Trendy boxy tee", comment: "Heavy fabric, nice drop shoulders. Will buy more colours.", createdAt: new Date() },
  ];
}

export type DemoQuery = {
  q?: string;
  slug?: string;
  category?: string;
  audience?: string;
  flag?: string;
  sort?: string;
  limit?: number;
  offset?: number;
  minPrice?: number | null;
  maxPrice?: number | null;
  size?: string;
  fit?: string;
  color?: string;
  minDiscount?: number;
};

function discountOf(p: DemoProduct): number {
  if (!p.mrp || p.mrp <= p.price) return 0;
  return ((p.mrp - p.price) / p.mrp) * 100;
}

/** Full local query: search + filter + sort + paginate (mirrors /api/products SQL logic). */
export function demoQueryProducts(query: DemoQuery = {}): DemoProduct[] {
  const {
    q = "", slug = "", category = "", audience = "", flag = "",
    sort = "relevance", limit = 48, offset = 0,
    minPrice = null, maxPrice = null, size = "", fit = "", color = "", minDiscount = 0,
  } = query;

  let list = demoProducts().filter((p) => p.isActive);

  if (slug) list = list.filter((p) => p.slug === slug);
  if (category) list = list.filter((p) => p.categorySlug === category);
  if (audience) list = list.filter((p) => p.audience === audience);
  if (flag === "new") list = list.filter((p) => p.isNewArrival);
  if (flag === "trending") list = list.filter((p) => p.isTrending);
  if (minPrice != null) list = list.filter((p) => p.price >= minPrice);
  if (maxPrice != null) list = list.filter((p) => p.price <= maxPrice);
  if (q.trim()) {
    const needle = q.trim().toLowerCase();
    list = list.filter((p) =>
      p.name.toLowerCase().includes(needle) ||
      (p.keywords ?? "").toLowerCase().includes(needle) ||
      p.categorySlug.toLowerCase().includes(needle) ||
      (p.description ?? "").toLowerCase().includes(needle) ||
      (p.shortDesc ?? "").toLowerCase().includes(needle) ||
      (p.tags ?? []).some((t) => t.toLowerCase().includes(needle))
    );
  }
  if (size) list = list.filter((p) => (p.sizes ?? []).includes(size));
  if (fit) list = list.filter((p) => (p.fits ?? []).includes(fit) || p.fit === fit);
  if (color) list = list.filter((p) => (p.colors ?? []).some((c) => c.toLowerCase().includes(color.toLowerCase())));
  if (minDiscount > 0) list = list.filter((p) => discountOf(p) >= minDiscount);

  const by = [...list];
  if (sort === "price-asc") by.sort((a, b) => a.price - b.price);
  else if (sort === "price-desc") by.sort((a, b) => b.price - a.price);
  else if (sort === "newest") by.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  else if (sort === "rating") by.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  else if (sort === "discount") by.sort((a, b) => discountOf(b) - discountOf(a));
  else by.sort((a, b) => (b.bestsellerScore ?? 0) - (a.bestsellerScore ?? 0));

  return by.slice(offset, offset + Math.min(limit, 100));
}

export function demoGetProductBySlug(slug: string): DemoProduct | null {
  return demoProducts().find((p) => p.slug === slug && p.isActive) ?? null;
}

export function demoRelated(categorySlug: string, excludeId: number, limit = 8): DemoProduct[] {
  return demoProducts()
    .filter((p) => p.categorySlug === categorySlug && p.isActive && p.id !== excludeId)
    .slice(0, limit);
}
