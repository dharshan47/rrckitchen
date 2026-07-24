"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Star, Bike, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { createDeliveryReview } from "@/actions/reviews/delivery-review"

interface DeliveryRatingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  deliveryPartnerId: string
  deliveryPartnerName: string
}

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
    <div className="flex gap-1.5">
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
            className={cn(
              "h-7 w-7 transition-colors",
              star <= (hovered || rating)
                ? "fill-yellow-400 text-yellow-400"
                : "text-muted-foreground/30"
            )}
          />
        </button>
      ))}
    </div>
  )
}

export function DeliveryRatingDialog({
  open,
  onOpenChange,
  orderId,
  deliveryPartnerId,
  deliveryPartnerName,
}: DeliveryRatingDialogProps) {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [speedRating, setSpeedRating] = useState(0)
  const [hoveredSpeed, setHoveredSpeed] = useState(0)
  const [behaviorHygiene, setBehaviorHygiene] = useState<boolean | null>(null)
  const [comment, setComment] = useState("")

  const mutation = useMutation({
    mutationFn: () =>
      createDeliveryReview({
        orderId,
        deliveryPartnerId,
        rating,
        speedRating: speedRating || undefined,
        behaviorHygiene: behaviorHygiene ?? undefined,
        comment: comment || undefined,
      }),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("Delivery rating submitted!")
        onOpenChange(false)
        queryClient.invalidateQueries({ queryKey: ["orders"] })
      } else {
        toast.error(result.error ?? "Failed to submit rating")
      }
    },
    onError: () => toast.error("Something went wrong"),
  })

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error("Please select a rating")
      return
    }
    mutation.mutate()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" /> Rate Delivery Partner
          </DialogTitle>
          <DialogDescription>
            How was your delivery experience with {deliveryPartnerName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Overall Delivery</p>
            </div>
            <StarPicker rating={rating} hovered={hovered} setRating={setRating} setHovered={setHovered} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Bike className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Delivery Speed</p>
            </div>
            <StarPicker rating={speedRating} hovered={hoveredSpeed} setRating={setSpeedRating} setHovered={setHoveredSpeed} />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Behavior & Hygiene</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBehaviorHygiene(true)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-medium border transition-colors",
                  behaviorHygiene === true
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-background text-muted-foreground border-border hover:border-muted-foreground"
                )}
              >
                Good
              </button>
              <button
                type="button"
                onClick={() => setBehaviorHygiene(false)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-medium border transition-colors",
                  behaviorHygiene === false
                    ? "bg-red-600 text-white border-red-600"
                    : "bg-background text-muted-foreground border-border hover:border-muted-foreground"
                )}
              >
                Needs Improvement
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Comment (optional)</p>
            <Textarea
              placeholder="Share your experience..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-20 resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={rating === 0 || mutation.isPending}>
            {mutation.isPending ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
