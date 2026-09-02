"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  useDeliverySupportTickets, useDeliveryActions,
  type DeliverySupportTicket,
} from "@/stores/deliveryDashboardStore"
import {
  Ticket, CircleCheck, Clock3, ShieldCheck, Headphones, CalendarDays, Bike, UserRound, WalletCards, MapPin, Wrench, ShieldAlert, Timer, MoreHorizontal, Pencil, ClipboardList, ChevronRight, MessageCircle, Phone, Share2, CircleHelp, BookOpen, FileText, Shield, Clipboard, LifeBuoy, UsersRound, LockKeyhole, Loader2, CloudUpload, RotateCcw, Send, RefreshCw, X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { CloudinaryUpload } from "@/components/cloudinary/cloudinary-upload"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { LiveChatWidget } from "@/components/chat/live-chat-widget"

interface UploadedImage {
  secure_url: string
  public_id: string
}

const ticketFormSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject too long"),
  description: z.string().min(10, "Please provide at least 10 characters").max(2000, "Description too long"),
  orderId: z.string().max(100, "Order ID too long").optional(),
})

type TicketForm = z.infer<typeof ticketFormSchema>

const categories = [
  { id: "delivery-issue", label: "Delivery Issue", icon: Bike, color: "text-[#0D6C2B]", bg: "bg-[#EFF7F0]" },
  { id: "customer-order", label: "Order & Customer", icon: UserRound, color: "text-[#5A46B8]", bg: "bg-[#F3F1FC]" },
  { id: "payment", label: "Earnings & Payout", icon: WalletCards, color: "text-[#0D6C2B]", bg: "bg-[#EEF7F0]" },
  { id: "navigation", label: "Navigation Problem", icon: MapPin, color: "text-[#2C4EB4]", bg: "bg-[#EEF2FC]" },
  { id: "vehicle", label: "Vehicle Issue", icon: Wrench, color: "text-[#FA4A05]", bg: "bg-[#FFF1E9]" },
  { id: "account", label: "Account Verification", icon: ShieldCheck, color: "text-[#128D87]", bg: "bg-[#E9F6F5]" },
  { id: "safety", label: "Safety & Security", icon: ShieldAlert, color: "text-[#E9232B]", bg: "bg-[#FFF0F1]" },
  { id: "kitchen-partner", label: "Pickup Delay", icon: Timer, color: "text-[#F59A23]", bg: "bg-[#FFF6E9]" },
  { id: "other", label: "Other Issue", icon: MoreHorizontal, color: "text-[#30343B]", bg: "bg-[#F3F4F6]" },
]

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

const getTicketColorConfig = (ticket: DeliverySupportTicket) => {
  if (ticket.category === "delivery-issue" || ticket.priority === "HIGH" || ticket.priority === "URGENT") {
    return { iconColor: "text-[#FA4A05]", iconBg: "bg-[#FFF1E9]" }
  } else if (ticket.category === "payment" || ticket.status === "RESOLVED" || ticket.status === "CLOSED") {
    return { iconColor: "text-[#0D6C2B]", iconBg: "bg-[#EAF5EC]" }
  } else {
    return { iconColor: "text-[#2C4EB4]", iconBg: "bg-[#EEF2FC]" }
  }
}

const getStatusConfig = (status: string) => {
   if (status === "OPEN") return { label: "Open", dot: "bg-[#2C4EB4]", text: "text-[#2C4EB4]" }
   if (status === "INPROGRESS") return { label: "In Progress", dot: "bg-[#FA4A05]", text: "text-[#E85A16]" }
   if (status === "RESOLVED" || status === "CLOSED") return { label: "Resolved", dot: "bg-[#0D6C2B]", text: "text-[#0D6C2B]" }
   return { label: status, dot: "bg-[#747780]", text: "text-[#747780]" }
}

const getPriorityConfig = (priority: string) => {
   if (priority === "HIGH" || priority === "URGENT") return { label: "High", text: "text-[#E9232B]", bg: "bg-[#FFF0F1]" }
   if (priority === "MEDIUM") return { label: "Medium", text: "text-[#E85A16]", bg: "bg-[#FFF1E9]" } // Using orange tint for Medium
   return { label: "Low", text: "text-[#2C4EB4]", bg: "bg-[#EEF2FC]" }
}

export default function SupportPageClient() {
  const queryClient = useQueryClient()

  const [selectedCategory, setSelectedCategory] = useState("")
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM")
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [activeTab, setActiveTab] = useState("All")

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketForm>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: { subject: "", description: "", orderId: "" },
  })

  const { data: queryTickets = [], isLoading } = useQuery({
    queryKey: ["delivery-support-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/support")
      if (!res.ok) throw new Error("Failed to fetch tickets")
      return res.json() as Promise<DeliverySupportTicket[]>
    },
    refetchInterval: 30_000,
  })

  const supportTickets = useDeliverySupportTickets()
  const { setSupportTickets } = useDeliveryActions()

  useEffect(() => {
    if (queryTickets.length > 0) setSupportTickets(queryTickets)
  }, [queryTickets, setSupportTickets])

  const tickets = supportTickets ?? queryTickets

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const openTickets = tickets.filter((t) => t.status === "OPEN" || t.status === "URGENT").length
  const resolvedTickets = tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length
  const todayTickets = tickets.filter((t) => new Date(t.createdAt) >= todayStart).length
  const resolutionRate = tickets.length > 0 ? Math.round((resolvedTickets / tickets.length) * 100) : 0

  const kpiCards = [
    { title: "Open Tickets", value: String(openTickets), sub: "View open tickets →", subColor: "text-[#FA4A05]", icon: Ticket, iColor: "text-[#0D6C2B]", iBg: "bg-[#EAF5EC]" },
    { title: "Resolved Tickets", value: String(resolvedTickets), sub: "All time", subColor: "text-[#747780]", icon: CircleCheck, iColor: "text-[#FA4A05]", iBg: "bg-[#FFF1E9]" },
    { title: "Avg Response Time", value: "—", sub: "Not tracked yet", subColor: "text-[#747780]", icon: Clock3, iColor: "text-[#5A46B8]", iBg: "bg-[#F2F0FC]" },
    { title: "Resolution Rate", value: `${resolutionRate}%`, sub: "All time", subColor: "text-[#747780]", icon: ShieldCheck, iColor: "text-[#0D6C2B]", iBg: "bg-[#EAF5EC]" },
    { title: "Support Status", value: "Online", sub: "We're available", subColor: "text-[#0D6C2B]", icon: Headphones, iColor: "text-[#2C4EB4]", iBg: "bg-[#EEF2FC]" },
    { title: "Today's Tickets", value: String(todayTickets), sub: "Created today", subColor: "text-[#747780]", icon: CalendarDays, iColor: "text-[#FA4A05]", iBg: "bg-[#FFF1E9]" },
  ]

  const filteredTickets = tickets.filter(t => {
    if (activeTab === "All") return true
    if (activeTab === "Open") return t.status === "OPEN"
    if (activeTab === "In Progress") return t.status === "INPROGRESS"
    if (activeTab === "Waiting for Reply") return t.status === "OPEN"
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
      queryClient.invalidateQueries({ queryKey: ["delivery-support-tickets"] })
      toast.success("Support ticket created successfully!")
      setSelectedCategory("")
      setPriority("MEDIUM")
      setUploadedImages([])
      reset()
      setActiveTab("Open")
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create ticket")
    },
  })

  const onSubmit = (formData: TicketForm) => {
    if (!selectedCategory) { toast.error("Please select a category"); return }
    createMutation.mutate({
      ...formData,
      category: selectedCategory,
      priority,
      mediaUrls: uploadedImages.map((img) => img.secure_url),
    })
  }

  const handleReset = () => {
    reset()
    setSelectedCategory("")
    setUploadedImages([])
  }

  if (isLoading) {
    return (
      <div className="bg-[#FAFAFA] min-h-screen" role="status" aria-label="Loading support">
        <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-[52px] w-[52px] rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-44" />
              <Skeleton className="h-3.5 w-96 max-w-full" />
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-[#FFFFFF] border-[#EDEEEF] rounded-[12px] shadow-none">
                <CardContent className="p-4 sm:p-5 flex items-start gap-4">
                  <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                  <div className="flex flex-col justify-center min-w-0 flex-1 gap-1.5">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-5 w-10" />
                    <Skeleton className="h-2.5 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Issue Categories */}
          <div className="flex flex-col gap-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-72" />
            </div>
            <div className="flex overflow-x-auto gap-3 pb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-[108px] w-[116px] rounded-[12px] shrink-0" />
              ))}
            </div>
          </div>

          {/* Main 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Raise a New Ticket */}
            <div className="lg:col-span-5 2xl:col-span-3 flex flex-col h-full space-y-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-40" />
              </div>
              <Card className="rounded-[14px] border-[#EDEEEF] bg-[#FFFFFF] shadow-none flex-1">
                <CardContent className="p-5 space-y-5">
                  <Skeleton className="h-[116px] w-full rounded-[12px]" />
                  <Skeleton className="h-[44px] w-full rounded-[8px]" />
                  <Skeleton className="h-[44px] w-full rounded-[8px]" />
                  <Skeleton className="h-[120px] w-full rounded-[8px]" />
                  <Skeleton className="h-10 w-full rounded-[8px]" />
                </CardContent>
              </Card>
            </div>

            {/* Center: My Tickets */}
            <div className="lg:col-span-7 2xl:col-span-6 flex flex-col h-full space-y-4 order-first lg:order-none">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Card className="rounded-[14px] border-[#EDEEEF] bg-[#FFFFFF] shadow-none flex-1 overflow-hidden">
                <div className="px-5 border-b border-[#F0F1F2] flex items-center justify-between">
                  <div className="flex items-center gap-7 overflow-hidden">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-4 w-20 my-4" />
                    ))}
                  </div>
                  <Skeleton className="h-3.5 w-24 hidden md:block" />
                </div>
                <div className="p-5 space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <div key={i} className="rounded-[10px] border border-[#EDEEEF] p-4">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-start gap-3.5 flex-1 min-w-0">
                          <Skeleton className="h-11 w-11 rounded-full shrink-0" />
                          <div className="flex flex-col gap-2 flex-1 min-w-0">
                            <Skeleton className="h-3 w-24" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-full" />
                          </div>
                        </div>
                        <Skeleton className="h-6 w-20 rounded-[6px]" />
                      </div>
                      <div className="flex items-center justify-between border-t border-[#F0F1F2] pt-3.5 mt-3.5">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-16 rounded-full" />
                          <Skeleton className="h-5 w-24 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right: Quick Help & Resources */}
            <div className="lg:col-span-12 2xl:col-span-3 flex flex-col md:flex-row 2xl:flex-col gap-6">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="flex flex-col space-y-4 flex-1">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Card className="rounded-[14px] border-[#EDEEEF] bg-[#FFFFFF] shadow-none">
                    <CardContent className="p-2.5 space-y-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-3.5">
                            <Skeleton className="h-9 w-9 rounded-full" />
                            <div className="flex flex-col gap-1.5">
                              <Skeleton className="h-3 w-28" />
                              <Skeleton className="h-2.5 w-20" />
                            </div>
                          </div>
                          <Skeleton className="h-4 w-4" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#FAFAFA] min-h-screen font-sans text-[#252830] pb-12">
      <div className="max-w-[1440px] mx-auto p-4 sm:p-6 md:p-8 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-[52px] w-[52px] rounded-full bg-[#EAF5EC] flex items-center justify-center shrink-0 relative shadow-sm">
              <Headphones className="h-6 w-6 text-[#0D6C2B] absolute" strokeWidth={2.5} />
              <div className="absolute bottom-1 right-0.5 bg-[#EAF5EC] rounded-full p-0.5">
                 <MessageCircle className="h-3.5 w-3.5 text-[#0D6C2B] fill-[#EAF5EC]" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-[26px] font-[700] tracking-tight text-[#111318] leading-none">Support Center</h1>
              <p className="text-[#747780] text-[13px] mt-1.5 font-[500]">We&apos;re here to help you 24/7. Raise a ticket for any issue you face.</p>
            </div>
          </div>

        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-4">
          {kpiCards.map((kpi, i) => {
            const Icon = kpi.icon
            return (
              <Card key={i} className="bg-[#FFFFFF] border-[#EDEEEF] rounded-[12px] shadow-[0_2px_8px_rgba(16,24,40,0.025)] hover:shadow-[0_4px_14px_rgba(16,24,40,0.06)] transition-shadow">
                <CardContent className="p-4 sm:p-5 flex items-start gap-4 h-full">
                  <div className={cn("h-11 w-11 rounded-full flex items-center justify-center shrink-0", kpi.iBg)}>
                     <Icon className={cn("h-5 w-5", kpi.iColor)} strokeWidth={2} />
                  </div>
                  <div className="flex flex-col justify-center min-w-0">
                     <h3 className="text-[12px] font-[600] text-[#747780] mb-0.5 truncate">{kpi.title}</h3>
                     <div className="text-[20px] font-[700] text-[#111318] mb-1">{kpi.value}</div>
                     <div className={cn("text-[11px] font-[600]", kpi.subColor)}>{kpi.sub}</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Issue Categories */}
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-[16px] font-[700] text-[#111318]">What issue are you facing?</h2>
            <p className="text-[12px] text-[#747780] font-[500] mt-0.5">Choose a category to help us route your ticket faster</p>
          </div>
          <div className="flex overflow-x-auto gap-3 pb-2 no-scrollbar">
             {categories.map((cat) => {
                const Icon = cat.icon
                const isSelected = selectedCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "flex flex-col items-center justify-center text-center p-4 rounded-[12px] border transition-all duration-200 bg-[#FFFFFF] hover:shadow-[0_4px_14px_rgba(16,24,40,0.06)] shrink-0 w-[116px]",
                      isSelected ? "border-[#0D6C2B] shadow-sm ring-1 ring-[#0D6C2B]" : "border-[#EDEEEF] shadow-[0_2px_8px_rgba(16,24,40,0.025)]"
                    )}
                  >
                    <div className={cn("h-[44px] w-[44px] rounded-full flex items-center justify-center mb-3", cat.bg)}>
                      <Icon className={cn("h-5 w-5", cat.color)} strokeWidth={2} />
                    </div>
                    <h3 className="font-[700] text-[11px] text-[#252830] leading-tight px-1">{cat.label}</h3>
                  </button>
                )
             })}
          </div>
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: Raise a New Ticket */}
          <div className="lg:col-span-5 2xl:col-span-3 flex flex-col h-full space-y-4">
            <div className="flex items-center gap-2">
               <div className="h-6 w-6 rounded-full bg-[#EAF5EC] flex items-center justify-center">
                  <Pencil className="h-3 w-3 text-[#0D6C2B]" strokeWidth={2.5} />
               </div>
               <h2 className="text-[16px] font-[700] text-[#111318]">Raise a New Ticket</h2>
            </div>
            
            <Card className="rounded-[14px] border-[#EDEEEF] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(16,24,40,0.035)] flex-1">
              <CardContent className="p-5 flex flex-col h-full space-y-5">
                {/* Category */}
                <div>
                   <label className="text-[12px] font-[700] text-[#252830] mb-2 flex items-center">Category <span className="text-[#E9232B] ml-1">*</span></label>
                   <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="rounded-[8px] border-[#E5E7EA] bg-[#FFFFFF] text-[#252830] h-[42px] font-[500] shadow-sm">
                         <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                         {categories.map((c) => <SelectItem key={c.id} value={c.id} className="text-[13px] font-[500]">{c.label}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
                
                {/* Subject */}
                <div>
                   <label className="text-[12px] font-[700] text-[#252830] mb-2 flex items-center">Subject <span className="text-[#E9232B] ml-1">*</span></label>
                   <Input {...register("subject")} placeholder="Briefly describe your issue" className="rounded-[8px] border-[#E5E7EA] bg-[#FFFFFF] text-[#252830] placeholder:text-[#A4A7AE] h-[42px] font-[500] shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#0D6C2B] focus-visible:shadow-[0_0_0_3px_rgba(13,108,43,0.08)]" />
                   {errors.subject && <p className="text-[11px] text-[#E9232B] mt-1.5 font-[500]">{errors.subject.message}</p>}
                </div>
                
                {/* Order ID */}
                <div>
                   <label className="text-[12px] font-[700] text-[#252830] mb-2 flex items-center">Order ID <span className="text-[#747780] ml-1 font-[500]">(Optional)</span></label>
                   <Input {...register("orderId")} placeholder="Enter Order ID (e.g. #RRC123456)" className="rounded-[8px] border-[#E5E7EA] bg-[#FFFFFF] text-[#252830] placeholder:text-[#A4A7AE] h-[42px] font-[500] shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#0D6C2B] focus-visible:shadow-[0_0_0_3px_rgba(13,108,43,0.08)]" />
                </div>
                
                {/* Description */}
                <div className="flex-1 flex flex-col">
                   <label className="text-[12px] font-[700] text-[#252830] mb-2 flex items-center">Description <span className="text-[#E9232B] ml-1">*</span></label>
                   <Textarea {...register("description")} placeholder="Please describe your issue in detail..." className="rounded-[8px] border-[#E5E7EA] bg-[#FFFFFF] text-[#252830] placeholder:text-[#A4A7AE] resize-none flex-1 min-h-[120px] font-[500] shadow-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[#0D6C2B] focus-visible:shadow-[0_0_0_3px_rgba(13,108,43,0.08)]" />
                   {errors.description && <p className="text-[11px] text-[#E9232B] mt-1.5 font-[500]">{errors.description.message}</p>}
                </div>
                
                {/* Attachments */}
                <div>
                   <label className="text-[12px] font-[700] text-[#252830] mb-2 flex items-center">Attachments <span className="text-[#747780] ml-1 font-[500]">(Optional)</span></label>
                   <CloudinaryUpload onUpload={(res) => setUploadedImages(p => [...p, res])}>
                      {({ uploading, startUpload, cancelUpload }) => (
                         <div className="flex flex-wrap items-center gap-3">
                           <div onClick={startUpload} className="flex items-center gap-3 rounded-[8px] border border-dashed border-[#D8DDE2] bg-[#FFFFFF] p-3 cursor-pointer hover:bg-[#FAFAFA] transition-colors flex-1 shadow-sm min-w-[200px]">
                              <div className="h-[38px] w-[38px] rounded-full bg-[#EFF8F1] flex items-center justify-center shrink-0">
                                 {uploading ? <Loader2 className="h-4 w-4 text-[#0D6C2B] animate-spin" /> : <CloudUpload className="h-4 w-4 text-[#0D6C2B]" />}
                              </div>
                              <div className="flex flex-col">
                                 <span className="text-[11px] font-[700] text-[#252830]">Drag & drop files or<br/>click to upload</span>
                                 <span className="text-[9px] text-[#747780] font-[600] mt-0.5">PNG, JPG, JPEG up to 5MB</span>
                              </div>
                           </div>
                           
                           {uploading && (
                              <button type="button" onClick={cancelUpload} className="text-[11px] font-[700] text-[#E9232B] hover:underline shrink-0">Cancel</button>
                           )}
                           
                           {uploadedImages.length > 0 && uploadedImages.map((img, i) => (
                              <div key={img.public_id} className="relative h-[62px] w-[62px] rounded-[8px] overflow-hidden border border-[#D8DDE2] group shrink-0">
                                 <Image src={img.secure_url} alt={`Upload ${i}`} fill className="object-cover" sizes="62px" />
                                 <button type="button" onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                                   className="absolute top-0 right-0 h-5 w-5 bg-black/60 flex items-center justify-center rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                 ><X className="h-3 w-3 text-white" /></button>
                              </div>
                           ))}
                           
                           {uploadedImages.length > 0 && (
                             <div onClick={startUpload} className="h-[62px] w-[62px] rounded-[8px] border border-[#D8DDE2] bg-[#FFFFFF] flex items-center justify-center cursor-pointer hover:bg-[#FAFAFA] shrink-0">
                               <span className="text-[#A4A7AE] text-[20px] font-light">+</span>
                             </div>
                           )}
                         </div>
                      )}
                   </CloudinaryUpload>
                </div>
                
                {/* Buttons */}
                <div className="flex gap-3 pt-2 mt-auto">
                   <Button type="button" variant="outline" onClick={handleReset} className="w-24 h-[44px] rounded-[8px] border-[#E1E4E7] bg-[#FFFFFF] text-[#252830] font-[700] shadow-sm hover:bg-[#FAFAFA]">
                      <RotateCcw className="h-4 w-4 mr-1.5 text-[#454951]" strokeWidth={2.5} /> Reset
                   </Button>
                   <Button type="button" onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending} className="flex-1 h-[44px] rounded-[8px] bg-[#FA4A05] hover:bg-[#E84204] text-[#FFFFFF] font-[700] shadow-[0_2px_5px_rgba(250,74,5,0.12)] border-none">
                      {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" strokeWidth={2.5} />} Submit Ticket
                   </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Center: My Tickets */}
          <div className="lg:col-span-7 2xl:col-span-6 flex flex-col h-full space-y-4 order-first lg:order-none">
            <div className="flex items-center gap-2">
               <div className="h-6 w-6 rounded-full bg-[#EAF5EC] flex items-center justify-center">
                  <ClipboardList className="h-3 w-3 text-[#0D6C2B]" strokeWidth={2.5} />
               </div>
               <h2 className="text-[16px] font-[700] text-[#111318]">My Tickets</h2>
            </div>
            
            <Card className="rounded-[14px] border-[#EDEEEF] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(16,24,40,0.035)] flex-1 overflow-hidden flex flex-col">
               <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
                 <div className="px-5 border-b border-[#F0F1F2] flex items-center justify-between gap-4">
                   <div className="flex-1 overflow-x-auto no-scrollbar">
                     <TabsList className="bg-transparent h-[52px] p-0 flex justify-start gap-4 lg:gap-6 w-max">
                       {["All", "Open", "In Progress", "Waiting for Reply", "Resolved", "Closed"].map(tab => (
                          <TabsTrigger key={tab} value={tab} className="rounded-none px-0 py-4 h-full border-b-[2px] border-transparent bg-transparent shadow-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-[#0D6C2B] data-[state=active]:text-[#0D6C2B] text-[#454951] font-[700] text-[13px] hover:text-[#0D6C2B] whitespace-nowrap transition-none">
                            {tab}
                          </TabsTrigger>
                       ))}
                     </TabsList>
                   </div>
                   <button className="hidden md:flex shrink-0 items-center text-[12px] font-[700] text-[#FA4A05] whitespace-nowrap hover:underline">
                     View All Tickets <ChevronRight className="h-3.5 w-3.5 ml-0.5" strokeWidth={2.5} />
                   </button>
                 </div>
                 
                 <TabsContent value={activeTab} className="p-5 m-0 space-y-4 flex-1 overflow-y-auto max-h-[620px]">
                   {filteredTickets.map(ticket => {
                      const { iconColor, iconBg } = getTicketColorConfig(ticket)
                      const statusConf = getStatusConfig(ticket.status)
                      const prioConf = getPriorityConfig(ticket.priority)
                      const catObj = categories.find(c => c.id === ticket.category) || categories[8]
                      const CatIcon = catObj.icon
                      
                      return (
                         <div key={ticket.id} className={cn("rounded-[10px] border border-[#EDEEEF] bg-[#FFFFFF] p-4 flex flex-col gap-3 relative cursor-pointer hover:shadow-sm transition-all")}>
                            <div className="flex justify-between items-start gap-4">
                               <div className="flex items-start gap-3.5 flex-1 min-w-0">
                                  <div className={cn("h-11 w-11 rounded-full flex items-center justify-center shrink-0 shadow-sm", iconBg)}>
                                     <CatIcon className={cn("h-5 w-5", iconColor)} strokeWidth={2.5} />
                                  </div>
                                  <div className="flex flex-col min-w-0">
                                     <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                                       <span className="text-[12px] font-[700] text-[#252830]">#TK-{ticket.id.slice(0,5)}</span>
                                       <span className={cn("text-[10px] font-[700] px-1.5 py-0.5 rounded-[6px]", prioConf.text, prioConf.bg)}>{prioConf.label}</span>
                                     </div>
                                     <h3 className="text-[15px] font-[700] text-[#111318] truncate">{ticket.subject}</h3>
                                     <p className="text-[13px] text-[#454951] mt-0.5 line-clamp-1">{ticket.description}</p>
                                  </div>
                               </div>
                               
                               <div className="flex flex-col items-end gap-2 shrink-0">
                                  <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-[6px]", statusConf.dot.replace('bg-', 'bg-').replace('[#', '[#').replace(']', ']/10'))}>
                                     <div className={cn("h-1.5 w-1.5 rounded-full", statusConf.dot)} />
                                     <span className={cn("text-[11px] font-[700]", statusConf.text)}>{statusConf.label}</span>
                                  </div>
                               </div>
                            </div>
                            
                            <div className="flex items-center justify-between border-t border-[#F0F1F2] pt-3.5 mt-1.5">
                               <div className="flex items-center gap-2.5 flex-wrap">
                                  <div className="bg-[#F7F8F9] px-2.5 py-1 rounded-full text-[11px] text-[#747780] font-[600]">Order: {ticket.order?.publicCode ?? ticket.publicCode ?? ticket.orderId ?? "-"}</div>
                                  <div className="bg-[#F7F8F9] px-2.5 py-1 rounded-full text-[11px] text-[#747780] font-[600]">Created: {formatFullDate(ticket.createdAt)}</div>
                               </div>
                               
                               <div className="flex items-center gap-4">
                                  <div className="hidden sm:flex items-center gap-2">
                                     <div className="h-7 w-7 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-[#EDEEEF]">
                                        <Image src="/delivery/delivery-person-green.webp" alt="Agent" width={28} height={28} className="object-cover" />
                                     </div>
                                     <div className="flex flex-col">
                                        <span className="text-[11px] font-[700] text-[#111318]">Rahul Sharma</span>
                                        <span className="text-[10px] text-[#747780] font-[600]">Support Executive</span>
                                     </div>
                                  </div>
                                  <div className="text-[11px] text-[#747780] text-right font-[500] leading-tight">
                                     Updated<br/>{formatRelativeTime(ticket.updatedAt)}
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-[#A4A7AE]" strokeWidth={2.5} />
                               </div>
                            </div>
                         </div>
                      )
                   })}
                 </TabsContent>
                 <div className="p-3 bg-[#FFF7ED] border-t border-[#FCE7D3] flex items-center justify-center gap-2.5 rounded-b-[14px]">
                    <RefreshCw className="h-4 w-4 text-[#FA4A05]" strokeWidth={2.5} />
                    <span className="text-[13px] text-[#454951] font-[600]">Can&apos;t find your ticket? Pull down to refresh or click the refresh button above.</span>
                 </div>
               </Tabs>
            </Card>
          </div>

          {/* Right: Quick Help & Resources */}
          <div className="lg:col-span-12 2xl:col-span-3 flex flex-col md:flex-row 2xl:flex-col gap-6">
            <div className="flex flex-col space-y-4 flex-1">
               <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#EAF5EC] flex items-center justify-center">
                     <CircleHelp className="h-3.5 w-3.5 text-[#0D6C2B]" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[16px] font-[700] text-[#111318]">Quick Help</h2>
               </div>
               <Card className="rounded-[14px] border-[#EDEEEF] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(16,24,40,0.035)]">
                  <CardContent className="p-2.5 space-y-1">
                     {[
                       { icon: MessageCircle, title: "Live Chat", sub: "Chat with support" },
                       { icon: Phone, title: "Call Support", sub: "Speak with executive" },
                       { icon: MessageCircle, title: "WhatsApp Support", sub: "Chat on WhatsApp" },
                       { icon: Share2, title: "Track Existing Ticket", sub: "Check ticket status" },
                       { icon: CircleHelp, title: "FAQs", sub: "Find quick answers" },
                     ].map((item, i) => (
                       <div key={i} className="flex items-center justify-between p-3 rounded-[10px] hover:bg-[#FAFAFA] cursor-pointer group transition-colors">
                          <div className="flex items-center gap-3.5">
                             <div className="h-[36px] w-[36px] rounded-full bg-[#EFF8F1] flex items-center justify-center shrink-0">
                                <item.icon className="h-[18px] w-[18px] text-[#0D6C2B]" strokeWidth={2} />
                             </div>
                             <div className="flex flex-col">
                                <span className="text-[13px] font-[700] text-[#252830]">{item.title}</span>
                                <span className="text-[11px] text-[#747780] font-[500] mt-0.5">{item.sub}</span>
                             </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-[#A4A7AE] group-hover:text-[#252830] transition-colors" strokeWidth={2} />
                       </div>
                     ))}
                  </CardContent>
               </Card>
            </div>

            <div className="flex flex-col space-y-4 flex-1">
               <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-[#EAF5EC] flex items-center justify-center">
                     <BookOpen className="h-3.5 w-3.5 text-[#0D6C2B]" strokeWidth={2.5} />
                  </div>
                  <h2 className="text-[16px] font-[700] text-[#111318]">Helpful Resources</h2>
               </div>
               <Card className="rounded-[14px] border-[#EDEEEF] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(16,24,40,0.035)]">
                  <CardContent className="p-3 space-y-1">
                     {[
                       { icon: FileText, title: "Delivery Guidelines", sub: "Read delivery policy" },
                       { icon: WalletCards, title: "Payment & Payouts", sub: "Learn about payments" },
                       { icon: Shield, title: "Safety Guidelines", sub: "Your safety matters" },
                       { icon: Clipboard, title: "Common Issues", sub: "Fix common problems" },
                     ].map((item, i) => (
                       <div key={i} className="flex items-start gap-3.5 p-3 rounded-[10px] hover:bg-[#FAFAFA] cursor-pointer transition-colors">
                          <item.icon className="h-[18px] w-[18px] text-[#252830] mt-0.5" strokeWidth={2} />
                          <div className="flex flex-col">
                             <span className="text-[13px] font-[700] text-[#252830]">{item.title}</span>
                             <span className="text-[11px] text-[#747780] font-[500] mt-0.5">{item.sub}</span>
                          </div>
                       </div>
                     ))}
                     <div className="p-3 pt-2">
                        <button className="flex items-center text-[12px] font-[700] text-[#FA4A05] hover:underline">
                          View All Articles <ChevronRight className="h-3.5 w-3.5 ml-0.5" strokeWidth={2.5} />
                        </button>
                     </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        </div>

        {/* Bottom Info Strip */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 mt-8">
           <Card className="rounded-[14px] border-[#EDEEEF] bg-[#FFFFFF] shadow-[0_2px_12px_rgba(16,24,40,0.035)] p-5 sm:p-6 flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-6">
              <div className="shrink-0">
                 <h3 className="text-[18px] font-[700] text-[#111318]">We&apos;re Here to Help</h3>
                 <p className="text-[13px] text-[#747780] font-[500] mt-1.5">Your safety and satisfaction are our top priorities</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 xl:gap-6 w-full">
                 {[
                   { icon: LifeBuoy, t: "24/7 Support", s: "Round the clock assistance" },
                   { icon: Clock3, t: "Quick Response", s: "Usually within 30 minutes" },
                   { icon: UsersRound, t: "Expert Team", s: "Trained support executives" },
                   { icon: LockKeyhole, t: "Secure & Confidential", s: "Your data is protected" },
                 ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3.5">
                       <div className="h-10 w-10 rounded-full bg-[#EFF8F1] flex items-center justify-center shrink-0">
                          <item.icon className="h-5 w-5 text-[#0D6C2B]" strokeWidth={2} />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-[12px] font-[700] text-[#252830]">{item.t}</span>
                          <span className="text-[10px] text-[#747780] font-[500] mt-0.5">{item.s}</span>
                       </div>
                    </div>
                 ))}
              </div>
           </Card>
           
           <Card className="rounded-[14px] border-[#EEF0E7] bg-[#F8FAF2] p-5 shadow-[0_2px_12px_rgba(16,24,40,0.035)] flex flex-col justify-center">
              <h4 className="text-[14px] font-[700] text-[#252830]">Need immediate help?</h4>
              <p className="text-[11px] text-[#747780] font-[500] mb-3.5 mt-0.5">Our team is available 24/7 to assist you</p>
              <Button className="w-full h-[40px] bg-[#0D6C2B] hover:bg-[#09541B] text-white text-[13px] font-[700] rounded-[8px] shadow-sm">
                 <MessageCircle className="h-4 w-4 mr-2" strokeWidth={2.5} /> Contact Live Support
              </Button>
           </Card>
        </div>

      </div>
      <LiveChatWidget />
    </div>
  )
}
