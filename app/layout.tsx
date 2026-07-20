import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#EE7005",
};

export const metadata: Metadata = {
  title: { default: "RRC Kitchen", template: "%s" },
  description:
    "Order fresh home-cooked meals from local kitchens in Thanjavur for next-day delivery. Browse menus by time slot, filter by Veg/Non-Veg, and pay securely.",
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-384x384.png", sizes: "384x384", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.webmanifest",
  other: {
    "mobile-web-app-capable": "yes",
  },
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
          <link rel="preconnect" href="https://*.r2.dev" />
          <link rel="dns-prefetch" href="https://*.r2.dev" />
          <link rel="preconnect" href="https://*.cloudfront.net" />
          <link rel="dns-prefetch" href="https://*.cloudfront.net" />
          <link rel="preload" as="image" href="/icons/icon-192x192.png" />
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
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
          id="razorpay-checkout"
        />
      </body>
    </html>
  );
}
