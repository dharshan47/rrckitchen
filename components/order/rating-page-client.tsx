"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { 
  Star, UtensilsCrossed, Package, Layers, Bike, ChefHat, 
  ShieldCheck, MessageCircleHeart, Users, CheckCircle2, 
  Lightbulb, ArrowRight, Lock, Tag, MessageSquare, Clock, type LucideIcon
} from "lucide-react"
import { RatingPageSkeleton } from "@/components/order/rating-page-skeleton"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  useRatingOrdersQuery,
  useSubmitKitchenReviewMutation,
  useSubmitDeliveryReviewMutation,
  useRatingOrders,
  useRatingStep,
  useKitchenRatings,
  useDeliveryRatings,
  useRatingActions,
} from "@/stores/ratingStore"

const KITCHEN_TAGS = [
  "Delicious", "Fresh", "On Time", "Hygienic", "Spicy", "Value for Money",
  "Tasty", "Portion Size", "Packaging"
]
const DELIVERY_TAGS = [
  "Friendly", "Fast", "Careful", "On Time", "Professional",
  "Late", "Rude"
]

function StarPicker({
  rating,
  hovered,
  setRating,
  setHovered,
}: {
  rating: number
  hovered: number
  setRating: (n: number) => void
  setHovered: (n: number) => void
}) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110"
        >
          <Star
            className={`h-6 w-6 ${
              star <= (hovered || rating)
                ? "fill-[#EE7005] text-[#EE7005]"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function getRatingLabel(rating: number) {
  if (rating === 5) return "Excellent"
  if (rating === 4) return "Very Good"
  if (rating === 3) return "Good"
  if (rating === 2) return "Average"
  if (rating === 1) return "Poor"
  return " "
}

function RatingSection({
  icon: Icon,
  title,
  rating,
  hovered,
  setRating,
  setHovered,
  iconBg,
  iconColor
}: {
  icon: LucideIcon
  title: string
  rating: number
  hovered: number
  setRating: (n: number) => void
  setHovered: (n: number) => void
  iconBg: string
  iconColor: string
}) {
  return (
    <div className="flex flex-col items-center justify-center p-4 border rounded-xl bg-white hover:border-[#EE7005]/30 transition-colors">
      <div className={cn("w-10 h-10 rounded-full flex items-center justify-center mb-3", iconBg, iconColor)}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-[13px] font-bold text-gray-900 mb-2">{title}</p>
      <StarPicker
        rating={rating}
        hovered={hovered}
        setRating={setRating}
        setHovered={setHovered}
      />
      <span className="text-[11px] font-medium text-gray-500 mt-2 min-h-[16px]">
        {getRatingLabel(rating)}
      </span>
    </div>
  )
}

export function RatingPageClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get("orderId")

  const step = useRatingStep()
  const {
    tasteRating,
    packagingRating,
    portionRating,
    kitchenOverall,
    kitchenTags,
    kitchenThoughts,
    hoveredTaste,
    hoveredPackaging,
    hoveredPortion,
    hoveredKitchen,
  } = useKitchenRatings()
  const {
    deliveryRating,
    speedRating,
    deliveryTags,
    deliveryThoughts,
    hoveredDelivery,
    hoveredSpeed,
  } = useDeliveryRatings()
  const {
    setStep,
    setTasteRating,
    setPackagingRating,
    setPortionRating,
    setKitchenOverall,
    setKitchenTags,
    setKitchenThoughts,
    setDeliveryRating,
    setSpeedRating,
    setDeliveryTags,
    setDeliveryThoughts,
    setHoveredTaste,
    setHoveredPackaging,
    setHoveredPortion,
    setHoveredKitchen,
    setHoveredDelivery,
    setHoveredSpeed,
  } = useRatingActions()

  const { isLoading } = useRatingOrdersQuery()

  const orders = useRatingOrders()

  const order = orders?.find(o => o.id === orderId)

  // Fast forward if review already exists
  useEffect(() => {
    if (order) {
      if (order.kitchenReview && !order.deliveryReview && order.deliveryPartner) {
        setStep("delivery")
      } else if (order.kitchenReview && (!order.deliveryPartner || order.deliveryReview)) {
        setStep("done")
      }
    }
  }, [order, setStep])

  const kitchenMutation = useSubmitKitchenReviewMutation(() => {
    if (order?.deliveryPartner) {
      setStep("delivery")
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      toast.success("Review submitted!")
      setStep("done")
    }
  })

  const deliveryMutation = useSubmitDeliveryReviewMutation(() => {
    toast.success("All reviews submitted!")
    setStep("done")
    router.push("/account/orders")
  })

  function toggleTag(tag: string, list: string[], setter: (t: string[]) => void) {
    if (list.includes(tag)) {
      setter(list.filter((t) => t !== tag))
    } else {
      setter([...list, tag])
    }
  }

  if (isLoading) {
    return <RatingPageSkeleton />
  }

  if (!order) {
    return (
      <div className="container max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold mb-2">Order not found</h2>
        <Link href="/account/orders" className="text-[#EE7005] hover:underline">Go back to orders</Link>
      </div>
    )
  }



  const firstImage = order.items[0]?.imageUrl
  const deliveredDate = order.statusHistory?.find(h => h.status === "COMPLETED")?.changedAt

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container max-w-[1200px] mx-auto px-4 py-6 md:py-10">
        
        {/* Header Section */}
        <div className="bg-[#fff9f5] rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between mb-10 shadow-sm border border-orange-50/50">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left w-full md:w-auto">
            <div className="relative w-48 h-32 md:w-56 md:h-36 shrink-0">
               <Image 
                  src="/rating/order.webp" 
                  alt="Order" 
                  fill 
                  className="object-contain drop-shadow-sm"
               />
            </div>
            <div className="mt-2 md:mt-6">
              <h1 className="text-2xl md:text-[28px] font-extrabold text-gray-900 mb-2 md:mb-3 tracking-tight">
                Thanks for choosing <span className="text-[#EE7005] italic font-serif tracking-normal">RRC Kitchen!</span>
              </h1>
              <p className="text-gray-600 text-sm md:text-[15px] max-w-md leading-relaxed font-medium">
                Your feedback helps us serve you better and support our partner kitchens.
              </p>
            </div>
          </div>
          <div className="flex gap-6 md:gap-10 mt-8 md:mt-0 text-center text-[12px] font-bold text-gray-700 justify-center w-full md:w-auto">
             <div className="flex flex-col items-center gap-3">
               <div className="w-12 h-12 md:w-14 md:h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                 <MessageCircleHeart className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5}/>
               </div>
               <span>Your opinion<br/>makes a difference</span>
             </div>
             <div className="flex flex-col items-center gap-3">
               <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-50 text-[#EE7005] rounded-full flex items-center justify-center">
                 <ChefHat className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5}/>
               </div>
               <span>Helps partners<br/>improve</span>
             </div>
             <div className="flex flex-col items-center gap-3 hidden sm:flex">
               <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center">
                 <Users className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.5}/>
               </div>
               <span>Better experience<br/>for everyone</span>
             </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="max-w-4xl mx-auto mb-8 md:mb-10 relative px-2 sm:px-0">
          <div className="absolute top-[15px] left-0 right-0 z-0 block">
            <Progress 
              value={step === 'kitchen' ? 0 : (step === 'delivery' ? 33.33 : 100)} 
              className="h-[2px] bg-gray-200 [&>div]:bg-green-600"
            />
          </div>
          
          <div className="flex justify-between relative z-10 gap-1 sm:gap-2">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 text-center">
              <div className={cn("w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 bg-white transition-colors", 
                "border-green-600 bg-green-600 text-white")}>
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] sm:text-xs font-bold text-green-700 leading-tight">Food & Kitchen</span>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 text-center">
              <div className={cn("w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 bg-white transition-colors", 
                step === "kitchen" ? "border-gray-300 text-gray-400" : "border-green-600 bg-green-600 text-white")}>
                {step === "kitchen" ? "2" : <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <span className={cn("text-[10px] sm:text-xs font-bold leading-tight", step === "kitchen" ? "text-gray-400" : "text-green-700")}>Delivery Partner</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 text-center">
              <div className={cn("w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 bg-white transition-colors", 
                step === "done" ? "border-green-600 bg-green-600 text-white" : "border-gray-300 text-gray-400")}>
                {step === "done" ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : "3"}
              </div>
              <span className={cn("text-[10px] sm:text-xs font-bold leading-tight", step === "done" ? "text-green-700" : "text-gray-400")}>RRC Kitchen</span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-1 sm:gap-2 flex-1 text-center">
              <div className={cn("w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 bg-white transition-colors", 
                step === "done" ? "border-green-600 bg-green-600 text-white" : "border-gray-300 text-gray-400")}>
                {step === "done" ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : "4"}
              </div>
              <span className={cn("text-[10px] sm:text-xs font-bold leading-tight", step === "done" ? "text-green-700" : "text-gray-400")}>Done</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Rating Area */}
          <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
            {step === "kitchen" && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                  <div className="flex gap-4 items-center">
                    <div className="bg-orange-50 p-3 rounded-xl">
                      <ChefHat className="text-[#EE7005] w-7 h-7" strokeWidth={2}/>
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">Rate Your Food & Kitchen</h2>
                      <p className="text-gray-500 text-[13px] font-medium">Tell us about the food and the kitchen</p>
                    </div>
                  </div>
                  <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 bg-green-50 sm:bg-transparent px-3 py-2 sm:p-0 rounded-lg">
                    <div className="flex items-center gap-1.5 text-green-700 font-bold text-[13px]">
                      <ShieldCheck className="w-4 h-4"/> Secure & Private
                    </div>
                    <p className="text-[11px] text-green-600 sm:text-gray-400 font-medium">Your reviews are safe</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <RatingSection
                    icon={UtensilsCrossed}
                    title="Taste"
                    rating={tasteRating}
                    hovered={hoveredTaste}
                    setRating={setTasteRating}
                    setHovered={setHoveredTaste}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                  />
                  <RatingSection
                    icon={Package}
                    title="Packaging"
                    rating={packagingRating}
                    hovered={hoveredPackaging}
                    setRating={setPackagingRating}
                    setHovered={setHoveredPackaging}
                    iconBg="bg-orange-50"
                    iconColor="text-[#EE7005]"
                  />
                  <RatingSection
                    icon={Layers}
                    title="Portion Size"
                    rating={portionRating}
                    hovered={hoveredPortion}
                    setRating={setPortionRating}
                    setHovered={setHoveredPortion}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                  />
                  <RatingSection
                    icon={ChefHat}
                    title="Overall Kitchen"
                    rating={kitchenOverall}
                    hovered={hoveredKitchen}
                    setRating={setKitchenOverall}
                    setHovered={setHoveredKitchen}
                    iconBg="bg-orange-50"
                    iconColor="text-[#EE7005]"
                  />
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-[14px] text-gray-900">Tags (Select what you felt)</h3>
                    {kitchenTags.length > 0 && (
                      <button 
                        onClick={() => setKitchenTags([])}
                        className="text-[#EE7005] text-[12px] font-bold hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {KITCHEN_TAGS.map((tag) => {
                      const isSelected = kitchenTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag, kitchenTags, setKitchenTags)}
                          className={cn(
                            "px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-200 border flex items-center gap-1.5",
                            isSelected
                              ? "bg-green-50 text-green-700 border-green-200 shadow-sm"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-[14px] text-gray-900">Write your thoughts <span className="text-gray-400 font-medium ml-1">(Optional)</span></h3>
                    <span className="text-[11px] text-gray-400 font-medium">{kitchenThoughts.length}/250</span>
                  </div>
                  <textarea 
                    value={kitchenThoughts}
                    onChange={(e) => setKitchenThoughts(e.target.value)}
                    maxLength={250}
                    className="w-full border border-gray-200 rounded-xl p-4 text-[14px] h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#EE7005]/20 focus:border-[#EE7005] placeholder:text-gray-400 transition-all font-medium" 
                    placeholder="The biryani was super tasty and fresh. Loved the packaging too. Will order again!"
                  />
                </div>

                <button
                  onClick={() => kitchenMutation.mutate({
                    orderId: orderId!,
                    kitchenPartnerId: order!.kitchenPartnerId!,
                    rating: kitchenOverall || tasteRating,
                    tasteRating: tasteRating || undefined,
                    packagingRating: packagingRating || undefined,
                    portionSizeRating: portionRating || undefined,
                    tags: kitchenTags,
                    comment: kitchenThoughts,
                  })}
                  disabled={kitchenOverall === 0 && tasteRating === 0 || kitchenMutation.isPending}
                  className="w-full bg-[#EE7005] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#EE7005]/90 transition-all shadow-sm shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none"
                >
                  {kitchenMutation.isPending ? "Submitting..." : "Continue"} {!kitchenMutation.isPending && <ArrowRight className="w-4 h-4"/>}
                </button>
              </>
            )}

            {step === "delivery" && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                  <div className="flex gap-4 items-center">
                    <div className="bg-orange-50 p-3 rounded-xl">
                      <Bike className="text-[#EE7005] w-7 h-7" strokeWidth={2}/>
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-1">Rate Your Delivery</h2>
                      <p className="text-gray-500 text-[13px] font-medium">How was your delivery partner?</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mb-8">
                  <RatingSection
                    icon={Bike}
                    title="Overall Delivery"
                    rating={deliveryRating}
                    hovered={hoveredDelivery}
                    setRating={setDeliveryRating}
                    setHovered={setHoveredDelivery}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                  />
                  <RatingSection
                    icon={Clock}
                    title="Speed"
                    rating={speedRating}
                    hovered={hoveredSpeed}
                    setRating={setSpeedRating}
                    setHovered={setHoveredSpeed}
                    iconBg="bg-orange-50"
                    iconColor="text-[#EE7005]"
                  />
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-[14px] text-gray-900">Tags (Select what you felt)</h3>
                    {deliveryTags.length > 0 && (
                      <button 
                        onClick={() => setDeliveryTags([])}
                        className="text-[#EE7005] text-[12px] font-bold hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {DELIVERY_TAGS.map((tag) => {
                      const isSelected = deliveryTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag, deliveryTags, setDeliveryTags)}
                          className={cn(
                            "px-4 py-2 rounded-full text-[13px] font-bold transition-all duration-200 border flex items-center gap-1.5",
                            isSelected
                              ? "bg-green-50 text-green-700 border-green-200 shadow-sm"
                              : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-[14px] text-gray-900">Write your thoughts <span className="text-gray-400 font-medium ml-1">(Optional)</span></h3>
                  </div>
                  <textarea 
                    value={deliveryThoughts}
                    onChange={(e) => setDeliveryThoughts(e.target.value)}
                    maxLength={250}
                    className="w-full border border-gray-200 rounded-xl p-4 text-[14px] h-28 resize-none focus:outline-none focus:ring-2 focus:ring-[#EE7005]/20 focus:border-[#EE7005] placeholder:text-gray-400 transition-all font-medium" 
                    placeholder="Very polite and on time..."
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep("kitchen")}
                    className="flex-1 bg-white border border-gray-200 text-gray-700 py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => deliveryMutation.mutate({
                      orderId: orderId!,
                      deliveryPartnerId: order!.deliveryPartner!.id,
                      rating: deliveryRating,
                      speedRating: speedRating || undefined,
                      behaviorHygiene: true,
                      comment: deliveryThoughts,
                    })}
                    disabled={deliveryRating === 0 || deliveryMutation.isPending}
                    className="flex-[2] bg-[#EE7005] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#EE7005]/90 transition-all shadow-sm shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none"
                  >
                    {deliveryMutation.isPending ? "Submitting..." : "Submit Review"} {!deliveryMutation.isPending && <CheckCircle2 className="w-4 h-4"/>}
                  </button>
                </div>
              </>
            )}

            {step === "done" && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2 text-gray-900">Thank you for your feedback!</h2>
                <p className="text-gray-500 mb-8 font-medium">Your reviews help us improve our service.</p>
                <Link href="/account/orders" className="bg-[#EE7005] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#EE7005]/90 transition-colors">
                  Back to Orders
                </Link>
              </div>
            )}

            <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-[12px] font-medium text-gray-500">
               <Lock className="w-4 h-4 text-green-600"/> Your feedback is private and will never be shared with others. 
               <span className="mx-2 text-gray-300">|</span> 
               Need help? <Link href="/help" className="text-[#EE7005] hover:underline font-bold">Contact Support</Link>
            </div>
          </div>

          {/* Right Column - Context Cards */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Order Summary */}
            <div className="bg-[#f8f9fa] rounded-xl p-6 border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-extrabold text-[15px] text-gray-900">Your Order</h3>
                <span className="text-[11px] font-bold text-gray-500 bg-gray-200 px-2 py-1 rounded">Order ID: #{order.publicCode ?? order.id.slice(-6)}</span>
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3.5">
                  {firstImage ? (
                    <div className="w-12 h-12 relative rounded-lg overflow-hidden shadow-sm">
                      <Image src={firstImage} alt="Food" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center shadow-sm">
                      <ChefHat className="w-6 h-6 text-gray-300" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 font-extrabold text-[14px] text-gray-900 mb-0.5">
                      {order.kitchenName} <CheckCircle2 className="w-[14px] h-[14px] text-green-600 fill-green-600 text-white shrink-0"/>
                    </div>
                    <div className="text-[12px] font-medium text-gray-500">
                      {order.items[0]?.name} {order.items.length > 1 && `• ${order.items.length} Items`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-extrabold text-[14px] text-gray-900 mb-0.5">₹ {parseFloat(order.totalAmount).toFixed(0)}</div>
                  <div className="text-[11px] font-bold text-green-600">Delivered</div>
                </div>
              </div>
              
              <div className="border-t border-gray-200 mt-5 pt-4 flex items-center gap-2 text-[12px] font-bold text-gray-600">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0"/> 
                Delivered on: {deliveredDate ? new Date(deliveredDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                }) : "Recently"}
              </div>
            </div>

            {/* Why review matters */}
            <div className="bg-[#fff9f5] rounded-xl p-6 relative overflow-hidden border border-orange-50 shadow-sm">
              <h3 className="font-extrabold text-[15px] text-gray-900 mb-4 relative z-10">Why your review matters</h3>
              <ul className="space-y-3.5 text-[13px] font-medium text-gray-600 relative z-10">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5"/> 
                  <span>Helps kitchens serve better quality</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5"/> 
                  <span>Encourages delivery partners</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5"/> 
                  <span>Improves experience for future orders</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5"/> 
                  <span>Your feedback is 100% private</span>
                </li>
              </ul>
              <div className="absolute right-0 bottom-0 w-36 h-36 z-0 opacity-90 mix-blend-multiply">
                 <Image src="/rating/girl.webp" alt="Illustration" fill className="object-contain" />
              </div>
            </div>
            
            {/* Tips Card */}
            <div className="bg-green-50/50 rounded-xl p-6 border border-green-100 shadow-sm">
              <h3 className="font-extrabold text-[14px] text-gray-900 flex items-center gap-2 mb-5">
                <Lightbulb className="w-[18px] h-[18px] text-green-600 fill-green-600 text-white"/> 
                Tips: Quick Guide
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-orange-400">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 leading-tight">Be honest<br/>& fair</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-green-600">
                    <Tag className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 leading-tight">Select relevant<br/>tags</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-blue-500">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 leading-tight">Share specific<br/>feedback</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white border border-gray-100 flex items-center justify-center text-[#EE7005]">
                    <Clock className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-bold text-gray-600 leading-tight">It takes only<br/>a minute!</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}
