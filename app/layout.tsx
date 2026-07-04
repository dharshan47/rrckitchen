import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { AppShell } from "@/components/layout/app-shell";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#f97316",
};

export const metadata: Metadata = {
  title: { default: "RrcKitchen — Thanjavur home meals", template: "%s — RrcKitchen" },
  description:
    "Order fresh home-cooked meals from local kitchens in Thanjavur for next-day delivery. Browse menus by time slot, filter by Veg/Non-Veg, and pay securely.",
  icons: {
    icon: "/next.svg",
    apple: "/next.svg",
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
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <head>
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <link rel="preload" href="/next.svg" as="image" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <AppShell>
            {children}
          </AppShell>
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
