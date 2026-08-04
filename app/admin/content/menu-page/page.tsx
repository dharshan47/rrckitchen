import { Metadata } from "next"
import { MenuPageClient } from "@/components/admin/content/menu-page/menu-page-client"

export const metadata: Metadata = {
  title: "Menu Detail Management",
  description: "Manage and customize menu details for all kitchens",
}

export default function MenuPage() {
  return <MenuPageClient />
}
