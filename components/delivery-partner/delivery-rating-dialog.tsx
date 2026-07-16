"use client"
/* eslint-disable react-hooks/incompatible-library */

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
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
import { createDeliveryReview } from "@/actions/reviews/delivery-review"

const ratingSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  comment: z.string().optional(),
})

type RatingFormData = z.infer<typeof ratingSchema>

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
  const [hovered, setHovered] = useState(0)

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: {
      rating: 0,
      comment: "",
    },
  })

  const mutation = useMutation({
    mutationFn: ({ rating, comment }: { rating: number; comment?: string }) =>
      createDeliveryReview({
        orderId,
        deliveryPartnerId,
        rating,
        comment,
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

  const rating = form.watch("rating")

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate Delivery</DialogTitle>
          <DialogDescription>
            How was your delivery experience with {deliveryPartnerName}?
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit((data) =>
            mutation.mutate({
              rating: data.rating,
              comment: data.comment || undefined,
            })
          )}
        >
          <div className="flex flex-col items-center gap-6 py-4">
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    form.setValue("rating", star, { shouldValidate: true })
                  }
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

            {form.formState.errors.rating && (
              <p className="text-xs text-destructive -mt-4">
                {form.formState.errors.rating.message}
              </p>
            )}

            <Textarea
              placeholder="Share your experience (optional)..."
              {...form.register("comment")}
              className="min-h-24 resize-none"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
