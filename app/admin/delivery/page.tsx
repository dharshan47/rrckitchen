import type { Metadata } from "next"
import AdminDeliveryPage from "@/components/admin/delivery-client"

export const metadata: Metadata = {
  title: "Delivery",
  description: "Manage delivery partners and areas",
}

export default function DeliveryPage() {
  return <AdminDeliveryPage />
}
