import type { Metadata } from "next"
import AdminCouponsPage from "@/components/admin/payments/coupons-client"

export const metadata: Metadata = {
  title: "Coupons",
  description: "Manage discount coupons",
}

export default function CouponsPage() {
  return <AdminCouponsPage />
}
