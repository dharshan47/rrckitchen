import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const csp = isDev
  ? [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.razorpay.com https://maps.googleapis.com https://unpkg.com `,
      `style-src 'self' 'unsafe-inline' https://unpkg.com`,
      `img-src 'self' blob: data: https://*.r2.dev https://*.cloudfront.net https://*.cloudinary.com https://images.unsplash.com https://maps.gstatic.com https://*.googleapis.com https://*.tile.openstreetmap.org https://api.maptiler.com https://*.razorpay.com`,
      `font-src 'self'`,
       `connect-src 'self' ws: http://localhost:* wss://*.ably.io https://*.ably.io https://*.razorpay.com https://*.r2.dev https://*.cloudinary.com https://maps.googleapis.com https://api.maptiler.com https://unpkg.com https://checkout.razorpay.com `,
      `frame-src 'self' https://*.razorpay.com`,
      `worker-src 'self' blob:`,
      `base-uri 'self'`,
      `form-action 'self'`,
    ].join("; ")
  : [
      `default-src 'self'`,
      `script-src 'self' 'unsafe-eval' 'unsafe-inline' https://*.razorpay.com https://maps.googleapis.com https://unpkg.com `,
      `style-src 'self' 'unsafe-inline' https://unpkg.com`,
      `img-src 'self' blob: data: https://*.r2.dev https://*.cloudfront.net https://*.cloudinary.com https://images.unsplash.com https://maps.gstatic.com https://*.googleapis.com https://*.tile.openstreetmap.org https://api.maptiler.com https://*.razorpay.com`,
      `font-src 'self'`,
       `connect-src 'self' wss://*.ably.io https://*.ably.io https://*.razorpay.com https://*.r2.dev https://*.cloudinary.com https://maps.googleapis.com https://api.maptiler.com https://unpkg.com https://checkout.razorpay.com `,
      `frame-src 'self' https://*.razorpay.com`,
      `worker-src 'self' blob:`,
      `base-uri 'self'`,
      `form-action 'self'`,
    ].join("; ");

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "**.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    minimumCacheTTL: 31536000,
    deviceSizes: [480, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  compiler: {
    removeConsole: isDev ? false : true,
  },

  experimental: {
    optimizePackageImports: ["lucide-react", "recharts", "@tanstack/react-query", "date-fns"],
    serverComponentsHmrCache: true,
  },

  cacheComponents: true,

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Permissions-Policy", value: "camera=(), microphone=()" },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'; connect-src 'self' https://*.razorpay.com https://*.ably.io wss://*.ably.io https://unpkg.com https://api.maptiler.com https://maps.googleapis.com https://*.r2.dev https://*.cloudfront.net https://*.cloudinary.com; img-src 'self' data: blob: https://*.razorpay.com https://api.maptiler.com https://maps.gstatic.com https://*.googleapis.com https://*.tile.openstreetmap.org https://*.r2.dev https://*.cloudfront.net https://*.cloudinary.com https://images.unsplash.com; style-src 'self' 'unsafe-inline' https://unpkg.com; font-src 'self'; frame-src 'self' https://*.razorpay.com; worker-src 'self' blob:; base-uri 'self'; form-action 'self'" },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=30, stale-while-revalidate=60" },
        ],
      },
      {
        source: "/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:all*(svg|jpg|jpeg|png|webp|avif)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

const withMDX = createMDX({
  extension: /\.(md|mdx)$/,
})

export default withMDX(nextConfig);
