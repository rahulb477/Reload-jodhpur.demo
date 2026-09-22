import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getProductBySlug, getRelatedProducts, getProductsWithImages } from "@/lib/db-helpers";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await getProductBySlug(slug);
    if (!p) return { title: "Product not found" };
    return {
      title: p.name,
      description: p.shortDesc ?? p.name,
      openGraph: { title: `${p.name} | Reload Jodhpur`, description: p.shortDesc ?? "", images: p.images[0]?.url ? [p.images[0].url] : [] },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let product = null;
  try {
    product = await getProductBySlug(slug);
  } catch {}
  if (!product) notFound();

  let related: Awaited<ReturnType<typeof getRelatedProducts>> = [];
  let all: Awaited<ReturnType<typeof getProductsWithImages>> = [];
  try {
    [related, all] = await Promise.all([
      getRelatedProducts(product.categorySlug, product.id, 4),
      getProductsWithImages(20),
    ]);
  } catch {}

  const toCard = (p: (typeof all)[number] | (typeof related)[number]) => ({
    id: p.id, slug: p.slug, name: p.name, shortDesc: p.shortDesc, categorySlug: p.categorySlug,
    price: p.price, mrp: p.mrp, rating: p.rating, ratingCount: p.ratingCount,
    badges: p.badges, sizes: p.sizes, audience: p.audience, images: p.images,
  });
  const completeLook = all.filter((p) => p.id !== product!.id && p.categorySlug !== product!.categorySlug).slice(0, 4);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDesc,
    image: product.images.map((i) => i.url),
    brand: { "@type": "Brand", name: "Reload Jodhpur" },
    offers: { "@type": "Offer", priceCurrency: "INR", price: product.price, availability: "https://schema.org/InStock" },
    aggregateRating: { "@type": "AggregateRating", ratingValue: product.rating ?? 4.3, reviewCount: product.ratingCount ?? 10 },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetailClient product={product} related={related.map(toCard)} completeLook={completeLook.map(toCard)} />
    </>
  );
}
