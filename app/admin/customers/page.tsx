import type { Metadata } from "next"
import AdminCustomersPage from "@/components/admin/customers-client"

export const metadata: Metadata = {
  title: "Customers",
  description: "Manage and review all customers",
}

export default function CustomersPage() {
  return <AdminCustomersPage />
}
