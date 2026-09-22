import { Hero, Marquee, CategoryShortcuts, ProductRail, OffersSection, ShopByCategory, ReelsSection, WhyShop, StoreLocation } from "@/components/HomeSections";
import { getProductsWithImages, getActiveBanners, getActiveOffers, getActiveReels, getCategories } from "@/lib/db-helpers";

export const revalidate = 60;

export default async function HomePage() {
  let banners: Awaited<ReturnType<typeof getActiveBanners>> = [];
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let offers: Awaited<ReturnType<typeof getActiveOffers>> = [];
  let reels: Awaited<ReturnType<typeof getActiveReels>> = [];
  let all: Awaited<ReturnType<typeof getProductsWithImages>> = [];
  try {
    [banners, categories, offers, reels, all] = await Promise.all([
      getActiveBanners(), getCategories(), getActiveOffers(), getActiveReels(), getProductsWithImages(60),
    ]);
  } catch (e) {
    console.error("homepage fetch", e);
  }

  const newArrivals = all.filter((p) => p.isNewArrival).slice(0, 12);
  const trending = all.filter((p) => p.isTrending).slice(0, 12);
  const fallbackNew = newArrivals.length ? newArrivals : all.slice(0, 12);
  const fallbackTrend = trending.length ? trending : all.slice(0, 12);

  const toCard = (p: (typeof all)[number]) => ({
    id: p.id, slug: p.slug, name: p.name, shortDesc: p.shortDesc, categorySlug: p.categorySlug,
    price: p.price, mrp: p.mrp, rating: p.rating, ratingCount: p.ratingCount,
    badges: p.badges, sizes: p.sizes, audience: p.audience, images: p.images,
  });

  return (
    <>
      <Hero banners={banners} />
      <Marquee />
      <CategoryShortcuts categories={categories} />
      <ProductRail title="New Arrivals" sub="Fresh drops, updated every week." products={fallbackNew.map(toCard)} link="/new-arrivals" linkLabel="VIEW ALL NEW ARRIVALS" />
      <ProductRail title="Trending Now" sub="Styles everyone's talking about." products={fallbackTrend.map(toCard)} link="/trending" linkLabel="VIEW ALL TRENDING" dark />
      <OffersSection offers={offers} />
      <ShopByCategory categories={categories} />
      <ReelsSection reels={reels} />
      <WhyShop />
      <StoreLocation />
    </>
  );
}
