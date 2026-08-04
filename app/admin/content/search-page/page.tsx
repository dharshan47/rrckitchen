import type { Metadata } from "next"
import SearchPageContent from "@/components/admin/content/search-page-client"

export const metadata: Metadata = {
  title: "Search Page",
  description: "Manage search page content",
}

export default function SearchPageManagementPage() {
  return <SearchPageContent />
}
