import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  real,
} from "drizzle-orm/pg-core";

// ============ USERS ============
export const users = pgTable("nyc_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 160 }).notNull().unique(),
  mobile: varchar("mobile", { length: 20 }),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 20 }).default("customer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const addresses = pgTable("nyc_addresses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  label: varchar("label", { length: 40 }).default("Home"),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  house: varchar("house", { length: 200 }).notNull(),
  area: varchar("area", { length: 200 }).notNull(),
  city: varchar("city", { length: 100 }).notNull().default("Jodhpur"),
  state: varchar("state", { length: 100 }).notNull().default("Rajasthan"),
  pincode: varchar("pincode", { length: 10 }).notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ CATALOG ============
export const categories = pgTable("nyc_categories", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  audience: varchar("audience", { length: 20 }).notNull().default("men"), // men | kids
  parentSlug: varchar("parent_slug", { length: 80 }),
  image: text("image"),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const products = pgTable("nyc_products", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 140 }).notNull().unique(),
  name: varchar("name", { length: 220 }).notNull(),
  shortDesc: varchar("short_desc", { length: 300 }),
  description: text("description"),
  categorySlug: varchar("category_slug", { length: 80 }).notNull(),
  audience: varchar("audience", { length: 20 }).notNull().default("men"),
  brand: varchar("brand", { length: 80 }).default("RJ"),
  price: integer("price").notNull(), // selling
  mrp: integer("mrp").notNull(),
  rating: real("rating").default(4.2),
  ratingCount: integer("rating_count").default(0),
  tags: jsonb("tags").$type<string[]>().default([]),
  badges: jsonb("badges").$type<string[]>().default([]), // NEW TRENDING BESTSELLER LIMITED
  fits: jsonb("fits").$type<string[]>().default([]),
  colors: jsonb("colors").$type<string[]>().default([]),
  sizes: jsonb("sizes").$type<string[]>().default([]),
  keywords: text("keywords"),
  fabric: varchar("fabric", { length: 160 }),
  fit: varchar("fit", { length: 80 }),
  washCare: varchar("wash_care", { length: 300 }),
  isNewArrival: boolean("is_new_arrival").default(false),
  isTrending: boolean("is_trending").default(false),
  isActive: boolean("is_active").default(true),
  bestsellerScore: integer("bestseller_score").default(0),
  stockTotal: integer("stock_total").default(50),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productImages = pgTable("nyc_product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  url: text("url").notNull(),
  alt: varchar("alt", { length: 200 }),
  sortOrder: integer("sort_order").default(0),
  isPrimary: boolean("is_primary").default(false),
});

export const productVariants = pgTable("nyc_product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  size: varchar("size", { length: 20 }).notNull(),
  color: varchar("color", { length: 60 }),
  sku: varchar("sku", { length: 80 }),
  stock: integer("stock").default(10),
  priceOverride: integer("price_override"),
});

// ============ MARKETING / CONTENT ============
export const banners = pgTable("nyc_banners", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 200 }).notNull(),
  subtitle: varchar("subtitle", { length: 300 }),
  image: text("image"),
  mobileImage: text("mobile_image"),
  ctaText: varchar("cta_text", { length: 60 }),
  ctaLink: varchar("cta_link", { length: 200 }),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const offers = pgTable("nyc_offers", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 80 }).notNull().unique(),
  title: varchar("title", { length: 200 }).notNull(),
  subtitle: varchar("subtitle", { length: 300 }),
  priceLabel: varchar("price_label", { length: 60 }),
  description: text("description"),
  image: text("image"),
  ctaText: varchar("cta_text", { length: 60 }).default("SHOP NOW"),
  ctaLink: varchar("cta_link", { length: 200 }).default("/offers"),
  badge: varchar("badge", { length: 60 }),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
});

export const reels = pgTable("nyc_reels", {
  id: serial("id").primaryKey(),
  caption: varchar("caption", { length: 300 }).notNull(),
  thumbnail: text("thumbnail").notNull(),
  videoUrl: text("video_url"),
  instagramUrl: text("instagram_url"),
  productSlug: varchar("product_slug", { length: 140 }),
  views: varchar("views", { length: 20 }).default("10K"),
  sortOrder: integer("sort_order").default(0),
  isActive: boolean("is_active").default(true),
});

export const siteSettings = pgTable("nyc_site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 80 }).notNull().unique(),
  value: text("value").notNull(),
});

// ============ WISHLIST ============
export const wishlistItems = pgTable("nyc_wishlist_items", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  productId: integer("product_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ============ ORDERS ============
export const orders = pgTable("nyc_orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 30 }).notNull().unique(),
  userId: integer("user_id"),
  customerName: varchar("customer_name", { length: 120 }).notNull(),
  mobile: varchar("mobile", { length: 20 }).notNull(),
  email: varchar("email", { length: 160 }),
  addressJson: jsonb("address_json").$type<Record<string, string>>(),
  deliveryMethod: varchar("delivery_method", { length: 30 }).default("HOME_DELIVERY"),
  paymentMethod: varchar("payment_method", { length: 30 }).default("COD"),
  subtotal: integer("subtotal").notNull(),
  discount: integer("discount").default(0),
  deliveryCharge: integer("delivery_charge").default(0),
  total: integer("total").notNull(),
  status: varchar("status", { length: 20 }).default("PLACED"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItems = pgTable("nyc_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id"),
  name: varchar("name", { length: 220 }).notNull(),
  image: text("image"),
  size: varchar("size", { length: 20 }),
  color: varchar("color", { length: 60 }),
  qty: integer("qty").notNull(),
  price: integer("price").notNull(),
  mrp: integer("mrp").notNull(),
});

export const reviews = pgTable("nyc_reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  userName: varchar("user_name", { length: 120 }).notNull(),
  rating: integer("rating").notNull(),
  title: varchar("title", { length: 160 }),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ProductRow = typeof products.$inferSelect;
export type CategoryRow = typeof categories.$inferSelect;
