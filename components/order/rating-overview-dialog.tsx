"use client"

import { Star, UtensilsCrossed, Package, Layers, Bike, Heart, ChefHat, Truck } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface KitchenReviewData {
  id: string
  rating: number
  tasteRating?: number | null
  packagingRating?: number | null
  portionSizeRating?: number | null
  comment?: string | null
}

interface DeliveryReviewData {
  id: string
  rating: number
  speedRating?: number | null
  behaviorHygiene?: boolean | null
  safetyContactless?: boolean | null
  comment?: string | null
}

interface RatingOverviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kitchenReview?: KitchenReviewData | null
  deliveryReview?: DeliveryReviewData | null
  deliveryPartnerName?: string | null
}

function StarDisplay({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={cn(
            "h-3.5 w-3.5",
            i < rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/20"
          )}
        />
      ))}
    </div>
  )
}

function RatingRow({ icon: Icon, label, rating }: { icon: typeof Star; label: string; rating?: number | null }) {
  if (rating == null) return null
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <StarDisplay rating={rating} />
    </div>
  )
}

export function RatingOverviewDialog({
  open,
  onOpenChange,
  kitchenReview,
  deliveryReview,
  deliveryPartnerName,
}: RatingOverviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" /> Your Ratings
          </DialogTitle>
          <DialogDescription>Review of ratings you submitted for this order</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {kitchenReview && (
            <>
              <div className="space-y-1 rounded-lg border border-border p-3">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <UtensilsCrossed className="h-4 w-4 text-primary" /> Food Rating
                </p>
                <div className="divide-y divide-border/50">
                  <RatingRow icon={UtensilsCrossed} label="Food Taste" rating={kitchenReview.tasteRating || kitchenReview.rating} />
                </div>
              </div>

              <div className="space-y-1 rounded-lg border border-border p-3">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <Package className="h-4 w-4 text-primary" /> Packaging Rating
                </p>
                <div className="divide-y divide-border/50">
                  <RatingRow icon={Package} label="Packaging" rating={kitchenReview.packagingRating} />
                  <RatingRow icon={Layers} label="Portion Size" rating={kitchenReview.portionSizeRating} />
                </div>
              </div>

              <div className="space-y-1 rounded-lg border border-border p-3">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <ChefHat className="h-4 w-4 text-primary" /> Kitchen Rating
                </p>
                <div className="divide-y divide-border/50">
                  <RatingRow icon={Star} label="Overall Kitchen" rating={kitchenReview.rating} />
                </div>
              </div>
            </>
          )}

          {deliveryReview && (
            <>
              <div className="space-y-1 rounded-lg border border-border p-3">
                <p className="text-sm font-semibold flex items-center gap-1.5">
                  <Bike className="h-4 w-4 text-primary" /> Delivery Partner Rating
                  {deliveryPartnerName && (
                    <span className="text-xs font-normal text-muted-foreground">- {deliveryPartnerName}</span>
                  )}
                </p>
                <div className="divide-y divide-border/50">
                  <RatingRow icon={Star} label="Overall Delivery" rating={deliveryReview.rating} />
                  <RatingRow icon={Truck} label="Speed" rating={deliveryReview.speedRating} />
                  {deliveryReview.behaviorHygiene != null && (
                    <div className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <Heart className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Behavior & Hygiene</span>
                      </div>
                      <span className={cn("text-xs font-medium", deliveryReview.behaviorHygiene ? "text-green-600" : "text-red-600")}>
                        {deliveryReview.behaviorHygiene ? "Good" : "Needs Improvement"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {kitchenReview?.comment && (
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Kitchen Comment</p>
              <p className="text-xs italic">&ldquo;{kitchenReview.comment}&rdquo;</p>
            </div>
          )}

          {deliveryReview?.comment && (
            <div className="rounded-lg bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground mb-1">Delivery Comment</p>
              <p className="text-xs italic">&ldquo;{deliveryReview.comment}&rdquo;</p>
            </div>
          )}

          {!kitchenReview && !deliveryReview && (
            <p className="text-center text-sm text-muted-foreground py-4">No ratings submitted yet</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
