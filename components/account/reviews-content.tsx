"use client"

import { useRouter } from "next/navigation"
import { Star, MessageSquareText, ChefHat, Calendar, FileText, ChevronDown, MessageCircle, PenLine, ChevronRight } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { format } from "date-fns"
import {
  useUserOrdersQuery,
  useUserOrders,
} from "@/stores/userProfileStore"
import Image from "next/image"
import { Skeleton } from "@/components/ui/skeleton"

function ReviewsSkeleton() {
  return (
    <div className="w-full flex flex-col max-w-6xl mx-auto pb-12 bg-[#FFFEFF] min-h-screen px-4 md:px-0 pt-2">
      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 mb-4">
        <Skeleton className="h-4 w-12 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-3.5 w-3.5 rounded-full" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>

      {/* BANNER */}
      <div className="relative w-full rounded-[24px] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 md:p-10 mb-8 border border-[#FDEEE4] shadow-sm bg-white">
        <div className="relative z-10 flex-1 w-full flex flex-col items-center md:items-start gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex flex-col items-center md:items-start gap-2">
              <Skeleton className="h-[36px] md:h-[44px] w-48 rounded-lg" />
              <Skeleton className="h-[18px] w-64 rounded-md" />
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-[14px] p-3 pr-6 border border-[#FDEEE4] min-w-[140px]">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-[18px] w-8 rounded" />
                  <Skeleton className="h-[12px] w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative z-10 mt-8 md:mt-0 w-[240px] h-[180px] md:w-[360px] md:h-[240px] flex-shrink-0 flex items-center justify-center md:justify-end">
          <Skeleton className="w-[180px] h-[180px] md:w-[240px] md:h-[240px] rounded-[24px]" />
        </div>
      </div>

      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 px-1 gap-4 md:gap-0">
        <div className="flex items-center gap-2">
          <Skeleton className="w-8 h-8 rounded-[8px]" />
          <Skeleton className="h-[20px] w-32 rounded" />
        </div>
        <Skeleton className="h-[36px] w-32 rounded-[10px]" />
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {[1, 2].map(i => (
          <div key={i} className="bg-white rounded-[20px] p-5 md:p-6 border border-[#E4E8E4] shadow-sm flex flex-col gap-5">
            {/* Top row */}
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex items-start gap-4 md:w-[45%]">
                <Skeleton className="w-14 h-14 rounded-full shrink-0" />
                <div className="flex flex-col gap-2 pr-4 w-full">
                  <Skeleton className="h-[18px] w-3/4 rounded" />
                  <Skeleton className="h-[14px] w-1/2 rounded" />
                  <Skeleton className="h-[20px] w-24 rounded-full mt-1" />
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-[55%] mt-2 md:mt-0">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map(j => <Skeleton key={j} className="w-4 h-4 rounded-full" />)}
                  <Skeleton className="h-[14px] w-6 rounded ml-2" />
                </div>
                <div className="flex items-center gap-1.5">
                  <Skeleton className="w-3.5 h-3.5 rounded-full" />
                  <Skeleton className="h-[14px] w-24 rounded" />
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-[#EEF0F2]" />

            {/* Bottom row */}
            <div className="flex flex-col md:flex-row items-start md:items-stretch gap-6">
              <div className="flex-shrink-0 flex flex-col md:flex-row gap-4 md:gap-6 py-1">
                {[1, 2, 3].map(j => (
                  <div key={j} className="flex items-center border-b md:border-b-0 md:border-r border-[#EEF0F2] pb-2 md:pb-0 md:pr-6 last:border-0 last:pr-0">
                    <Skeleton className="h-[14px] w-[50px] rounded mr-2" />
                    <div className="flex items-center gap-0.5 ml-2">
                      {[1,2,3,4,5].map(k => <Skeleton key={k} className="w-3 h-3 rounded-full" />)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex-1 w-full bg-[#FDFBF7] border border-[#F4EBE1] rounded-[14px] p-4 flex gap-3">
                <Skeleton className="h-[24px] w-4 rounded" />
                <div className="flex flex-col gap-2 pt-1 w-full">
                  <Skeleton className="h-[14px] w-full rounded" />
                  <Skeleton className="h-[14px] w-4/5 rounded" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Stars({ rating, showValue = false }: { rating: number, showValue?: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < Math.round(rating) ? "fill-[#FFB000] text-[#FFB000]" : "fill-[#F3F4F6] text-[#F3F4F6]"
            }`}
          />
        ))}
      </div>
      {showValue && <span className="text-[14px] font-extrabold text-[#142036] ml-1">{rating.toFixed(1)}</span>}
    </div>
  )
}

function SmallStars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5 ml-2">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-3 w-3 ${
            i < Math.round(rating) ? "fill-[#FFB000] text-[#FFB000]" : "fill-[#F3F4F6] text-[#F3F4F6]"
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
      shortId: o.id.split('-')[0]?.toUpperCase() || o.id.substring(0, 8).toUpperCase(),
      kitchenName: o.kitchenName ?? "Kitchen",
      dish: o.items[0]?.name || "Assorted Items",
      rating: o.kitchenReview!.rating,
      tasteRating: o.kitchenReview!.tasteRating,
      packagingRating: o.kitchenReview!.packagingRating,
      portionSizeRating: o.kitchenReview!.portionSizeRating,
      comment: o.kitchenReview!.comment,
      date: o.createdAt,
    }))

  const totalReviews = reviews.length;
  const kitchensReviewed = new Set(reviews.map(r => r.kitchenName)).size;
  const averageRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : "0.0";

  return (
    <div className="w-full flex flex-col max-w-6xl mx-auto pb-12 bg-[#FFFEFF] min-h-screen px-4 md:px-0 pt-2">

      {/* BREADCRUMB */}
      <div className="flex items-center gap-2 text-[13px] font-medium text-[#8C96A5] mb-4">
        <span className="hover:text-[#F97316] cursor-pointer transition-colors">Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="hover:text-[#F97316] cursor-pointer transition-colors">Account</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-[#1E293B] font-bold">Reviews</span>
      </div>

      {/* BANNER */}
      <div 
        className="relative w-full rounded-[24px] overflow-hidden flex flex-col md:flex-row items-center justify-between p-6 md:p-10 mb-8 border border-[#FDEEE4] shadow-[0_12px_40px_rgba(249,115,22,0.06)]"
        style={{
          background: `
            radial-gradient(circle at 88% 50%, rgba(255, 255, 255, 0.5), transparent 30%),
            linear-gradient(135deg, #FEF5EE 0%, #FDF0E6 100%)
          `
        }}
      >
        <div className="relative z-10 flex-1 w-full text-center md:text-left flex flex-col gap-6">
          
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm border border-[#FDEEE4]">
              <MessageCircle className="w-6 h-6 text-[#F97316]" />
            </div>
            <div>
              <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#142036] leading-tight mb-1 tracking-tight">
                My Reviews
              </h1>
              <p className="text-[14px] md:text-[15px] text-[#4F5C70] font-medium">
                Your feedback for the kitchens you ordered from
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 mt-2">
            <div className="flex items-center gap-3 bg-white rounded-[14px] p-3 pr-6 border border-[#FDEEE4] shadow-sm min-w-[140px]">
               <div className="w-10 h-10 rounded-full bg-[#FFF5EE] flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-[#F97316]" />
               </div>
               <div>
                 <div className="text-[18px] font-extrabold text-[#F97316] leading-none">{totalReviews}</div>
                 <div className="text-[11px] font-bold text-[#4F5C70] mt-1">Total Reviews</div>
               </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-[14px] p-3 pr-6 border border-[#FDEEE4] shadow-sm min-w-[140px]">
               <div className="w-10 h-10 rounded-full bg-[#F0FDF4] flex items-center justify-center shrink-0">
                  <ChefHat className="w-5 h-5 text-[#15803D]" />
               </div>
               <div>
                 <div className="text-[18px] font-extrabold text-[#15803D] leading-none">{kitchensReviewed}</div>
                 <div className="text-[11px] font-bold text-[#4F5C70] mt-1">Kitchens Reviewed</div>
               </div>
            </div>
            <div className="flex items-center gap-3 bg-white rounded-[14px] p-3 pr-6 border border-[#FDEEE4] shadow-sm min-w-[140px]">
               <div className="w-10 h-10 rounded-full bg-[#F0F5FF] flex items-center justify-center shrink-0">
                  <MessageSquareText className="w-5 h-5 text-[#3B82F6]" />
               </div>
               <div>
                 <div className="text-[18px] font-extrabold text-[#3B82F6] leading-none">{averageRating}</div>
                 <div className="text-[11px] font-bold text-[#4F5C70] mt-1">Average Rating</div>
               </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 mt-8 md:mt-0 w-[240px] h-[180px] md:w-[360px] md:h-[240px] flex-shrink-0">
          <Image 
            src="/account/rating.webp" 
            alt="Rating Illustration" 
            fill 
            className="object-contain drop-shadow-[0_10px_30px_rgba(249,115,22,0.15)]"
          />
        </div>
      </div>

      {/* HEADER ROW */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 px-1">
        <div className="flex items-center gap-2 mb-4 md:mb-0">
          <div className="w-8 h-8 rounded-[8px] bg-[#FFF5EE] flex items-center justify-center border border-[#FDEEE4]">
            <FileText className="w-4 h-4 text-[#F97316]" />
          </div>
          <h2 className="text-[18px] font-extrabold text-[#142036]">Your Reviews</h2>
        </div>
        
        <button className="flex items-center gap-2 bg-white border border-[#E4E8E4] rounded-[10px] px-4 py-2 text-[13px] font-bold text-[#4F5C70] hover:bg-[#F6F8F9] transition-colors shadow-sm self-start md:self-auto">
          <Calendar className="w-4 h-4 text-[#8C96A5]" />
          Latest First
          <ChevronDown className="w-4 h-4 text-[#8C96A5] ml-1" />
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="bg-white rounded-[20px] p-5 md:p-6 border border-[#E4E8E4] shadow-sm flex flex-col gap-5">
            
            {/* Top row: Kitchen & Date/Rating */}
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              <div className="flex items-start gap-4 md:w-[45%]">
                <div className="w-14 h-14 rounded-full bg-[#F3FAF4] border border-[#E7F6E8] flex items-center justify-center shrink-0">
                  <ChefHat className="w-6 h-6 text-[#277C36]" />
                </div>
                <div className="flex flex-col gap-1 pr-4">
                  <h3 className="text-[16px] font-extrabold text-[#142036]">{review.kitchenName}</h3>
                  <p className="text-[13px] text-[#4F5C70] font-medium">{review.dish}</p>
                  <div className="mt-1">
                    <span className="text-[10px] font-bold text-[#277C36] bg-[#E7F6E8] px-2.5 py-1 rounded-full tracking-wide uppercase border border-[#C4DFC8]">
                      Order #{review.shortId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-[55%] mt-2 md:mt-0">
                <div className="flex items-center">
                  <Stars rating={review.rating} showValue={true} />
                </div>
                <div className="flex items-center gap-1.5 text-[12px] font-bold text-[#8C96A5]">
                  <Calendar className="w-3.5 h-3.5" />
                  {format(new Date(review.date), "dd MMM yyyy")}
                </div>
              </div>
            </div>

            <div className="h-px w-full bg-[#EEF0F2]" />

            {/* Bottom row: Sub-ratings & Comment */}
            <div className="flex flex-col md:flex-row items-start md:items-stretch gap-6">
              
              {/* Sub-ratings */}
              <div className="flex-shrink-0 flex flex-col md:flex-row gap-4 md:gap-6 py-1">
                {review.tasteRating != null && (
                  <div className="flex items-center border-b md:border-b-0 md:border-r border-[#EEF0F2] pb-2 md:pb-0 md:pr-6 last:border-0 last:pr-0">
                    <span className="text-[12px] text-[#4F5C70] font-bold w-[70px] md:w-auto">Taste</span> 
                    <SmallStars rating={review.tasteRating} />
                  </div>
                )}
                {review.packagingRating != null && (
                  <div className="flex items-center border-b md:border-b-0 md:border-r border-[#EEF0F2] pb-2 md:pb-0 md:pr-6 last:border-0 last:pr-0">
                    <span className="text-[12px] text-[#4F5C70] font-bold w-[70px] md:w-auto">Packaging</span> 
                    <SmallStars rating={review.packagingRating} />
                  </div>
                )}
                {review.portionSizeRating != null && (
                  <div className="flex items-center">
                    <span className="text-[12px] text-[#4F5C70] font-bold w-[70px] md:w-auto">Portion Size</span> 
                    <SmallStars rating={review.portionSizeRating} />
                  </div>
                )}
              </div>

              {/* Comment Box */}
              {review.comment && (
                <div className="flex-1 w-full bg-[#FDFBF7] border border-[#F4EBE1] rounded-[14px] p-4 flex gap-3 shadow-[0_2px_10px_rgba(20,30,30,0.02)]">
                  <div className="text-[#F97316] font-serif text-[32px] leading-none opacity-40 mt-[-4px]">
                    &ldquo;
                  </div>
                  <p className="text-[13px] text-[#4F5C70] font-medium leading-[1.6] pt-1">
                    {review.comment}
                  </p>
                </div>
              )}
            </div>
            
          </div>
        ))}
        
        {/* EMPTY STATE BLOCK (Rendered at the bottom, or replacing the list if empty) */}
        <div className="bg-gradient-to-r from-[#FFF9F5] to-[#FEF5EE] rounded-[18px] border border-dashed border-[#FDEEE4] shadow-[0_4px_12px_rgba(249,115,22,0.03)] overflow-hidden mt-6 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-5 relative">
          <div className="relative z-10 flex items-center gap-5 w-full md:w-auto">
            <div className="w-14 h-14 rounded-full bg-[#FFF5EE] flex items-center justify-center shrink-0 border border-[#FDEEE4] text-[#F97316]">
              <Star className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-extrabold text-[#142036]">{reviews.length === 0 ? "No reviews yet" : "No more reviews yet"}</h3>
              <p className="text-[13px] text-[#667085] font-medium mt-1">Reviews you leave for orders will appear here.</p>
            </div>
          </div>
          
          <div className="relative z-10 hidden md:flex items-center gap-2 opacity-50 mr-4">
             <MessageSquareText className="w-12 h-12 text-[#FDEEE4] fill-[#FDF5F0]" strokeWidth={1} />
             <PenLine className="w-8 h-8 text-[#F97316] absolute right-[-10px] bottom-[-4px]" strokeWidth={1.5} />
          </div>
        </div>

      </div>
    </div>
  )
}