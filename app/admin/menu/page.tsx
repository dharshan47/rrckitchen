import type { Metadata } from "next"
import AdminMenuPage from "@/components/admin/menu-client"

export const metadata: Metadata = {
  title: "Menu",
  description: "Manage kitchen menus",
}

export default function AdminMenuPageWrapper() {
  return <AdminMenuPage />
}
