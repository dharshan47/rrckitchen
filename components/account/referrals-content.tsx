"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, Copy, Gift, Share2, ShoppingBag, ChevronRight, Star } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  useUserReferralCodeQuery,
  useUserReferralStatsQuery,
  useUserReferralCode,
  useUserReferralStats,
} from "@/stores/userProfileStore"

function ReferralsSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto pb-12 animate-pulse">
      <div className="h-[180px] md:h-[220px] rounded-[24px] bg-[#F3F4F6]" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="h-[120px] rounded-[20px] bg-[#F3F4F6]" />
        <div className="h-[120px] rounded-[20px] bg-[#F3F4F6]" />
        <div className="h-[120px] rounded-[20px] bg-[#F3F4F6]" />
      </div>
      <div className="h-[200px] rounded-[20px] bg-[#F3F4F6] mt-6" />
    </div>
  )
}

export function ReferralsContent() {
  const router = useRouter()
  const { data: session, isPending } = useSession()
  const isLoggedIn = !!session?.user

  const { isLoading: codeLoading } = useUserReferralCodeQuery(isLoggedIn)
  const { isLoading: statsLoading } = useUserReferralStatsQuery(isLoggedIn)
  const referralStats = useUserReferralStats()
  const code = useUserReferralCode()

  if (isPending || codeLoading || statsLoading) {
    return <ReferralsSkeleton />
  }

  if (!session?.user) {
    router.replace("/login")
    return null
  }

  const referralLink = code ? `https://rrckitchen.com/signup?ref=${code}` : ""

  const copyLink = () => {
    if (!referralLink) return
    navigator.clipboard.writeText(referralLink)
    toast.success("Referral link copied!")
  }

  const copyCode = () => {
    if (!code) return
    navigator.clipboard.writeText(code)
    toast.success("Referral code copied!")
  }

  const recentReferrals = referralStats?.referrals ?? []

  const share = async () => {
    if (!referralLink) return
    if (navigator.share) {
      try {
        await navigator.share({
          title: "RRC Kitchen - Refer & Earn",
          text: "Order homemade food on RRC Kitchen and earn rewards! Use my referral code.",
          url: referralLink,
        })
        return
      } catch {
        // user dismissed share sheet - fall back to copy
      }
    }
    copyLink()
  }

  return (
    <div className="w-full flex flex-col gap-6 md:gap-8 max-w-6xl mx-auto pb-12">

      {/* BANNER */}
      <div className="relative w-full h-[180px] md:h-[220px] rounded-[24px] overflow-hidden bg-gradient-to-r from-[#FFF4E5] to-[#FFEDD5] flex items-center px-6 md:px-12 border border-[#FEE2E2]">
        <div className="relative z-10 max-w-[60%]">
          <h1 className="text-[28px] md:text-[36px] font-extrabold text-gray-900 leading-tight mb-2 md:mb-3">
            Refer &amp; Earn
          </h1>
          <p className="text-[14px] md:text-[16px] font-medium text-gray-700">
            Share your code with friends. Earn 100 points when they join and 50 more on their first order!
          </p>
        </div>
        <div className="absolute right-[-20px] md:right-8 top-1/2 -translate-y-1/2 w-[200px] h-[200px] md:w-[280px] md:h-[280px] opacity-90">
          <div className="w-full h-full bg-[#FFE8D6] rounded-full flex items-center justify-center border-4 border-white shadow-lg">
            <Gift className="w-16 h-16 md:w-20 md:h-20 text-[#F97316]" />
          </div>
        </div>
      </div>

      {/* REFERRAL CODE + SHARE */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-full border border-[#15803D] flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-[#15803D]" />
          </div>
          <h2 className="text-[16px] font-bold text-gray-900">Your Referral Code</h2>
        </div>
        <p className="text-[13px] text-gray-600 font-medium mb-6 leading-relaxed">
          Share this code or link with friends. They get rewarded, and so do you!
        </p>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 flex items-center bg-white border border-[#DCFCE7] rounded-xl p-1.5">
            <input
              type="text"
              value={code ?? "Loading referral code..."}
              readOnly
              className="flex-1 bg-transparent text-[14px] font-extrabold tracking-widest text-gray-700 px-3 outline-none truncate"
            />
            <button
              onClick={copyCode}
              disabled={!code}
              className="h-10 px-4 bg-[#F0FDF4] rounded-lg border border-[#15803D] flex items-center gap-1.5 hover:bg-[#DCFCE7] transition-colors shrink-0 text-[12px] font-bold text-[#15803D] disabled:opacity-50"
            >
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>
          <button
            onClick={share}
            disabled={!referralLink}
            className="h-[52px] px-6 bg-[#15803D] text-white rounded-xl font-bold text-[13px] flex items-center justify-center gap-2 hover:bg-[#166534] transition-colors disabled:opacity-50"
          >
            <Share2 className="w-4 h-4" /> Share Link
          </button>
        </div>
      </div>

      {/* STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#15803D]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[28px] font-extrabold text-gray-900 leading-none mb-1">
              {(referralStats?.totalReferrals ?? 0).toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] font-medium text-gray-500">Total Referrals</span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FFF7ED] flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 fill-[#F97316] text-[#F97316]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[28px] font-extrabold text-gray-900 leading-none mb-1">
              {(referralStats?.totalPointsEarned ?? 0).toLocaleString("en-IN")}
            </span>
            <span className="text-[11px] font-medium text-gray-500">Points Earned</span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FEF3E2] flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 text-[#F97316]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[28px] font-extrabold text-gray-900 leading-none mb-1">100</span>
            <span className="text-[11px] font-medium text-gray-500">Points per Referral</span>
          </div>
        </div>
      </div>

      {/* RECENT REFERRALS */}
      <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-6 h-6 rounded-full border border-[#15803D] flex items-center justify-center">
            <Users className="w-3.5 h-3.5 text-[#15803D]" />
          </div>
          <h2 className="text-[16px] font-bold text-gray-900">Recent Referrals</h2>
        </div>

        {recentReferrals.length === 0 ? (
          <p className="text-[13px] text-gray-500 text-center py-10 border border-dashed border-[#E5E7EB] rounded-xl">
            No referrals yet. Share your code and start earning points!
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-extrabold text-[11px] text-gray-900">Friend</TableHead>
                <TableHead className="font-extrabold text-[11px] text-gray-900">Joined On</TableHead>
                <TableHead className="font-extrabold text-[11px] text-gray-900">Status</TableHead>
                <TableHead className="font-extrabold text-[11px] text-gray-900 text-right">Reward</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReferrals.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-semibold text-gray-800">
                    <span className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[10px] font-extrabold text-gray-500">
                        {(row.name ?? "N").slice(0, 1).toUpperCase()}
                      </span>
                      {row.name}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-gray-500">
                    {format(new Date(row.createdAt), "d MMM yyyy")}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold ${
                      row.status === "COMPLETED" ? "bg-[#F0FDF4] text-[#15803D]" : "bg-[#FEF3C7] text-[#B45309]"
                    }`}>
                      {row.status === "COMPLETED" ? "Joined" : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-extrabold text-[#15803D]">
                    +{row.rewardAmount.toLocaleString("en-IN")} pts
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* HOW IT WORKS */}
      <div className="bg-white rounded-[20px] p-6 md:p-8 border border-[#E5E7EB] shadow-sm">
        <h2 className="text-[16px] font-bold text-gray-900 mb-6">How it works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Share2, title: "1. Share your code", desc: "Share your referral link with friends on WhatsApp, Instagram or any chat." },
            { icon: Users, title: "2. They sign up", desc: "Your friend signs up on RRC Kitchen using your code and gets rewarded too." },
            { icon: ShoppingBag, title: "3. Earn points", desc: "You earn 100 points when they join and 50 more when they place their first order." },
          ].map((step) => (
            <div key={step.title} className="flex flex-col items-center text-center gap-3 p-4 rounded-[16px] bg-[#FAFAFA] border border-[#F0F0F0]">
              <div className="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                <step.icon className="w-5 h-5 text-[#15803D]" />
              </div>
              <h3 className="text-[14px] font-bold text-gray-900">{step.title}</h3>
              <p className="text-[12px] text-gray-500 font-medium leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <Link href="/account/loyalty" className="text-[13px] font-bold text-[#F97316] hover:underline inline-flex items-center gap-1 w-fit">
        View your loyalty points <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  )
}
