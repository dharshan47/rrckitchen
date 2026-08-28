"use client"

import { useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { 
  Star, UtensilsCrossed, Package, Bike, ChefHat, 
  ShieldCheck, MessageCircleHeart, Users, CheckCircle2, 
  Lightbulb, ArrowRight, Lock, Tag, MessageSquare, Clock, Smile, Camera, X, Loader2, type LucideIcon
} from "lucide-react"
import { RatingPageSkeleton } from "@/components/order/rating-page-skeleton"
import { CloudinaryUpload } from "@/components/cloudinary/cloudinary-upload"
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
                ? "fill-[#FF5A1F] text-[#FF5A1F]"
                : "fill-[#D1D5DB] text-[#D1D5DB]"
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
    <div className="flex flex-col items-center justify-center p-5 border border-[#E5E7EB] rounded-2xl bg-white hover:border-[#E5E7EB] transition-colors shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
      <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-3", iconBg, iconColor)}>
        <Icon className="h-6 w-6" strokeWidth={2} />
      </div>
      <p className="text-[14px] font-bold text-[#111827] mb-3">{title}</p>
      <StarPicker
        rating={rating}
        hovered={hovered}
        setRating={setRating}
        setHovered={setHovered}
      />
      <span className="text-[12px] font-medium text-[#6B7280] mt-2 min-h-[16px]">
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
    mediaUrls,
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
    setMediaUrls,
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
        <Link href="/account/orders" className="text-[#FF5A1F] hover:underline">Go back to orders</Link>
      </div>
    )
  }



  const firstImage = order.items[0]?.imageUrl
  const deliveredDate = order.statusHistory?.find(h => h.status === "COMPLETED")?.changedAt

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="container max-w-[1200px] mx-auto px-4 py-6 md:py-10">
        
        {/* Header Section */}
        <div className="bg-[linear-gradient(90deg,#FFF8F5_0%,#FFFFFF_50%,#F0FDF4_100%)] rounded-2xl p-6 md:p-10 flex flex-col lg:flex-row items-center justify-between mb-10 relative overflow-hidden shadow-sm">
          <div className="flex items-center gap-6 md:gap-8 relative z-10 w-full lg:w-auto">
            <div className="relative w-48 h-48 md:w-64 md:h-64 -ml-12 -my-16 shrink-0">
               <Image 
                  src="/rating/order.webp" 
                  alt="Order" 
                  fill 
                  className="object-cover md:object-contain drop-shadow-xl"
               />
            </div>
            <div className="mt-2 md:mt-0 flex-1 z-10">
              <h1 className="text-2xl md:text-[34px] font-extrabold text-[#111827] mb-2 md:mb-3 tracking-tight leading-tight">
                Thanks for choosing <span className="text-[#FF5A1F] italic font-serif text-[28px] md:text-[40px] ml-1 font-medium">RRC Kitchen!</span>
              </h1>
              <p className="text-[#374151] text-sm md:text-[16px] max-w-md leading-relaxed font-medium">
                Your feedback helps us serve you better<br className="hidden md:block"/> and support our partner kitchens.
              </p>
            </div>
          </div>
          
          <div className="flex gap-6 md:gap-14 mt-8 lg:mt-0 text-center text-[13px] font-bold text-[#111827] justify-center w-full lg:w-auto relative z-10">
             <div className="flex flex-col items-center gap-4">
               <div className="w-14 h-14 bg-[#ECFDF3] text-[#15803D] rounded-full flex items-center justify-center">
                 <MessageCircleHeart className="w-6 h-6" strokeWidth={2.5}/>
               </div>
               <span className="leading-tight">Your opinion<br/>makes a difference</span>
             </div>
             
             <div className="w-[1px] h-20 bg-gray-200 hidden sm:block self-center"></div>
             
             <div className="flex flex-col items-center gap-4">
               <div className="w-14 h-14 bg-[#FFF3EC] text-[#FF5A1F] rounded-full flex items-center justify-center">
                 <ChefHat className="w-6 h-6" strokeWidth={2.5}/>
               </div>
               <span className="leading-tight">Helps partners<br/>improve</span>
             </div>
             
             <div className="w-[1px] h-20 bg-gray-200 hidden sm:block self-center"></div>
             
             <div className="flex flex-col items-center gap-4 hidden sm:flex">
               <div className="w-14 h-14 bg-[#ECFDF3] text-[#15803D] rounded-full flex items-center justify-center">
                 <Users className="w-6 h-6" strokeWidth={2.5}/>
               </div>
               <span className="leading-tight">Better experience<br/>for everyone</span>
             </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="max-w-4xl mx-auto mb-10 relative px-4 sm:px-12">
          <div className="absolute top-[16px] left-[10%] right-[10%] z-0 block">
            <Progress 
              value={step === 'kitchen' ? 0 : (step === 'delivery' ? 33.33 : (step === 'done' ? 100 : 66.66))} 
              className="h-[2px] bg-gray-200 [&>div]:bg-[#15803D]"
            />
          </div>
          
          <div className="flex justify-between relative z-10">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-3 flex-1 text-center">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-[2px] bg-white transition-colors",
                step === "kitchen" ? "border-[#FF5A1F] text-[#FF5A1F] bg-[#FFF3EC]" : "border-[#15803D] bg-[#15803D] text-white")}>
                {step === "kitchen" ? "1" : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <span className={cn("text-[13px] font-bold leading-tight", step === "kitchen" ? "text-[#FF5A1F]" : "text-[#15803D]")}>Food & Kitchen</span>
            </div>
            
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-3 flex-1 text-center">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-[2px] bg-white transition-colors", 
                step === "kitchen" ? "border-[#E5E7EB] text-[#6B7280]" : "border-[#15803D] bg-[#15803D] text-white")}>
                {step === "kitchen" ? "2" : <CheckCircle2 className="w-5 h-5" />}
              </div>
              <span className={cn("text-[13px] font-bold leading-tight", step === "kitchen" ? "text-[#9CA3AF]" : "text-[#15803D]")}>Delivery Partner</span>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-3 flex-1 text-center">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-[2px] bg-white transition-colors", 
                step === "done" ? "border-[#15803D] bg-[#15803D] text-white" : "border-[#E5E7EB] text-[#6B7280]")}>
                {step === "done" ? <CheckCircle2 className="w-5 h-5" /> : "3"}
              </div>
              <span className={cn("text-[13px] font-bold leading-tight", step === "done" ? "text-[#15803D]" : "text-[#9CA3AF]")}>RRC Kitchen</span>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center gap-3 flex-1 text-center">
              <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-[2px] bg-white transition-colors", 
                step === "done" ? "border-[#15803D] bg-[#15803D] text-white" : "border-[#E5E7EB] text-[#6B7280]")}>
                {step === "done" ? <CheckCircle2 className="w-5 h-5" /> : "4"}
              </div>
              <span className={cn("text-[13px] font-bold leading-tight", step === "done" ? "text-[#15803D]" : "text-[#9CA3AF]")}>Done</span>
            </div>
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Rating Area */}
          <div className="flex-[2] bg-white rounded-2xl shadow-sm border border-[#E5E7EB] p-6 md:p-8">
            {step === "kitchen" && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                  <div className="flex gap-4 items-center">
                    <div className="bg-[#FFF3EC] p-3 rounded-2xl w-14 h-14 flex items-center justify-center">
                      <ChefHat className="text-[#FF5A1F] w-8 h-8" strokeWidth={2}/>
                    </div>
                    <div>
                      <h2 className="text-[22px] md:text-2xl font-bold text-[#111827] mb-1">Rate Your Food & Kitchen</h2>
                      <p className="text-[#6B7280] text-[14px] font-medium">Tell us about the food and the kitchen</p>
                    </div>
                  </div>
                  <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-1 bg-transparent px-0 py-2 sm:p-0">
                    <div className="flex items-center gap-1.5 text-[#15803D] font-bold text-[14px]">
                      <ShieldCheck className="w-5 h-5"/> Secure & Private
                    </div>
                    <p className="text-[12px] text-[#9CA3AF] font-medium">Your reviews are safe</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <RatingSection
                    icon={Smile}
                    title="Taste"
                    rating={tasteRating}
                    hovered={hoveredTaste}
                    setRating={setTasteRating}
                    setHovered={setHoveredTaste}
                    iconBg="bg-[#ECFDF3]"
                    iconColor="text-[#15803D]"
                  />
                  <RatingSection
                    icon={Package}
                    title="Packaging"
                    rating={packagingRating}
                    hovered={hoveredPackaging}
                    setRating={setPackagingRating}
                    setHovered={setHoveredPackaging}
                    iconBg="bg-[#FFF3EC]"
                    iconColor="text-[#FF5A1F]"
                  />
                  <RatingSection
                    icon={UtensilsCrossed}
                    title="Portion Size"
                    rating={portionRating}
                    hovered={hoveredPortion}
                    setRating={setPortionRating}
                    setHovered={setHoveredPortion}
                    iconBg="bg-[#ECFDF3]"
                    iconColor="text-[#15803D]"
                  />
                  <RatingSection
                    icon={ChefHat}
                    title="Overall Kitchen"
                    rating={kitchenOverall}
                    hovered={hoveredKitchen}
                    setRating={setKitchenOverall}
                    setHovered={setHoveredKitchen}
                    iconBg="bg-[#FFF3EC]"
                    iconColor="text-[#FF5A1F]"
                  />
                </div>

                <div className="mb-8 mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[15px] text-[#111827]">Tags <span className="text-[#6B7280] font-normal">(Select what you felt)</span></h3>
                    {kitchenTags.length > 0 && (
                      <button 
                        onClick={() => setKitchenTags([])}
                        className="text-[#FF5200] text-[13px] font-bold hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {KITCHEN_TAGS.map((tag) => {
                      const isSelected = kitchenTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag, kitchenTags, setKitchenTags)}
                          className={cn(
                            "px-5 py-2.5 rounded-full text-[14px] font-medium transition-all duration-200 border flex items-center gap-1.5",
                            isSelected
                              ? "bg-[#ECFDF3] text-[#15803D] border-[#BBF7D0] shadow-sm"
                              : "bg-white text-[#374151] border-[#E5E7EB] hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4 fill-[#16A34A] text-white" />}
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[15px] text-[#111827]">Write your thoughts <span className="text-[#9CA3AF] font-normal ml-1">(Optional)</span></h3>
                  </div>
                  <div className="relative">
                    <textarea 
                      value={kitchenThoughts}
                      onChange={(e) => setKitchenThoughts(e.target.value)}
                      maxLength={250}
                      className="w-full border border-[#E5E7EB] rounded-2xl p-5 pb-14 text-[15px] h-32 resize-none focus:outline-none focus:ring-1 focus:ring-[#FF5A1F] focus:border-[#FF5A1F] placeholder:text-[#9CA3AF] transition-all text-[#111827]" 
                      placeholder="The biryani was super tasty and fresh. Loved the packaging too. Will order again!"
                    />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                      <CloudinaryUpload 
                        onUpload={(res) => {
                          setMediaUrls([...mediaUrls, res.secure_url]);
                        }}
                      >
                        {({ uploading, startUpload }) => (
                          <button 
                            type="button"
                            onClick={startUpload}
                            disabled={uploading || mediaUrls.length >= 3}
                            className="cursor-pointer flex items-center gap-1.5 text-[13px] font-bold text-[#FF5A1F] hover:text-[#E84C12] transition-colors disabled:opacity-50 disabled:hover:text-[#FF5A1F]"
                          >
                            <div className="w-8 h-8 rounded-full bg-[#FFF3EC] flex items-center justify-center">
                              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                            </div>
                            {uploading ? "Uploading..." : "Add Photos"}
                          </button>
                        )}
                      </CloudinaryUpload>
                    </div>
                    <div className="absolute bottom-4 right-4 text-[12px] text-[#9CA3AF] font-medium mt-2">
                      {kitchenThoughts.length}/250
                    </div>
                  </div>
                  {mediaUrls.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      {mediaUrls.map((url, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden border border-[#E5E7EB]">
                          <Image src={url} alt={`Upload ${i}`} fill sizes="64px" className="object-cover" />
                          <button 
                            onClick={() => setMediaUrls(mediaUrls.filter((_, idx) => idx !== i))}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full shadow-sm border border-gray-200 flex items-center justify-center text-red-500 hover:text-red-600 z-10"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
                    mediaUrls,
                  })}
                  disabled={kitchenOverall === 0 && tasteRating === 0 || kitchenMutation.isPending}
                  className="w-full bg-[#FF5A1F] text-white py-4 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-[#E84C12] transition-all shadow-[0_10px_30px_rgba(255,90,31,0.22)] disabled:opacity-50 disabled:shadow-none"
                >
                  {kitchenMutation.isPending ? "Submitting..." : "Continue"} {!kitchenMutation.isPending && <ArrowRight className="w-5 h-5"/>}
                </button>
              </>
            )}

            {step === "delivery" && (
              <>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
                  <div className="flex gap-4 items-center">
                    <div className="bg-[#FFF3EC] p-3 rounded-2xl w-14 h-14 flex items-center justify-center">
                      <Bike className="text-[#FF5A1F] w-8 h-8" strokeWidth={2}/>
                    </div>
                    <div>
                      <h2 className="text-[22px] md:text-2xl font-bold text-[#111827] mb-1">Rate Your Delivery</h2>
                      <p className="text-[#6B7280] text-[14px] font-medium">How was your delivery partner?</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <RatingSection
                    icon={Bike}
                    title="Overall Delivery"
                    rating={deliveryRating}
                    hovered={hoveredDelivery}
                    setRating={setDeliveryRating}
                    setHovered={setHoveredDelivery}
                    iconBg="bg-[#ECFDF3]"
                    iconColor="text-[#15803D]"
                  />
                  <RatingSection
                    icon={Clock}
                    title="Speed"
                    rating={speedRating}
                    hovered={hoveredSpeed}
                    setRating={setSpeedRating}
                    setHovered={setHoveredSpeed}
                    iconBg="bg-[#FFF3EC]"
                    iconColor="text-[#FF5A1F]"
                  />
                </div>

                <div className="mb-8 mt-2">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[15px] text-[#111827]">Tags <span className="text-[#6B7280] font-normal">(Select what you felt)</span></h3>
                    {deliveryTags.length > 0 && (
                      <button 
                        onClick={() => setDeliveryTags([])}
                        className="text-[#FF5200] text-[13px] font-bold hover:underline"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {DELIVERY_TAGS.map((tag) => {
                      const isSelected = deliveryTags.includes(tag)
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag, deliveryTags, setDeliveryTags)}
                          className={cn(
                            "px-5 py-2.5 rounded-full text-[14px] font-medium transition-all duration-200 border flex items-center gap-1.5",
                            isSelected
                              ? "bg-[#ECFDF3] text-[#15803D] border-[#BBF7D0] shadow-sm"
                              : "bg-white text-[#374151] border-[#E5E7EB] hover:border-gray-300 hover:bg-gray-50"
                          )}
                        >
                          {isSelected && <CheckCircle2 className="w-4 h-4 fill-[#16A34A] text-white" />}
                          {tag}
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="mb-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-[15px] text-[#111827]">Write your thoughts <span className="text-[#9CA3AF] font-normal ml-1">(Optional)</span></h3>
                  </div>
                  <div className="relative">
                    <textarea 
                      value={deliveryThoughts}
                      onChange={(e) => setDeliveryThoughts(e.target.value)}
                      maxLength={250}
                      className="w-full border border-[#E5E7EB] rounded-2xl p-5 text-[15px] h-32 resize-none focus:outline-none focus:ring-1 focus:ring-[#FF5200] focus:border-[#FF5200] placeholder:text-[#9CA3AF] transition-all text-[#111827]" 
                      placeholder="Very polite and on time..."
                    />
                    <div className="absolute bottom-4 right-4 text-[12px] text-[#9CA3AF] font-medium">
                      {deliveryThoughts.length}/250
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep("kitchen")}
                    className="flex-1 bg-white border border-[#E5E7EB] text-[#374151] py-4 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
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
                    className="flex-[2] bg-[#FF5A1F] text-white py-4 rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 hover:bg-[#E84C12] transition-all shadow-[0_10px_30px_rgba(255,90,31,0.22)] disabled:opacity-50 disabled:shadow-none"
                  >
                    {deliveryMutation.isPending ? "Submitting..." : "Submit Review"} {!deliveryMutation.isPending && <CheckCircle2 className="w-5 h-5"/>}
                  </button>
                </div>
              </>
            )}

            {step === "done" && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-[#ECFDF3] rounded-full flex items-center justify-center mx-auto mb-8">
                  <CheckCircle2 className="w-12 h-12 text-[#15803D]" />
                </div>
                <h2 className="text-3xl font-extrabold mb-3 text-[#111827]">Thank you for your feedback!</h2>
                <p className="text-[#374151] mb-10 font-medium text-[16px]">Your reviews help us improve our service.</p>
                <Link href="/account/orders" className="bg-[#FF5A1F] text-white px-10 py-4 rounded-xl font-bold hover:bg-[#E84C12] transition-colors shadow-md text-[16px]">
                  Back to Orders
                </Link>
              </div>
            )}
          </div>

          {/* Right Column - Context Cards */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Order Summary */}
            <div className="bg-[#F8FAF8] rounded-2xl p-6 border-none shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[16px] text-[#111827]">Your Order</h3>
                <span className="text-[13px] font-medium text-[#6B7280]">Order ID: #{order.publicCode ?? order.id.slice(-6)}</span>
              </div>
              
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  {firstImage ? (
                    <div className="w-16 h-16 relative rounded-xl overflow-hidden shadow-sm">
                      <Image src={firstImage} alt="Food" fill sizes="64px" className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 bg-white rounded-xl border border-[#E5E7EB] flex items-center justify-center shadow-sm">
                      <ChefHat className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-[15px] text-[#111827] mb-1">
                      {order.kitchenName} <CheckCircle2 className="w-[18px] h-[18px] text-[#15803D] fill-[#16A34A] text-white shrink-0"/>
                    </div>
                    <div className="text-[13px] font-medium text-[#6B7280]">
                      {order.items[0]?.name} {order.items.length > 1 && `• ${order.items.length} Items`}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-[15px] text-[#111827] mb-1">₹ {parseFloat(order.totalAmount).toFixed(0)}</div>
                  <div className="text-[13px] font-medium text-[#6B7280]">Delivered</div>
                </div>
              </div>
              
              <div className="border-t border-[#E5E7EB] pt-4 flex items-center gap-2 text-[13px] font-medium text-[#374151]">
                <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0"/> 
                Delivered on: {deliveredDate ? new Date(deliveredDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                }) : "—"}
              </div>
            </div>

            {/* Why review matters */}
            <div className="bg-[#FFF8F5] rounded-2xl p-6 relative overflow-hidden border-none shadow-sm min-h-[190px]">
              <h3 className="font-bold text-[16px] text-[#111827] mb-5 relative z-10">Why your review matters</h3>
              <ul className="space-y-3.5 text-[14px] font-medium text-[#374151] relative z-10 max-w-[65%]">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0"/> 
                  <span>Helps kitchens serve better quality</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0"/> 
                  <span>Encourages delivery partners</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0"/> 
                  <span>Improves experience for future orders</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0"/> 
                  <span>Your feedback is 100% private</span>
                </li>
              </ul>
              <div className="absolute -right-4 -bottom-4 w-44 h-44 z-0 mix-blend-multiply opacity-95">
                 <Image src="/rating/girl.webp" alt="Illustration" fill sizes="176px" className="object-contain" />
              </div>
            </div>
            
            {/* Tips Card */}
            <div className="bg-[#F8F9FA] rounded-2xl p-6 border-none shadow-sm">
              <h3 className="font-bold text-[15px] text-[#111827] flex items-center gap-2 mb-6">
                <Lightbulb className="w-[20px] h-[20px] text-[#15803D] fill-[#16A34A] text-white"/> 
                Tips: Quick Guide
              </h3>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#FF8A00] shadow-sm">
                    <Star className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-[#374151] leading-tight">Be honest<br/>& fair</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#15803D] shadow-sm">
                    <Tag className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-[#374151] leading-tight">Select relevant<br/>tags</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#15803D] shadow-sm">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-[#374151] leading-tight">Share specific<br/>feedback</span>
                </div>
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center text-[#15803D] shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-bold text-[#374151] leading-tight">It takes only<br/>a minute!</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="mt-6 mb-4 bg-[#F8F9FA] rounded-2xl py-4 flex items-center justify-center gap-2 text-[14px] font-medium text-[#374151] w-full border border-[#E5E7EB]">
           <Lock className="w-4 h-4 text-[#15803D]"/> Your feedback is private and will never be shared with others. 
           <span className="mx-3 text-gray-300">|</span> 
           Need help? <Link href="/help" className="text-[#FF5200] font-bold hover:underline">Contact Support</Link>
        </div>

      </div>
    </div>
  )
}
