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
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { PieChart, Pie } from "recharts"
import { toast } from "sonner"
import { getRrcKitchenReview, submitRrcKitchenReview } from "@/actions/kitchen/rrc-review"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Star, MessageSquare, UsersRound, ShieldCheck, RefreshCw, ChefHat, 
  Package, Search, ChevronDown, CheckCircle2, 
  CalendarDays, UtensilsCrossed, TriangleAlert, ArrowUpRight,
  Loader2, Send, ThumbsUp, ThumbsDown,
  CookingPot, Utensils, Smile, ArrowRight, CircleCheck
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
    <Card className="rounded-[10px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden w-full">
      <div className="bg-gradient-to-br from-[#FFF7ED] via-white to-[#F0FDF4] p-6 sm:p-8">
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4 shrink-0">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#FF9800] to-[#FF8A3D] flex items-center justify-center shrink-0 shadow-sm">
              <Star className="h-7 w-7 text-white" fill="white" />
            </div>
            <div>
              <h2 className="text-[18px] font-bold text-[#111827] tracking-tight">
                Rate <span className="text-[#FF9800]">RRC</span> <span className="text-[#087A2B]">Kitchen</span>
              </h2>
              <p className="text-[12px] text-[#6B7280] font-medium mt-0.5">Share your experience working with RRC Kitchen as a partner</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-5 w-full">
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
                        i <= (hoverRating || rating) ? "fill-[#FF9800] text-[#FF9800]" : "fill-[#E5E7EB] text-[#E5E7EB]"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-[14px] font-bold text-[#111827] w-10">{rating ? `${rating}/5` : "0/5"}</span>
            </div>

            <div className="flex-1 w-full">
              <Textarea
                placeholder={initial ? "Update your feedback about RRC Kitchen..." : "Tell us about your experience with RRC Kitchen (optional)..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                className="bg-[#FFFFFF] border-[#E5E7EB] rounded-[8px] text-[13px] font-medium placeholder:text-[#9CA3AF] focus-visible:ring-1 focus-visible:ring-[#087A2B] resize-none w-full"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-3 shrink-0 w-full pt-2">
            <Button
              onClick={() => rrcMutation.mutate({ rating, recommendation: recommend, comment: comment || null })}
              disabled={!rating || rrcMutation.isPending}
              className="h-11 px-6 rounded-[8px] bg-[#087A2B] hover:bg-[#075F22] text-[#FFFFFF] font-bold shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto min-w-[160px]"
            >
              {rrcMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              {initial ? "Update Review" : "Submit Review"}
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                type="button"
                className={`flex-1 sm:flex-none h-9 px-3 rounded-[8px] text-[11px] font-bold border transition-all ${
                  recommend === true ? "bg-[#EAF6ED] border-[#087A2B] text-[#087A2B]" : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
                }`}
                onClick={() => setRecommend(recommend === true ? null : true)}
              >
                <ThumbsUp className="h-3.5 w-3.5 mr-1.5" /> Recommend
              </Button>
              <Button
                variant="outline"
                type="button"
                className={`flex-1 sm:flex-none h-9 px-3 rounded-[8px] text-[11px] font-bold border transition-all ${
                  recommend === false ? "bg-[#FFF0F0] border-[#EF4444] text-[#EF4444]" : "border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]"
                }`}
                onClick={() => setRecommend(recommend === false ? null : false)}
              >
                <ThumbsDown className="h-3.5 w-3.5 mr-1.5" /> Not Yet
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

const TABS = [
  { id: "overview", label: "Overview", icon: Star },
  { id: "rate", label: "Rate RRC Kitchen", icon: ThumbsUp },
  { id: "all", label: "All Reviews", icon: MessageSquare },
  { id: "food", label: "Food Reviews", icon: Utensils },
  { id: "packaging", label: "Packaging Reviews", icon: Package },
  { id: "kitchen", label: "Kitchen Reviews", icon: ChefHat },
] as const

const CHART_CONFIG = {
  Food: { label: "Food", color: "#087A2B" },
  Packaging: { label: "Packaging", color: "#FF5A1F" },
  Kitchen: { label: "Kitchen", color: "#8B5CF6" },
  Delivery: { label: "Delivery", color: "#2196F3" },
}

export default function ReviewsPageClient() {
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]["id"]>("overview")
  const [search, setSearch] = useState("")
  const [ratingFilter, setRatingFilter] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent")
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [datePickerOpen, setDatePickerOpen] = useState(false)
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

  const filteredReviews = useMemo(() => {
    let list = reviews
    if (activeTab === "food") list = list.filter(r => r.tasteRating != null)
    if (activeTab === "packaging") list = list.filter(r => r.packagingRating != null)
    if (activeTab === "kitchen") list = list.filter(r => r.portionSizeRating != null)
    if (ratingFilter != null) list = list.filter(r => Math.round(r.rating) === ratingFilter)
    if (selectedDate) {
      const target = selectedDate.toDateString()
      list = list.filter(r => new Date(r.createdAt).toDateString() === target)
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(r =>
        (r.customerName?.toLowerCase().includes(q) ?? false) ||
        (r.comment?.toLowerCase().includes(q) ?? false) ||
        (r.itemName?.toLowerCase().includes(q) ?? false)
      )
    }
    const sorted = [...list]
    if (sortBy === "highest") sorted.sort((a, b) => b.rating - a.rating)
    else if (sortBy === "lowest") sorted.sort((a, b) => a.rating - b.rating)
    else sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    return sorted
  }, [reviews, activeTab, ratingFilter, search, sortBy, selectedDate])

  const totalPages = Math.max(1, Math.ceil(filteredReviews.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageReviews = filteredReviews.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)

  const resetPage = (fn: () => void) => {
    setPage(1)
    fn()
  }

  if (!data) {
    return (
      <div className="space-y-6 pb-20 animate-in fade-in duration-500">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-11 w-56 rounded-xl" />
        </div>
        <Skeleton className="h-14 w-full" />
        <div className="grid lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-[10px]" />)}
        </div>
        <div className="grid xl:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-64 rounded-[10px]" />)}
        </div>
        <div className="grid lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_360px] gap-6">
          <Skeleton className="h-96 rounded-[10px]" />
          <Skeleton className="h-96 rounded-[10px]" />
        </div>
      </div>
    )
  }

  const k = data.kitchen
  const avgRating = k.avgRating
  const totalReviews = k.totalReviews ?? reviews.length

  const totalCustomers = data.stats?.customers ?? 0

  const starCounts = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => Math.round(r.rating) === star).length
    return { stars: star, count, pct: reviews.length > 0 ? Math.round((count / reviews.length) * 100) : 0 }
  })

  const avgOf = (vals: (number | null | undefined)[]) => {
    const nums = vals.filter((v): v is number => typeof v === "number")
    if (nums.length === 0) return null
    return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10
  }

  const categoryRatings = [
    { label: "Food Quality", icon: Utensils, iconBg: "bg-[#EAF6ED]", iconColor: "text-[#087A2B]", score: avgOf(reviews.map((r) => r.rating)) },
    { label: "Taste", icon: CookingPot, iconBg: "bg-[#FFF3E5]", iconColor: "text-[#FF9800]", score: avgOf(reviews.map((r) => r.tasteRating)) },
    { label: "Packaging", icon: Package, iconBg: "bg-[#F3EDFF]", iconColor: "text-[#8B5CF6]", score: avgOf(reviews.map((r) => r.packagingRating)) },
    { label: "Portion Size", icon: UtensilsCrossed, iconBg: "bg-[#EAF4FF]", iconColor: "text-[#2196F3]", score: avgOf(reviews.map((r) => r.portionSizeRating)) },
  ]

  const chartCounts = [
    { label: "Food Quality", key: "rating" as const, color: "bg-[#087A2B]" },
    { label: "Packaging", key: "packagingRating" as const, color: "bg-[#FF5A1F]" },
    { label: "Taste", key: "tasteRating" as const, color: "bg-[#8B5CF6]" },
    { label: "Portion Size", key: "portionSizeRating" as const, color: "bg-[#2196F3]" },
  ]
  const chartTotal = chartCounts.reduce((sum, c) => sum + reviews.filter((r) => r[c.key] != null).length, 0) || 1
  const chartData = chartCounts.map((c) => ({
    name: c.label,
    value: reviews.filter((r) => r[c.key] != null).length,
    fill: c.color,
  }))
  const chartPct = (count: number) => `${Math.round((count / chartTotal) * 100)}%`

  const highlights = reviews
    .filter((r) => r.comment)
    .slice(0, 3)
    .map((r, idx) => ({
      comment: r.comment,
      user: r.customerName || "Customer",
      icon: [Smile, Package, ChefHat][idx % 3],
      color: ["text-[#087A2B]", "text-[#FF6B00]", "text-[#8B5CF6]"][idx % 3],
      bg: ["bg-[#EAF6ED]", "bg-[#FFF1E8]", "bg-[#F3EDFF]"][idx % 3],
    }))

  const renderStars = (rating: number, size = "h-[14px] w-[14px]") => {
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
              "fill-[#E5E7EB] text-[#E5E7EB]"
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500 bg-[#FEFEFE] font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-2">
        <div className="flex items-start gap-3">
          <Star className="h-8 w-8 text-[#FF9800] hidden sm:block mt-0.5" strokeWidth={1.8} />
          <div>
            <h1 className="text-[28px] font-bold text-[#111827] tracking-tight flex items-center gap-2">
              Ratings & Reviews <Star className="h-6 w-6 text-[#FF9800] sm:hidden" strokeWidth={1.8} />
            </h1>
            <p className="text-[14px] text-[#6B7280] font-medium mt-0.5">View and manage all your ratings and reviews</p>
          </div>
        </div>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2 border-[#E5E7EB] text-[#374151] bg-[#FFFFFF] hover:bg-[#F9FAFB] rounded-[8px] h-10 px-4 shadow-none font-medium transition-colors w-full sm:w-auto justify-center sm:justify-start">
              <CalendarDays className="h-[18px] w-[18px] text-[#374151]" strokeWidth={1.8} />
              {selectedDate
                ? selectedDate.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                : dateRange}
              <ChevronDown className="h-4 w-4 ml-1 text-[#6B7280]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0 rounded-[8px] border-[#E5E7EB]">
            <Calendar
              mode="single"
              selected={selectedDate ?? undefined}
              onSelect={(d) => {
                resetPage(() => {
                  setSelectedDate(d ?? null)
                  setDatePickerOpen(false)
                })
              }}
            />
            <div className="border-t border-[#EEF0F2] p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-[#087A2B] font-semibold"
                onClick={() =>
                  resetPage(() => {
                    setSelectedDate(null)
                    setDatePickerOpen(false)
                  })
                }
              >
                All Time
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val: string) => resetPage(() => setActiveTab(val as (typeof TABS)[number]["id"]))} className="w-full">
        <ScrollArea className="w-full border-b border-[#EEF0F2]">
          <TabsList className="flex items-center justify-start gap-8 w-max pb-0 bg-transparent h-auto p-0 rounded-none border-none">
            {TABS.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={`flex items-center gap-2 pb-3.5 pt-0 px-0 rounded-none border-0 border-b-[2px] whitespace-nowrap text-[14px] font-semibold transition-colors shadow-none bg-transparent outline-none focus-visible:ring-0 focus:outline-none data-[state=active]:shadow-none ${
                  activeTab === tab.id 
                    ? "border-b-[#087A2B] text-[#087A2B]" 
                    : "border-b-transparent text-[#374151] hover:text-[#087A2B]"
                }`}
              >
                <tab.icon className={`h-[18px] w-[18px] ${activeTab === tab.id ? 'text-[#087A2B]' : 'text-[#374151]'}`} strokeWidth={1.8} />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          <ScrollBar orientation="horizontal" className="hidden" />
        </ScrollArea>
      </Tabs>

      {activeTab === "rate" ? (
        <div className="pt-8 pb-12 w-full max-w-5xl mx-auto flex justify-center">
          <div className="w-full">
            {!rrcReviewLoading ? (
              <RrcKitchenReviewCard initial={rrcReview ?? null} />
            ) : (
              <Skeleton className="h-[200px] w-full rounded-[10px]" />
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Top Summary Cards */}
          <div className="flex overflow-x-auto pb-4 xl:pb-0 xl:grid xl:grid-cols-5 gap-4 hide-scrollbar snap-x">
        
        {/* Overall Rating */}
        <Card className="rounded-[10px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)] min-w-[240px] xl:min-w-0 snap-start shrink-0">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-[52px] w-[52px] rounded-full bg-[#EAF6ED] flex items-center justify-center shrink-0">
              <Star className="h-[24px] w-[24px] text-[#087A2B]" strokeWidth={1.8} />
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-bold text-[#111827]">Overall Rating</span>
              <div className="flex items-end gap-2 mt-1">
                <span className="text-[24px] font-bold text-[#111827] leading-none">{avgRating ?? "New"}</span>
                {avgRating != null && renderStars(avgRating, "h-[14px] w-[14px]")}
              </div>
              <span className="text-[11px] text-[#6B7280] mt-1">Based on {totalReviews} reviews</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Reviews */}
        <Card className="rounded-[10px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)] min-w-[200px] xl:min-w-0 snap-start shrink-0">
          <CardContent className="p-5 flex flex-col justify-center text-center items-center h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-[#EAF4FF] flex items-center justify-center">
                <MessageSquare className="h-4 w-4 text-[#2196F3]" strokeWidth={1.8} />
              </div>
              <span className="text-[12px] font-bold text-[#111827]">Total Reviews</span>
            </div>
            <div className="text-[24px] font-bold text-[#111827] leading-none mb-1">{reviews.length}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#087A2B]">
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} /> {filteredReviews.length} <span className="text-[#6B7280] font-normal">matching filters</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="rounded-[10px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)] min-w-[200px] xl:min-w-0 snap-start shrink-0">
          <CardContent className="p-5 flex flex-col justify-center text-center items-center h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-[#F3EDFF] flex items-center justify-center">
                <UsersRound className="h-4 w-4 text-[#8B5CF6]" strokeWidth={1.8} />
              </div>
              <span className="text-[12px] font-bold text-[#111827]">Total Customers</span>
            </div>
            <div className="text-[24px] font-bold text-[#111827] leading-none mb-1">{totalCustomers.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#087A2B]">
              <ArrowUpRight className="h-3 w-3" strokeWidth={2.5} /> {reviews.length} <span className="text-[#6B7280] font-normal">total reviews</span>
            </div>
          </CardContent>
        </Card>

        {/* Response Rate */}
        <Card className="rounded-[10px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)] min-w-[200px] xl:min-w-0 snap-start shrink-0">
          <CardContent className="p-5 flex flex-col justify-center text-center items-center h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-[#EAF6ED] flex items-center justify-center">
                <ShieldCheck className="h-4 w-4 text-[#087A2B]" strokeWidth={1.8} />
              </div>
              <span className="text-[12px] font-bold text-[#111827]">Response Rate</span>
            </div>
            <div className="text-[24px] font-bold text-[#111827] leading-none mb-1">—</div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#6B7280]">
              <span className="text-[#6B7280] font-normal">Reply to reviews to see insights</span>
            </div>
          </CardContent>
        </Card>

        {/* Repeat Customers */}
        <Card className="rounded-[10px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)] min-w-[200px] xl:min-w-0 snap-start shrink-0">
          <CardContent className="p-5 flex flex-col justify-center text-center items-center h-full">
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-[#FFF1E8] flex items-center justify-center">
                <RefreshCw className="h-4 w-4 text-[#FF6B00]" strokeWidth={1.8} />
              </div>
              <span className="text-[12px] font-bold text-[#111827]">Repeat Customers</span>
            </div>
            <div className="text-[24px] font-bold text-[#111827] leading-none mb-1">
              {data.stats?.repeatCustomers != null && data.stats.repeatCustomers > 0
                ? `${Math.round((data.stats.repeatCustomers / (totalCustomers || 1)) * 100)}%`
                : "—"}
            </div>
            <div className="flex items-center gap-1 text-[11px] font-bold text-[#6B7280]">
              <span className="text-[#6B7280] font-normal">{data.stats?.repeatCustomers ?? 0} customers reordered</span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Ratings Breakdown */}
        <Card className="rounded-[10px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardHeader className="pb-4 pt-6 px-6">
            <CardTitle className="text-[15px] font-bold text-[#111827]">Ratings Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            {starCounts.map((row) => (
              <div key={row.stars} className="w-full flex items-center gap-3 text-[13px] font-bold">
                <span className="w-14 text-[#374151]">{row.stars} Stars</span>
                <Progress value={row.pct} className={`h-1.5 flex-1 bg-[#EEF0F2] [&>div]:${row.stars >= 4 ? "bg-[#087A2B]" : row.stars === 3 ? "bg-[#FF9800]" : "bg-[#EF4444]"}`} />
                <span className="w-[60px] text-[#374151] text-right">{row.count} ({row.pct}%)</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Category Ratings */}
        <Card className="rounded-[10px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center justify-between">
            <CardTitle className="text-[15px] font-bold text-[#111827]">Category Ratings</CardTitle>
            <Button variant="link" className="h-auto p-0 text-[#087A2B] font-semibold text-[13px]" onClick={() => document.getElementById("latest-reviews")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
              View Details
            </Button>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            {categoryRatings.map((cat) => (
              <div key={cat.label} className="flex items-center justify-between text-[13px]">
                <div className="flex items-center gap-3">
                  <div className={`h-8 w-8 rounded-[8px] flex items-center justify-center ${cat.iconBg}`}>
                    <cat.icon className={`h-4 w-4 ${cat.iconColor}`} strokeWidth={1.8} />
                  </div>
                  <span className="font-bold text-[#374151]">{cat.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {cat.score != null ? (
                    <>
                      {renderStars(cat.score, "h-[14px] w-[14px]")}
                      <span className="font-bold text-[#374151] w-6 text-right">{cat.score}</span>
                    </>
                  ) : (
                    <span className="text-[12px] text-[#9CA3AF] font-medium">No ratings</span>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Highlights */}
        <Card className="rounded-[10px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex flex-col lg:col-span-2 xl:col-span-1">
          <CardHeader className="pb-4 pt-6 px-6 flex flex-row items-center gap-2">
            <div className="h-6 w-6 rounded-[6px] bg-[#EAF6ED] flex items-center justify-center">
              <Star className="h-3.5 w-3.5 text-[#087A2B]" strokeWidth={1.8} />
            </div>
            <CardTitle className="text-[15px] font-bold text-[#111827]">Recent Highlights</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 flex-1 flex flex-col justify-between space-y-4">
            <div className="space-y-5">
              {highlights.length > 0 ? (
                highlights.map((highlight, idx) => (
                  <div key={idx} className="flex gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${highlight.bg}`}>
                      <highlight.icon className={`h-5 w-5 ${highlight.color}`} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#374151] leading-relaxed">{highlight.comment}</p>
                      <p className="text-[11px] text-[#6B7280] mt-0.5">- {highlight.user}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-[13px] text-[#6B7280] text-center py-4">No reviews with comments yet</p>
              )}
            </div>
            <Button className="w-full bg-[#F3FAF5] hover:bg-[#EAF6ED] text-[#087A2B] font-semibold h-11 rounded-[8px] mt-4 shadow-none transition-colors" onClick={() => resetPage(() => setActiveTab("all"))}>
              View All Reviews <ArrowRight className="h-4 w-4 ml-1.5" strokeWidth={2} />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section: List & Right Sidebar */}
      <div className="grid gap-6 grid-cols-1 xl:grid-cols-[1fr_320px] 2xl:grid-cols-[1fr_360px]">
        
        {/* Latest Reviews List */}
        <Card className="rounded-[10px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
          <CardHeader className="pb-4 pt-6 px-6 border-b border-[#EEF0F2] flex flex-col sm:flex-row sm:items-center justify-between gap-4" id="latest-reviews">
            <CardTitle className="text-[16px] font-bold text-[#111827]">Latest Reviews</CardTitle>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
                <Input
                  placeholder="Search reviews..."
                  value={search}
                  onChange={(e) => resetPage(() => setSearch(e.target.value))}
                  className="pl-9 h-10 rounded-[8px] border-[#E5E7EB] bg-[#FFFFFF] text-[13px] w-full sm:w-[220px] focus-visible:ring-[#087A2B]"
                />
              </div>
              <div className="flex items-center gap-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10 px-3 rounded-[8px] border-[#E5E7EB] text-[#374151] text-[13px] font-medium shrink-0 flex-1 sm:flex-none shadow-none hover:bg-[#F9FAFB]">
                      {ratingFilter ? `${ratingFilter} Stars` : "All Ratings"} <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-[8px]">
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
                    <Button variant="outline" className="h-10 px-3 rounded-[8px] border-[#E5E7EB] text-[#374151] text-[13px] font-medium shrink-0 flex-1 sm:flex-none shadow-none hover:bg-[#F9FAFB]">
                      {sortBy === "highest" ? "Highest Rated" : sortBy === "lowest" ? "Lowest Rated" : "Most Recent"} <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-[8px]">
                    <DropdownMenuItem onClick={() => resetPage(() => setSortBy("recent"))}>Most Recent</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => resetPage(() => setSortBy("highest"))}>Highest Rated</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => resetPage(() => setSortBy("lowest"))}>Lowest Rated</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-[#EEF0F2]">
              {pageReviews.length > 0 ? (
                pageReviews.map((review) => (
                  <div key={review.id} className="p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 hover:bg-[#F9FAFB] transition-colors relative">
                    
                    {/* Left: Avatar & Name */}
                    <div className="w-full sm:w-[130px] shrink-0 flex items-center sm:items-start gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-[14px] shrink-0 bg-[#EAF6ED] text-[#087A2B]`}>
                        {(review.customerName || "C").charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col min-w-0 pt-0.5">
                        <span className="text-[13px] font-bold text-[#111827] truncate">{review.customerName || "Customer"}</span>
                        <div className="flex items-center gap-1 mt-0.5 bg-[#EAF6ED] text-[#087A2B] px-1.5 py-0.5 rounded-full w-max">
                          <CheckCircle2 className="h-2.5 w-2.5" />
                          <span className="text-[9px] font-bold uppercase tracking-wide">Verified</span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Review Content */}
                    <div className="flex-1 space-y-2.5">
                      <div className="flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-[13px] font-bold text-[#111827]">{review.rating.toFixed(1)}</span>
                      </div>
                      <p className="text-[13px] font-medium text-[#374151] leading-relaxed">
                        {review.comment || "No comment provided."}
                      </p>
                      {(review.tasteRating != null || review.packagingRating != null || review.portionSizeRating != null) && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {review.tasteRating != null && (
                            <Badge variant="secondary" className="px-2.5 py-0.5 rounded-[999px] bg-[#EAF6ED] text-[#087A2B] text-[11px] font-semibold border border-transparent hover:bg-[#EAF6ED] shadow-none">
                              Taste {review.tasteRating}
                            </Badge>
                          )}
                          {review.packagingRating != null && (
                            <Badge variant="secondary" className="px-2.5 py-0.5 rounded-[999px] bg-[#F3EDFF] text-[#8B5CF6] text-[11px] font-semibold border border-transparent hover:bg-[#F3EDFF] shadow-none">
                              Packaging {review.packagingRating}
                            </Badge>
                          )}
                          {review.portionSizeRating != null && (
                            <Badge variant="secondary" className="px-2.5 py-0.5 rounded-[999px] bg-[#EAF4FF] text-[#2196F3] text-[11px] font-semibold border border-transparent hover:bg-[#EAF4FF] shadow-none">
                              Portion {review.portionSizeRating}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Item details & Date */}
                    <div className="w-full sm:w-[180px] shrink-0 flex sm:flex-col justify-between sm:justify-start items-center sm:items-end gap-3 sm:gap-2 pr-6 sm:pr-8">
                      <div className="flex items-center gap-3 w-full sm:justify-end">
                        <div className="h-10 w-10 rounded-[8px] bg-[#F3F4F6] flex items-center justify-center overflow-hidden shrink-0 border border-[#E5E7EB]">
                          <UtensilsCrossed className="h-4 w-4 text-[#9CA3AF]" />
                        </div>
                        <div className="flex flex-col min-w-0 text-left sm:text-right">
                          <span className="text-[13px] font-bold text-[#111827] truncate w-[100px]">{review.itemName || "—"}</span>
                          <span className="text-[11px] text-[#6B7280] font-medium">Order Item</span>
                        </div>
                      </div>
                      <span className="text-[12px] text-[#6B7280] font-medium whitespace-nowrap mt-1">
                        {new Date(review.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center">
                  <MessageSquare className="h-12 w-12 text-[#D1D5DB] mb-3" />
                  <p className="text-[14px] font-semibold text-[#374151]">No reviews found</p>
                  <p className="text-[12px] text-[#9CA3AF] mt-1">Try adjusting your search or filters</p>
                </div>
              )}
            </div>
            
            {/* Pagination */}
            {filteredReviews.length > 0 && (
            <div className="flex items-center justify-between p-6 border-t border-[#EEF0F2] flex-col sm:flex-row gap-4">
              <span className="text-[13px] font-medium text-[#6B7280] text-center sm:text-left">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, filteredReviews.length)} of {filteredReviews.length} reviews
              </span>
              <Pagination className="justify-end w-auto mx-0">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setPage((p) => p - 1)
                      }}
                      className={`h-8 px-2.5 rounded-[6px] border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] shadow-none ${currentPage === 1 ? "opacity-50 pointer-events-none" : ""}`}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setPage(i + 1)
                        }}
                        isActive={currentPage === i + 1}
                        className={`h-8 w-8 rounded-[6px] border ${
                          currentPage === i + 1
                            ? "bg-[#087A2B] text-white hover:bg-[#075F22] hover:text-white border-0 shadow-none"
                            : "border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] shadow-none"
                        }`}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setPage((p) => p + 1)
                      }}
                      className={`h-8 px-2.5 rounded-[6px] border border-[#E5E7EB] text-[#374151] hover:bg-[#F9FAFB] shadow-none ${currentPage === totalPages ? "opacity-50 pointer-events-none" : ""}`}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
            )}
          </CardContent>
        </Card>

        {/* Right Sidebar */}
        <div className="space-y-6">
          
          {/* Review Summary Chart */}
          <Card className="rounded-[10px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-[15px] font-bold text-[#111827]">Review Summary by Category</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 flex flex-col sm:flex-row xl:flex-col items-center gap-6">
              <div className="h-[160px] w-[160px] shrink-0">
                <ChartContainer config={CHART_CONFIG} className="h-full w-full">
                  <PieChart>
                    <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                    <Pie
                      data={chartData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={75}
                      strokeWidth={0}
                    />
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="flex flex-col gap-3 w-full sm:w-auto xl:w-full">
                {chartData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full shrink-0`} style={{ backgroundColor: item.fill }} />
                      <span className="text-[13px] font-medium text-[#374151]">{item.name}</span>
                    </div>
                    <span className="text-[13px] font-bold text-[#111827]">{chartPct(item.value)}</span>
                  </div>
                ))}
                {chartData.every((d) => d.value === 0) && (
                  <p className="text-[12px] text-[#9CA3AF] text-center py-2">No category ratings yet</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tips to Improve */}
          <Card className="rounded-[10px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
            <CardHeader className="pb-4 pt-6 px-6">
              <CardTitle className="text-[15px] font-bold text-[#111827]">Tips to Improve</CardTitle>
            </CardHeader>
            <CardContent className="px-6 pb-6 space-y-5">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CircleCheck className="h-4 w-4 text-[#087A2B] shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[13px] font-medium text-[#374151]">Most customers love your food quality</p>
                </div>
                <div className="flex items-start gap-3">
                  <TriangleAlert className="h-4 w-4 text-[#FF9800] shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[13px] font-medium text-[#374151]">Focus on delivery speed improvement</p>
                </div>
                <div className="flex items-start gap-3">
                  <CircleCheck className="h-4 w-4 text-[#087A2B] shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[13px] font-medium text-[#374151]">Maintain packaging quality</p>
                </div>
                <div className="flex items-start gap-3">
                  <CircleCheck className="h-4 w-4 text-[#087A2B] shrink-0 mt-0.5" strokeWidth={2} />
                  <p className="text-[13px] font-medium text-[#374151]">Keep up the good hygiene standards</p>
                </div>
              </div>
              <Button className="w-full bg-[#F3FAF5] hover:bg-[#EAF6ED] text-[#087A2B] font-semibold h-11 rounded-[8px] mt-2 shadow-none transition-colors" onClick={() => document.getElementById("latest-reviews")?.scrollIntoView({ behavior: "smooth", block: "start" })}>
                View Detailed Analytics <ArrowRight className="h-4 w-4 ml-1.5" strokeWidth={2} />
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
        </>
      )}
    </div>
  )
}
