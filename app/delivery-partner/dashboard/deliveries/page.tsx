import DeliveriesPageClient from "@/components/delivery-partner/dashboard/deliveries-page-client"
import { Suspense } from "react"

export default function DeliveriesPage() {
  return (
    <Suspense fallback={<div>Loading deliveries...</div>}>
      <DeliveriesPageClient />
    </Suspense>
  )
}
