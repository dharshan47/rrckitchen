"use client"

import { useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useKitchenDashboardData } from "@/stores/kitchenDashboardStore"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { getRrcKitchenReview, submitRrcKitchenReview } from "@/actions/kitchen/rrc-review"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Star, MessageSquare, Users, ShieldCheck, RefreshCw, ChefHat, 
  Package, Search, ChevronDown, CheckCircle2, 
  Calendar, UtensilsCrossed, AlertTriangle, ArrowUpRight,
  ChevronLeft, ChevronRight, Loader2, Send, ThumbsUp, ThumbsDown
} from "lucide-react"

const PAGE_SIZE = 5

type RrcReview = NonNullable<Awaited<ReturnType<typeof getRrcKitchenReview>>>

function RrcKitchenReviewCard({ initial }: { initial: RrcReview | null }) {
  const queryClient = useQueryClient()
  const [rating, setRating] = useState(initial?.rating ?? 0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState(initial?.comment ?? "")
  const [recommend, setRecommend] = useState<boolean | null>(initial?.recommendation ?? null)

  const rrcMutation = useMutation({
    mutationFn: submitRrcKitchenReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["rrc-kitchen-review"] })
      toast.success("Thank you for rating RRC Kitchen!")
    },
    onError: () => toast.error("Failed to submit review. Please try again."),
  })

  return (
    <Card className="rounded-2xl border-none shadow-sm overflow-hidden">
      <div className="bg-gradient-to-br from-[#FFF7ED] via-white to-[#F0FDF4] p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-10">
          {/* Brand */}
          <div className="flex items-center gap-4 shrink-0">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FF6B00] to-[#FF8A3D] flex items-center justify-center shrink-0 shadow-sm">
              <Star className="h-7 w-7 text-white" fill="white" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">
                Rate <span className="text-[#FF6B00]">RRC</span> <span className="text-[#10B981]">Kitchen</span>
              </h2>
              <p className="text-[12px] text-gray-600 font-medium mt-0.5">Share your experience working with RRC Kitchen as a partner</p>
            </div>
          </div>

          {/* Star picker + comment */}
          <div className="flex-1 flex flex-col xl:flex-row xl:items-center gap-5 xl:gap-8 w-full">
            <div className="flex items-center gap-4 shrink-0">
              <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
                    onMouseEnter={() => setHoverRating(i)}
                    onClick={() => setRating(i)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`h-9 w-9 transition-colors ${
                        i <= (hoverRating || rating) ? "fill-[#FF9800] text-[#FF9800]" : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[14px] font-bold text-gray-800 w-10">{rating ? `${rating}/5` : "0/5"}</span>
            </div>

            <div className="flex-1 w-full">
              <Textarea
                placeholder={initial ? "Update your feedback about RRC Kitchen..." : "Tell us about your experience with RRC Kitchen (optional)..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={2}
                className="bg-white border-gray-200 rounded-xl text-[13px] font-medium placeholder:text-gray-400 focus-visible:ring-1 focus-visible:ring-[#FF6B00] resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row xl:flex-col items-stretch sm:items-center xl:items-stretch gap-3 shrink-0">
            <Button
              onClick={() => rrcMutation.mutate({ rating, recommendation: recommend, comment: comment || null })}
              disabled={!rating || rrcMutation.isPending}
              className="h-11 px-6 rounded-xl bg-[#FF6B00] hover:bg-[#E65E00] text-white font-bold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {rrcMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {initial ? "Update Review" : "Submit Review"}
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                type="button"
                className={`h-9 px-3 rounded-lg text-[11px] font-bold border transition-all ${
                  recommend === true ? "bg-green-50 border-green-200 text-green-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setRecommend(recommend === true ? null : true)}
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1.5" /> Recommend
              </Button>
              <Button
                variant="outline"
                type="button"
                className={`h-9 px-3 rounded-lg text-[11px] font-bold border transition-all ${
                  recommend === false ? "bg-red-50 border-red-200 text-red-600" : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setRecommend(recommend === false ? null : false)}
              >
                <ThumbsDown className="h-3.5 w-3.5 mr-1.5" /> Not Yet
              </Button>
            </div>
          </div>
        </div>

        {initial && (
          <div className="mt-5 pt-5 border-t border-gray-200/70 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
            <p className="text-[12px] font-medium text-gray-600">
              You rated RRC Kitchen <span className="font-bold text-gray-900">{initial.rating}/5</span> on{" "}
              <span className="font-bold text-gray-900">
                {new Date(initial.updatedAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
              {initial.recommendation === true && " · You recommend RRC Kitchen to other partners"}
              {initial.recommendation === false && " · You would not recommend RRC Kitchen yet"}
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}

const TABS = [
  { id: "overview", label: "Overview", icon: Star },
  { id: "all", label: "All Reviews", icon: MessageSquare },
  { id: "food", label: "Food Reviews", icon: UtensilsCrossed },
  { id: "packaging", label: "Packaging Reviews", icon: Package },
  { id: "kitchen", label: "Kitchen Reviews", icon: ChefHat },
] as const

export default function ReviewsPageClient() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("overview")
  const [search, setSearch] = useState("")
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent")
  const [dateFilter, setDateFilter] = useState<"all" | "week" | "month">("all")
  const [page, setPage] = useState(1)

  const data = useKitchenDashboardData()

  const reviews = useMemo(() => data?.reviews ?? [], [data])

  const { data: rrcReview, isLoading: rrcReviewLoading } = useQuery({
    queryKey: ["rrc-kitchen-review"],
    queryFn: async () => getRrcKitchenReview(),
    refetchOnWindowFocus: false,
  })

  const dateRange = useMemo(() => {
    if (reviews.length === 0) return "No reviews yet"
    const dates = reviews.map(r => new Date(r.createdAt))
    const min = new Date(Math.min(...dates.map(d => d.getTime())))
    const max = new Date(Math.max(...dates.map(d => d.getTime())))
    return `${min.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })} - ${max.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}`
  }, [reviews])

  const reviewsThisWeek = useMemo(() => {
    const now = new Date()
    const start = new Date(now)
    start.setHours(0, 0, 0, 0)
    start.setDate(now.getDate() - now.getDay())
    return reviews.filter(r => new Date(r.createdAt) >= start).length
  }, [reviews])

  const commentsCount = useMemo(() => reviews.filter(r => r.comment).length, [reviews])

  const filteredReviews = useMemo(() => {
    let list = reviews
    if (activeTab === "food") list = list.filter(r => r.tasteRating != null)
    if (activeTab === "packaging") list = list.filter(r => r.packagingRating != null)
    if (activeTab === "kitchen") list = list.filter(r => r.portionSizeRating != null)
    if (ratingFilter != null) list = list.filter(r => Math.round(r.rating) === ratingFilter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(r =>
        (r.customerName?.toLowerCase().includes(q) ?? false) ||
        (r.comment?.toLowerCase().includes(q) ?? false) ||
        (r.itemName?.toLowerCase().includes(q) ?? false)
      )
    }
    const now = new Date()
    const startOfWeek = new Date(now)
    startOfWeek.setHours(0, 0, 0, 0)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    if (dateFilter === "week") list = list.filter(r => new Date(r.createdAt) >= startOfWeek)
    if (dateFilter === "month") list = list.filter(r => new Date(r.createdAt) >= startOfMonth)
    const sorted = [...list]
    if (sortBy === "highest") sorted.sort((a, b) => b.rating - a.rating)
    else if (sortBy === "lowest") sorted.sort((a, b) => a.rating - b.rating)
    else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return sorted
  }, [reviews, activeTab, ratingFilter, search, dateFilter, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageReviews = filteredReviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const resetPage = (fn: () => void) => {
    setPage(1)
    fn()
  }

  const topComments = useMemo(() => {
    return filteredReviews
      .filter(r => r.comment && r.comment.length > 10)
      .slice(0, 3)
  }, [filteredReviews])

  if (!data) {
    return (
      <div className="space-y-6 pb-20 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-xl" />
            <div>
              <Skeleton className="h-8 w-56 rounded" />
              <Skeleton className="h-5 w-72 rounded mt-1" />
            </div>
          </div>
          <Skeleton className="h-11 w-56 rounded-xl" />
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto pb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-32 shrink-0" />
          ))}
        </div>

        {/* Summary cards */}
        <div className="flex overflow-x-auto pb-4 lg:pb-0 lg:grid lg:grid-cols-5 gap-4 hide-scrollbar snap-x">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white shadow-sm min-w-[220px] lg:min-w-0 snap-start shrink-0 p-5 flex flex-col items-center justify-center text-center space-y-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-16" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>

        {/* Analytics grid */}
        <div className="grid gap-6 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
              <Skeleton className="h-5 w-40" />
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-2 flex-1 rounded-full" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* List + sidebar */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
            <div className="pb-4 pt-6 px-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Skeleton className="h-5 w-40" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-[200px] rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
                <Skeleton className="h-9 w-28 rounded-lg" />
              </div>
            </div>
            <div className="divide-y divide-gray-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                  <div className="w-[120px] shrink-0 flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3.5 w-16" />
                      <Skeleton className="h-3 w-14" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-24" />
                      <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-5 w-32 rounded-full" />
                  </div>
                  <div className="w-full sm:w-[160px] shrink-0 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-3 sm:gap-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-2.5 w-14" />
                      </div>
                    </div>
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between p-6 border-t border-gray-50">
              <Skeleton className="h-3.5 w-48" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 space-y-4">
            <Skeleton className="h-5 w-36" />
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-5 w-5 rounded-full" />
                <Skeleton className="h-4 flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const k = data.kitchen
  
  const totalReviews = reviews.length
  const avgRating = k.avgRating || 0

  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  let tasteSum = 0, packSum = 0, portionSum = 0
  let tasteCount = 0, packCount = 0, portionCount = 0

  reviews.forEach(r => {
    const rounded = Math.round(r.rating)
    if (rounded >= 1 && rounded <= 5) {
      starCounts[rounded as 1|2|3|4|5]++
    }
    if (r.tasteRating) { tasteSum += r.tasteRating; tasteCount++ }
    if (r.packagingRating) { packSum += r.packagingRating; packCount++ }
    if (r.portionSizeRating) { portionSum += r.portionSizeRating; portionCount++ }
  })

  const avgTaste = tasteCount ? (tasteSum / tasteCount).toFixed(1) : avgRating.toFixed(1)
  const avgPack = packCount ? (packSum / packCount).toFixed(1) : avgRating.toFixed(1)
  const avgPortion = portionCount ? (portionSum / portionCount).toFixed(1) : avgRating.toFixed(1)

  const renderStars = (rating: number, size = "h-3.5 w-3.5") => {
    const full = Math.floor(rating)
    const half = rating - full >= 0.25 && rating - full < 0.75
    const rounded = rating - full >= 0.75 ? full + 1 : full
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`${size} ${
              i <= rounded ? "fill-[#FF9800] text-[#FF9800]" :
              i - 0.5 <= rating || half ? "fill-[#FF9800] text-[#FF9800] opacity-50" :
              "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
        <div className="flex items-center gap-3">
          <Star className="h-8 w-8 text-[#FF6B00] hidden sm:block" />
          <div>
            <h1 className="text-[24px] font-bold text-gray-900 tracking-tight flex items-center gap-2">
              Ratings & Reviews <Star className="h-6 w-6 text-[#FF6B00] sm:hidden" />
            </h1>
            <p className="text-[14px] text-gray-500 font-medium mt-0.5">View and manage all your ratings and reviews</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 border-gray-200 text-gray-700 bg-white hover:bg-gray-50 rounded-xl h-11 px-4 shadow-sm font-medium transition-colors">
              <Calendar className="h-4 w-4 text-gray-500" />
              {dateFilter === "week" ? "This Week" : dateFilter === "month" ? "This Month" : dateRange}
              <ChevronDown className="h-4 w-4 ml-1 text-gray-400" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => resetPage(() => setDateFilter("all"))}>All Time</DropdownMenuItem>
            <DropdownMenuItem onClick={() => resetPage(() => setDateFilter("month"))}>This Month</DropdownMenuItem>
            <DropdownMenuItem onClick={() => resetPage(() => setDateFilter("week"))}>This Week</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Rate RRC Kitchen */}
      {!rrcReviewLoading && <RrcKitchenReviewCard initial={rrcReview ?? null} />}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto hide-scrollbar">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => resetPage(() => setActiveTab(tab.id))}
            className={`text-[13px] font-bold border-b-2 pb-3 flex items-center gap-2 shrink-0 transition-colors ${
              activeTab === tab.id ? "text-green-700 border-green-600" : "text-gray-500 hover:text-gray-900 border-transparent"
            }`}
          >
            <tab.icon className="h-4 w-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Top Summary Cards (Horizontal scroll on mobile) */}
      <div className="flex overflow-x-auto pb-4 lg:pb-0 lg:grid lg:grid-cols-5 gap-4 hide-scrollbar snap-x">
        {/* Overall Rating */}
        <Card className="rounded-2xl border-none shadow-sm min-w-[240px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-center">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-green-50 flex items-center justify-center shrink-0">
              <Star className="h-7 w-7 text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">Overall Rating</span>
              <div className="flex items-end gap-2 mt-0.5">
                <span className="text-[26px] font-bold text-gray-900 leading-none">{avgRating.toFixed(1)}</span>
                {renderStars(avgRating)}
              </div>
              <span className="text-[11px] text-gray-500 font-medium mt-1">Based on {totalReviews} {totalReviews === 1 ? "review" : "reviews"}</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card className="rounded-2xl border-none shadow-sm min-w-[220px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-center">
          <CardContent className="p-5 flex flex-col justify-center text-center items-center h-full">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5 text-blue-500" />
              <span className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">Total Reviews</span>
            </div>
            <div className="text-[26px] font-bold text-gray-900 leading-none mb-1">{totalReviews}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-green-600">
              <ArrowUpRight className="h-3 w-3" /> {reviewsThisWeek} <span className="text-gray-400 font-medium normal-case">this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="rounded-2xl border-none shadow-sm min-w-[220px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-center">
          <CardContent className="p-5 flex flex-col justify-center text-center items-center h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-purple-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">Total Customers</span>
            </div>
            <div className="text-[26px] font-bold text-gray-900 leading-none mb-1">{data.stats.customers}</div>
          </CardContent>
        </Card>

        {/* Reviews with Comments */}
        <Card className="rounded-2xl border-none shadow-sm min-w-[220px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-center">
          <CardContent className="p-5 flex flex-col justify-center text-center items-center h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">Reviews with Comments</span>
            </div>
            <div className="text-[26px] font-bold text-gray-900 leading-none mb-1">{commentsCount}</div>
          </CardContent>
        </Card>

        {/* Menu Items */}
        <Card className="rounded-2xl border-none shadow-sm min-w-[220px] lg:min-w-0 snap-start shrink-0 flex flex-col justify-center">
          <CardContent className="p-5 flex flex-col justify-center text-center items-center h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-orange-50 flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-orange-500" />
              </div>
              <span className="text-[11px] font-bold text-gray-500 tracking-wide uppercase">Menu Items</span>
            </div>
            <div className="text-[26px] font-bold text-gray-900 leading-none mb-1">{data.stats.menuItems}</div>
          </CardContent>
        </Card>
      </div>

      {/* Middle Section: Analytics Grid */}
      <div className="grid gap-6 xl:grid-cols-3">
        
        {/* Ratings Breakdown */}
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-[15px] font-bold text-gray-900">Ratings Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = starCounts[stars as 1|2|3|4|5]
              const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
              let color = "bg-green-600"
              if (stars === 4) color = "bg-green-400"
              if (stars === 3) color = "bg-yellow-500"
              if (stars === 2) color = "bg-orange-500"
              if (stars === 1) color = "bg-red-600"
              
              return (
                <button
                  key={stars}
                  type="button"
                  onClick={() => resetPage(() => setRatingFilter(ratingFilter === stars ? null : stars))}
                  className={`w-full flex items-center gap-3 text-[12px] font-bold rounded-lg px-1 py-0.5 transition-colors ${
                    ratingFilter === stars ? "bg-green-50" : "hover:bg-gray-50"
                  }`}
                >
                  <span className="w-12 text-gray-600 text-right">{stars} Stars</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${percentage}%` }} />
                  </div>
                  <span className="w-12 text-gray-600 text-right">{count} ({percentage}%)</span>
                </button>
              )
            })}
          </CardContent>
        </Card>

        {/* Category Ratings */}
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px] font-bold text-gray-900">Category Ratings</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded bg-green-50 flex items-center justify-center">
                  <UtensilsCrossed className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-bold text-gray-700">Food Quality</span>
              </div>
              <div className="flex items-center gap-2">
                {renderStars(Number(avgPortion), "h-3 w-3")}
                <span className="font-bold text-gray-900 w-6 text-right">{avgPortion}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded bg-orange-50 flex items-center justify-center">
                  <ChefHat className="h-4 w-4 text-orange-500" />
                </div>
                <span className="font-bold text-gray-700">Taste</span>
              </div>
              <div className="flex items-center gap-2">
                {renderStars(Number(avgTaste), "h-3 w-3")}
                <span className="font-bold text-gray-900 w-6 text-right">{avgTaste}</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-3">
                <div className="h-7 w-7 rounded bg-purple-50 flex items-center justify-center">
                  <Package className="h-4 w-4 text-purple-600" />
                </div>
                <span className="font-bold text-gray-700">Packaging</span>
              </div>
              <div className="flex items-center gap-2">
                {renderStars(Number(avgPack), "h-3 w-3")}
                <span className="font-bold text-gray-900 w-6 text-right">{avgPack}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Highlights */}
        <Card className="rounded-2xl border-none shadow-sm flex flex-col">
          <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-green-50 flex items-center justify-center">
              <Star className="h-3 w-3 text-green-600" />
            </div>
            <CardTitle className="text-[15px] font-bold text-gray-900">Recent Highlights</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-4">
              {topComments.length > 0 ? topComments.map((r) => (
                <div key={r.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                    <Star className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-[12px] font-bold text-gray-800 leading-snug">&quot;{r.comment}&quot;</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">- {r.customerName || "—"}</p>
                  </div>
                </div>
              )) : (
                <p className="text-[13px] text-gray-500 text-center py-4">No review comments yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: List & Right Sidebar */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px]">
        
        {/* Latest Reviews List */}
        <Card className="rounded-2xl border-none shadow-sm">
          <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-[16px] font-bold text-gray-900">Latest Reviews</CardTitle>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reviews..."
                  value={search}
                  onChange={(e) => resetPage(() => setSearch(e.target.value))}
                  className="pl-9 h-9 rounded-lg border-gray-200 text-[12px] w-full sm:w-[200px]"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 px-3 rounded-lg border-gray-200 text-gray-600 text-[12px] font-medium shrink-0">
                    {ratingFilter ? `${ratingFilter} Stars` : "All Ratings"} <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => resetPage(() => setRatingFilter(null))}>All Ratings</DropdownMenuItem>
                  {[5, 4, 3, 2, 1].map(s => (
                    <DropdownMenuItem key={s} onClick={() => resetPage(() => setRatingFilter(s))}>
                      {s} Star{s > 1 ? "s" : ""}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="h-9 px-3 rounded-lg border-gray-200 text-gray-600 text-[12px] font-medium shrink-0 hidden sm:flex">
                    {sortBy === "highest" ? "Highest Rated" : sortBy === "lowest" ? "Lowest Rated" : "Most Recent"} <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => resetPage(() => setSortBy("recent"))}>Most Recent</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => resetPage(() => setSortBy("highest"))}>Highest Rated</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => resetPage(() => setSortBy("lowest"))}>Lowest Rated</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {pageReviews.length === 0 ? (
              <div className="py-16 text-center text-gray-500 text-sm font-medium">No reviews found.</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {pageReviews.map((review, i) => {
                  const initial = (review.customerName || "—").charAt(0).toUpperCase()
                  const colors = ["bg-green-100 text-green-700", "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700", "bg-blue-100 text-blue-700", "bg-yellow-100 text-yellow-700"]
                  const avatarColor = colors[i % colors.length]
                  
                  return (
                    <div key={review.id} className="p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 hover:bg-gray-50/30 transition-colors">
                      {/* Left: Avatar & Name */}
                      <div className="w-[120px] shrink-0 flex items-start gap-3">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 ${avatarColor}`}>
                          {initial}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-bold text-gray-900 truncate max-w-[80px]">{review.customerName || "—"}</span>
                        </div>
                      </div>

                      {/* Middle: Review Content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-[12px] font-bold text-gray-900">{review.rating.toFixed(1)}</span>
                        </div>
                        <p className="text-[13px] font-medium text-gray-700 leading-relaxed">
                          {review.comment || "No comment provided."}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {review.tasteRating && <Badge variant="secondary" className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold border-0">Food Quality</Badge>}
                          {review.packagingRating && <Badge variant="secondary" className="px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold border-0">Packaging</Badge>}
                          {review.portionSizeRating && <Badge variant="secondary" className="px-2 py-0.5 rounded-full bg-[#FFF7ED] text-[#EA580C] text-[10px] font-bold border-0">Portion Size</Badge>}
                        </div>
                      </div>

                      {/* Right: Item details & Date */}
                      <div className="w-full sm:w-[160px] shrink-0 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-3 sm:gap-2">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                            <UtensilsCrossed className="h-4 w-4 text-gray-400" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-gray-900 line-clamp-1">{review.itemName || "—"}</span>
                            <span className="text-[10px] text-gray-500 font-medium">Menu Item</span>
                          </div>
                        </div>
                        <span className="text-[11px] text-gray-400 font-medium whitespace-nowrap">
                          {new Date(review.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            
            {/* Pagination */}
            {filteredReviews.length > 0 && (
              <div className="flex items-center justify-between p-6 border-t border-gray-50 flex-col sm:flex-row gap-4">
                <span className="text-[12px] font-medium text-gray-500">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredReviews.length)} of {filteredReviews.length} reviews
                </span>
                <div className="flex items-center gap-1.5">
                  <Button variant="outline" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      onClick={() => setPage(i + 1)}
                      className={`h-8 w-8 p-0 rounded-lg font-bold text-[12px] ${
                        currentPage === i + 1
                          ? "bg-[#166534] text-white hover:bg-[#14532D] hover:text-white"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button variant="outline" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-8 w-8 p-0 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* Rating Insights */}
          <Card className="rounded-2xl border-none shadow-sm">
            <CardHeader className="pb-4 pt-6 px-6 border-b border-gray-50">
              <CardTitle className="text-[15px] font-bold text-gray-900">Rating Insights</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {avgRating >= 4 && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-[12px] font-medium text-gray-600 leading-snug">Customers love your food quality — keep it up!</p>
                </div>
              )}
              {avgRating >= 3 && avgRating < 4 && (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] font-medium text-gray-600 leading-snug">Room for improvement in overall experience</p>
                </div>
              )}
              {avgRating < 3 && avgRating > 0 && (
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-[12px] font-medium text-gray-600 leading-snug">Focus on addressing customer feedback</p>
                </div>
              )}
              {avgPortion !== avgRating.toFixed(1) && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-[12px] font-medium text-gray-600 leading-snug">Food quality rating: {avgPortion}/5</p>
                </div>
              )}
              {avgPack !== avgRating.toFixed(1) && (
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <p className="text-[12px] font-medium text-gray-600 leading-snug">Packaging rating: {avgPack}/5</p>
                </div>
              )}
              {totalReviews === 0 && (
                <p className="text-[12px] text-gray-500 text-center py-2">No review data available yet.</p>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

    </div>
  )
}

