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
  TrendingUp,
  Filter,
  ChevronDown,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Package,
  Award,
  Check
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
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

  if (isLoading || !resolvedData) {
    return (
      <div className="max-w-[1400px] mx-auto space-y-8 pb-12" role="status" aria-label="Loading reviews">
        {/* Header */}
        <div className="space-y-3">
          <Skeleton className="h-9 w-72 max-w-full" />
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="rounded-3xl shadow-none border-slate-100">
              <CardContent className="p-5 flex flex-col items-center text-center space-y-3">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-6 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-9 w-14" />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 pt-2">
          {/* Left Col: Reviews List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-24 rounded-xl" />
                <Skeleton className="h-9 w-20 rounded-xl" />
                <Skeleton className="h-9 w-20 rounded-xl" />
                <Skeleton className="h-9 w-20 rounded-xl" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-9 w-20 rounded-xl" />
                <Skeleton className="h-9 w-28 rounded-xl" />
              </div>
            </div>

            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="rounded-3xl shadow-none border-slate-100 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="flex gap-4 sm:w-[220px] flex-shrink-0">
                      <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-28" />
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-4 w-28" />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <div key={j} className="space-y-1.5">
                            <Skeleton className="h-3 w-12" />
                            <Skeleton className="h-4 w-10" />
                          </div>
                        ))}
                      </div>
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="flex justify-end">
                        <Skeleton className="h-8 w-20 rounded-lg" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <div className="flex justify-center mt-2">
              <Skeleton className="h-10 w-48 rounded-xl" />
            </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            {/* Rating Breakdown */}
            <Card className="rounded-3xl shadow-none border-slate-100">
              <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                <Skeleton className="h-4 w-4 rounded-md" />
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-2 flex-1 mx-3 rounded-full" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Category Scores */}
            <Card className="rounded-3xl shadow-none border-slate-100">
              <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                <Skeleton className="h-4 w-4 rounded-md" />
                <Skeleton className="h-5 w-36" />
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-2 flex justify-between">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <Skeleton className="h-[68px] w-[68px] rounded-full mb-2" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recent Highlights */}
            <Card className="rounded-3xl shadow-none border-slate-100">
              <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                <Skeleton className="h-4 w-4 rounded-md" />
                <Skeleton className="h-5 w-40" />
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-0 space-y-5">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Your Progress + Tips */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="rounded-3xl shadow-none border-slate-100 overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-2 pb-2 pt-6 px-6">
                  <Skeleton className="h-4 w-4 rounded-md" />
                  <Skeleton className="h-5 w-36" />
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-2">
                  <Skeleton className="h-[140px] w-full rounded-2xl" />
                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3 w-40" />
                      <Skeleton className="h-7 w-24" />
                    </div>
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                </CardContent>
              </Card>
              <Card className="rounded-3xl shadow-none border-slate-100 overflow-hidden">
                <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                  <Skeleton className="h-4 w-4 rounded-md" />
                  <Skeleton className="h-5 w-36" />
                </CardHeader>
                <CardContent className="px-6 pb-6 pt-0 space-y-5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-3.5 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
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
        className={cn("h-3.5 w-3.5", i < rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200")} 
      />
    ))
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">Reviews & Ratings</h1>
        <p className="text-slate-500 mt-1 font-medium text-sm md:text-base">See what customers say about your delivery service</p>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        
        {/* Overall Rating */}
        <Card className="shadow-none border-slate-100 rounded-3xl">
          <CardContent className="p-5 flex flex-col justify-between h-full text-center items-center">
             <div className="flex items-center gap-2 mb-2">
                 <div className="h-6 w-6 rounded-full bg-amber-50 flex items-center justify-center">
                     <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                 </div>
                 <span className="text-xs font-bold text-slate-900">Overall Rating</span>
             </div>
             <div className="text-4xl font-extrabold text-slate-900 flex items-baseline justify-center gap-1 my-2">
                 {stats.overallRating} <span className="text-lg text-slate-400 font-bold">/5</span>
             </div>
             <div className="flex items-center justify-center gap-1 mb-1">
                 {renderStars(Math.round(stats.overallRating))}
             </div>
             <div className="text-[10px] font-bold text-slate-400">
               Based on {stats.totalReviews} reviews
             </div>
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card className="shadow-none border-slate-100 rounded-3xl">
          <CardContent className="p-5 flex flex-col justify-center h-full text-center items-center">
             <div className="flex items-center gap-2 mb-4">
                 <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center">
                     <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                 </div>
                 <span className="text-xs font-bold text-slate-900">Total Reviews</span>
             </div>
             <div className="text-4xl font-extrabold text-slate-900 mb-2">
                 {stats.totalReviews}
             </div>
             <div className="text-xs font-bold flex items-center justify-center text-emerald-600">
                 <TrendingUp className="h-3.5 w-3.5 mr-1" /> {stats.reviewsThisMonth} <span className="text-slate-400 ml-1">this month</span>
             </div>
          </CardContent>
        </Card>

        {/* 5 Star Reviews */}
        <Card className="shadow-none border-slate-100 rounded-3xl">
          <CardContent className="p-5 flex flex-col justify-center h-full text-center items-center">
             <div className="flex items-center gap-2 mb-4">
                 <div className="h-6 w-6 rounded-full bg-emerald-50 flex items-center justify-center">
                     <Star className="h-3.5 w-3.5 text-emerald-600 fill-emerald-600" />
                 </div>
                 <span className="text-xs font-bold text-slate-900">5 Star Reviews</span>
             </div>
             <div className="text-4xl font-extrabold text-slate-900 mb-2">
                 {stats.fiveStarReviews}
             </div>
             <div className="text-xs font-bold text-slate-500">
                 ({stats.fiveStarPercentage}%)
             </div>
          </CardContent>
        </Card>

        {/* Response Rate */}
        <Card className="shadow-none border-slate-100 rounded-3xl">
          <CardContent className="p-5 flex flex-col justify-center h-full text-center items-center">
             <div className="flex items-center gap-2 mb-4">
                 <div className="h-6 w-6 rounded-full bg-blue-50 flex items-center justify-center">
                     <ThumbsUp className="h-3.5 w-3.5 text-blue-600" />
                 </div>
                 <span className="text-xs font-bold text-slate-900">Response Rate</span>
             </div>
             <div className="text-4xl font-extrabold text-slate-900 mb-2">
                 {stats.responseRate}%
             </div>
             <div className="text-xs font-bold flex items-center justify-center text-emerald-600">
                 <TrendingUp className="h-3.5 w-3.5 mr-1" /> Excellent
             </div>
          </CardContent>
        </Card>

        {/* Repeat Customers */}
        <Card className="shadow-none border-slate-100 rounded-3xl">
          <CardContent className="p-5 flex flex-col justify-center h-full text-center items-center">
             <div className="flex items-center gap-2 mb-4">
                 <div className="h-6 w-6 rounded-full bg-purple-50 flex items-center justify-center">
                     <Heart className="h-3.5 w-3.5 text-purple-600 fill-purple-600" />
                 </div>
                 <span className="text-xs font-bold text-slate-900">Repeat Customers</span>
             </div>
             <div className="text-4xl font-extrabold text-slate-900 mb-2">
                 {stats.repeatCustomers}
             </div>
             <div className="text-xs font-bold text-slate-500">
                 Happy customers
             </div>
          </CardContent>
        </Card>

      </div>

      <div className="grid lg:grid-cols-3 gap-6 pt-2">
          
          {/* Main Column: Reviews List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                 <Tabs value={activeFilter} onValueChange={(v) => { setActiveFilter(v); setVisibleCount(5) }} className="w-full md:w-auto">
                    <TabsList className="bg-transparent space-x-2 h-auto p-0">
                        <TabsTrigger value="all" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none rounded-xl text-xs font-bold text-slate-500 px-4 py-2 hover:bg-slate-50">
                            All Reviews ({stats.totalReviews})
                        </TabsTrigger>
                        <TabsTrigger value="5" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none rounded-xl text-xs font-bold text-slate-500 px-4 py-2 hover:bg-slate-50">
                            5 Star ({ratingBreakdown[0].count})
                        </TabsTrigger>
                        <TabsTrigger value="4" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none rounded-xl text-xs font-bold text-slate-500 px-4 py-2 hover:bg-slate-50">
                            4 Star ({ratingBreakdown[1].count})
                        </TabsTrigger>
                        <TabsTrigger value="3" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none rounded-xl text-xs font-bold text-slate-500 px-4 py-2 hover:bg-slate-50">
                            3 Star ({ratingBreakdown[2].count})
                        </TabsTrigger>
                        <TabsTrigger value="1|2" className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none rounded-xl text-xs font-bold text-slate-500 px-4 py-2 hover:bg-slate-50">
                            1-2 Star ({ratingBreakdown[3].count + ratingBreakdown[4].count})
                        </TabsTrigger>
                    </TabsList>
                 </Tabs>

                 <div className="flex items-center gap-2 relative">
                     <Popover open={filterOpen} onOpenChange={setFilterOpen}>
                       <PopoverTrigger asChild>
                         <Button variant="outline" size="sm" className="h-9 text-xs font-semibold text-slate-600 border-slate-200 rounded-xl px-4 hover:bg-slate-50 shadow-sm flex items-center gap-2">
                            <Filter className="h-3.5 w-3.5" /> Filter
                            {filterCount > 0 && (
                              <span className="h-4 w-4 rounded-full bg-emerald-500 text-white text-[9px] font-bold flex items-center justify-center">{filterCount}</span>
                            )}
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent align="end" className="w-44 p-1.5 rounded-xl shadow-lg border-slate-100">
                         {["all", "5", "4", "3", "1|2"].map((f) => (
                           <button
                             key={f}
                             onClick={() => { setActiveFilter(f); setVisibleCount(5); setFilterOpen(false) }}
                             className={cn(
                               "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors",
                               activeFilter === f ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50"
                             )}
                           >
                             {f === "all" ? "All Reviews" : f === "1|2" ? "1-2 Stars" : `${f} Stars`}
                             {activeFilter === f && <Check className="h-3.5 w-3.5" />}
                           </button>
                         ))}
                       </PopoverContent>
                     </Popover>
                     <Button variant="outline" size="sm" onClick={() => { setSortOrder((prev) => prev === "newest" ? "oldest" : "newest"); setVisibleCount(5) }} className="h-9 text-xs font-semibold text-slate-600 border-slate-200 rounded-xl px-4 hover:bg-slate-50 shadow-sm flex items-center gap-2">
                        {sortOrder === "newest" ? "Newest First" : "Oldest First"} <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", sortOrder === "oldest" && "rotate-180")} />
                     </Button>
                 </div>
              </div>

              <div className="space-y-4">
                  {visibleReviews.length === 0 ? (
                    <div className="text-center py-16 rounded-3xl border border-slate-100 bg-white">
                      <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No reviews found for this filter.</p>
                    </div>
                  ) : (
                  visibleReviews.map((review, i) => {
                      // Avatar color based on initials
                      const colors = ["bg-emerald-100 text-emerald-700", "bg-blue-100 text-blue-700", "bg-orange-100 text-orange-700", "bg-purple-100 text-purple-700", "bg-rose-100 text-rose-700"]
                      const colorClass = colors[i % colors.length]
                      
                      // Category badge color
                      const catBadgeClass = review.category === "Excellent" ? "bg-emerald-50 text-emerald-600" 
                                          : review.category === "Good" ? "bg-blue-50 text-blue-600"
                                          : review.category === "Average" ? "bg-orange-50 text-orange-600"
                                          : "bg-red-50 text-red-600"

                      return (
                      <Card key={review.id} className="shadow-none border-slate-100 rounded-3xl overflow-hidden hover:border-slate-200 transition-colors">
                          <CardContent className="p-6">
                              <div className="flex flex-col sm:flex-row gap-6">
                                  {/* Left col: User Info */}
                                  <div className="flex gap-4 sm:w-[220px] flex-shrink-0">
                                      <div className={cn("h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0", colorClass)}>
                                          {review.userInitials}
                                      </div>
                                      <div>
                                          <div className="font-bold text-slate-900 mb-1">{review.userName}</div>
                                          <div className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded text-[9px] font-bold inline-flex items-center gap-0.5 mb-2">
                                              <CheckCircle2 className="h-2.5 w-2.5" /> Verified
                                          </div>
                                          <div className="text-[11px] font-medium text-slate-500 mt-1">Order #{review.orderId}</div>
                                          <div className="text-[11px] font-medium text-slate-400">Delivered on {review.date}</div>
                                      </div>
                                  </div>

                                  {/* Right col: Review Content */}
                                  <div className="flex-1">
                                      <div className="flex justify-between items-start mb-4">
                                          <div className="flex items-center gap-3">
                                              <div className="flex items-center gap-1">
                                                  {renderStars(review.rating)}
                                              </div>
                                              <span className="font-bold text-slate-900">{review.rating.toFixed(1)}</span>
                                          </div>
                                          <div className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold", catBadgeClass)}>
                                              {review.category}
                                          </div>
                                      </div>

                                      <div className="grid grid-cols-3 gap-4 mb-4">
                                          <div>
                                              <div className="text-[11px] font-bold text-slate-900 mb-1">Speed</div>
                                              <div className="text-[13px] font-bold text-slate-700">{review.scores.speed}/5</div>
                                          </div>
                                          <div>
                                              <div className="text-[11px] font-bold text-slate-900 mb-1">Behavior</div>
                                              <div className="text-[13px] font-bold text-slate-700">{review.scores.behavior}/5</div>
                                          </div>
                                          <div>
                                              <div className="text-[11px] font-bold text-slate-900 mb-1">Hygiene</div>
                                              <div className="text-[13px] font-bold text-slate-700">{review.scores.hygiene}/5</div>
                                          </div>
                                      </div>

                                      <p className="text-sm font-medium text-slate-600 leading-relaxed italic mb-4">
                                          &quot;{review.comment}&quot;
                                      </p>

                                      <div className="flex justify-end">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleHelpful(review.id)}
                                            className={cn(
                                              "h-8 text-xs font-semibold transition-colors",
                                              hasHelpful(review.id) ? "text-emerald-600" : "text-slate-400 hover:text-slate-600"
                                            )}
                                          >
                                              <ThumbsUp className={cn("h-3.5 w-3.5 mr-1.5", hasHelpful(review.id) && "fill-emerald-600")} /> Helpful
                                          </Button>
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
                   <Button variant="outline" onClick={handleLoadMore} className="h-10 text-sm font-semibold text-slate-600 border-slate-200 rounded-xl px-6 hover:bg-slate-50 shadow-sm">
                     Load More Reviews <ChevronDown className="h-4 w-4 ml-2 text-slate-400" />
                  </Button>
                 ) : (
                   <span className="text-xs font-semibold text-slate-400">Showing all {totalFiltered} reviews</span>
                 )}
              </div>
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
              
              {/* Rating Breakdown */}
              <Card className="shadow-none border-slate-100 rounded-3xl">
                  <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                      <Star className="h-4 w-4 text-emerald-600" />
                      <h2 className="text-sm font-bold text-slate-900">Rating Breakdown</h2>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0 space-y-3">
                      {ratingBreakdown.map((row, i) => (
                          <div key={i} className="flex items-center text-xs">
                              <span className="w-12 font-medium text-slate-600">{row.stars} Stars</span>
                              <Progress 
                                value={row.percent} 
                                className={cn("h-2 mx-3 flex-1", 
                                    row.stars === 5 ? "[&>div]:bg-green-600" :
                                    row.stars === 4 ? "[&>div]:bg-green-400" :
                                    row.stars === 3 ? "[&>div]:bg-orange-400" :
                                    row.stars === 2 ? "[&>div]:bg-red-500" :
                                    "[&>div]:bg-red-600"
                                )} 
                              />
                              <span className="w-16 text-right font-medium text-slate-500">
                                  {row.count} <span className="text-[10px] text-slate-400">({row.percent}%)</span>
                              </span>
                          </div>
                      ))}
                  </CardContent>
              </Card>

              {/* Category Scores */}
              <Card className="shadow-none border-slate-100 rounded-3xl">
                  <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                      <Award className="h-4 w-4 text-emerald-600" />
                      <h2 className="text-sm font-bold text-slate-900">Category Scores</h2>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-2 flex justify-between">
                      {/* Speed */}
                      <div className="flex flex-col items-center">
                          <div className="relative h-[68px] w-[68px] flex items-center justify-center mb-2">
                             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#16a34a" strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 - (264 * (categoryScores.speed / 5))} strokeLinecap="round" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="font-extrabold text-slate-900">{categoryScores.speed.toFixed(1)}</span>
                             </div>
                          </div>
                          <span className="text-xs font-bold text-slate-900">Speed</span>
                      </div>
                      
                      {/* Behavior */}
                      <div className="flex flex-col items-center">
                          <div className="relative h-[68px] w-[68px] flex items-center justify-center mb-2">
                             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#16a34a" strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 - (264 * (categoryScores.behavior / 5))} strokeLinecap="round" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="font-extrabold text-slate-900">{categoryScores.behavior.toFixed(1)}</span>
                             </div>
                          </div>
                          <span className="text-xs font-bold text-slate-900">Behavior</span>
                      </div>

                      {/* Hygiene */}
                      <div className="flex flex-col items-center">
                          <div className="relative h-[68px] w-[68px] flex items-center justify-center mb-2">
                             <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#16a34a" strokeWidth="8" strokeDasharray="264" strokeDashoffset={264 - (264 * (categoryScores.hygiene / 5))} strokeLinecap="round" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center">
                                 <span className="font-extrabold text-slate-900">{categoryScores.hygiene.toFixed(1)}</span>
                             </div>
                          </div>
                          <span className="text-xs font-bold text-slate-900">Hygiene</span>
                      </div>
                  </CardContent>
              </Card>

              {/* Recent Highlights */}
              <Card className="shadow-none border-slate-100 rounded-3xl">
                  <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                      <MessageSquare className="h-4 w-4 text-emerald-600" />
                      <h2 className="text-sm font-bold text-slate-900">Recent Highlights</h2>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-0 flex flex-col gap-5">
                      <div className="flex gap-3 items-center">
                          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0">
                              <ThumbsUp className="h-5 w-5 text-emerald-600 fill-emerald-600" />
                          </div>
                          <div>
                              <div className="font-bold text-slate-900 text-xs mb-0.5">On-time deliveries</div>
                              <div className="text-[11px] font-medium text-slate-500">Mentioned in 92 reviews</div>
                          </div>
                      </div>
                      <div className="flex gap-3 items-center">
                          <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center flex-shrink-0">
                              <Heart className="h-5 w-5 text-rose-500 fill-rose-500" />
                          </div>
                          <div>
                              <div className="font-bold text-slate-900 text-xs mb-0.5">Polite & helpful</div>
                              <div className="text-[11px] font-medium text-slate-500">Mentioned in 87 reviews</div>
                          </div>
                      </div>
                      <div className="flex gap-3 items-center">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                              <Package className="h-5 w-5 text-slate-600" />
                          </div>
                          <div>
                              <div className="font-bold text-slate-900 text-xs mb-0.5">Order handled with care</div>
                              <div className="text-[11px] font-medium text-slate-500">Mentioned in 79 reviews</div>
                          </div>
                      </div>
                  </CardContent>
              </Card>

              {/* Your Progress */}
              <Card className="shadow-none border-slate-100 rounded-3xl overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-2 pb-2 pt-6 px-6">
                      <TrendingUp className="h-4 w-4 text-emerald-600" />
                      <h2 className="text-sm font-bold text-slate-900">Your Progress</h2>
                  </CardHeader>
                  <CardContent className="px-6 pb-6 pt-2">
                      <div className="h-[140px] -mx-2">
                          <ResponsiveContainer width="100%" height="100%">
                              <AreaChart data={progressData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                  <defs>
                                      <linearGradient id="colorRating" x1="0" y1="0" x2="0" y2="1">
                                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                      </linearGradient>
                                  </defs>
                                  <Tooltip 
                                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', fontWeight: 'bold', fontSize: '12px' }}
                                      itemStyle={{ color: '#0f172a' }}
                                  />
                                  <XAxis 
                                      dataKey="name" 
                                      axisLine={false} 
                                      tickLine={false} 
                                      tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} 
                                      dy={5}
                                  />
                                  {/* YAxis omitted to match design simplicity, relying on shape */}
                                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRating)" activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
                              </AreaChart>
                          </ResponsiveContainer>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                          <div>
                              <div className="text-xs font-medium text-slate-500 mb-0.5">Your rating has improved by</div>
                              <div className="font-extrabold text-emerald-600 text-2xl flex items-baseline gap-1">
                                  +{ratingImprovement} <span className="text-[11px] text-slate-400 font-medium">this month</span>
                              </div>
                          </div>
                          <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center">
                              <TrendingUp className="h-5 w-5 text-emerald-600" />
                          </div>
                      </div>
                  </CardContent>
              </Card>

              {/* Tips to Improve */}
              <Card className="shadow-none border-slate-100 rounded-3xl flex flex-col relative overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-2 pb-4 pt-6 px-6">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <h2 className="text-sm font-bold text-slate-900">Tips to Improve</h2>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-6 relative z-10 pt-0 px-6 pb-32">
                      <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <ThumbsUp className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                              <div className="font-bold text-xs text-slate-900 mb-0.5">Keep up the great work!</div>
                              <div className="text-[11px] text-slate-500 font-medium">Your ratings are excellent</div>
                          </div>
                      </div>
                      <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Clock className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                              <div className="font-bold text-xs text-slate-900 mb-0.5">Maintain on-time deliveries</div>
                              <div className="text-[11px] text-slate-500 font-medium">Customers appreciate punctuality</div>
                          </div>
                      </div>
                      <div className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <MessageSquare className="h-4 w-4 text-emerald-600" />
                          </div>
                          <div>
                              <div className="font-bold text-xs text-slate-900 mb-0.5">Stay polite and helpful</div>
                              <div className="text-[11px] text-slate-500 font-medium">It makes a big difference</div>
                          </div>
                      </div>
                  </CardContent>
                  
                  {/* Illustration at bottom right */}
                  <div className="absolute bottom-0 right-4 w-32 md:w-36 flex flex-col justify-end pointer-events-none opacity-90">
                      <Image 
                          src="/delivery/delivery-person-green.webp" 
                          alt="Delivery partner" 
                          width={144} 
                          height={144} 
                          className="object-contain"
                      />
                  </div>
              </Card>

          </div>
      </div>

    </div>
  )
}
