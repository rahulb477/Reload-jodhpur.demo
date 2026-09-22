import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { StoreProvider } from "@/lib/store-context";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import QuickView from "@/components/QuickView";
import { STORE } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "RELOAD JODHPUR — Men's Wear Store in Jodhpur",
    template: "%s | Reload Jodhpur",
  },
  description:
    "Reload Jodhpur — men's wear store in Jodhpur, Rajasthan. Shop jeans, shirts, t-shirts, casual wear & outfits. YOUR SEARCH END HERE. Opp. Manu Computer, Saraswati Nagar, Madhuban Main Road.",
  keywords: [
    "Reload Jodhpur",
    "Men's wear Jodhpur",
    "Men's clothing Jodhpur",
    "Reload Jodhpur store",
    "Madhuban Main Road fashion",
    "mens jeans Jodhpur",
    "shirts Jodhpur",
    "casual wear Jodhpur",
  ],
  openGraph: {
    title: "RELOAD JODHPUR — Men's Wear Store in Jodhpur",
    description: "Men's fashion in Jodhpur. YOUR SEARCH END HERE. Jeans, shirts, tees & casual wear.",
    type: "website",
    locale: "en_IN",
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: "Reload Jodhpur",
    alternateName: "RJ",
    description: STORE.tagline,
    address: {
      "@type": "PostalAddress",
      streetAddress: `${STORE.address1}, ${STORE.address2}`,
      addressLocality: "Jodhpur",
      addressRegion: "Rajasthan",
      addressCountry: "IN",
    },
    telephone: STORE.phone,
    sameAs: [STORE.instagram],
    priceRange: "₹₹",
  };
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </head>
      <body className="bg-white text-neutral-900 antialiased min-h-screen flex flex-col">
        <StoreProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <QuickView />
        </StoreProvider>
      </body>
    </html>
  );
}
