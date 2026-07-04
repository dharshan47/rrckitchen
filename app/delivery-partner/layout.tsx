import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Delivery Partner",
  description:
    "Delivery partner portal for RrcKitchen. View delivery assignments, customer details, kitchen information, and manage your profile.",
  openGraph: {
    title: "Delivery Partner",
    description:
      "Delivery partner portal for RrcKitchen. View delivery assignments, customer details, kitchen information, and manage your profile.",
    locale: "en_IN",
    siteName: "RrcKitchen",
  },
}

export default function DeliveryPartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
