import type { Metadata } from "next"
import AdminLoyaltyPointsPage from "@/components/admin/payments/loyalty-coupons-client"

export const metadata: Metadata = {
  title: "Loyalty Coupons",
  description: "Manage loyalty coupons and points",
}

export default function LoyaltyCouponsPage() {
  return <AdminLoyaltyPointsPage />
}
