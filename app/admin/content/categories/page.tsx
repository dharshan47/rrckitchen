import type { Metadata } from "next"
import CategoriesPage from "@/components/admin/content/categories-client"

export const metadata: Metadata = {
  title: "Categories",
  description: "Manage food categories",
}

export default function CategoriesManagementPage() {
  return <CategoriesPage />
}
