"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Ticket, Loader2, CheckCircle2, Clock, AlertCircle, X,
  ChevronRight, HelpCircle, Package, ChefHat,
  Truck, UploadCloud, ShieldCheck, Timer,
  ThumbsUp, MessageSquare, Mail,
  Navigation, UserCheck, ClipboardList, Wheat, Settings,
  RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload"

interface TicketMessage {
  id: string
  senderId: string | null
  message: string
  mediaUrls: string[]
  createdAt: string
}

interface SupportTicket {
  id: string
  userId: string
  orderId: string | null
  subject: string
  description: string
  status: "OPEN" | "INPROGRESS" | "RESOLVED" | "CLOSED"
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
  category: string
  createdAt: string
  updatedAt: string
  messages: TicketMessage[]
}

const ticketFormSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject too long"),
  description: z.string().min(10, "Please provide at least 10 characters").max(2000, "Description too long"),
  orderId: z.string().max(100, "Order ID too long").optional(),
})

type TicketForm = z.infer<typeof ticketFormSchema>

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  OPEN: { label: "OPEN", color: "text-blue-600 bg-blue-50 border-blue-200", icon: AlertCircle },
  INPROGRESS: { label: "IN PROGRESS", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock },
  RESOLVED: { label: "RESOLVED", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
  CLOSED: { label: "CLOSED", color: "text-gray-600 bg-gray-50 border-gray-200", icon: CheckCircle2 },
}

const priorityColors: Record<string, string> = {
  LOW: "text-green-600",
  MEDIUM: "text-amber-600",
  HIGH: "text-red-500",
  URGENT: "text-red-700 font-bold",
}

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const

const categories = [
  { id: "kitchen", label: "Kitchen Issue", desc: "Setup, profile, equipment", icon: ChefHat, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "menu", label: "Menu Related", desc: "Menu items, pricing, photos", icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50" },
  { id: "order", label: "Order Related", desc: "Order issues, modifications", icon: Package, color: "text-purple-600", bg: "bg-purple-50" },
  { id: "delivery-partner", label: "Delivery Partner", desc: "Rider assignment, delays", icon: Truck, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "ingredient", label: "Ingredient Issue", desc: "Stock, quality, supply", icon: Wheat, color: "text-green-600", bg: "bg-green-50" },
  { id: "equipment", label: "Equipment Issue", desc: "Utensils, appliances, setup", icon: Settings, color: "text-red-500", bg: "bg-red-50" },
  { id: "payment", label: "Payment Issue", desc: "Settlements, payouts", icon: Navigation, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "other", label: "Other", desc: "Other queries", icon: HelpCircle, color: "text-orange-500", bg: "bg-orange-50" },
]

export default function SupportPageClient() {
  const queryClient = useQueryClient()

  const [selectedCategory, setSelectedCategory] = useState("")
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("All")
  const [showCategoryGrid, setShowCategoryGrid] = useState(true)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketForm>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: { subject: "", description: "", orderId: "" },
  })

  const { data: tickets = [], isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ["kitchen-support-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/support")
      if (!res.ok) throw new Error("Failed to fetch tickets")
      return res.json() as Promise<SupportTicket[]>
    },
    refetchInterval: 15_000,
    staleTime: 15_000,
    refetchOnWindowFocus: false,
  })

  const filteredTickets = tickets.filter(t => {
    if (activeTab === "All") return true
    if (activeTab === "Open") return t.status === "OPEN"
    if (activeTab === "In Progress") return t.status === "INPROGRESS"
    if (activeTab === "Resolved") return t.status === "RESOLVED"
    if (activeTab === "Closed") return t.status === "CLOSED"
    return true
  })

  const createMutation = useMutation({
    mutationFn: async (data: TicketForm & { category: string; priority: string; mediaUrls: string[] }) => {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create ticket" }))
        throw new Error(err.error || "Failed to create ticket")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-support-tickets"] })
      toast.success("Support ticket created successfully!")
      setSelectedCategory("")
      setPriority("MEDIUM")
      setUploadedImages([])
      reset()
      setActiveTab("Open")
      setShowCategoryGrid(true)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create ticket")
    },
  })

  const onSubmit = (formData: TicketForm) => {
    if (!selectedCategory) { toast.error("Please select a category"); return }
    createMutation.mutate({ ...formData, category: selectedCategory, priority, mediaUrls: uploadedImages })
  }

  const handleReset = () => {
    reset()
    setSelectedCategory("")
    setUploadedImages([])
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-red-100 bg-red-50 p-8 text-center">
          <p className="text-sm font-bold text-red-700">Failed to load support tickets</p>
          <p className="text-xs text-red-500 mt-1">Please refresh the page or try again later.</p>
        </div>
      </div>
    )
  }

  if (isLoading || isFetching) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        {/* Header card */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <Skeleton className="h-16 w-16 rounded-full shrink-0" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-48 rounded" />
              <Skeleton className="h-4 w-72 max-w-full rounded" />
            </div>
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </div>

        {/* Category grid */}
        <div>
          <Skeleton className="h-5 w-44 mb-3" />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl border border-gray-100 bg-white space-y-2">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form skeleton */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <Skeleton className="h-6 w-44 mb-4 px-1" />
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex-1 flex flex-col p-5 sm:p-6 space-y-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3.5 w-24" />
                  <Skeleton className="h-11 w-full rounded-xl" />
                </div>
              ))}
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
              <Skeleton className="h-20 w-full rounded-xl" />
              <div className="flex gap-3 pt-4 mt-auto">
                <Skeleton className="h-11 w-24 rounded-xl" />
                <Skeleton className="h-11 flex-1 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Right column skeleton */}
          <div className="lg:col-span-7 flex flex-col space-y-6">
            <div>
              <Skeleton className="h-6 w-36 mb-4 px-1" />
              <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
                <div className="px-4 sm:px-6 pt-4 border-b border-gray-100 flex gap-4 sm:gap-6 overflow-x-auto">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-5 w-20 shrink-0 py-3" />
                  ))}
                </div>
                <div className="p-4 sm:p-6 space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="rounded-xl border border-gray-100 p-4">
                      <div className="flex gap-3 sm:gap-4">
                        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <Skeleton className="h-4 w-40" />
                            <Skeleton className="h-5 w-20 rounded-full" />
                          </div>
                          <Skeleton className="h-3 w-48" />
                          <Skeleton className="h-3 w-full" />
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-3 w-28" />
                            <Skeleton className="h-4 w-4 rounded-full" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-gray-100 shadow-sm border-t-4 border-t-green-600 bg-white p-5 space-y-4">
                <Skeleton className="h-4 w-40" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <div className="space-y-1.5 flex-1">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-2.5 w-full" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-gray-100 shadow-sm bg-white p-5 space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-3 w-56" />
                </div>
                <Skeleton className="h-5 w-40" />
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2.5 w-36" />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm">
                    <Skeleton className="h-5 w-5 rounded-full" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-2.5 w-36" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F2F8F4] rounded-xl p-4 sm:p-5 border border-green-100/50">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2 sm:gap-3">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-2.5 w-14" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
        <div className="flex items-start gap-4">
          <div className="hidden sm:flex h-16 w-16 bg-green-50 rounded-full items-center justify-center shrink-0 border-[3px] border-white shadow-sm relative">
            <div className="absolute inset-0 rounded-full border-2 border-green-100 animate-pulse" />
            <MessageSquare className="h-7 w-7 text-green-600" />
            <div className="absolute top-1.5 right-1.5 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-gray-900">Support Center</h1>
            <p className="text-gray-500 text-sm mt-1">We&apos;re here to help! Raise a ticket and get the assistance you need.</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {showCategoryGrid && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-900">Choose a Category</h2>
            {selectedCategory && (
              <Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground" onClick={() => setSelectedCategory("")}>
                Clear
              </Button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {categories.map((cat) => {
              const Icon = cat.icon
              const isSelected = selectedCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center text-center p-3 sm:p-4 rounded-xl border transition-all duration-200 bg-white hover:shadow-sm group",
                    isSelected ? "border-primary shadow-sm ring-1 ring-primary" : "border-gray-100 hover:border-gray-200"
                  )}
                >
                  <div className={cn("h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center mb-2 transition-transform group-hover:scale-110", cat.bg)}>
                    <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5", cat.color)} />
                  </div>
                  <h3 className="font-semibold text-[11px] sm:text-xs text-gray-900 leading-tight">{cat.label}</h3>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        <div className="lg:col-span-5 flex flex-col h-full">
          <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Raise a New Ticket</h2>
          <Card className="rounded-2xl border-gray-100 shadow-sm flex-1 flex flex-col">
            <CardContent className="p-5 sm:p-6 space-y-5 flex-1 flex flex-col">
              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center">Category <span className="text-red-500 ml-1">*</span></label>
                <Select value={selectedCategory} onValueChange={(val) => { setSelectedCategory(val); setShowCategoryGrid(false) }}>
                  <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center">Subject <span className="text-red-500 ml-1">*</span></label>
                <Input {...register("subject")} placeholder="Briefly describe your issue" className="rounded-xl border-gray-200 bg-gray-50/50" />
                {errors.subject && <p className="text-xs text-red-500 mt-1">{errors.subject.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center">Order ID <span className="text-gray-400 ml-1 font-normal">(Optional)</span></label>
                <Input {...register("orderId")} placeholder="Enter order ID (e.g. #RRC123456)" className="rounded-xl border-gray-200 bg-gray-50/50" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center">Priority <span className="text-red-500 ml-1">*</span></label>
                <Select value={priority} onValueChange={(val) => setPriority(val as "LOW" | "MEDIUM" | "HIGH" | "URGENT")}>
                  <SelectTrigger className="rounded-xl border-gray-200 bg-gray-50/50">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex-1 flex flex-col">
                <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center">Description <span className="text-red-500 ml-1">*</span></label>
                <Textarea {...register("description")} placeholder="Please describe your issue in detail..." className="rounded-xl border-gray-200 bg-gray-50/50 resize-none flex-1 min-h-25" />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center">Attach Images <span className="text-gray-400 ml-1 font-normal">(Optional)</span></label>
                <CloudinaryUpload onUpload={(result) => setUploadedImages((prev) => [...prev, result.secure_url])}>
                  {({ uploading, startUpload }) => (
                    <div onClick={startUpload} role="button" tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startUpload() } }}
                      className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 p-3 sm:p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                      <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                        {uploading ? <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 animate-spin" /> : <UploadCloud className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-green-700"><span className="underline">Click to upload</span> or drag & drop</p>
                        <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, JPEG up to 5MB</p>
                      </div>
                    </div>
                  )}
                </CloudinaryUpload>
                {uploadedImages.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {uploadedImages.map((url, i) => (
                      <div key={i} className="relative h-14 w-14 rounded-lg overflow-hidden border border-gray-200 group">
                        <Image src={url} alt={`Upload ${i}`} fill className="object-cover" sizes="56px" />
                        <button type="button" onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                          className="absolute top-0 right-0 h-5 w-5 bg-black/60 flex items-center justify-center rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        ><X className="h-3 w-3 text-white" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4 mt-auto">
                <Button type="button" variant="outline" className="w-24 rounded-xl border-gray-200 text-gray-600 font-semibold" onClick={handleReset}>
                  Reset
                </Button>
                <Button type="button" onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending} className="flex-1 rounded-xl bg-[#F05522] hover:bg-[#D94819] text-white font-semibold">
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Navigation className="h-4 w-4 mr-2 -rotate-45" />}
                  Submit Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-7 flex flex-col space-y-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">My Tickets</h2>
            <Card className="rounded-2xl border-gray-100 shadow-sm bg-white overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="px-4 sm:px-6 pt-4 border-b border-gray-100 overflow-x-auto">
                  <TabsList className="w-max h-auto p-0 bg-transparent flex gap-4 sm:gap-6 border-none">
                    {["All", "Open", "In Progress", "Resolved", "Closed"].map((tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="rounded-none px-0 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-700 text-gray-500 font-medium text-sm transition-none whitespace-nowrap"
                      >
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                <TabsContent value={activeTab} className="p-4 sm:p-6 m-0 space-y-3 max-h-125 overflow-y-auto">
                  {filteredTickets.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <Ticket className="h-12 w-12 text-gray-200 mb-3" />
                      <p className="text-gray-500 text-sm">No tickets found for this status.</p>
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const statusInfo = statusConfig[ticket.status] || statusConfig.OPEN
                      const catInfo = categories.find((c) => c.id === ticket.category) || categories[0]
                      const CatIcon = catInfo.icon

                      return (
                        <Link href={`/support?ticket=${ticket.id}`} key={ticket.id} className="block group">
                          <div className="rounded-xl border border-gray-100 p-4 transition-all hover:border-gray-300 hover:shadow-sm bg-white">
                            <div className="flex gap-3 sm:gap-4">
                              <div className={cn("h-10 w-10 sm:h-12 sm:w-12 rounded-full flex items-center justify-center shrink-0", catInfo.bg)}>
                                <CatIcon className={cn("h-5 w-5 sm:h-6 sm:w-6", catInfo.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 mb-1">
                                  <h3 className="font-bold text-sm text-gray-900 truncate pr-2">{ticket.subject}</h3>
                                  <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 border w-fit shrink-0", statusInfo.color)}>
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-xs text-gray-500 mb-2 gap-2 flex-wrap">
                                  {ticket.orderId && <span>Order ID: {ticket.orderId}</span>}
                                  {ticket.orderId && <span className="hidden sm:inline">•</span>}
                                  <span>{new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-1 mb-2">{ticket.description}</p>
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-medium text-gray-400">
                                    Priority: <span className={priorityColors[ticket.priority]}>{ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}</span>
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      )
                    })
                  )}
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="rounded-xl border-gray-100 shadow-sm border-t-4 border-t-green-600 bg-white">
              <CardContent className="p-4 sm:p-5">
                <h3 className="font-bold text-gray-900 mb-4 text-sm">How to Use Support</h3>
                <div className="space-y-4 relative before:absolute before:inset-0 before:ml-3.25 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  <div className="relative flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0 font-bold text-[10px] shadow-sm z-10">1</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900">Choose a Category</h4>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">Select the category that best matches your issue.</p>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0 font-bold text-[10px] shadow-sm z-10">2</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900">Describe Your Issue</h4>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">Provide a clear subject and detailed description.</p>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0 font-bold text-[10px] shadow-sm z-10">3</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900">Attach Evidence</h4>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">Upload images if needed for faster resolution.</p>
                    </div>
                  </div>
                  <div className="relative flex items-start gap-3">
                    <div className="h-6 w-6 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0 font-bold text-[10px] shadow-sm z-10">4</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-gray-900">Submit Ticket</h4>
                      <p className="text-[11px] text-gray-500 leading-snug mt-0.5">Our team will review and respond to your ticket.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card className="rounded-xl border-gray-100 shadow-sm bg-white">
                <CardContent className="p-4 sm:p-5 flex items-start gap-3">
                  <Clock className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 mb-1">Support Hours</h4>
                    <p className="text-xs text-gray-500 font-medium">We&apos;re available 24/7</p>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Our support team typically responds within a few hours.</p>
                  </div>
                </CardContent>
              </Card>

              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm">Other Ways to Reach Us</h3>
                <div className="space-y-2">
                  <Link href="/support" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 transition-colors">
                    <MessageSquare className="h-5 w-5 text-gray-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">Live Chat</h4>
                      <p className="text-[11px] text-gray-500">Chat with our support team</p>
                    </div>
                  </Link>
                  <a href="mailto:support@rrckitchen.com" className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 transition-colors">
                    <Mail className="h-5 w-5 text-gray-400 shrink-0" />
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">Email Support</h4>
                      <p className="text-[11px] text-gray-500">support@rrckitchen.com</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F2F8F4] rounded-xl p-4 sm:p-5 border border-green-100/50">
            <div className="flex items-center gap-2 sm:gap-3">
              <ShieldCheck className="h-6 w-6 sm:h-7 sm:w-7 text-green-700 shrink-0" />
              <div>
                <h4 className="font-bold text-[11px] text-gray-900">Secure & Confidential</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Your info is safe.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Timer className="h-6 w-6 sm:h-7 sm:w-7 text-green-700 shrink-0" />
              <div>
                <h4 className="font-bold text-[11px] text-gray-900">Quick Resolution</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Fast issue resolution.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <UserCheck className="h-6 w-6 sm:h-7 sm:w-7 text-green-700 shrink-0" />
              <div>
                <h4 className="font-bold text-[11px] text-gray-900">Expert Support</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Trained support team.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <ThumbsUp className="h-6 w-6 sm:h-7 sm:w-7 text-green-700 shrink-0" />
              <div>
                <h4 className="font-bold text-[11px] text-gray-900">Customer First</h4>
                <p className="text-[10px] text-gray-500 mt-0.5">Your satisfaction first.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
