import type { Metadata } from "next"
import PaymentOffersPage from "@/components/admin/payments/payment-offers-client"

export const metadata: Metadata = {
  title: "Payment Offers",
  description: "Manage payment method offers",
}

export default function PaymentOffersManagementPage() {
  return <PaymentOffersPage />
}
