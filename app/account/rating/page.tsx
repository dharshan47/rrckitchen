import { Suspense } from "react"
import { RatingPageClient } from "@/components/order/rating-page-client"
import { RatingPageSkeleton } from "@/components/order/rating-page-skeleton"

export const metadata = {
  title: "Rate Your Order | RRC Kitchen",
  description: "Share your feedback about the food, kitchen, and delivery.",
}

export default function RatingPage() {
  return (
    <Suspense fallback={<RatingPageSkeleton />}>
      <RatingPageClient />
    </Suspense>
  )
}
