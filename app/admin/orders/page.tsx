import type { Metadata } from "next"
import AdminOrdersPage from "@/components/admin/orders-client"

export const metadata: Metadata = {
  title: "Orders",
  description: "Review and manage all orders",
}

export default function OrdersPage() {
  return <AdminOrdersPage />
}
