import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const viewport: Viewport = {
  themeColor: "#EE7005",
};

const BASE_URL = "https://rrckitchen.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: { default: "RRC Kitchen — Home-Cooked Meals Delivered in Thanjavur", template: "%s | RRC Kitchen" },
  description:
    "Order fresh home-cooked meals from local kitchens in Thanjavur for next-day delivery. Browse menus by time slot, filter by Veg/Non-Veg, and pay securely.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "RRC Kitchen — Home-Cooked Meals Delivered in Thanjavur",
    description:
      "Order fresh home-cooked meals from local kitchens in Thanjavur for next-day delivery. Browse menus by time slot, filter by Veg/Non-Veg, and pay securely.",
    url: BASE_URL,
    siteName: "RRC Kitchen",
    type: "website",
    locale: "en_IN",
    images: [
      {
        url: "/icons/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "RRC Kitchen — Home-Cooked Meals",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RRC Kitchen — Home-Cooked Meals Delivered in Thanjavur",
    description:
      "Order fresh home-cooked meals from local kitchens in Thanjavur. Browse menus, filter by Veg/Non-Veg, and pay securely.",
    images: ["/icons/icon-512x512.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RRC Kitchen",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "RRC Kitchen",
  description:
    "Order fresh home-cooked meals from local kitchens in Thanjavur for next-day delivery.",
  url: BASE_URL,
  logo: `${BASE_URL}/icons/icon-512x512.png`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Thanjavur",
    addressRegion: "Tamil Nadu",
    addressCountry: "IN",
  },
  sameAs: [],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${inter.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Suspense fallback={null}>
            <AppShell>
              {children}
              <Toaster position="top-center" />
            </AppShell>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
