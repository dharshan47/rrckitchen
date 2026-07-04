import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Kitchen Partner",
  description:
    "Kitchen partner portal for RrcKitchen. Manage your menu, view orders, track revenue, and grow your home kitchen business.",
  openGraph: {
    title: "Kitchen Partner",
    description:
      "Kitchen partner portal for RrcKitchen. Manage your menu, view orders, track revenue, and grow your home kitchen business.",
    locale: "en_IN",
    siteName: "RrcKitchen",
  },
}

export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
