import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/db";
import { isDatabaseConfigured, databaseUnavailableResponse } from "@/lib/database";
import { orders, orderItems, products } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { demoProducts } from "@/lib/demo-catalog";
import { verifySession, SESSION_COOKIE } from "@/lib/auth";

export const dynamic = "force-dynamic";

function orderNo(prefix = "RJ") {
  const d = new Date();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, "0")}${rand}`;
}

export async function GET(req: NextRequest) {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ orders: [], ...databaseUnavailableResponse() });
  }
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const u = token ? verifySession(token) : null;
  if (!u) return NextResponse.json({ orders: [] });
  try {
    const db = getDb();
    if (!db) return NextResponse.json({ orders: [], ...databaseUnavailableResponse() });
    const rows = await db.select().from(orders).where(eq(orders.userId, u.id)).orderBy(desc(orders.createdAt)).limit(50);
    const out = [];
    for (const o of rows) {
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
      out.push({ ...o, items });
    }
    return NextResponse.json({ orders: out, databaseConfigured: true });
  } catch {
    return NextResponse.json({ orders: [], ...databaseUnavailableResponse() });
  }
}

type SubmittedItem = {
  productId?: unknown;
  image?: unknown;
  size?: unknown;
  color?: unknown;
  qty?: unknown;
};

type OrderBody = {
  customerName?: unknown;
  mobile?: unknown;
  email?: unknown;
  address?: unknown;
  deliveryMethod?: unknown;
  paymentMethod?: unknown;
  items?: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    const u = token ? verifySession(token) : null;
    const body = (await req.json()) as OrderBody;
    const customerName = typeof body.customerName === "string" ? body.customerName.trim() : "";
    const mobile = typeof body.mobile === "string" ? body.mobile.replace(/\D/g, "").slice(-10) : "";
    const email = typeof body.email === "string" && body.email.trim() ? body.email.trim().toLowerCase() : u?.email ?? null;
    const deliveryMethod = body.deliveryMethod === "STORE_PICKUP" ? "STORE_PICKUP" : "HOME_DELIVERY";
    const paymentMethod = body.paymentMethod === "COD" ? "COD" : "COD";
    const address = body.address && typeof body.address === "object" ? body.address as Record<string, string> : {};
    const submitted = Array.isArray(body.items) ? body.items as SubmittedItem[] : [];

    if (!customerName || !mobile || !submitted.length) {
      return NextResponse.json({ error: "Missing order details" }, { status: 400 });
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number" }, { status: 400 });
    }
    if (deliveryMethod === "HOME_DELIVERY" && (!address.house || !address.area || !/^\d{6}$/.test(address.pincode ?? ""))) {
      return NextResponse.json({ error: "Please provide a valid delivery address" }, { status: 400 });
    }

    const productIds = submitted.map((item) => Number(item.productId));
    if (productIds.some((id) => !Number.isInteger(id) || id <= 0) || submitted.some((item) => {
      const qty = Number(item.qty);
      return !Number.isInteger(qty) || qty < 1 || qty > 10;
    })) {
      return NextResponse.json({ error: "Invalid cart items" }, { status: 400 });
    }

    const db = isDatabaseConfigured() ? getDb() : null;
    let catalog: { id: number; name: string; price: number; mrp: number; isActive: boolean | null }[];
    if (db) {
      const rows = await db.select({ id: products.id, name: products.name, price: products.price, mrp: products.mrp, isActive: products.isActive })
        .from(products)
        .where(inArray(products.id, Array.from(new Set(productIds))));
      catalog = rows;
    } else {
      catalog = demoProducts().map((p) => ({ id: p.id, name: p.name, price: p.price, mrp: p.mrp, isActive: p.isActive }));
    }

    const byId = new Map(catalog.map((product) => [product.id, product]));
    if (submitted.some((item) => !byId.get(Number(item.productId))?.isActive)) {
      return NextResponse.json({ error: "One or more items are no longer available" }, { status: 409 });
    }

    const canonicalItems = submitted.map((item) => {
      const product = byId.get(Number(item.productId))!;
      return {
        productId: product.id,
        name: product.name,
        image: typeof item.image === "string" ? item.image : null,
        size: typeof item.size === "string" ? item.size.slice(0, 20) : null,
        color: typeof item.color === "string" ? item.color.slice(0, 60) : null,
        qty: Number(item.qty),
        price: product.price,
        mrp: product.mrp,
      };
    });
    const subtotal = canonicalItems.reduce((sum, item) => sum + item.price * item.qty, 0);
    const discount = Math.max(0, canonicalItems.reduce((sum, item) => sum + (item.mrp - item.price) * item.qty, 0));
    const deliveryCharge = deliveryMethod === "STORE_PICKUP" || subtotal >= 1499 ? 0 : 49;
    const total = subtotal + deliveryCharge;

    // ---- DEMO MODE: accept the order locally so checkout stays fully functional ----
    if (!db) {
      const number = orderNo("DEMO");
      return NextResponse.json({ ok: true, orderNumber: number, id: Date.now(), ...databaseUnavailableResponse() });
    }

    const number = orderNo();
    const inserted = await db.insert(orders).values({
      orderNumber: number,
      userId: u?.id ?? null,
      customerName,
      mobile,
      email,
      addressJson: address,
      deliveryMethod,
      paymentMethod,
      subtotal,
      discount,
      deliveryCharge,
      total,
      status: "PLACED",
    }).returning();
    const order = inserted[0];
    for (const item of canonicalItems) {
      await db.insert(orderItems).values({ orderId: order.id, ...item });
    }
    return NextResponse.json({ ok: true, orderNumber: number, id: order.id, databaseConfigured: true });
  } catch (e) {
    console.error("orders", e);
    if (!isDatabaseConfigured()) {
      return NextResponse.json({ ok: true, orderNumber: orderNo("DEMO"), id: Date.now(), ...databaseUnavailableResponse() });
    }
    return NextResponse.json({ error: "Could not place order" }, { status: 500 });
  }
}
