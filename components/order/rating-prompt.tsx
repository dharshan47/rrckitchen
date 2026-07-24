"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { submitKitchenReview, submitDeliveryReview } from "@/actions/reviews/review-actions"
import { toast } from "sonner"
import { Star, UtensilsCrossed, Package, Layers, Bike } from "lucide-react"

interface RatingPromptProps {
  orderId: string
  kitchenId: string
  deliveryPersonId?: string
  onComplete?: () => void
}

const KITCHEN_TAGS = [
  "Delicious", "Fresh", "On Time", "Portion Size", "Packaging",
  "Spicy", "Tasty", "Value for Money", "Hygienic",
]
const DELIVERY_TAGS = [
  "Friendly", "Fast", "Careful", "On Time", "Professional",
  "Late", "Rude",
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
            className={`h-7 w-7 ${
              star <= (hovered || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-muted text-muted"
            }`}
          />
        </button>
      ))}
    </div>
  )
}

function RatingSection({
  icon: Icon,
  title,
  description,
  rating,
  hovered,
  setRating,
  setHovered,
}: {
  icon: typeof Star
  title: string
  description?: string
  rating: number
  hovered: number
  setRating: (n: number) => void
  setHovered: (n: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">{title}</p>
      </div>
      {description && <p className="text-xs text-muted-foreground -mt-1">{description}</p>}
      <StarPicker
        rating={rating}
        hovered={hovered}
        setRating={setRating}
        setHovered={setHovered}
      />
    </div>
  )
}

export function RatingPrompt({ orderId, kitchenId, deliveryPersonId, onComplete }: RatingPromptProps) {
  const [step, setStep] = useState<"kitchen" | "delivery" | "done">("kitchen")

  const [tasteRating, setTasteRating] = useState(0)
  const [packagingRating, setPackagingRating] = useState(0)
  const [portionRating, setPortionRating] = useState(0)
  const [kitchenOverall, setKitchenOverall] = useState(0)
  const [kitchenTags, setKitchenTags] = useState<string[]>([])

  const [deliveryRating, setDeliveryRating] = useState(0)
  const [speedRating, setSpeedRating] = useState(0)
  const [behaveHygiene, setBehaveHygiene] = useState(true)
  const [deliveryTags, setDeliveryTags] = useState<string[]>([])

  const [hoveredTaste, setHoveredTaste] = useState(0)
  const [hoveredPackaging, setHoveredPackaging] = useState(0)
  const [hoveredPortion, setHoveredPortion] = useState(0)
  const [hoveredKitchen, setHoveredKitchen] = useState(0)
  const [hoveredDelivery, setHoveredDelivery] = useState(0)
  const [hoveredSpeed, setHoveredSpeed] = useState(0)

  const kitchenMutation = useMutation({
    mutationFn: () =>
      submitKitchenReview({
        orderId,
        kitchenPartnerId: kitchenId,
        rating: kitchenOverall || tasteRating,
        tasteRating: tasteRating || undefined,
        packagingRating: packagingRating || undefined,
        portionSizeRating: portionRating || undefined,
        tags: kitchenTags,
        comment: kitchenTags.join(", "),
      }),
    onSuccess: () => {
      if (deliveryPersonId) {
        setStep("delivery")
      } else {
        toast.success("Review submitted!")
        setStep("done")
        onComplete?.()
      }
    },
    onError: () => toast.error("Failed to submit review"),
  })

  const deliveryMutation = useMutation({
    mutationFn: () =>
      submitDeliveryReview({
        orderId,
        deliveryPartnerId: deliveryPersonId!,
        rating: deliveryRating,
        speedRating: speedRating || undefined,
        behaviorHygiene: behaveHygiene,
        comment: deliveryTags.join(", "),
      }),
    onSuccess: () => {
      toast.success("All reviews submitted!")
      setStep("done")
      onComplete?.()
    },
    onError: () => toast.error("Failed to submit delivery review"),
  })

  function toggleTag(tag: string, list: string[], setter: (t: string[]) => void) {
    if (list.includes(tag)) {
      setter(list.filter((t) => t !== tag))
    } else {
      setter([...list, tag])
    }
  }

  if (step === "done") return null

  return (
    <div className="space-y-5 p-2">
      {step === "kitchen" && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-primary" />
              Rate Your Food & Kitchen
            </h3>
            <p className="text-xs text-muted-foreground">Share your experience with the food and kitchen</p>
          </div>

          <RatingSection
            icon={UtensilsCrossed}
            title="Taste"
            description="How was the taste of the food?"
            rating={tasteRating}
            hovered={hoveredTaste}
            setRating={setTasteRating}
            setHovered={setHoveredTaste}
          />

          <RatingSection
            icon={Package}
            title="Packaging"
            description="How was the food packaging?"
            rating={packagingRating}
            hovered={hoveredPackaging}
            setRating={setPackagingRating}
            setHovered={setHoveredPackaging}
          />

          <RatingSection
            icon={Layers}
            title="Portion Size"
            description="How was the portion size?"
            rating={portionRating}
            hovered={hoveredPortion}
            setRating={setPortionRating}
            setHovered={setHoveredPortion}
          />

          <RatingSection
            icon={Star}
            title="Overall Kitchen"
            description="Overall rating for the kitchen"
            rating={kitchenOverall}
            hovered={hoveredKitchen}
            setRating={setKitchenOverall}
            setHovered={setHoveredKitchen}
          />

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Tags (tap to select)</p>
            <div className="flex flex-wrap gap-2">
              {KITCHEN_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag, kitchenTags, setKitchenTags)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    kitchenTags.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-muted-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => kitchenMutation.mutate()}
            disabled={kitchenOverall === 0 && tasteRating === 0 || kitchenMutation.isPending}
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {kitchenMutation.isPending ? "Submitting..." : "Submit Kitchen Review"}
          </button>
        </div>
      )}

      {step === "delivery" && (
        <div className="space-y-5">
          <div className="space-y-1">
            <h3 className="text-base font-semibold flex items-center gap-2">
              <Bike className="h-4 w-4 text-primary" />
              Rate Your Delivery
            </h3>
            <p className="text-xs text-muted-foreground">How was your delivery experience?</p>
          </div>

          <RatingSection
            icon={Star}
            title="Overall Delivery"
            description="Overall rating for the delivery partner"
            rating={deliveryRating}
            hovered={hoveredDelivery}
            setRating={setDeliveryRating}
            setHovered={setHoveredDelivery}
          />

          <RatingSection
            icon={Bike}
            title="Speed"
            description="How fast was the delivery?"
            rating={speedRating}
            hovered={hoveredSpeed}
            setRating={setSpeedRating}
            setHovered={setHoveredSpeed}
          />

          <div className="flex items-center gap-3 py-2">
            <p className="text-sm font-medium">Behavior & Hygiene</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBehaveHygiene(true)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  behaveHygiene
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-background text-muted-foreground border-border"
                }`}
              >
                Good
              </button>
              <button
                type="button"
                onClick={() => setBehaveHygiene(false)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  !behaveHygiene
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-background text-muted-foreground border-border"
                }`}
              >
                Needs Improvement
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Tags (tap to select)</p>
            <div className="flex flex-wrap gap-2">
              {DELIVERY_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag, deliveryTags, setDeliveryTags)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    deliveryTags.includes(tag)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background text-muted-foreground border-border hover:border-muted-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep("kitchen")}
              className="flex-1 inline-flex items-center justify-center rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted/50"
            >
              Back
            </button>
            <button
              onClick={() => deliveryMutation.mutate()}
              disabled={deliveryRating === 0 || deliveryMutation.isPending}
              className="flex-1 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {deliveryMutation.isPending ? "Submitting..." : "Submit Delivery Review"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
