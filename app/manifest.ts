import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RrcKitchen — Thanjavur home food delivery",
    short_name: "RrcKitchen",
    description:
      "Order fresh home-cooked meals from local kitchens in Thanjavur. Next-day delivery with OTP login and Razorpay checkout.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f97316",
    orientation: "portrait-primary",
    categories: ["food", "lifestyle"],
    lang: "en",
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-384x384.png",
        sizes: "384x384",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Tomorrow's Menu",
        short_name: "Menu",
        description: "Browse tomorrow's menu",
        url: "/menu",
      },
      {
        name: "My Cart",
        short_name: "Cart",
        description: "View your cart",
        url: "/cart",
      },
    ],
  };
}
