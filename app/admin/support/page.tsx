import type { Metadata } from "next"
import AdminSupportPage from "@/components/admin/support-client"

export const metadata: Metadata = {
  title: "Support",
  description: "Manage support tickets and queries",
}

export default function SupportPage() {
  return <AdminSupportPage />
}
