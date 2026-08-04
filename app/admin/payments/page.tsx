import type { Metadata } from "next"
import AdminPaymentsPage from "@/components/admin/payments/payments-client"

export const metadata: Metadata = {
  title: "Payments",
  description: "Manage payments and payouts",
}

export default function PaymentsPage() {
  return <AdminPaymentsPage />
}
