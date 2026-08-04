import type { Metadata } from "next"
import CravingsPopupPage from "@/components/admin/content/cravings-popup-client"

export const metadata: Metadata = {
  title: "Cravings Popup",
  description: "Manage the cravings popup banner",
}

export default function CravingsPopupManagementPage() {
  return <CravingsPopupPage />
}
