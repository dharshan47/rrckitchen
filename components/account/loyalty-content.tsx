"use client";

import Image from "next/image";
import {
  ShoppingBag,
  Zap,
  ShoppingCart,
  Copy,
  Users,
  ChevronRight,
  ChevronLeft,
  Star,
  Clock,
  Loader2,
} from "lucide-react";
import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";
import {
  useUserLoyaltyPoints,
  useUserLoyaltyPointsQuery,
  useUserReferralCode,
  useUserReferralCodeQuery,
  useUserReferralStats,
  useUserReferralStatsQuery,
} from "@/stores/userProfileStore";
import { purchaseCouponWithPoints } from "@/actions/loyalty/loyalty-coupons";

// -----------------------------------------
// Types
// -----------------------------------------

interface LoyaltyCouponData {
  id: string;
  name: string;
  description: string | null;
  discountType: "FLAT" | "PERCENTAGE";
  discountValue: number | string;
  maxDiscount: number | string | null;
  minOrderValue: number | string | null;
  pointsCost: number;
  isActive: boolean;
}

interface PurchasedCoupon {
  id: string;
  couponCode: string;
  discountType: "FLAT" | "PERCENTAGE";
  discountValue: number | string;
  maxDiscount: number | string | null;
  minOrderValue: number | string | null;
  used: boolean;
  expiresAt: string;
  loyaltyCoupon: { name: string };
}

interface HistoryRow {
  id: string;
  points: number;
  type: string;
  reference: string | null;
  description: string | null;
  createdAt: string;
}

// -----------------------------------------
// Tier helpers (mirrors computeTier in actions/loyalty/loyalty.ts)
// -----------------------------------------

const TIER_CONFIG = [
  { key: "BRONZE", label: "Bronze", min: 0, image: "/loyalty/bronze-badge.webp" },
  { key: "SILVER", label: "Silver", min: 2000, image: "/loyalty/silver-badge.webp" },
  { key: "GOLD", label: "Gold", min: 5000, image: "/loyalty/gold-badge.webp" },
] as const;

const NEXT_TIER: Record<string, { label: string; min: number; image: string }> = {
  BRONZE: { label: "Silver", min: 2000, image: "/loyalty/silver-badge.webp" },
  SILVER: { label: "Gold", min: 5000, image: "/loyalty/gold-badge.webp" },
};

const COUPON_STYLES = [
  { border: "border-[#FED7AA]", circle: "bg-[#FFF7ED]", text: "text-[#EA580C]", btn: "border-[#F97316] text-[#F97316] hover:bg-[#FFF7ED]" },
  { border: "border-[#BBF7D0]", circle: "bg-[#F0FDF4]", text: "text-[#16A34A]", btn: "border-[#16A34A] text-[#16A34A] bg-[#F0FDF4] hover:bg-[#DCFCE7]" },
  { border: "border-[#BFDBFE]", circle: "bg-[#EFF6FF]", text: "text-[#2563EB]", btn: "border-[#2563EB] text-[#2563EB] bg-[#EFF6FF] hover:bg-[#DBEAFE]" },
  { border: "border-[#FECDD3]", circle: "bg-[#FFF1F2]", text: "text-[#E11D48]", btn: "border-[#E11D48] text-[#E11D48] bg-[#FFF1F2] hover:bg-[#FFE4E6]" },
];

function couponBadgeValue(c: { discountType: string; discountValue: number | string }) {
  const value = Number(c.discountValue);
  return c.discountType === "PERCENTAGE" ? `${value}%` : `₹${value.toLocaleString("en-IN")}`;
}

function couponLabel(c: { discountType: string; discountValue: number | string; maxDiscount?: number | string | null }) {
  const value = Number(c.discountValue);
  const max = c.maxDiscount != null && c.maxDiscount !== "" ? Number(c.maxDiscount) : null;
  if (c.discountType === "PERCENTAGE") {
    return max ? `${value}% Off up to ₹${max.toLocaleString("en-IN")}` : `${value}% Off`;
  }
  return `₹${value.toLocaleString("en-IN")} Off`;
}

function couponStatus(p: PurchasedCoupon): { label: string; cls: string } {
  if (p.used) return { label: "Used", cls: "bg-[#F3F4F6] text-[#6B7280]" };
  if (new Date(p.expiresAt).getTime() < Date.now()) return { label: "Expired", cls: "bg-[#FEE2E2] text-[#DC2626]" };
  return { label: "Active", cls: "bg-[#DCFCE7] text-[#15803D]" };
}

function HistoryRowBadge({ row }: { row: HistoryRow }) {
  const isRedeem = row.type === "REDEEMED";
  const isBonus = /bonus/i.test(row.description ?? "");
  const label = isRedeem ? "Redeemed" : isBonus ? "Bonus" : "Earned";
  return (
    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${isRedeem ? "bg-[#FEF2F2] text-[#DC2626]" : "bg-[#F0FDF4] text-[#15803D]"}`}>
      {label}
    </span>
  );
}

function SkeletonRow() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-[#F3F4F6] rounded w-1/3 mb-1.5"></div>
      <div className="h-4 bg-[#F3F4F6] rounded w-1/2 mb-1.5"></div>
      <div className="h-4 bg-[#F3F4F6] rounded w-1/4"></div>
    </div>
  );
}

function SkeletonCouponCard() {
  return (
    <div className="min-w-[260px] max-w-[260px] rounded-xl border border-[#E5E7EB] bg-white flex flex-col p-4 animate-pulse shrink-0">
      <div className="flex gap-4 items-center mb-5">
        <div className="w-16 h-16 rounded-full bg-[#F3F4F6]"></div>
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-3.5 bg-[#F3F4F6] rounded w-3/4"></div>
          <div className="h-3 bg-[#F3F4F6] rounded w-1/2"></div>
        </div>
      </div>
      <div className="h-3 bg-[#F3F4F6] rounded w-1/3 mb-4"></div>
      <div className="h-10 bg-[#F3F4F6] rounded-lg"></div>
    </div>
  );
}

// -----------------------------------------
// Component
// -----------------------------------------

export function LoyaltyContent() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  useUserLoyaltyPointsQuery(isLoggedIn);
  useUserReferralCodeQuery(isLoggedIn);
  useUserReferralStatsQuery(isLoggedIn);

  const points = useUserLoyaltyPoints();
  const referralCode = useUserReferralCode();
  const referralStats = useUserReferralStats();

  const { data: history = [], isPending: historyLoading } = useQuery({
    queryKey: ["loyalty-history"],
    queryFn: async () => {
      const res = await fetch("/api/loyalty/history");
      if (!res.ok) return [];
      return res.json() as Promise<HistoryRow[]>;
    },
    enabled: isLoggedIn,
  });

  const { data: coupons = [], isPending: couponsLoading } = useQuery({
    queryKey: ["loyalty-coupons"],
    queryFn: async () => {
      const res = await fetch("/api/loyalty/coupons");
      if (!res.ok) return [];
      return res.json() as Promise<LoyaltyCouponData[]>;
    },
    enabled: isLoggedIn,
  });

  const { data: purchased = [], isPending: purchasedLoading } = useQuery({
    queryKey: ["loyalty-purchased-coupons"],
    queryFn: async () => {
      const res = await fetch("/api/loyalty/purchased-coupons");
      if (!res.ok) return [];
      return res.json() as Promise<PurchasedCoupon[]>;
    },
    enabled: isLoggedIn,
  });

  const redeemMutation = useMutation({
    mutationFn: purchaseCouponWithPoints,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["loyalty-points"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-history"] });
      queryClient.invalidateQueries({ queryKey: ["loyalty-purchased-coupons"] });
      toast.success(`Coupon redeemed! Code: ${res.couponCode}`);
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to redeem coupon");
    },
  });

  const [showAllHistory, setShowAllHistory] = useState(false);
  const [showAllPurchased, setShowAllPurchased] = useState(false);
  const couponsRef = useRef<HTMLDivElement>(null);
  const scrollCoupons = (dir: number) => couponsRef.current?.scrollBy({ left: dir * 280, behavior: "smooth" });

  const pointsBalance = points?.points ?? 0;
  const lifetime = points?.lifetimePoints ?? 0;
  const currentTier = (points?.tier ?? "BRONZE").toUpperCase();
  const tierInfo = TIER_CONFIG.find((t) => t.key === currentTier) ?? TIER_CONFIG[0];
  const nextTier = NEXT_TIER[currentTier] ?? null;
  const progress = nextTier ? Math.min(100, Math.round((lifetime / nextTier.min) * 100)) : 100;
  const ptsToGo = nextTier ? Math.max(0, nextTier.min - lifetime) : 0;

  const referralLink = referralCode ? `https://rrckitchen.com/signup?ref=${referralCode}` : "";

  const copyReferral = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  };

  const redeemingId = redeemMutation.isPending ? redeemMutation.variables : null;
  const visibleHistory = showAllHistory ? history : history.slice(0, 6);
  const visiblePurchased = showAllPurchased ? purchased : purchased.slice(0, 3);

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto pb-12">

      {/* BANNER */}
      <div className="relative w-full h-[180px] md:h-[220px] rounded-[24px] overflow-hidden bg-gradient-to-r from-[#FFF4E5] to-[#FFEDD5] flex items-center px-6 md:px-12 border border-[#FEE2E2]">
        <div className="relative z-10 max-w-[60%]">
          <h1 className="text-[28px] md:text-[36px] font-extrabold text-gray-900 leading-tight mb-2 md:mb-3">
            Loyalty & Rewards
          </h1>
          <p className="text-[14px] md:text-[16px] font-medium text-gray-700">
            Earn points with every order and unlock exciting rewards!
          </p>
        </div>

        {/* Floating Images */}
        <div className="absolute right-[-20px] md:right-8 top-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[280px] md:h-[280px]">
          <Image
            src="/loyalty/giftbox-stars.webp"
            alt="Rewards"
            fill
            className="object-contain"
          />
        </div>
      </div>

      {/* STATS ROW */}
      <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-gray-200">

          {/* Your Points */}
          <div className="flex items-center gap-5 md:pr-6">
            <div className="relative w-[70px] h-[70px] shrink-0">
              <Image src="/loyalty/gold-badge.webp" alt="Gold Badge" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-gray-900 mb-1">Your Points</span>
              <span className="text-[32px] font-extrabold text-[#F97316] leading-none mb-2">{pointsBalance.toLocaleString("en-IN")}</span>
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-gray-500">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                Lifetime Points <span className="text-gray-900">{lifetime.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Your Tier */}
          <div className="flex items-center gap-4 md:px-6">
            <div className="w-12 h-12 bg-[#FFF7ED] rounded-full flex items-center justify-center shrink-0">
              <Image src={tierInfo.image} alt={tierInfo.label} width={28} height={28} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 font-medium">Your Tier</span>
              <span className="text-[16px] font-bold text-gray-900 mb-1">{tierInfo.label}</span>
              <span className="text-[11px] font-medium text-gray-500">
                {nextTier
                  ? <>Keep ordering<br />to stay {tierInfo.label}</>
                  : <>You&apos;ve reached<br />the highest tier!</>}
              </span>
            </div>
          </div>

          {/* Next Tier */}
          <div className="flex flex-col justify-center gap-2 md:px-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#EFF6FF] rounded-full flex items-center justify-center shrink-0">
                <Image src={nextTier?.image ?? tierInfo.image} alt={nextTier?.label ?? tierInfo.label} width={28} height={28} className="object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] text-gray-500 font-medium">Next Tier</span>
                <span className="text-[16px] font-bold text-gray-900">{nextTier?.label ?? tierInfo.label}</span>
              </div>
            </div>
            <div className="flex flex-col mt-1">
              <span className="text-[10px] font-bold text-gray-500 text-right mb-1.5">
                {nextTier ? `${ptsToGo.toLocaleString("en-IN")} pts to go` : "Top tier unlocked"}
              </span>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#F97316] rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          </div>

          {/* Points Value */}
          <div className="flex items-center gap-4 md:pl-6">
            <div className="w-12 h-12 bg-[#FFFBEB] rounded-full flex items-center justify-center shrink-0">
              <Image src="/loyalty/coin.webp" alt="Coin" width={24} height={24} className="object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-gray-500 font-medium">Points Value</span>
              <span className="text-[16px] font-bold text-gray-900 mb-1">1 pt = ₹1</span>
              <span className="text-[11px] font-medium text-gray-500">Use points to get<br />amazing discounts</span>
            </div>
          </div>

        </div>
      </div>

      {/* HOW TO EARN POINTS */}
      <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FFF7ED] flex items-center justify-center border border-[#F97316]">
              <Star className="w-3.5 h-3.5 text-[#F97316] fill-[#F97316]" />
            </div>
            <h2 className="text-[16px] font-bold text-gray-900">How to Earn Points</h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          <div className="bg-[#F8FAF9] rounded-xl p-4 flex items-center gap-4 border border-[#E8F5E9]">
            <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] flex items-center justify-center shrink-0">
              <ShoppingBag className="w-6 h-6 text-[#15803D]" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-900 mb-1">Every Order</span>
              <span className="text-[11px] font-medium text-gray-600 leading-tight">Earn 1 point for<br />every ₹1 spent</span>
            </div>
          </div>

          <div className="bg-[#FAF5FF] rounded-xl p-4 flex items-center gap-4 border border-[#F3E8FF]">
            <div className="w-12 h-12 rounded-xl bg-[#F3E8FF] flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-[#7C3AED]" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-900 mb-1">Orders above ₹500</span>
              <span className="text-[11px] font-medium text-gray-600 leading-tight">+50 bonus points</span>
            </div>
          </div>

          <div className="bg-[#FFFDF4] rounded-xl p-4 flex items-center gap-4 border border-[#FEF3C7]">
            <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-[#D97706]" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-900 mb-1">Orders above ₹1,500</span>
              <span className="text-[11px] font-medium text-gray-600 leading-tight">+150 bonus points</span>
            </div>
          </div>

          <div className="bg-[#F8FAFC] rounded-xl p-4 flex items-center gap-4 border border-[#E2E8F0]">
            <div className="w-12 h-12 rounded-xl bg-[#E0E7FF] flex items-center justify-center shrink-0">
              <ShoppingCart className="w-6 h-6 text-[#4F46E5]" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-gray-900 mb-1">3+ items in an order</span>
              <span className="text-[11px] font-medium text-gray-600 leading-tight">+30 bonus points</span>
            </div>
          </div>

        </div>
      </div>

      {/* REDEEM POINTS */}
      <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#FFF7ED] flex items-center justify-center border border-[#F97316]">
              <span className="text-[#F97316] text-[12px] font-bold">%</span>
            </div>
            <h2 className="text-[16px] font-bold text-gray-900">Redeem Points for Coupons</h2>
          </div>
        </div>

        {coupons.length > 0 ? (
          <div className="relative group">
            <button
              onClick={() => scrollCoupons(-1)}
              className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center z-10 hidden md:flex hover:bg-[#F9FAFB]"
              aria-label="Previous coupons"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={() => scrollCoupons(1)}
              className="absolute right-[-16px] top-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center z-10 hidden md:flex hover:bg-[#F9FAFB]"
              aria-label="Next coupons"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>

            <div ref={couponsRef} className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {couponsLoading ? (
                <>
                  <SkeletonCouponCard />
                  <SkeletonCouponCard />
                  <SkeletonCouponCard />
                </>
              ) : (
                coupons.map((coupon, index) => {
                  const style = COUPON_STYLES[index % COUPON_STYLES.length];
                  const canAfford = pointsBalance >= coupon.pointsCost;
                  const isRedeeming = redeemingId === coupon.id;
                  const minOrder = coupon.minOrderValue != null && coupon.minOrderValue !== "" ? Number(coupon.minOrderValue) : null;
                  return (
                    <div key={coupon.id} className={`min-w-[260px] max-w-[260px] rounded-xl border ${style.border} bg-white flex flex-col p-4 snap-start shrink-0 relative overflow-hidden`}>
                      <div className="flex gap-4 items-center mb-5">
                        <div className={`w-16 h-16 rounded-full ${style.circle} flex items-center justify-center flex-col shrink-0 relative`}>
                          <span className={`text-[18px] font-extrabold ${style.text} leading-none`}>{couponBadgeValue(coupon)}</span>
                          <span className={`text-[11px] font-bold ${style.text}`}>OFF</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-[13px] font-bold text-gray-900 mb-1 truncate">{coupon.name}</span>
                          <span className="text-[11px] text-gray-500 font-medium">{minOrder ? `On orders above ₹${minOrder.toLocaleString("en-IN")}` : (coupon.description ?? "")}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] font-bold text-gray-500 mb-4">
                        Cost <Star className="w-3.5 h-3.5 fill-[#F97316] text-[#F97316]" /> <span className="text-gray-900">{coupon.pointsCost.toLocaleString("en-IN")} pts</span>
                      </div>
                      <button
                        onClick={() => redeemMutation.mutate(coupon.id)}
                        disabled={!canAfford || redeemMutation.isPending}
                        className={`w-full py-2.5 rounded-lg border ${style.btn} text-[13px] font-bold transition-colors flex items-center justify-center gap-1.5 ${!canAfford ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        {isRedeeming ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                        {isRedeeming ? "Redeeming..." : canAfford ? "Redeem Now" : "Not enough points"}
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ) : (
          <p className="text-[13px] text-gray-500 text-center py-8 border border-dashed border-[#E5E7EB] rounded-xl">
            {couponsLoading ? "Loading coupons..." : "No coupons available right now. Check back soon!"}
          </p>
        )}
      </div>

      {/* BOTTOM ROW: Your Coupons & Refer */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">

        {/* Your Coupons */}
        <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-[#F97316] flex items-center justify-center">
                <span className="text-[14px] leading-none text-[#F97316] mt-[-2px] ml-[1px]">✂</span>
              </div>
              <h2 className="text-[16px] font-bold text-gray-900">Your Coupons</h2>
            </div>
            {purchased.length > 3 && (
              <button onClick={() => setShowAllPurchased((v) => !v)} className="text-[12px] font-bold text-[#F97316] hover:underline flex items-center gap-1">
                {showAllPurchased ? "Show Less" : "View All"} <ChevronRight className={`w-4 h-4 transition-transform ${showAllPurchased ? "rotate-90" : ""}`} />
              </button>
            )}
          </div>

          {purchasedLoading ? (
            <div className="space-y-3">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : visiblePurchased.length === 0 ? (
            <p className="text-[13px] text-gray-500 text-center py-10 border border-dashed border-[#E5E7EB] rounded-xl">
              No coupons yet. Redeem your points to get discounts!
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {visiblePurchased.map((coupon) => {
                const status = couponStatus(coupon);
                return (
                  <div key={coupon.id} className="flex items-center border border-gray-100 rounded-xl p-3 bg-[#FAFAFA]">
                    <div className="bg-[#F0FDF4] border border-[#DCFCE7] text-[#15803D] font-bold text-[14px] py-3 px-4 rounded-lg w-[110px] text-center shrink-0 shadow-sm relative overflow-hidden">
                      {coupon.couponCode}
                      <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                      <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div className="flex-1 px-4 flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-gray-900 mb-0.5">{couponLabel(coupon)}</span>
                      <span className="text-[10px] text-gray-500 font-medium truncate">
                        {coupon.minOrderValue != null && coupon.minOrderValue !== "" ? `Min. order ₹${Number(coupon.minOrderValue).toLocaleString("en-IN")}` : coupon.loyaltyCoupon.name}
                      </span>
                    </div>
                    <div className="flex flex-col border-l border-gray-200 pl-4 pr-2">
                      <span className="text-[9px] text-gray-400 font-medium mb-0.5">Valid till</span>
                      <span className="text-[11px] text-gray-700 font-bold mb-1.5">{format(new Date(coupon.expiresAt), "d MMM yyyy")}</span>
                      <span className={`${status.cls} text-[9px] font-extrabold px-2 py-0.5 rounded uppercase w-fit`}>{status.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Refer & Earn */}
        <div className="bg-[#F8FAF9] rounded-[20px] p-6 md:p-8 border border-[#E8F5E9] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full border border-[#15803D] flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-[#15803D]" />
              </div>
              <h2 className="text-[16px] font-bold text-gray-900">Refer & Earn</h2>
            </div>

            <p className="text-[13px] text-gray-600 font-medium mb-6 pr-8 leading-relaxed">
              Share your referral link with friends<br />and earn points when they order!
            </p>

            <div className="flex items-center bg-white border border-[#DCFCE7] rounded-xl p-1.5 mb-8">
              <input
                type="text"
                value={referralLink || "Loading referral code..."}
                readOnly
                className="flex-1 bg-transparent text-[12px] font-bold text-gray-700 px-3 outline-none truncate"
              />
              <button onClick={copyReferral} className="w-10 h-10 bg-[#F0FDF4] rounded-lg border border-[#15803D] flex items-center justify-center hover:bg-[#DCFCE7] transition-colors shrink-0" aria-label="Copy referral link">
                <Copy className="w-4 h-4 text-[#15803D]" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                <Users className="w-5 h-5 text-[#15803D]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[18px] font-extrabold text-gray-900 leading-none mb-1">{(referralStats?.totalReferrals ?? 0).toLocaleString("en-IN")}</span>
                <span className="text-[11px] font-medium text-gray-500 leading-none">Total Referrals</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF7ED] flex items-center justify-center">
                <Star className="w-5 h-5 fill-[#F97316] text-[#F97316]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[18px] font-extrabold text-gray-900 leading-none mb-1">{(referralStats?.totalPointsEarned ?? 0).toLocaleString("en-IN")}</span>
                <span className="text-[11px] font-medium text-gray-500 leading-none">Points Earned</span>
              </div>
            </div>
          </div>

          <a
            href={referralLink || undefined}
            onClick={(e) => { if (!referralLink) e.preventDefault(); }}
            className="w-full py-3.5 bg-[#15803D] text-white rounded-xl font-bold text-[14px] flex items-center justify-center gap-2 hover:bg-[#166534] transition-colors"
          >
            <Users className="w-4 h-4" /> Share & Earn More
          </a>
        </div>

      </div>

      {/* POINTS HISTORY */}
      <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex flex-col md:flex-row gap-6">

        {/* Left Table */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full border border-[#15803D] flex items-center justify-center">
                <Clock className="w-3.5 h-3.5 text-[#15803D]" />
              </div>
              <h2 className="text-[16px] font-bold text-gray-900">Points History</h2>
            </div>
            {history.length > 6 && (
              <button onClick={() => setShowAllHistory((v) => !v)} className="text-[12px] font-bold text-[#F97316] hover:underline flex items-center gap-1">
                {showAllHistory ? "Show Less" : "View All History"} <ChevronRight className={`w-4 h-4 transition-transform ${showAllHistory ? "rotate-90" : ""}`} />
              </button>
            )}
          </div>

          {historyLoading ? (
            <div className="space-y-4">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : visibleHistory.length === 0 ? (
            <p className="text-[13px] text-gray-500 text-center py-10 border border-dashed border-[#E5E7EB] rounded-xl">
              No points activity yet. Place your first order to start earning!
            </p>
          ) : (
            <div className="w-full overflow-x-auto pb-2">
              <table className="w-full text-left border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-bold text-gray-900">
                    <th className="pb-4 font-extrabold">Date</th>
                    <th className="pb-4 font-extrabold">Description</th>
                    <th className="pb-4 font-extrabold">Type</th>
                    <th className="pb-4 text-right font-extrabold">Points</th>
                  </tr>
                </thead>
                <tbody className="text-[12px] text-gray-700">
                  {visibleHistory.map((row, index) => {
                    const isRedeem = row.type === "REDEEMED";
                    return (
                      <tr key={row.id} className={index < visibleHistory.length - 1 ? "border-b border-gray-50" : ""}>
                        <td className="py-4 font-medium text-gray-500 whitespace-nowrap">{format(new Date(row.createdAt), "d MMM yyyy, h:mm a")}</td>
                        <td className="py-4 font-semibold text-gray-800">{row.description ?? "Loyalty points"}</td>
                        <td className="py-4"><HistoryRowBadge row={row} /></td>
                        <td className={`py-4 text-right font-extrabold ${isRedeem ? "text-[#DC2626]" : "text-[#15803D]"}`}>
                          {isRedeem ? "−" : "+"}{Math.abs(row.points).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Promo Box */}
        <div className="w-full md:w-[280px] bg-gradient-to-br from-[#FFF7ED] to-[#FFE8D6] rounded-[20px] p-6 border border-[#FFEDD5] relative overflow-hidden flex flex-col min-h-[220px]">
          <h3 className="text-[20px] font-extrabold text-[#9A3412] leading-tight mb-2 relative z-10">
            More Orders,<br />More Rewards!
          </h3>
          <p className="text-[12px] font-medium text-[#C2410C] relative z-10">
            Keep ordering delicious<br />homemade food and<br />unlock bigger rewards.
          </p>

          <div className="absolute right-[-20px] bottom-[-20px] w-[180px] h-[180px] z-0">
            <Image src="/loyalty/giftbox.webp" alt="Giftbox" fill className="object-contain" />
          </div>
        </div>

      </div>

    </div>
  );
}
