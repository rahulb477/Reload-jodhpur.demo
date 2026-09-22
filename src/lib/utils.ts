export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatINR(n: number): string {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

export function discountPct(mrp: number, price: number): number {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 120);
}

export const SIZES_MEN = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];
export const SIZES_KIDS = ["2-3Y", "4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y"];

export const STORE = {
  name: "Reload Jodhpur",
  short: "RJ",
  tagline: "YOUR SEARCH END HERE",
  address1: "Opp. Manu Computer, C Sector",
  address2: "Saraswati Nagar, Madhuban Main Road",
  city: "Jodhpur, Rajasthan",
  phone: "+91 72620 26149",
  phoneRaw: "917262026149",
  phoneDisplay: "7262026149",
  whatsapp: "https://wa.me/917262026149?text=Hi%20Reload%20Jodhpur!%20I%20want%20to%20enquire%20about%20your%20collection.",
  instagram: "https://instagram.com/reloadjodhpur__0072",
  instagramHandle: "@reloadjodhpur__0072",
  facebook: "https://instagram.com/reloadjodhpur__0072",
  hours: "10:00 AM – 9:00 PM (All days)",
  mapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Opp.+Manu+Computer+C+Sector+Saraswati+Nagar+Madhuban+Main+Road+Jodhpur+Rajasthan",
};

export function whatsappEnquiry(productName: string, price: number): string {
  const msg = encodeURIComponent(
    `Hi Reload Jodhpur, I'm interested in "${productName}" (${formatINR(price)}). Please share availability and details.`
  );
  return `https://wa.me/917262026149?text=${msg}`;
}
