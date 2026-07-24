"use client"

import { Spinner } from "@/components/ui/spinner"

interface CouponOffer {
  code: string
  description: string
  discountType: "PERCENTAGE" | "FIXED"
  discountValue: number
  minOrderValue: number | null
}

interface CouponOffersPanelProps {
  show: boolean
  loading: boolean
  offers: CouponOffer[]
  appliedCoupon: { code: string; discount: number; type: string } | null
  onToggle: () => void
  onApply: (code: string) => void
  onApplyCoupon: () => void
  onRemoveCoupon: () => void
  total: number
}

export function CouponOffersPanel({
  show,
  loading,
  offers,
  appliedCoupon,
  onApply,
  total,
}: CouponOffersPanelProps) {
  if (!show) return null

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner />
      </div>
    )
  }

  if (offers.length === 0) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        No coupon offers available right now
      </div>
    )
  }

  return (
    <div className="space-y-2 p-2">
      {offers.map((offer) => {
        const isApplied = appliedCoupon?.code === offer.code
        const meetsMinOrder = offer.minOrderValue == null || total >= offer.minOrderValue

        return (
          <button
            key={offer.code}
            disabled={isApplied || !meetsMinOrder}
            onClick={() => onApply(offer.code)}
            className="w-full rounded-lg border p-3 text-left transition-colors hover:bg-accent disabled:opacity-50"
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold">{offer.code}</span>
              <span className="text-sm text-primary">
                {offer.discountType === "PERCENTAGE"
                  ? `${offer.discountValue}% OFF`
                  : `\u20B9${offer.discountValue} OFF`}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{offer.description}</p>
            {offer.minOrderValue != null && (
              <p className="mt-1 text-xs text-muted-foreground">
                Min \u20B9{offer.minOrderValue}
              </p>
            )}
          </button>
        )
      })}
    </div>
  )
}
