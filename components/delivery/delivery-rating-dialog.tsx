"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Star } from "lucide-react"
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
import { createDeliveryReview } from "@/actions/delivery-review"

interface DeliveryRatingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  orderId: string
  deliveryPartnerId: string
  deliveryPartnerName: string
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
  const [comment, setComment] = useState("")

  const mutation = useMutation({
    mutationFn: () =>
      createDeliveryReview({
        orderId,
        deliveryPartnerId,
        rating,
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Delivery</DialogTitle>
          <DialogDescription>
            How was your delivery experience with {deliveryPartnerName}?
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-6 py-4">
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
                    "h-8 w-8 transition-colors",
                    star <= (hovered || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground/30"
                  )}
                />
              </button>
            ))}
          </div>

          <Textarea
            placeholder="Share your experience (optional)..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-24 resize-none"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={rating === 0 || mutation.isPending}
          >
            {mutation.isPending ? "Submitting..." : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
