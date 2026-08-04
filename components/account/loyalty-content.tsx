"use client"

import Image from "next/image"
import { useRef } from "react"
import { useSession } from "@/lib/auth-client"
import { format } from "date-fns"
import {
  ChevronRight,
  ShoppingBag,
  Zap,
  ShoppingCart,
  Copy,
  Users,
  Star,
  Clock,
  Tag,
  ChevronLeft,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import {
  useLoyaltySummaryQuery,
  useLoyaltyHistoryQuery,
  useLoyaltyAvailableCouponsQuery,
  useLoyaltyMyCouponsQuery,
  useLoyaltyReferralStatsQuery,
  useLoyaltyReferralCodeQuery,
  useRedeemCouponMutation,
  useLoyaltySummary,
  useLoyaltyHistory,
  useLoyaltyAvailableCoupons,
  useLoyaltyMyCoupons,
  useLoyaltyReferralStats,
  useLoyaltyReferralCode,
} from "@/stores/loyaltyStore"

const TIER_THRESHOLDS: Record<string, number> = {
  BRONZE: 0,
  SILVER: 2000,
  GOLD: 5000,
  PLATINUM: 10000,
}
const TIER_ORDER = ["BRONZE", "SILVER", "GOLD", "PLATINUM"]
const BADGE_IMAGES: Record<string, string> = {
  BRONZE: "/loyalty/bronze-badge.webp",
  SILVER: "/loyalty/silver-badge.webp",
  GOLD: "/loyalty/gold-badge.webp",
  PLATINUM: "/loyalty/gold-badge.webp",
}

/* ───────────── Skeleton components (exact shape) ───────────── */

function BannerSkeleton() {
  return <Skeleton className="w-full h-[180px] md:h-[220px] rounded-[24px]" />
}

function PointsCardSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-[24px] p-6 lg:p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">
      <div className="flex items-center gap-6 md:w-1/3 w-full justify-center md:justify-start">
        <Skeleton className="w-[100px] h-[100px] rounded-full shrink-0" />
        <div className="space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 flex gap-8 justify-between">
        <div className="space-y-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-24" />
        </div>
        <div className="flex-1 flex flex-col justify-center px-4 max-w-[200px] space-y-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-1.5 w-full rounded-full" />
          <Skeleton className="h-3 w-16 self-end" />
        </div>
        <div className="space-y-3">
          <Skeleton className="h-10 w-10 rounded-full opacity-50" />
        </div>
      </div>
      <div className="md:w-[220px] w-full border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
        <div className="flex items-start gap-4">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      </div>
    </div>
  )
}

function EarnGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white rounded-[16px] p-5 border border-gray-100 flex items-start gap-4">
          <Skeleton className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>
  )
}

function CouponsRowSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="min-w-[280px] w-[280px] bg-white border border-gray-100 rounded-[16px] p-5 shadow-sm flex flex-col gap-4"
        >
          <div className="flex gap-4">
            <Skeleton className="w-[60px] h-[60px] rounded-[12px] shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-9 w-full rounded-[8px]" />
        </div>
      ))}
    </div>
  )
}

function MyCouponsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-[12px] p-4 flex items-center gap-4 shadow-sm">
          <Skeleton className="h-7 w-16 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
          <div className="space-y-2 text-right">
            <Skeleton className="h-3 w-12 ml-auto" />
            <Skeleton className="h-3 w-16 ml-auto" />
            <Skeleton className="h-4 w-12 ml-auto rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

function ReferCardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-3 w-52" />
      </div>
      <Skeleton className="h-12 w-full rounded-[12px]" />
      <div className="grid grid-cols-2 gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-[12px] p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>
      <Skeleton className="h-12 w-full rounded-[12px]" />
    </div>
  )
}

function HistoryTableSkeleton() {
  return (
    <div className="bg-white border border-gray-100 rounded-[16px] shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-center">Type</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell><Skeleton className="h-3 w-28" /></TableCell>
              <TableCell><Skeleton className="h-3 w-44" /></TableCell>
              <TableCell><Skeleton className="h-5 w-16 mx-auto rounded" /></TableCell>
              <TableCell><Skeleton className="h-3 w-10 ml-auto" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

/* ───────────── Main content ───────────── */

export function LoyaltyContent() {
  const { data: session, isPending: sessionLoading } = useSession()
  const carouselRef = useRef<HTMLDivElement>(null)

  const { isLoading: summaryLoading } = useLoyaltySummaryQuery(!!session?.user)
  const { isLoading: historyLoading } = useLoyaltyHistoryQuery(!!session?.user)
  const { isLoading: couponsLoading } = useLoyaltyAvailableCouponsQuery(!!session?.user)
  const { isLoading: myCouponsLoading, dataUpdatedAt } = useLoyaltyMyCouponsQuery(!!session?.user)
  const { isLoading: refLoading } = useLoyaltyReferralStatsQuery(!!session?.user)
  const { isLoading: refCodeLoading } = useLoyaltyReferralCodeQuery(!!session?.user)

  const redeemMutation = useRedeemCouponMutation()

  const summary = useLoyaltySummary()
  const history = useLoyaltyHistory()
  const availableCoupons = useLoyaltyAvailableCoupons()
  const myCoupons = useLoyaltyMyCoupons()
  const refStats = useLoyaltyReferralStats()
  const refCode = useLoyaltyReferralCode()

  const points = Number(summary?.points) || 0
  const lifetime = Number(summary?.lifetimePoints) || 0
  const tierRaw = (summary?.tier?.toUpperCase() || "BRONZE") as string
  const tier = TIER_ORDER.includes(tierRaw) ? tierRaw : "BRONZE"
  const tierIdx = TIER_ORDER.indexOf(tier)
  const nextTier = tierIdx < TIER_ORDER.length - 1 ? TIER_ORDER[tierIdx + 1] : null
  const threshold = TIER_THRESHOLDS[tier]
  const nextThreshold = nextTier ? TIER_THRESHOLDS[nextTier] : null
  const pointsToNext = nextThreshold != null ? Math.max(0, nextThreshold - lifetime) : 0
  const progressPercent =
    nextThreshold != null && nextThreshold > threshold
      ? Math.max(0, Math.min(100, ((lifetime - threshold) / (nextThreshold - threshold)) * 100))
      : 100
  const badgeImage = BADGE_IMAGES[tier]

  const couponColors = [
    { bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-100", btn: "text-orange-500 border-orange-200 hover:bg-orange-50" },
    { bg: "bg-green-50", text: "text-green-500", border: "border-green-100", btn: "text-green-500 border-green-200 hover:bg-green-50" },
    { bg: "bg-blue-50", text: "text-blue-500", border: "border-blue-100", btn: "text-blue-500 border-blue-200 hover:bg-blue-50" },
    { bg: "bg-pink-50", text: "text-pink-500", border: "border-pink-100", btn: "text-pink-500 border-pink-200 hover:bg-pink-50" },
  ]

  const referralLink = refCode ? `https://rrckitchen.vercel.app/signup?ref=${refCode}` : ""

  const copyReferralLink = () => {
    if (!referralLink) return
    navigator.clipboard
      .writeText(referralLink)
      .then(() => toast.success("Referral link copied!"))
      .catch(() => toast.error("Failed to copy link"))
  }

  const shareAndEarn = async () => {
    if (!referralLink) return
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "RRC Kitchen", text: "Order homemade food with RRC Kitchen", url: referralLink })
        return
      } catch {
        copyReferralLink()
        return
      }
    }
    copyReferralLink()
  }

  const scrollCarousel = (dir: 1 | -1) => {
    carouselRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" })
  }

  if (sessionLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-[1200px] w-full pb-10">
        <BannerSkeleton />
        <PointsCardSkeleton />
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-40" />
          </div>
          <EarnGridSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1200px] w-full animate-in fade-in duration-500 pb-10">

      {/* ─── Top Banner ─── */}
      <div className="relative w-full h-[180px] md:h-[220px] rounded-[24px] overflow-hidden bg-gradient-to-r from-[#FFF4EB] to-[#FFE4CE] p-8 md:p-10 flex items-center shadow-sm">
        <div className="z-10 max-w-[60%]">
          <h1 className="text-[28px] md:text-[36px] font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
            Loyalty & Rewards
          </h1>
          <p className="text-[14px] md:text-[16px] text-gray-700 font-medium leading-relaxed">
            Earn points with every order and unlock exciting rewards!
          </p>
        </div>
        <div className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[280px] md:w-[380px] h-[280px] md:h-[380px]">
          <Image
            src="/loyalty/giftbox-stars.webp"
            alt="Loyalty Rewards"
            fill
            className="object-contain drop-shadow-xl"
            priority
          />
        </div>
      </div>

      {/* ─── Points Overview Card ─── */}
      {summaryLoading ? (
        <PointsCardSkeleton />
      ) : (
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 lg:p-8 flex flex-col md:flex-row items-center gap-8 shadow-sm">

          {/* Left: Badge & Points */}
          <div className="flex items-center gap-6 md:w-1/3">
            <div className="w-[100px] h-[100px] relative shrink-0 drop-shadow-md">
              <Image src={badgeImage} alt={`${tier} Badge`} fill className="object-contain" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-gray-500 uppercase tracking-wider mb-1">Your Points</p>
              <p className="text-[38px] font-extrabold text-[#EE7005] leading-none mb-2">{points.toLocaleString()}</p>
              <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-600">
                <Star className="h-3.5 w-3.5 text-[#F59E0B] fill-[#F59E0B]" /> Lifetime Points <span className="text-gray-900">{lifetime.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Middle: Tiers */}
          <div className="flex-1 w-full border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8 flex gap-8 justify-between">
            <div>
              <div className="w-10 h-10 relative mb-3 drop-shadow-sm">
                <Image src={badgeImage} alt={tier} fill className="object-contain" />
              </div>
              <p className="text-[12px] font-medium text-gray-400 mb-0.5">Your Tier</p>
              <p className="text-[16px] font-bold text-gray-900 capitalize">{tier.toLowerCase()}</p>
              <p className="text-[11px] font-medium text-gray-500 mt-2">Keep ordering<br />to stay {tier.toLowerCase()}</p>
            </div>

            <div className="flex-1 flex flex-col justify-center px-4 max-w-[200px]">
              <div className="flex justify-between items-end mb-2 text-[12px]">
                <span className="font-bold text-gray-400">Next Tier</span>
                <span className="font-bold text-gray-900">{nextTier ?? "Max Tier"}</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-[#EE7005] rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-[11px] font-semibold text-gray-500 text-right">
                <span className="text-gray-900">{pointsToNext.toLocaleString()}</span> pts to go
              </p>
            </div>

            <div>
              <div className="w-10 h-10 relative mb-3 drop-shadow-sm opacity-50 grayscale">
                <Image
                  src={nextTier ? BADGE_IMAGES[nextTier] : BADGE_IMAGES[tier]}
                  alt={nextTier ?? tier}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>

          {/* Right: Point Value */}
          <div className="md:w-[220px] w-full border-t md:border-t-0 md:border-l border-gray-100 pt-6 md:pt-0 md:pl-8">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#FFF4EB] flex items-center justify-center shrink-0">
                <span className="text-[#EE7005] font-bold text-[18px]">S</span>
              </div>
              <div>
                <p className="text-[12px] font-medium text-gray-400 mb-1">Points Value</p>
                <p className="text-[18px] font-extrabold text-gray-900 mb-2">1 pt = ₹1</p>
                <p className="text-[12px] font-medium text-gray-500 leading-relaxed">
                  Use points to get amazing discounts
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── How to Earn Points ─── */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#FFF4EB] flex items-center justify-center text-[#EE7005]">
              <Star className="h-4 w-4" />
            </div>
            How to Earn Points
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F6FBF7] rounded-[16px] p-5 border border-[#E8F5E9] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E8F5E9] flex items-center justify-center shrink-0 text-[#10B981] shadow-sm">
              <ShoppingBag className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900 mb-1">Every Order</p>
              <p className="text-[12px] font-medium text-gray-600">Earn 1 point for every ₹1 spent</p>
            </div>
          </div>
          <div className="bg-[#F8F5FF] rounded-[16px] p-5 border border-[#F3E8FF] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white border border-[#F3E8FF] flex items-center justify-center shrink-0 text-[#8B5CF6] shadow-sm">
              <Zap className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900 mb-1">Orders above ₹500</p>
              <p className="text-[12px] font-medium text-gray-600">+50 bonus points</p>
            </div>
          </div>
          <div className="bg-[#FFF8F2] rounded-[16px] p-5 border border-[#FFE8D6] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white border border-[#FFE8D6] flex items-center justify-center shrink-0 text-[#EE7005] shadow-sm">
              <Zap className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900 mb-1">Orders above ₹1,500</p>
              <p className="text-[12px] font-medium text-gray-600">+150 bonus points</p>
            </div>
          </div>
          <div className="bg-[#F0F7FF] rounded-[16px] p-5 border border-[#E0F2FE] flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-white border border-[#E0F2FE] flex items-center justify-center shrink-0 text-[#3B82F6] shadow-sm">
              <ShoppingCart className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900 mb-1">3+ items in an order</p>
              <p className="text-[12px] font-medium text-gray-600">+30 bonus points</p>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Redeem Points for Coupons ─── */}
      <div className="mt-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-[#FFF4EB] flex items-center justify-center text-[#EE7005]">
              <Tag className="h-4 w-4" />
            </div>
            Redeem Points for Coupons
          </h2>
        </div>

        <div className="relative group">
          <div ref={carouselRef} className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
            {couponsLoading ? (
              <CouponsRowSkeleton />
            ) : availableCoupons.length > 0 ? (
              availableCoupons.map((coupon, i) => {
                const color = couponColors[i % couponColors.length];
                const insufficient = points < Number(coupon.pointsCost);
                const redeeming = redeemMutation.isPending && redeemMutation.variables === coupon.id;
                return (
                  <div key={coupon.id} className="min-w-[280px] w-[280px] bg-white border border-gray-100 rounded-[16px] p-5 shadow-sm shrink-0 snap-start flex flex-col relative overflow-hidden">
                    <div className="flex gap-4 mb-4">
                      <div className={`w-[60px] h-[60px] rounded-[12px] ${color.bg} flex items-center justify-center flex-col shrink-0 font-extrabold leading-tight text-center ${color.text}`}>
                        <span className="text-[18px]">{coupon.discountType === 'PERCENTAGE' ? `${Number(coupon.discountValue)}%` : `₹${Number(coupon.discountValue)}`}</span>
                        <span className="text-[11px] uppercase">OFF</span>
                      </div>
                      <div>
                        <p className="text-[14px] font-bold text-gray-900 leading-tight mb-1">{coupon.name}</p>
                        <p className="text-[11px] font-medium text-gray-500">On orders above ₹{Number(coupon.minOrderValue) || 0}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-gray-600">
                        Cost <Star className="h-3.5 w-3.5 text-[#F59E0B] fill-[#F59E0B]" /> <span className="text-gray-900">{Number(coupon.pointsCost).toLocaleString()} pts</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => redeemMutation.mutate(coupon.id)}
                      disabled={insufficient || redeeming}
                      className={`w-full mt-4 h-9 rounded-[8px] text-[13px] font-bold bg-white border transition-colors ${color.btn}`}
                    >
                      {redeeming ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : insufficient ? (
                        "Not enough points"
                      ) : (
                        "Redeem Now"
                      )}
                    </Button>

                    {/* Dashed edge detail */}
                    <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full bg-[#F8FAFC] border-r border-gray-100 shadow-inner -translate-y-1/2" />
                    <div className="absolute top-1/2 -right-2 w-4 h-4 rounded-full bg-[#F8FAFC] border-l border-gray-100 shadow-inner -translate-y-1/2" />
                  </div>
                )
              })
            ) : (
              <div className="w-full text-center py-8 text-gray-500 font-medium bg-white rounded-[16px] border border-gray-100">
                No coupons available at the moment.
              </div>
            )}
          </div>

          {!couponsLoading && availableCoupons.length > 0 && (
            <>
              <button
                onClick={() => scrollCarousel(-1)}
                className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50"
                aria-label="Scroll coupons left"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => scrollCarousel(1)}
                className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 bg-white shadow-md border border-gray-100 rounded-full flex items-center justify-center text-gray-700 hover:bg-gray-50"
                aria-label="Scroll coupons right"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* ─── Your Coupons ─── */}
        <div className="bg-[#F8FAFC] border border-gray-100 rounded-[24px] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#EE7005] shadow-sm">
                <Tag className="h-4 w-4" />
              </div>
              Your Coupons
            </h2>
          </div>

          <div className="space-y-4">
            {myCouponsLoading ? (
              <MyCouponsSkeleton />
            ) : myCoupons.length > 0 ? (
              myCoupons.slice(0, 3).map((purchase, i) => {
                const color = couponColors[i % couponColors.length];
                const expired = new Date(purchase.expiresAt).getTime() < dataUpdatedAt;
                return (
                  <div key={purchase.id} className="bg-white border border-gray-100 rounded-[12px] p-4 flex items-center gap-4 shadow-sm relative overflow-hidden">
                    <div className={`px-4 py-1.5 rounded-lg ${color.bg} ${color.text} font-bold text-[14px] border ${color.border}`}>
                      {purchase.couponCode.substring(0, 6)}...
                    </div>
                    <div className="flex-1">
                      <p className="text-[14px] font-bold text-gray-900">{purchase.loyaltyCoupon.name}</p>
                      <p className="text-[11px] font-medium text-gray-500">Min. order ₹{Number(purchase.minOrderValue) || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-semibold text-gray-400 mb-1">Valid till</p>
                      <p className="text-[11px] font-bold text-gray-700 mb-2">{format(new Date(purchase.expiresAt), "dd MMM yyyy")}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${expired ? "bg-gray-100 text-gray-500 border-gray-200" : "bg-[#ECFDF5] text-[#10B981] border-[#D1FAE5]"}`}>
                        {expired ? "Expired" : "Active"}
                      </span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-6 text-gray-500 font-medium text-[13px]">
                You haven&apos;t claimed any coupons yet.
              </div>
            )}
          </div>
        </div>

        {/* ─── Refer & Earn ─── */}
        <div className="bg-[#F8FAFC] border border-gray-100 rounded-[24px] p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-[#10B981] shadow-sm">
              <Users className="h-4 w-4" />
            </div>
            <h2 className="text-[18px] font-bold text-gray-900">Refer & Earn</h2>
          </div>

          {refLoading || refCodeLoading ? (
            <ReferCardSkeleton />
          ) : (
            <>
              <p className="text-[13px] text-gray-600 font-medium mb-5 max-w-[80%]">
                Share your referral link with friends and earn points when they order!
              </p>

              <div className="relative mb-6">
                <Input
                  type="text"
                  readOnly
                  value={referralLink}
                  className="w-full h-12 bg-white border border-gray-200 rounded-[12px] px-4 text-[13px] font-medium text-gray-700 outline-none pr-12"
                />
                <button
                  onClick={copyReferralLink}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-[8px] text-[#10B981] hover:bg-green-50 transition-colors shadow-sm"
                  title="Copy Link"
                  aria-label="Copy referral link"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 mt-auto">
                <div className="bg-white border border-gray-100 rounded-[12px] p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#10B981]">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[20px] font-extrabold text-gray-900 leading-tight">{refStats?.totalReferrals || 0}</p>
                    <p className="text-[11px] font-semibold text-gray-500">Total Referrals</p>
                  </div>
                </div>
                <div className="bg-white border border-gray-100 rounded-[12px] p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FFF4EB] flex items-center justify-center text-[#F59E0B]">
                    <Star className="h-5 w-5 fill-[#F59E0B]" />
                  </div>
                  <div>
                    <p className="text-[20px] font-extrabold text-gray-900 leading-tight">{(refStats?.totalPointsEarned || 0).toLocaleString()}</p>
                    <p className="text-[11px] font-semibold text-gray-500">Points Earned</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={shareAndEarn}
                className="w-full h-12 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-[12px] flex items-center justify-center gap-2 transition-colors"
              >
                <Users className="h-4 w-4" /> Share & Earn More
              </Button>
            </>
          )}
        </div>
      </div>

      {/* ─── Points History ─── */}
      <div className="mt-4 flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-bold text-gray-900 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-[#FFF4EB] flex items-center justify-center text-[#EE7005]">
                <Clock className="h-4 w-4" />
              </div>
              Points History
            </h2>
          </div>

          {historyLoading ? (
            <HistoryTableSkeleton />
          ) : (
            <div className="bg-white border border-gray-100 rounded-[16px] shadow-sm overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100">
                    <TableHead className="px-5 py-4 text-[12px] font-bold text-gray-900 uppercase">Date</TableHead>
                    <TableHead className="px-5 py-4 text-[12px] font-bold text-gray-900 uppercase">Description</TableHead>
                    <TableHead className="px-5 py-4 text-[12px] font-bold text-gray-900 uppercase text-center">Type</TableHead>
                    <TableHead className="px-5 py-4 text-[12px] font-bold text-gray-900 uppercase text-right">Points</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-gray-100">
                  {history.slice(0, 5).map((txn) => (
                    <TableRow key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <TableCell className="px-5 py-4 text-[13px] font-medium text-gray-600 whitespace-nowrap">
                        {format(new Date(txn.createdAt), "dd MMM yyyy, hh:mm a")}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-[13px] font-bold text-gray-900 max-w-[200px] md:max-w-none">
                        {txn.description}
                      </TableCell>
                      <TableCell className="px-5 py-4 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-md text-[10px] font-bold border ${
                          txn.type === "EARNED"
                            ? "bg-[#ECFDF5] text-[#10B981] border-[#D1FAE5]"
                            : txn.type === "REDEEMED"
                            ? "bg-red-50 text-red-500 border-red-100"
                            : "bg-orange-50 text-[#EE7005] border-orange-100"
                        }`}>
                          {txn.type === "EARNED" ? "Earned" : txn.type === "REDEEMED" ? "Redeemed" : "Bonus"}
                        </span>
                      </TableCell>
                      <TableCell className={`px-5 py-4 text-right text-[14px] font-extrabold ${txn.points > 0 ? "text-[#10B981]" : "text-red-500"}`}>
                        {txn.points > 0 ? `+${txn.points}` : txn.points}
                      </TableCell>
                    </TableRow>
                  ))}
                  {history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="px-5 py-8 text-center text-[13px] text-gray-500 font-medium">
                        No points history yet. Start ordering to earn points!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* ─── Promo Banner ─── */}
        <div className="w-full lg:w-[320px] shrink-0 bg-[#FFF4EB] rounded-[24px] p-6 flex flex-col justify-between relative overflow-hidden shadow-sm h-full min-h-[300px]">
          <div className="relative z-10">
            <h3 className="text-[22px] font-extrabold text-gray-900 leading-tight mb-2">More Orders,<br />More Rewards!</h3>
            <p className="text-[13px] font-medium text-gray-700">Keep ordering delicious homemade food and unlock bigger rewards.</p>
          </div>

          <div className="absolute -bottom-6 -right-6 w-[280px] h-[280px]">
            <Image
              src="/loyalty/giftbox.webp"
              alt="Rewards"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>

    </div>
  )
}
