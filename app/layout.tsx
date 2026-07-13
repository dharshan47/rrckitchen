import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Providers } from "@/providers/providers";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner"
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
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable)}
    >
      <head>
        <link rel="preconnect" href="https://checkout.razorpay.com" />
        <link rel="dns-prefetch" href="https://checkout.razorpay.com" />
        <style>{`
          #splash {
            position: fixed; inset: 0; z-index: 9999;
            display: flex; align-items: center; justify-content: center;
            flex-direction: column;
            background: #FFFFFF;
          }
          #splash.hide {
            opacity: 0; pointer-events: none; transition: opacity 0.25s;
          }
          #splash span {
            color: #EE7005; font-size: 1.5rem; font-weight: 700;
            font-family: 'Inter', system-ui, sans-serif;
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <div id="splash"><span>RRC Kitchen</span></div>
        <Providers>
          <AppShell>
            {children}
             <Toaster position="top-center" />
          </AppShell>
        </Providers>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var s=document.getElementById('splash');if(s){var r=function(){s.classList.add('hide')};'complete'===document.readyState?setTimeout(r,200):window.addEventListener('load',function(){setTimeout(r,200)})}})();`
          }}
        />
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
          id="razorpay-checkout"
        />
      </body>
    </html>
  );
}
