"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { submitKitchenReview, submitDeliveryReview } from "@/actions/reviews/review-actions"
import { toast } from "sonner"
import { Star } from "lucide-react"

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
  label,
}: {
  rating: number
  hovered: number
  setRating: (n: number) => void
  setHovered: (n: number) => void
  label: string
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
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
              className={`h-8 w-8 ${
                star <= (hovered || rating)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-muted text-muted"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}

export function RatingPrompt({ orderId, kitchenId, deliveryPersonId, onComplete }: RatingPromptProps) {
  const [step, setStep] = useState<"kitchen" | "delivery" | "done">("kitchen")
  const [kitchenRating, setKitchenRating] = useState(0)
  const [deliveryRating, setDeliveryRating] = useState(0)
  const [kitchenTags, setKitchenTags] = useState<string[]>([])
  const [deliveryTags, setDeliveryTags] = useState<string[]>([])
  const [hoveredKitchen, setHoveredKitchen] = useState(0)
  const [hoveredDelivery, setHoveredDelivery] = useState(0)

  const kitchenMutation = useMutation({
    mutationFn: () =>
      submitKitchenReview({
        orderId,
        kitchenPartnerId: kitchenId,
        rating: kitchenRating,
        tags: kitchenTags,
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
    <div className="space-y-6 p-6">
      {step === "kitchen" && (
        <>
          <StarPicker
            rating={kitchenRating}
            hovered={hoveredKitchen}
            setRating={setKitchenRating}
            setHovered={setHoveredKitchen}
            label="Rate the food"
          />
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
          <button
            onClick={() => kitchenMutation.mutate()}
            disabled={kitchenRating === 0 || kitchenMutation.isPending}
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {kitchenMutation.isPending ? "Submitting..." : "Submit Food Review"}
          </button>
        </>
      )}

      {step === "delivery" && (
        <>
          <StarPicker
            rating={deliveryRating}
            hovered={hoveredDelivery}
            setRating={setDeliveryRating}
            setHovered={setHoveredDelivery}
            label="Rate the delivery"
          />
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
          <button
            onClick={() => deliveryMutation.mutate()}
            disabled={deliveryRating === 0 || deliveryMutation.isPending}
            className="w-full inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {deliveryMutation.isPending ? "Submitting..." : "Submit Delivery Review"}
          </button>
        </>
      )}
    </div>
  )
}
