import type { Metadata } from "next"
import CategoryPagesManagement from "@/components/admin/content/category-pages-client"

export const metadata: Metadata = {
  title: "Category Pages",
  description: "Manage category landing pages",
}

export default function CategoryPagesPage() {
  return <CategoryPagesManagement />
}
