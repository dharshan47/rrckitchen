"use client"

import { useRouter } from "next/navigation"
import { Star, MessageSquareText, ChefHat } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { format } from "date-fns"
import {
  useUserOrdersQuery,
  useUserOrders,
} from "@/stores/userProfileStore"

function ReviewsSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-pulse">
      <div className="h-[160px] rounded-[24px] bg-[#F3F4F6]" />
      <div className="space-y-4 mt-6">
        <div className="h-[140px] rounded-[20px] bg-[#F3F4F6]" />
        <div className="h-[140px] rounded-[20px] bg-[#F3F4F6]" />
      </div>
    </div>
  )
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating ? "fill-[#FFB000] text-[#FFB000]" : "fill-transparent text-[#E6E6E6]"
          }`}
        />
      ))}
    </div>
  )
}

export function ReviewsContent() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const isLoggedIn = !!session?.user

  const { isLoading: ordersLoading } = useUserOrdersQuery(isLoggedIn)
  const orders = useUserOrders()

  if (isPending || ordersLoading) {
    return <ReviewsSkeleton />
  }

  if (!session?.user) {
    router.replace("/login")
    return null
  }

  const reviews = orders
    .filter((o) => o.kitchenReview)
    .map((o) => ({
      id: o.kitchenReview!.id,
      orderId: o.id,
      kitchenName: o.kitchenName ?? "Kitchen",
      dish: o.items[0]?.name || "Assorted Items",
      rating: o.kitchenReview!.rating,
      tasteRating: o.kitchenReview!.tasteRating,
      packagingRating: o.kitchenReview!.packagingRating,
      portionSizeRating: o.kitchenReview!.portionSizeRating,
      comment: o.kitchenReview!.comment,
      date: o.createdAt,
    }))

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto pb-12">

      {/* HEADER */}
      <div className="relative w-full h-[150px] md:h-[180px] rounded-[24px] overflow-hidden bg-gradient-to-r from-[#FFF4E5] to-[#FFEDD5] flex items-center px-6 md:px-12 border border-[#FEE2E2]">
        <div className="relative z-10 max-w-[70%]">
          <h1 className="text-[26px] md:text-[34px] font-extrabold text-gray-900 leading-tight mb-2">
            My Reviews
          </h1>
          <p className="text-[14px] md:text-[15px] font-medium text-gray-700">
            Your feedback for the kitchens you ordered from
          </p>
        </div>
        <div className="absolute right-[-16px] md:right-10 top-1/2 -translate-y-1/2 w-[150px] h-[150px] md:w-[190px] md:h-[190px] bg-[#FFE8D6] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
          <MessageSquareText className="w-12 h-12 md:w-16 md:h-16 text-[#F97316]" />
        </div>
      </div>

      {/* LIST */}
      {reviews.length === 0 ? (
        <div className="bg-white rounded-[20px] p-10 border border-[#E5E7EB] shadow-sm text-center">
          <div className="w-16 h-16 mx-auto bg-[#FFF7ED] rounded-full flex items-center justify-center mb-4">
            <Star className="w-8 h-8 text-[#F97316]" />
          </div>
          <h3 className="text-[15px] font-bold text-gray-900 mb-1">No reviews yet</h3>
          <p className="text-[13px] text-gray-500 font-medium">
            Reviews you leave for orders will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-[20px] p-6 md:p-7 border border-[#E5E7EB] shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-[#F0FDF4] flex items-center justify-center shrink-0">
                    <ChefHat className="w-5 h-5 text-[#15803D]" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-gray-900">{review.kitchenName}</h3>
                    <p className="text-[12px] text-gray-500 font-medium">{review.dish}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Stars rating={review.rating} />
                  <span className="text-[11px] text-gray-400 font-medium border-l border-gray-200 pl-3">
                    {format(new Date(review.date), "dd MMM yyyy")}
                  </span>
                </div>
              </div>

              {(review.tasteRating != null || review.packagingRating != null || review.portionSizeRating != null) && (
                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4">
                  {review.tasteRating != null && (
                    <span className="text-[12px] text-gray-600 font-medium">Taste <Stars rating={review.tasteRating} /></span>
                  )}
                  {review.packagingRating != null && (
                    <span className="text-[12px] text-gray-600 font-medium">Packaging <Stars rating={review.packagingRating} /></span>
                  )}
                  {review.portionSizeRating != null && (
                    <span className="text-[12px] text-gray-600 font-medium">Portion <Stars rating={review.portionSizeRating} /></span>
                  )}
                </div>
              )}

              {review.comment && (
                <p className="text-[13px] text-gray-600 font-medium leading-relaxed bg-[#FAFAFA] border border-gray-100 rounded-[12px] p-4">
                  &ldquo;{review.comment}&rdquo;
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}