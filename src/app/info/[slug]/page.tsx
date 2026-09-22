import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE } from "@/lib/utils";

const PAGES: Record<string, { title: string; body: { h: string; p: string }[] }> = {
  contact: {
    title: "Contact Us",
    body: [
      { h: "Store", p: `${STORE.address1}, ${STORE.address2}, ${STORE.city}. Open ${STORE.hours}.` },
      { h: "Call", p: `${STORE.phone} — call us for availability, sizes and combos.` },
      { h: "WhatsApp", p: "Fastest response on WhatsApp. Send a screenshot of the style you like and we'll confirm size & price." },
      { h: "Instagram", p: "@reloadjodhpur__0072 — DM us for new drops and reel products." },
    ],
  },
  shipping: {
    title: "Shipping Policy",
    body: [
      { h: "Delivery areas", p: "We deliver across Jodhpur city and nearby areas. Outstation delivery on request via WhatsApp." },
      { h: "Timelines", p: "Orders are dispatched in 24 hours and delivered in 2–5 working days." },
      { h: "Charges", p: "Flat ₹49 delivery. FREE shipping on orders above ₹1499. Store pickup is always FREE." },
      { h: "Tracking", p: "We share tracking on WhatsApp/SMS once your order ships. COD orders are confirmed on call." },
    ],
  },
  returns: {
    title: "Returns & Exchange",
    body: [
      { h: "7-day exchange", p: "Size/fit issues? Exchange within 7 days with original tags and bill — at store or via WhatsApp." },
      { h: "Condition", p: "Products must be unworn, unwashed with tags intact. Combo offers can be exchanged, not split-returned." },
      { h: "Damaged/wrong item", p: "Share an unboxing photo/video within 48 hours and we'll replace or refund immediately." },
      { h: "Refunds", p: "Refunds (where applicable) are processed to source/UPI within 3–5 working days." },
    ],
  },
  "size-guide": {
    title: "Size Guide",
    body: [
      { h: "Men's tops", p: "S: chest 36 · M: 38 · L: 40 · XL: 42 · XXL: 44 · 3XL: 46 (inches). For oversized/boxy fits, take your usual size for the intended loose look." },
      { h: "Bottoms", p: "Waist sizes 28–36. Slim fit sits close; straight/loose fits are roomier through the leg." },
      { h: "Kids", p: "2-3Y to 12-13Y. When between sizes, size up — kids grow fast." },
      { h: "Need help?", p: "WhatsApp us your height, weight and usual size — we'll recommend the perfect fit." },
    ],
  },
  faq: {
    title: "FAQs",
    body: [
      { h: "Is COD available?", p: "Yes! Cash on Delivery (cash/UPI) is available across Jodhpur." },
      { h: "Can I pick up from store?", p: "Yes — choose STORE PICKUP at checkout. Same-day pickup at Opp. Manu Computer, Saraswati Nagar, Madhuban Main Road." },
      { h: "Are combo prices fixed?", p: "Combos like ₹999 and ₹1149 are limited-period offers. Prices refresh regularly — grab them while live." },
      { h: "Do you have kids wear?", p: "Yes, a curated kids capsule (boys, girls, topwear, bottomwear) alongside our main men's collection." },
      { h: "How do I know my size?", p: "Use our size guide or WhatsApp us — we'll help you pick right and exchanges are easy." },
    ],
  },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: PAGES[slug]?.title ?? "Info" };
}

export default async function InfoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = PAGES[slug];
  if (!page) notFound();
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <p className="text-[11px] font-bold tracking-[0.3em] text-[#ff0000]">CUSTOMER CARE</p>
      <h1 className="font-display font-black text-3xl sm:text-4xl mt-1">{page.title}</h1>
      <div className="space-y-4 mt-7">
        {page.body.map((b) => (
          <div key={b.h} className="border border-neutral-200 rounded-2xl p-5">
            <h2 className="font-extrabold text-[15px]">{b.h}</h2>
            <p className="text-[14px] text-neutral-600 mt-1.5 leading-relaxed">{b.p}</p>
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <a href={STORE.whatsapp} target="_blank" rel="noreferrer" className="px-6 py-3 rounded-xl bg-[#25D366] text-white text-[12px] font-extrabold">WHATSAPP US</a>
        <Link href="/store" className="px-6 py-3 rounded-xl bg-black text-[#ffffff] text-[12px] font-extrabold">VISIT STORE</Link>
      </div>
    </div>
  );
}
