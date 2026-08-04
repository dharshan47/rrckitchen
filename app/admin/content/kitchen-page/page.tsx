import type { Metadata } from "next"
import KitchenSearchPageManagement from "@/components/admin/content/kitchen-page-client"

export const metadata: Metadata = {
  title: "Kitchen Page",
  description: "Manage kitchen landing pages",
}

export default function KitchenPageManagementPage() {
  return <KitchenSearchPageManagement />
}
