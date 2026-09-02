"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { Users, Copy, Gift, Share2, ChevronRight, Star, Ticket, BadgePercent, ArrowRight } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import { toast } from "sonner"
import { format } from "date-fns"
import {
  useUserReferralCodeQuery,
  useUserReferralStatsQuery,
  useUserReferralCode,
  useUserReferralStats,
} from "@/stores/userProfileStore"
import Image from "next/image"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

function ReferralsSkeleton() {
  return (
    <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto pb-12 px-4 xl:px-0 pt-6 md:pt-8">
      {/* Breadcrumb Skeleton */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><Skeleton className="h-4 w-12 rounded" /></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><Skeleton className="h-4 w-16 rounded" /></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><Skeleton className="h-4 w-16 rounded" /></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* BANNER */}
      <div className="relative w-full rounded-[24px] overflow-hidden border border-[#FDEAD7] flex flex-col md:flex-row items-center px-6 md:px-12 py-8 md:py-10 bg-white shadow-sm">
        <div className="relative z-10 flex flex-col gap-6 w-full md:w-[60%] shrink-0">
          <div>
            <Skeleton className="h-[40px] md:h-[48px] w-3/4 rounded-lg mb-2" />
            <Skeleton className="h-[20px] w-full max-w-lg rounded-md" />
            <Skeleton className="h-[20px] w-2/3 max-w-lg rounded-md mt-1" />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 flex-wrap mt-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <Skeleton className="h-[14px] w-24 rounded" />
                  <Skeleton className="h-[12px] w-20 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative w-full h-[180px] mt-8 md:mt-0 md:ml-auto md:w-[320px] md:h-[220px] shrink-0">
          <Skeleton className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] rounded-full mx-auto md:ml-auto md:mr-0" />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex gap-4">
            <Skeleton className="w-12 h-12 rounded-full shrink-0" />
            <div className="flex flex-col flex-1">
              <Skeleton className="h-[14px] w-24 rounded mb-2" />
              <Skeleton className="h-[28px] w-16 rounded mb-2" />
              <Skeleton className="h-[14px] w-32 rounded" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN */}
        <div className="flex-[2] flex flex-col gap-6">
          
          {/* YOUR REFERRAL CODE SECTION */}
          <div className="bg-[#F8FAFC] rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-hidden p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
              <div className="flex flex-col gap-1.5 pt-0.5">
                <Skeleton className="h-[20px] w-40 rounded" />
                <Skeleton className="h-[14px] w-48 rounded" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 mt-6">
              {/* CODE BOX */}
              <div className="flex-1 flex items-center justify-between w-full bg-[#F0FDF4] border-2 border-dashed border-[#86EFAC] rounded-[16px] p-2 pl-6 h-[56px]">
                <Skeleton className="h-[22px] w-24 rounded" />
                <Skeleton className="h-10 w-24 rounded-[10px]" />
              </div>

              <Skeleton className="w-8 h-8 rounded-full shrink-0" />

              {/* LINK BOX */}
              <div className="flex-1 flex items-center justify-between w-full bg-white border border-[#E5E7EB] rounded-[16px] p-2 pl-4 h-[56px]">
                <div className="flex items-center gap-2 w-full pr-4">
                  <Skeleton className="w-4 h-4 rounded-full shrink-0" />
                  <Skeleton className="h-[14px] w-full rounded" />
                </div>
                <Skeleton className="h-10 w-24 rounded-[10px] shrink-0 ml-2" />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8 flex-wrap">
              <Skeleton className="h-[20px] w-16 rounded" />
              <div className="flex items-center gap-3 flex-wrap">
                {[1, 2, 3, 4, 5].map(i => (
                  <Skeleton key={i} className="w-10 h-10 rounded-full" />
                ))}
                <div className="w-[1px] h-6 bg-[#E5E7EB] mx-1 hidden sm:block"></div>
                <Skeleton className="w-10 h-10 rounded-full" />
              </div>
            </div>
          </div>

          {/* EARN MORE SAVE MORE */}
          <div className="w-full rounded-[24px] overflow-hidden border border-[#DCFCE7] flex items-center px-6 md:px-8 py-6 md:py-8 bg-white shadow-sm">
            <Skeleton className="hidden sm:block w-[120px] h-[100px] rounded-[16px] shrink-0 mr-6" />
            <div className="flex-1 flex flex-col items-start gap-3">
              <Skeleton className="h-[20px] w-48 rounded" />
              <Skeleton className="h-[14px] w-full max-w-sm rounded" />
              <Skeleton className="h-[14px] w-4/5 max-w-sm rounded" />
            </div>
            <Skeleton className="hidden sm:block shrink-0 h-10 w-36 rounded-[10px] ml-4" />
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 flex flex-col gap-6 w-full lg:max-w-[400px]">
          
          {/* HOW IT WORKS */}
          <div className="bg-white rounded-[24px] p-6 md:p-8 border border-[#E5E7EB] shadow-sm">
            <Skeleton className="h-[20px] w-32 rounded mb-6" />
            <div className="flex flex-col gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                  <div className="flex flex-col gap-1.5 pt-1 w-full">
                    <Skeleton className="h-[16px] w-3/4 rounded" />
                    <Skeleton className="h-[14px] w-full rounded" />
                    <Skeleton className="h-[14px] w-2/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RECENT REFERRALS */}
          <div className="bg-white rounded-[24px] p-6 md:p-8 border border-[#E5E7EB] shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <Skeleton className="h-[20px] w-32 rounded" />
              <Skeleton className="h-[16px] w-16 rounded" />
            </div>

            <div className="flex flex-col gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0 pb-3 last:pb-0">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                    <div className="flex flex-col gap-1.5 pt-0.5">
                      <Skeleton className="h-[16px] w-24 rounded" />
                      <Skeleton className="h-[12px] w-32 rounded" />
                    </div>
                  </div>
                  <Skeleton className="h-[24px] w-16 rounded-[6px] shrink-0" />
                </div>
              ))}
            </div>

            <div className="w-full pt-4 mt-2 border-t border-[#E5E7EB] flex justify-center">
              <Skeleton className="h-[16px] w-32 rounded" />
            </div>
          </div>

        </div>
      </div>
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

  const share = async (platform?: string) => {
    if (!referralLink) return
    if (!platform && navigator.share) {
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
    // For specific platforms, you would open their share URLs
    // Example: whatsapp://send?text=...
    copyLink()
  }

  return (
    <div className="w-full flex flex-col gap-6 max-w-7xl mx-auto pb-12 px-4 xl:px-0 pt-6 md:pt-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-[#64748B] hover:text-[#0F172A] font-semibold text-[13px]">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/account/profile" className="text-[#64748B] hover:text-[#0F172A] font-semibold text-[13px]">Account</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[#15803D] font-bold text-[13px]">Referrals</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* BANNER */}
      <div className="relative w-full rounded-[24px] overflow-hidden border border-[#FDEAD7] flex flex-col md:flex-row items-center px-6 md:px-12 py-8 md:py-10"
           style={{ background: "linear-gradient(135deg, #FFF7ED 0%, #FFFBF5 55%, #FFF3E8 100%)" }}>
        
        <div className="relative z-10 flex flex-col gap-6 w-full md:w-[60%] shrink-0">
          <div>
            <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#0F172A] leading-tight mb-2">
              Refer Friends, <span className="text-[#F97316]">Earn Rewards</span>
            </h1>
            <p className="text-[14px] md:text-[15px] font-medium text-[#475569] max-w-lg">
              Share RRC Kitchen with your friends and get amazing rewards when they join and place their first order!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 text-[#15803D]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#0F172A]">They get 20% OFF</span>
                <span className="text-[11px] font-medium text-[#64748B]">on their first order</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFF7ED] border border-[#FDEAD7] flex items-center justify-center shrink-0">
                <Gift className="w-5 h-5 text-[#F97316]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#0F172A]">You get 100 points</span>
                <span className="text-[11px] font-medium text-[#64748B]">when they join</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-center shrink-0">
                <BadgePercent className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#0F172A]">You get 50 points</span>
                <span className="text-[11px] font-medium text-[#64748B]">on their first order</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full h-[180px] mt-8 md:mt-0 md:ml-auto md:w-[320px] md:h-[220px] shrink-0">
          <Image 
            src="/account/gift.webp" 
            alt="Refer and Earn Gift" 
            fill 
            className="object-contain md:object-right"
          />
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6 text-[#15803D]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-[#64748B]">Total Referrals</span>
            <span className="text-[28px] font-extrabold text-[#0F172A] leading-none my-1.5">
              {(referralStats?.totalReferrals ?? 0).toLocaleString("en-IN")}
            </span>
            <span className="text-[12px] font-bold text-[#15803D]">↑ 18.5% <span className="text-[#64748B] font-medium">this month</span></span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex gap-4">
          <div className="w-12 h-12 rounded-full bg-[#FFF7ED] border border-[#FDEAD7] flex items-center justify-center shrink-0">
            <Gift className="w-6 h-6 text-[#F97316]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-[#64748B]">Rewards Earned</span>
            <span className="text-[28px] font-extrabold text-[#0F172A] leading-none my-1.5">
              {(referralStats?.totalPointsEarned ?? 0).toLocaleString("en-IN")}
            </span>
            <span className="text-[12px] font-bold text-[#15803D]">↑ 24.7% <span className="text-[#64748B] font-medium">this month</span></span>
          </div>
        </div>

        <div className="bg-white rounded-[20px] p-6 border border-[#E5E7EB] shadow-sm flex gap-4">
          <div className="w-12 h-12 rounded-full bg-[#F5F3FF] border border-[#EDE9FE] flex items-center justify-center shrink-0">
            <Star className="w-6 h-6 text-[#7C3AED]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-[#64748B]">Pending Rewards</span>
            <span className="text-[28px] font-extrabold text-[#0F172A] leading-none my-1.5">
              1,250
            </span>
            <span className="text-[12px] font-medium text-[#64748B]">Valid until 30 Jun 2024</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN */}
        <div className="flex-[2] flex flex-col gap-6">
          
          {/* YOUR REFERRAL CODE SECTION */}
          <div className="bg-[#F8FAFC] rounded-[24px] border border-[#E5E7EB] shadow-sm overflow-hidden p-6 md:p-8 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] border border-[#DCFCE7] flex items-center justify-center shrink-0">
                <Ticket className="w-5 h-5 text-[#15803D]" />
              </div>
              <div className="flex flex-col">
                <h2 className="text-[18px] font-bold text-[#0F172A]">Your Referral Code</h2>
                <p className="text-[13px] text-[#64748B] font-medium mt-0.5">Share your code or link anywhere</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 mt-6">
              
              {/* CODE BOX */}
              <div className="flex-1 flex items-center justify-between w-full bg-[#F0FDF4] border-2 border-dashed border-[#86EFAC] rounded-[16px] p-2 pl-6">
                <span className="text-[22px] font-extrabold tracking-widest text-[#15803D] uppercase truncate">
                  {code ?? "LOADING..."}
                </span>
                <button
                  onClick={copyCode}
                  disabled={!code}
                  className="h-10 px-5 bg-white rounded-[10px] border border-[#E5E7EB] flex items-center gap-2 hover:bg-[#F8FAFC] transition-colors shrink-0 text-[13px] font-bold text-[#0F172A] shadow-sm disabled:opacity-50"
                >
                  <Copy className="w-4 h-4 text-[#64748B]" /> Copy
                </button>
              </div>

              <div className="w-8 h-8 rounded-full bg-white border border-[#E5E7EB] flex items-center justify-center shrink-0 text-[12px] font-bold text-[#64748B] relative z-10 md:-mx-2">
                or
              </div>

              {/* LINK BOX */}
              <div className="flex-1 flex items-center justify-between w-full bg-white border border-[#E5E7EB] rounded-[16px] p-2 pl-4">
                <div className="flex items-center gap-2 truncate overflow-hidden">
                  <Share2 className="w-4 h-4 text-[#64748B] shrink-0" />
                  <span className="text-[13px] font-semibold text-[#475569] truncate">
                    {referralLink || "Generating link..."}
                  </span>
                </div>
                <button
                  onClick={copyLink}
                  disabled={!referralLink}
                  className="h-10 px-5 bg-white rounded-[10px] border border-[#E5E7EB] flex items-center gap-2 hover:bg-[#F8FAFC] transition-colors shrink-0 text-[13px] font-bold text-[#0F172A] shadow-sm disabled:opacity-50 ml-2"
                >
                  <Copy className="w-4 h-4 text-[#64748B]" /> Copy
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 mt-8 flex-wrap">
              <span className="text-[14px] font-bold text-[#0F172A]">Share via</span>
              <div className="flex items-center gap-3 flex-wrap">
                <button onClick={() => share('whatsapp')} className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                </button>
                <button onClick={() => share('facebook')} className="w-10 h-10 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </button>
                <button onClick={() => share('instagram')} className="w-10 h-10 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity" style={{ background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)', color: 'white' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                </button>
                <button onClick={() => share('messenger')} className="w-10 h-10 rounded-full bg-[#00B2FF] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2C6.477 2 2 6.14 2 11.25c0 2.898 1.462 5.485 3.738 7.151v3.313c0 .385.421.62.756.425l3.411-1.988c1.65.46 3.428.715 5.295.715 5.523 0 10-4.14 10-9.25S17.523 2 12 2zm1.093 12.392l-2.617-2.776-5.074 2.776 5.586-5.918 2.673 2.776 5.016-2.776-5.584 5.918z"/></svg>
                </button>
                <button onClick={() => share('telegram')} className="w-10 h-10 rounded-full bg-[#24A1DE] text-white flex items-center justify-center hover:opacity-90 transition-opacity">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12.32 12.32 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.888-.662 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                </button>
                <div className="w-[1px] h-6 bg-[#E5E7EB] mx-1 hidden sm:block"></div>
                <button onClick={() => share()} className="w-10 h-10 rounded-full bg-white border border-[#E5E7EB] text-[#475569] flex items-center justify-center hover:bg-[#F8FAFC] transition-colors shadow-sm">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* EARN MORE SAVE MORE */}
          <div className="w-full rounded-[24px] overflow-hidden border border-[#DCFCE7] flex items-center px-6 md:px-8 py-6 md:py-8 bg-gradient-to-r from-[#F0FDF4] to-[#E8F5E9]">
            <div className="hidden sm:block relative w-[120px] h-[100px] shrink-0 mr-6">
              <Image 
                src="/account/wallet.webp" 
                alt="Wallet with points" 
                fill 
                className="object-contain"
              />
            </div>
            <div className="flex-1 flex flex-col items-start gap-3">
              <h3 className="text-[18px] font-bold text-[#0F172A]">Earn More, Save More!</h3>
              <p className="text-[13px] text-[#475569] font-medium leading-relaxed max-w-sm">
                The more friends you refer, the more rewards you earn. Collect points and enjoy exciting discounts on your orders.
              </p>
            </div>
            <Link href="/account/loyalty" className="hidden sm:flex shrink-0 h-10 px-5 bg-white border border-[#15803D] text-[#15803D] text-[13px] font-bold items-center justify-center rounded-[10px] gap-2 hover:bg-[#F0FDF4] transition-colors shadow-sm ml-4">
              View Rewards <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 flex flex-col gap-6 w-full lg:max-w-[400px]">
          
          {/* HOW IT WORKS */}
          <div className="bg-white rounded-[24px] p-6 md:p-8 border border-[#E5E7EB] shadow-sm">
            <h2 className="text-[16px] font-bold text-[#0F172A] mb-6">How It Works</h2>
            <div className="flex flex-col gap-8">
              
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#F0FDF4] flex items-center justify-center shrink-0 font-extrabold text-[#15803D] text-[14px]">
                  1
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <h3 className="text-[14px] font-bold text-[#0F172A]">Share your referral code</h3>
                  <p className="text-[12px] text-[#64748B] font-medium leading-relaxed">Share your code or link with friends</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#FFF7ED] flex items-center justify-center shrink-0 font-extrabold text-[#F97316] text-[14px]">
                  2
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <h3 className="text-[14px] font-bold text-[#0F172A]">They join & place an order</h3>
                  <p className="text-[12px] text-[#64748B] font-medium leading-relaxed">Your friend signs up and places their first order</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-[#F5F3FF] flex items-center justify-center shrink-0 font-extrabold text-[#7C3AED] text-[14px]">
                  3
                </div>
                <div className="flex flex-col gap-1 pt-1">
                  <h3 className="text-[14px] font-bold text-[#0F172A]">You earn rewards</h3>
                  <p className="text-[12px] text-[#64748B] font-medium leading-relaxed">You get 100 points when they join & 50 points on their first order</p>
                </div>
              </div>

            </div>
          </div>

          {/* RECENT REFERRALS */}
          <div className="bg-white rounded-[24px] p-6 md:p-8 border border-[#E5E7EB] shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[16px] font-bold text-[#0F172A]">Recent Referrals</h2>
              <button className="text-[13px] font-bold text-[#15803D] hover:underline">
                View All
              </button>
            </div>

            {recentReferrals.length === 0 ? (
              <p className="text-[13px] text-[#64748B] text-center py-10 border border-dashed border-[#E5E7EB] rounded-xl">
                No referrals yet. Share your code and start earning!
              </p>
            ) : (
              <ScrollArea className="w-full h-[240px] pr-4">
                <div className="flex flex-col gap-4">
                  {recentReferrals.map((row) => (
                    <div key={row.id} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0 pb-3 last:pb-0">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-[#F8FAFC] border border-[#E5E7EB] shrink-0">
                          <Image 
                            src="/account/profile.webp" 
                            alt={row.name ?? "Friend"} 
                            fill 
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[14px] font-bold text-[#0F172A]">{row.name || "Friend"}</span>
                          <span className="text-[11px] font-medium text-[#64748B]">
                            {row.status === "COMPLETED" ? `Joined on ${format(new Date(row.createdAt), "d MMM yyyy")}` : "Placed first order"}
                          </span>
                        </div>
                      </div>
                      <div className="px-2.5 py-1 rounded-[6px] bg-[#F0FDF4] text-[#15803D] text-[11px] font-extrabold shrink-0 border border-[#DCFCE7]">
                        +{row.rewardAmount.toLocaleString("en-IN")} pts
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {recentReferrals.length > 0 && (
              <div className="w-full pt-4 mt-2 border-t border-[#E5E7EB] flex justify-center">
                <button className="text-[13px] font-bold text-[#15803D] hover:underline flex items-center gap-1">
                  View All Referrals <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
