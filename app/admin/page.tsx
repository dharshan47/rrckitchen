import type { Metadata } from "next"
import DashboardClient from "@/components/admin/dashboard-client"

export const metadata: Metadata = {
  title: "Admin Overview",
  description: "Overview of the RRC Kitchen admin panel",
}

export default function AdminPage() {
  return <DashboardClient />
}
