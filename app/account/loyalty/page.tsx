"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import {
  ArrowLeft, Award, CheckCircle, Clock, Copy, History, Loader2, Share2,
  ShoppingBag, Star, Ticket, TrendingUp, Zap,
} from "lucide-react"
import { Button, Card } from "@/components/ui"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { purchaseCouponWithPoints } from "@/actions/loyalty/loyalty-coupons"

export default function LoyaltyPage() {
  const { data: session, isPending } = useSession()
  const queryClient = useQueryClient()

  const { data: loyaltyPoints } = useQuery({
    queryKey: ["loyalty-points"],
    queryFn: async () => {
      const res = await fetch("/api/loyalty/points")
      if (!res.ok) return null
      return res.json() as Promise<{ points: number; lifetimePoints: number; tier: string }>
    },
    enabled: !!session?.user,
  })

  const { data: history = [] } = useQuery({
    queryKey: ["loyalty-history"],
    queryFn: async () => {
      const res = await fetch("/api/loyalty/history")
      if (!res.ok) return []
      return res.json() as Promise<Array<{ id: string; points: number; type: string; description: string | null; createdAt: string }>>
    },
    enabled: !!session?.user,
  })

  const { data: availableCoupons = [] } = useQuery({
    queryKey: ["loyalty-coupons"],
    queryFn: async () => {
      const res = await fetch("/api/loyalty/coupons")
      if (!res.ok) return []
      return res.json() as Promise<Array<{ id: string; name: string; description: string | null; discountType: string; discountValue: number; maxDiscount: number | null; minOrderValue: number | null; pointsCost: number }>>
    },
    enabled: !!session?.user,
  })

  const { data: purchasedCoupons = [] } = useQuery({
    queryKey: ["purchased-coupons"],
    queryFn: async () => {
      const res = await fetch("/api/loyalty/purchased-coupons")
      if (!res.ok) return []
      return res.json() as Promise<Array<{ id: string; couponCode: string; discountType: string; discountValue: number; used: boolean; expiresAt: string; loyaltyCoupon: { name: string } }>>
    },
    enabled: !!session?.user,
  })

  const { data: referralCode } = useQuery({
    queryKey: ["referral-code"],
    queryFn: async () => {
      const res = await fetch("/api/referral/code")
      if (!res.ok) return null
      return res.json() as Promise<string>
    },
    enabled: !!session?.user,
  })

  const { data: referralStats } = useQuery({
    queryKey: ["referral-stats"],
    queryFn: async () => {
      const res = await fetch("/api/referral/stats")
      if (!res.ok) return null
      return res.json() as Promise<{ totalReferrals: number; totalPointsEarned: number }>
    },
    enabled: !!session?.user,
  })

  const purchaseMutation = useMutation({
    mutationFn: purchaseCouponWithPoints,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-points"] })
      queryClient.invalidateQueries({ queryKey: ["loyalty-history"] })
      queryClient.invalidateQueries({ queryKey: ["purchased-coupons"] })
      toast.success(`Coupon purchased! Code: ${data.couponCode}`)
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to purchase coupon")
    },
  })

  const copyReferral = () => {
    if (referralCode) {
      navigator.clipboard.writeText(`https://rrckitchen.com/signup?ref=${referralCode}`)
      toast.success("Referral link copied!")
    }
  }

  const tierColors: Record<string, string> = {
    BRONZE: "text-amber-700 bg-amber-100",
    SILVER: "text-gray-600 bg-gray-100",
    GOLD: "text-yellow-700 bg-yellow-100",
  }

  const tierIcons: Record<string, typeof Award> = {
    BRONZE: Award,
    SILVER: Award,
    GOLD: Star,
  }

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const TierIcon = loyaltyPoints ? tierIcons[loyaltyPoints.tier] || Award : Award

  return (
    <main className="min-h-screen bg-background">
      <div className="md:hidden sticky top-0 z-10 bg-background border-b border-border px-4 h-12 flex items-center">
        <Link href="/account/profile">
          <Button variant="ghost" size="icon-sm" aria-label="Go back">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Loyalty & Rewards</h1>
          <p className="text-sm text-muted-foreground mt-1">Earn points, unlock rewards, and refer friends</p>
        </div>

        {/* Points Card */}
        <Card className="p-6 bg-linear-to-br from-primary/5 via-background to-primary/5 border-primary/10">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <TierIcon className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Your Points</h2>
                {loyaltyPoints && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase ${tierColors[loyaltyPoints.tier] || "text-primary bg-primary/10"}`}>
                    {loyaltyPoints.tier}
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold mt-1">{loyaltyPoints?.points ?? 0} pts</p>
              <p className="text-sm text-muted-foreground mt-0.5">{loyaltyPoints?.lifetimePoints ?? 0} lifetime points earned</p>
            </div>
          </div>
        </Card>

        {/* How to Earn */}
        <Card className="p-6">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            How to Earn Points
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <ShoppingBag className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Every Order</p>
                <p className="text-xs text-muted-foreground">1 point per rupee spent</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Zap className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Orders above ₹500</p>
                <p className="text-xs text-muted-foreground">+50 bonus points</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Zap className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Orders above ₹1,500</p>
                <p className="text-xs text-muted-foreground">+150 bonus points</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <ShoppingBag className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">3+ items in an order</p>
                <p className="text-xs text-muted-foreground">+30 bonus points</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Available Coupons */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            Redeem Points for Coupons
          </h2>
          {availableCoupons.length === 0 ? (
            <p className="text-sm text-muted-foreground">No coupons available right now.</p>
          ) : (
            <div className="grid gap-3">
              {availableCoupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary/30 transition-colors">
                  <div className="space-y-1">
                    <p className="font-medium text-sm">{coupon.name}</p>
                    {coupon.description && (
                      <p className="text-xs text-muted-foreground">{coupon.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {coupon.discountType === "FLAT" ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`} off
                      {coupon.minOrderValue ? ` · Min. ₹${coupon.minOrderValue}` : ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-primary">{coupon.pointsCost} pts</p>
                    <Button
                      size="sm"
                      className="mt-1 w-full"
                      disabled={purchaseMutation.isPending || (loyaltyPoints?.points ?? 0) < coupon.pointsCost}
                      onClick={() => purchaseMutation.mutate(coupon.id)}
                    >
                      {purchaseMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : "Buy"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Purchased Coupons */}
        {purchasedCoupons.length > 0 && (
          <Card className="p-6">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Your Coupons
            </h2>
            <div className="space-y-2">
              {purchasedCoupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div>
                    <p className="text-sm font-medium">{coupon.loyaltyCoupon.name}</p>
                    <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{coupon.couponCode}</code>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {coupon.used ? "Used" : `Expires ${new Date(coupon.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  {coupon.used ? (
                    <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  ) : (
                    <Clock className="h-5 w-5 text-amber-500 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Referral Section */}
        <Card className="p-6 bg-linear-to-br from-primary/5 to-transparent border-primary/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Share2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-sm">Refer & Earn</h2>
              <p className="text-xs text-muted-foreground">Share your referral link with friends</p>
            </div>
          </div>
          {referralCode && (
            <>
              <div className="flex items-center gap-2 mb-3">
                <code className="flex-1 rounded-lg bg-muted px-3 py-2 text-xs font-mono truncate">
                  {`https://rrckitchen.com/signup?ref=${referralCode}`}
                </code>
                <Button size="sm" variant="outline" onClick={copyReferral} className="shrink-0">
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {referralStats && (
                <div className="flex gap-4 text-sm">
                  <div>
                    <span className="font-bold">{referralStats.totalReferrals}</span>
                    <span className="text-muted-foreground ml-1">referrals</span>
                  </div>
                  <div>
                    <span className="font-bold">{referralStats.totalPointsEarned}</span>
                    <span className="text-muted-foreground ml-1">pts earned</span>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Points History */}
        <Card className="p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-primary" />
            Points History
          </h2>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No points activity yet. Start ordering to earn points!</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{entry.description ?? "Points transaction"}</p>
                    <p className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ml-3 ${entry.points > 0 ? "text-green-600" : "text-destructive"}`}>
                    {entry.points > 0 ? "+" : ""}{entry.points}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}