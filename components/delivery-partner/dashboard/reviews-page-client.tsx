"use client"

import { useMemo, useState, useEffect } from "react"
import { useQuery } from "@tanstack/react-query"
import { getDeliveryReviewsData } from "@/actions/delivery/reviews"
import { useDeliveryReviews, useDeliveryActions } from "@/stores/deliveryDashboardStore"
import {
  Star,
  MessageSquare,
  ThumbsUp,
  Heart,
  ArrowUpRight,
  Filter,
  ChevronDown,
  Lightbulb,
  Check,
  Package,
  Trophy,
  MessageCircle,
} from "lucide-react"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts"
import { cn } from "@/lib/utils"
import Image from "next/image"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { toast } from "sonner"

export default function ReviewsPageClient() {
  const { data, isLoading } = useQuery({
    queryKey: ["delivery-reviews"],
    queryFn: getDeliveryReviewsData,
    refetchInterval: 30_000,
  })

  const storedReviews = useDeliveryReviews()
  const { setReviews } = useDeliveryActions()

  useEffect(() => {
    if (data) setReviews(data)
  }, [data, setReviews])

  const resolvedData = storedReviews ?? data

  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
  const [visibleCount, setVisibleCount] = useState(5)
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)

  const toggleHelpful = (id: string) => {
    setHelpfulIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        toast.info("Marked as not helpful")
      } else {
        next.add(id)
        toast.success("Marked as helpful")
      }
      return next
    })
  }

  const handleHelpful = (id: string) => toggleHelpful(id)

  const filteredReviews = useMemo(() => {
    if (!resolvedData) return []
    const list = [...resolvedData.reviews]
    list.sort((a, b) => {
      const timeDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return sortOrder === "newest" ? -timeDiff : timeDiff
    })
    if (activeFilter === "5") return list.filter((r) => r.rating === 5)
    if (activeFilter === "4") return list.filter((r) => r.rating === 4)
    if (activeFilter === "3") return list.filter((r) => r.rating === 3)
    if (activeFilter === "1|2") return list.filter((r) => r.rating <= 2)
    return list
  }, [resolvedData, activeFilter, sortOrder])

  const visibleReviews = filteredReviews.slice(0, visibleCount)
  const totalFiltered = filteredReviews.length
  const filterCount = activeFilter === "all" ? 0 : 1

  const hasHelpful = (id: string) => helpfulIds.has(id)

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5)
  }

  const cardStyle = "bg-[#FFFFFF] border-[#F3F5F8] rounded-[10px] shadow-[0_1px_3px_rgba(16,24,40,0.03)]"

  if (isLoading || !resolvedData) {
    return (
      <div className="max-w-[1440px] mx-auto space-y-[32px] pb-12 px-4 sm:px-6 lg:px-8 bg-[#FEFEFE]" role="status" aria-label="Loading reviews">
        {/* Header */}
        <div className="space-y-3">
          <Skeleton className="h-[29px] w-72 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className={cn(cardStyle)}>
              <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-8 w-14" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Column + Sidebar */}
        <div className="grid xl:grid-cols-[1fr_360px] gap-6 pt-2">
          {/* Main: Reviews List */}
          <div className="flex flex-col gap-6 w-full overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-6 border-b border-[#F3F5F8] w-full md:w-auto">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-24" />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-24 rounded-[8px]" />
                <Skeleton className="h-9 w-32 rounded-[8px]" />
              </div>
            </div>

            <div className="space-y-4">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i} className={cn(cardStyle)}>
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <div className="flex gap-4 sm:w-[200px] flex-shrink-0">
                        <Skeleton className="h-[42px] w-[42px] rounded-full" />
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-4 w-16 rounded-full" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-8" />
                          </div>
                          <Skeleton className="h-6 w-20 rounded-[6px]" />
                        </div>
                        <div className="flex gap-8 mb-4">
                          {Array.from({ length: 3 }).map((_, j) => (
                            <div key={j} className="flex flex-col gap-1.5">
                              <Skeleton className="h-3 w-12" />
                              <Skeleton className="h-3 w-8" />
                            </div>
                          ))}
                        </div>
                        <Skeleton className="h-3 w-full" />
                        <Skeleton className="h-3 w-2/3 mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="flex justify-center mt-2">
              <Skeleton className="h-10 w-44 rounded-[8px]" />
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            {/* Rating Breakdown */}
            <Card className={cn(cardStyle)}>
              <div className="px-6 py-5 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="px-6 pb-6 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-3 w-14" />
                    <Skeleton className="flex-1 h-[6px] rounded-full mx-3" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Category Scores */}
            <Card className={cn(cardStyle)}>
              <div className="px-6 py-5 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="px-6 pb-6 flex justify-between">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <Skeleton className="h-[60px] w-[60px] rounded-full" />
                    <Skeleton className="h-3 w-14" />
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Highlights */}
            <Card className={cn(cardStyle)}>
              <div className="px-6 py-5 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="px-6 pb-6 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-3 w-36" />
                      <Skeleton className="h-3 w-28" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Your Progress */}
            <Card className={cn(cardStyle, "overflow-hidden")}>
              <div className="px-6 py-5 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="px-6 pb-6 pt-2">
                <Skeleton className="h-[140px] w-full" />
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex flex-col gap-1.5">
                    <Skeleton className="h-3 w-40" />
                    <Skeleton className="h-6 w-32" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </Card>

            {/* Tips to Improve */}
            <Card className={cn(cardStyle)}>
              <div className="px-6 py-5 flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded-full" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="px-6 pb-6 space-y-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const { stats, ratingBreakdown, categoryScores, progressData, ratingImprovement } = resolvedData

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        className={cn("h-[14px] w-[14px]", i < rating ? "text-[#FBA50C] fill-[#FBA50C]" : "text-[#D9DDE3] fill-[#D9DDE3]")} 
      />
    ))
  }

  return (
    <div className="max-w-[1440px] mx-auto space-y-[32px] animate-in fade-in duration-500 pb-12 px-4 sm:px-6 lg:px-8 bg-[#FEFEFE] text-[#05060C] font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-[24px] font-[700] leading-[1.2] text-[#05060C]">Reviews & Ratings</h1>
        <p className="text-[#464A57] mt-1 text-[12px]">See what customers say about your delivery service</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        
        {/* Overall Rating */}
        <Card className={cn(cardStyle)}>
          <CardContent className="p-5 flex flex-col justify-between h-full text-center items-center">
             <div className="flex items-center gap-2 mb-2">
                 <div className="h-6 w-6 rounded-full bg-[#FFF6E5] flex items-center justify-center">
                     <Star className="h-3.5 w-3.5 text-[#FBA50C] fill-[#FBA50C]" />
                 </div>
                 <span className="text-[12px] font-[700] text-[#05060C]">Overall Rating</span>
             </div>
             <div className="text-[28px] md:text-[32px] font-[700] text-[#05060C] flex items-baseline justify-center gap-1 my-2">
                 {stats.overallRating} <span className="text-[16px] text-[#6E727E] font-[700]">/5</span>
             </div>
             <div className="flex items-center justify-center gap-[2px] mb-1">
                 {renderStars(Math.round(stats.overallRating))}
             </div>
             <div className="text-[10px] font-[600] text-[#05060C]">
               Based on {stats.totalReviews} reviews
             </div>
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card className={cn(cardStyle)}>
          <CardContent className="p-5 flex flex-col justify-center h-full text-center items-center">
             <div className="flex items-center gap-2 mb-4">
                 <div className="h-6 w-6 rounded-full bg-[#EEF8F0] flex items-center justify-center">
                     <MessageSquare className="h-3.5 w-3.5 text-[#0D7828]" />
                 </div>
                 <span className="text-[12px] font-[700] text-[#05060C]">Total Reviews</span>
             </div>
             <div className="text-[28px] md:text-[32px] font-[700] text-[#05060C] mb-2">
                 {stats.totalReviews}
             </div>
             <div className="text-[10px] font-[600] flex items-center justify-center text-[#0D7828]">
                 <ArrowUpRight className="h-3 w-3 mr-1" /> {stats.reviewsThisMonth} <span className="text-[#05060C] ml-1">this month</span>
             </div>
          </CardContent>
        </Card>

        {/* 5 Star Reviews */}
        <Card className={cn(cardStyle)}>
          <CardContent className="p-5 flex flex-col justify-center h-full text-center items-center">
             <div className="flex items-center gap-2 mb-4">
                 <div className="h-6 w-6 rounded-full bg-[#EAF6ED] flex items-center justify-center">
                     <Star className="h-3.5 w-3.5 text-[#0D7828] fill-[#0D7828]" />
                 </div>
                 <span className="text-[12px] font-[700] text-[#05060C]">5 Star Reviews</span>
             </div>
             <div className="text-[28px] md:text-[32px] font-[700] text-[#05060C] mb-2">
                 {stats.fiveStarReviews}
             </div>
             <div className="text-[10px] font-[600] text-[#05060C]">
                 ({stats.fiveStarPercentage}%)
             </div>
          </CardContent>
        </Card>

        {/* Response Rate */}
        <Card className={cn(cardStyle)}>
          <CardContent className="p-5 flex flex-col justify-center h-full text-center items-center">
             <div className="flex items-center gap-2 mb-4">
                 <div className="h-6 w-6 rounded-full bg-[#E6EFFB] flex items-center justify-center">
                     <ThumbsUp className="h-3.5 w-3.5 text-[#1C65F2]" />
                 </div>
                 <span className="text-[12px] font-[700] text-[#05060C]">Response Rate</span>
             </div>
             <div className="text-[28px] md:text-[32px] font-[700] text-[#05060C] mb-2">
                 {stats.responseRate}%
             </div>
             <div className="text-[10px] font-[600] flex items-center justify-center text-[#0D7828]">
                 <ArrowUpRight className="h-3 w-3 mr-1" /> Excellent
             </div>
          </CardContent>
        </Card>

        {/* Repeat Customers */}
        <Card className={cn(cardStyle)}>
          <CardContent className="p-5 flex flex-col justify-center h-full text-center items-center">
             <div className="flex items-center gap-2 mb-4">
                 <div className="h-6 w-6 rounded-full bg-[#F5EEFA] flex items-center justify-center">
                     <Heart className="h-3.5 w-3.5 text-[#8A50D4] fill-[#8A50D4]" />
                 </div>
                 <span className="text-[12px] font-[700] text-[#05060C]">Repeat Customers</span>
             </div>
             <div className="text-[28px] md:text-[32px] font-[700] text-[#05060C] mb-2">
                 {stats.repeatCustomers}
             </div>
             <div className="text-[10px] font-[600] text-[#05060C]">
                 Happy customers
             </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid xl:grid-cols-[1fr_360px] gap-6 pt-2">
          
          {/* Main Column: Reviews List */}
          <div className="flex flex-col gap-6 w-full overflow-hidden">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full border-b border-[#F3F5F8]">
                 <Tabs value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setVisibleCount(5) }} className="flex-1 min-w-0">
                   <ScrollArea className="w-full">
                    <TabsList className="bg-transparent gap-4 lg:gap-6 h-[52px] p-0 flex justify-start w-max rounded-none border-none">
                        {[
                          { val: "all", label: `All Reviews (${stats.totalReviews})` },
                          { val: "5", label: `5 Star (${ratingBreakdown[0].count})` },
                          { val: "4", label: `4 Star (${ratingBreakdown[1].count})` },
                          { val: "3", label: `3 Star (${ratingBreakdown[2].count})` },
                          { val: "1|2", label: `1-2 Star (${ratingBreakdown[3].count + ratingBreakdown[4].count})` },
                        ].map(t => (
                          <TabsTrigger 
                            key={t.val} 
                            value={t.val} 
                            className="focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent shadow-none border-0 border-b-[2px] border-b-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[#0D7828] data-[state=active]:text-[#0D7828] text-[#464A57] rounded-none px-0 py-4 h-full text-[14px] font-[600] hover:text-[#0D7828] whitespace-nowrap transition-none outline-none"
                          >
                            {t.label}
                          </TabsTrigger>
                        ))}
                    </TabsList>
                    <ScrollBar orientation="horizontal" className="hidden sm:flex" />
                   </ScrollArea>
                 </Tabs>

                 <div className="flex shrink-0 items-center gap-3 pb-3 md:pb-0">
                     <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                       <PopoverTrigger asChild>
                         <Button variant="outline" size="sm" className="h-9 text-[14px] font-[600] text-[#161B26] bg-[#FFFFFF] border-[#E9EDF2] rounded-[8px] px-4 hover:bg-slate-50 shadow-sm flex items-center gap-2">
                            <Filter className="h-4 w-4" /> Filter
                            {filterCount > 0 && (
                              <span className="h-4 w-4 rounded-full bg-[#0D7828] text-white text-[9px] font-bold flex items-center justify-center">{filterCount}</span>
                            )}
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent align="end" className="w-44 p-1.5 rounded-xl shadow-lg border-[#F3F5F8]">
                         {["all", "5", "4", "3", "1|2"].map((f) => (
                           <button
                             key={f}
                             onClick={() => { setActiveFilter(f); setVisibleCount(5); setFilterOpen(false) }}
                             className={cn(
                               "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors",
                               activeFilter === f ? "bg-[#F0F8F2] text-[#0D7828]" : "text-[#464A57] hover:bg-slate-50"
                             )}
                           >
                             {f === "all" ? "All Reviews" : f === "1|2" ? "1-2 Stars" : `${f} Stars`}
                             {activeFilter === f && <Check className="h-3.5 w-3.5" />}
                           </button>
                         ))}
                       </PopoverContent>
                     </Popover>
                     <Button variant="outline" size="sm" onClick={() => { setSortOrder((prev) => prev === "newest" ? "oldest" : "newest"); setVisibleCount(5) }} className="h-9 text-[14px] font-[600] text-[#161B26] bg-[#FFFFFF] border-[#E9EDF2] rounded-[8px] px-4 hover:bg-slate-50 shadow-sm flex items-center gap-2">
                        {sortOrder === "newest" ? "Newest First" : "Oldest First"} <ChevronDown className={cn("h-4 w-4 text-[#464A57] transition-transform", sortOrder === "oldest" && "rotate-180")} />
                     </Button>
                 </div>
              </div>

              <div className="space-y-4">
                  {visibleReviews.length === 0 ? (
                    <div className={cn(cardStyle, "text-center py-16")}>
                      <MessageSquare className="h-12 w-12 text-[#E9ECEF] mx-auto mb-3" />
                      <p className="text-[#6E727E] font-medium">No reviews found for this filter.</p>
                    </div>
                  ) : (
                  visibleReviews.map((review) => {
                      // Avatar logic from instructions
                      let avatarBg = "bg-[#E5F4E8]"; let avatarText = "text-[#0D7828]"
                      if(review.userName?.includes("Karthik")) { avatarBg = "bg-[#EAF2FF]"; avatarText = "text-[#1C65F2]" }
                      else if(review.userName?.includes("Meena")) { avatarBg = "bg-[#FFF0E8]"; avatarText = "text-[#F07818]" }
                      else if(review.userName?.includes("Aravind")) { avatarBg = "bg-[#F0E9FC]"; avatarText = "text-[#8A50D4]" }
                      else if(review.userName?.includes("Sangeetha")) { avatarBg = "bg-[#FFE9EA]"; avatarText = "text-[#E63946]" }
                      else if(review.userName?.includes("Ramesh")) { avatarBg = "bg-[#FFF3D9]"; avatarText = "text-[#E58A00]" }
                      
                      // Category badge color
                      const catBadgeClass = review.category === "Excellent" ? "bg-[#EFF8F1] text-[#0D7828]" 
                                          : review.category === "Good" ? "bg-[#EEF5FF] text-[#1C65F2]"
                                          : review.category === "Average" ? "bg-[#FFF6E9] text-[#D97706]"
                                          : "bg-[#FFF6E9] text-[#D97706]"

                      return (
                      <Card key={review.id} className={cn(cardStyle)}>
                          <CardContent className="p-6">
                              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                                  {/* Left col: User Info */}
                                  <div className="flex gap-4 sm:w-[200px] flex-shrink-0">
                                      <Avatar className={cn("h-[42px] w-[42px] flex-shrink-0 font-[600] text-[16px]", avatarBg, avatarText)}>
                                        <AvatarFallback className="bg-transparent">{review.userInitials}</AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1">
                                          <div className="font-[600] text-[14px] text-[#161B26] mb-1">{review.userName}</div>
                                          <div className="bg-[#F0F8F2] text-[#0D7828] px-1.5 py-0.5 rounded-full text-[9px] font-bold inline-flex items-center gap-0.5 mb-2 border border-[#EAF6ED]">
                                              <Check className="h-2.5 w-2.5" /> Verified
                                          </div>
                                          <div className="text-[10px] text-[#6E727E] mt-1">Order #{review.orderId}</div>
                                          <div className="text-[10px] text-[#6E727E]">Delivered on {review.date}</div>
                                      </div>
                                  </div>

                                  {/* Right col: Review Content */}
                                  <div className="flex-1">
                                      <div className="flex justify-between items-start mb-4">
                                          <div className="flex items-center gap-3">
                                              <div className="flex items-center gap-[2px]">
                                                  {renderStars(review.rating)}
                                              </div>
                                              <span className="font-[700] text-[14px] text-[#161B26]">{review.rating.toFixed(1)}</span>
                                          </div>
                                          <div className={cn("px-2.5 py-1 rounded-[6px] text-[11px] font-[600]", catBadgeClass)}>
                                              {review.category}
                                          </div>
                                      </div>

                                      <div className="flex flex-wrap gap-4 sm:gap-8 mb-4">
                                          <div>
                                              <div className="text-[12px] font-[600] text-[#464A57] mb-1">Speed</div>
                                              <div className="text-[14px] font-[600] text-[#161B26]">{review.scores.speed}/5</div>
                                          </div>
                                          <div>
                                              <div className="text-[12px] font-[600] text-[#464A57] mb-1">Behavior</div>
                                              <div className="text-[14px] font-[600] text-[#161B26]">{review.scores.behavior}/5</div>
                                          </div>
                                          <div>
                                              <div className="text-[12px] font-[600] text-[#464A57] mb-1">Hygiene</div>
                                              <div className="text-[14px] font-[600] text-[#161B26]">{review.scores.hygiene}/5</div>
                                          </div>
                                      </div>

                                      <p className="text-[12px] text-[#464A57] leading-[1.6] mb-4">
                                          &ldquo;{review.comment}&rdquo;
                                      </p>

                                      <div className="flex justify-end mt-4">
                                          <button
                                            onClick={() => handleHelpful(review.id)}
                                            className={cn(
                                              "text-[12px] font-[600] transition-colors flex items-center bg-transparent border-none outline-none",
                                              hasHelpful(review.id) ? "text-[#0D7828]" : "text-[#6E727E] hover:text-[#464A57]"
                                            )}
                                          >
                                              <ThumbsUp className={cn("h-4 w-4 mr-1.5", hasHelpful(review.id) && "fill-[#0D7828] text-[#0D7828]")} strokeWidth={2} /> Helpful
                                          </button>
                                      </div>
                                  </div>
                              </div>
                          </CardContent>
                      </Card>
                      )
                  })
                    )}
              </div>
              
              <div className="flex justify-center mt-2">
                 {visibleReviews.length < totalFiltered ? (
                   <Button variant="outline" onClick={handleLoadMore} className="h-10 text-[14px] font-[600] text-[#0D7828] bg-[#FFFFFF] border-[#E4E8ED] rounded-[8px] px-6 hover:bg-[#F0F8F2] shadow-none load-more">
                     Load More Reviews <ChevronDown className="h-4 w-4 ml-2 text-[#0D7828]" />
                  </Button>
                 ) : (
                   <span className="text-[12px] font-[600] text-[#6E727E]">Showing all {totalFiltered} reviews</span>
                 )}
              </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
              
              {/* Rating Breakdown */}
              <Card className={cn(cardStyle)}>
                  <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                      <Star className="h-4 w-4 text-[#0D7828]" />
                      <h2 className="text-[14px] font-[700] text-[#161B26]">Rating Breakdown</h2>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0 space-y-3">
                      {ratingBreakdown.map((row, i) => (
                          <div key={i} className="flex items-center text-[12px]">
                              <span className="w-14 font-[600] text-[#464A57]">{row.stars} Stars</span>
                              <Progress 
                                  value={row.percent}
                                  className={cn("h-[6px] mx-3 flex-1 bg-[#E9ECEF]", 
                                      row.stars === 5 ? "[&_[data-slot=progress-indicator]]:bg-[#0D7828]" :
                                      row.stars === 4 ? "[&_[data-slot=progress-indicator]]:bg-[#52A163]" :
                                      row.stars === 3 ? "[&_[data-slot=progress-indicator]]:bg-[#FBA50C]" :
                                      row.stars === 2 ? "[&_[data-slot=progress-indicator]]:bg-[#F02219]" :
                                      "[&_[data-slot=progress-indicator]]:bg-[#F02219]"
                                  )} 
                              />
                              <span className="w-16 text-right font-[600] text-[#464A57]">
                                  {row.count} <span className="text-[10px] text-[#6E727E]">({row.percent}%)</span>
                              </span>
                          </div>
                      ))}
                  </CardContent>
              </Card>

              {/* Category Scores */}
              <Card className={cn(cardStyle)}>
                  <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                      <Trophy className="h-4 w-4 text-[#0D7828]" />
                      <h2 className="text-[14px] font-[700] text-[#161B26]">Category Scores</h2>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 pb-6 pt-2 flex justify-between gap-2">
                      {[
                        { label: "Speed", score: categoryScores.speed },
                        { label: "Behavior", score: categoryScores.behavior },
                        { label: "Hygiene", score: categoryScores.hygiene }
                      ].map((cat, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="relative h-[60px] w-[60px] sm:h-[68px] sm:w-[68px] flex items-center justify-center mb-2">
                               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                  <circle cx="50" cy="50" r="42" fill="none" stroke="#E7F1E9" strokeWidth="8" />
                                  <circle cx="50" cy="50" r="42" fill="none" stroke="#0D7828" strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 - (264 * (cat.score / 5))} strokeLinecap="round" />
                               </svg>
                               <div className="absolute inset-0 flex items-center justify-center">
                                   <span className="text-[16px] font-[700] text-[#161B26]">{cat.score.toFixed(1)}</span>
                               </div>
                            </div>
                            <span className="text-[12px] font-[600] text-[#464A57]">{cat.label}</span>
                        </div>
                      ))}
                  </CardContent>
              </Card>

              {/* Recent Highlights */}
              <Card className={cn(cardStyle)}>
                  <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                      <MessageCircle className="h-4 w-4 text-[#0D7828]" />
                      <h2 className="text-[14px] font-[700] text-[#161B26]">Recent Highlights</h2>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0 flex flex-col gap-5">
                      <div className="flex gap-3 items-center">
                          <div className="h-8 w-8 rounded-full bg-[#EAF6ED] flex items-center justify-center flex-shrink-0">
                              <ThumbsUp className="h-4 w-4 text-[#0D7828] fill-[#0D7828]" strokeWidth={2} />
                          </div>
                          <div>
                              <div className="font-[700] text-[#161B26] text-[12px] mb-0.5">On-time deliveries</div>
                              <div className="text-[11px] text-[#6E727E]">Mentioned in 92 reviews</div>
                          </div>
                      </div>
                      <div className="flex gap-3 items-center">
                          <div className="h-8 w-8 rounded-full bg-[#FDEBEC] flex items-center justify-center flex-shrink-0">
                              <Heart className="h-4 w-4 text-[#F02219] fill-[#F02219]" strokeWidth={2} />
                          </div>
                          <div>
                              <div className="font-[700] text-[#161B26] text-[12px] mb-0.5">Polite & helpful</div>
                              <div className="text-[11px] text-[#6E727E]">Mentioned in 87 reviews</div>
                          </div>
                      </div>
                      <div className="flex gap-3 items-center">
                          <div className="h-8 w-8 rounded-full bg-[#EEF8F0] flex items-center justify-center flex-shrink-0">
                              <Package className="h-4 w-4 text-[#0D7828]" strokeWidth={2} />
                          </div>
                          <div>
                              <div className="font-[700] text-[#161B26] text-[12px] mb-0.5">Order handled with care</div>
                              <div className="text-[11px] text-[#6E727E]">Mentioned in 79 reviews</div>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              {/* Your Progress */}
              <Card className={cn(cardStyle, "overflow-hidden")}>
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 pt-6 px-6">
                      <MessageSquare className="h-4 w-4 text-[#0D7828]" />
                      <h2 className="text-[14px] font-[700] text-[#161B26]">Your Progress</h2>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-2">
                      <div className="h-[140px] -mx-4 mt-2">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                  <defs>
                                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#0D7828" stopOpacity={0.1}/>
                                          <stop offset="95%" stopColor="#0D7828" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <Tooltip 
                                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontWeight: 'bold', fontSize: '12px' }}
                                      itemStyle={{ color: '#161B26' }}
                                  />
                                  <XAxis 
                                      dataKey="name" 
                                      axisLine={false} 
                                      tickLine={false} 
                                      tick={{ fontSize: 10, fill: '#6E727E', fontWeight: 600 }} 
                                      dy={5}
                                  />
                                  <Area type="monotone" dataKey="value" stroke="#0D7828" strokeWidth={2} fillOpacity={1} fill="url(#colorRating)" activeDot={{ r: 4, fill: '#09641C', stroke: '#fff', strokeWidth: 2 }} />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                          <div>
                              <div className="text-[12px] font-[600] text-[#464A57] mb-0.5">Your rating has improved by</div>
                              <div className="font-[700] text-[#0D7828] text-[24px] flex items-baseline gap-1 mt-1">
                                  +{ratingImprovement} <span className="text-[12px] text-[#6E727E] font-[600]">this month</span>
                              </div>
                          </div>
                          <div className="h-10 w-10 rounded-full flex items-center justify-center">
                              <ArrowUpRight className="h-6 w-6 text-[#0D7828]" />
                          </div>
                      </div>
                  </CardContent>
              </Card>

              {/* Tips to Improve */}
              <Card className={cn(cardStyle, "flex flex-col relative overflow-hidden bg-[#FEFEFE]")}>
                  <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                      <Lightbulb className="h-4 w-4 text-[#0D7828]" />
                      <h2 className="text-[14px] font-[700] text-[#161B26]">Tips to Improve</h2>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6 relative z-10 pt-0 px-6 pb-32">
                      <div className="flex gap-3 relative z-10">
                          <div className="h-8 w-8 rounded-full bg-[#EEF8F0] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <ThumbsUp className="h-4 w-4 text-[#0D7828]" />
                          </div>
                          <div>
                              <div className="font-[700] text-[12px] text-[#161B26] mb-0.5">Keep up the great work!</div>
                              <div className="text-[11px] text-[#6E727E] font-[500]">Your ratings are excellent</div>
                          </div>
                      </div>
                      <div className="flex gap-3 relative z-10">
                          <div className="h-8 w-8 rounded-full bg-[#EEF8F0] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Package className="h-4 w-4 text-[#0D7828]" />
                          </div>
                          <div>
                              <div className="font-[700] text-[12px] text-[#161B26] mb-0.5">Maintain on-time deliveries</div>
                              <div className="text-[11px] text-[#6E727E] font-[500]">Customers appreciate punctuality</div>
                          </div>
                      </div>
                      <div className="flex gap-3 relative z-10">
                          <div className="h-8 w-8 rounded-full bg-[#EEF8F0] flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MessageSquare className="h-4 w-4 text-[#0D7828]" />
                          </div>
                          <div>
                              <div className="font-[700] text-[12px] text-[#161B26] mb-0.5">Stay polite and helpful</div>
                              <div className="text-[11px] text-[#6E727E] font-[500]">It makes a big difference</div>
                          </div>
                      </div>
                  </CardContent>
                  
                  {/* Illustration at bottom right */}
                  <div className="absolute bottom-0 right-0 md:right-4 w-28 md:w-36 flex flex-col justify-end pointer-events-none opacity-90 z-0">
                      <Image 
                          src="/delivery/delivery-person-green.webp" 
                          alt="Delivery partner" 
                          width={144} 
                          height={144} 
                          className="object-contain w-full h-auto"
                      />
                  </div>
              </Card>

          </div>
      </div>

    </div>
  )
}
