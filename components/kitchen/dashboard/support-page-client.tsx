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
  ChevronRight, Package, ChefHat,
  Truck, UploadCloud, ShieldCheck, Timer,
  ThumbsUp, MessageSquare, Mail, UserCheck,
  CreditCard, MoreHorizontal, Headset,
  Navigation
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
  OPEN: { label: "OPEN", color: "text-[#1677FF] bg-[#EEF6FF] border-[#CFE3FF]", icon: AlertCircle },
  INPROGRESS: { label: "IN PROGRESS", color: "text-[#D97706] bg-[#FFF7E8] border-[#F6D9A8]", icon: Clock },
  RESOLVED: { label: "RESOLVED", color: "text-[#087A3D] bg-[#EAF5ED] border-[#C7E4D0]", icon: CheckCircle2 },
  CLOSED: { label: "CLOSED", color: "text-[#475569] bg-[#F1F5F9] border-[#DCE3EA]", icon: CheckCircle2 },
}

const priorityColors: Record<string, string> = {
  LOW: "text-[#087A3D]",
  MEDIUM: "text-[#F59E0B]",
  HIGH: "text-[#FF4D00]",
  URGENT: "text-[#EF2B24] font-bold",
}

const categories = [
  { id: "menu", label: "Menu & Items", desc: "Menu updates, pricing, photos", icon: ChefHat, color: "text-[#087A3D]", bg: "bg-[#EAF5ED]" },
  { id: "delivery", label: "Delivery Rider", desc: "Rider delays, behavior issues", icon: Truck, color: "text-[#FF4D00]", bg: "bg-[#FFF0E9]" },
  { id: "order", label: "Order Issues", desc: "Modifications, cancellations", icon: Package, color: "text-[#087A3D]", bg: "bg-[#EAF5ED]" },
  { id: "payment", label: "Payments", desc: "Settlements, payouts, refunds", icon: CreditCard, color: "text-[#FF4D00]", bg: "bg-[#FFF0E9]" },
  { id: "kitchen", label: "Equipment", desc: "Utensils, supplies, setup", icon: ShieldCheck, color: "text-[#087A3D]", bg: "bg-[#EAF5ED]" },
  { id: "other", label: "Other", desc: "General queries and concerns", icon: MoreHorizontal, color: "text-[#FF4D00]", bg: "bg-[#FFF0E9]" },
]

export default function SupportPageClient() {
  const queryClient = useQueryClient()

  const [selectedCategory, setSelectedCategory] = useState("")
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM")
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("All")

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketForm>({
    resolver: zodResolver(ticketFormSchema),
    defaultValues: { subject: "", description: "", orderId: "" },
  })

  const { data: tickets = [], isLoading, isFetching, isError } = useQuery({
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
        <div className="rounded-[16px] border border-[#FFF0EF] bg-[#FFF0EF] p-8 text-center">
          <p className="text-sm font-bold text-[#EF2B24]">Failed to load support tickets</p>
          <p className="text-xs text-[#FF4D00] mt-1">Please refresh the page or try again later.</p>
        </div>
      </div>
    )
  }

  if (isLoading || isFetching) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 bg-[#FCFDFC]">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64 rounded" />
            <Skeleton className="h-4 w-96 rounded" />
          </div>
          <Skeleton className="h-24 w-24 rounded-full hidden sm:block" />
        </div>
        
        {/* Category Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[140px] rounded-[16px]" />
          ))}
        </div>

        {/* 3-Column Layout Skeleton */}
        <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] 2xl:grid-cols-[320px_1fr_300px] gap-6">
          <Skeleton className="h-[600px] rounded-[16px]" />
          <Skeleton className="h-[600px] rounded-[16px]" />
          <div className="space-y-6 hidden 2xl:block">
            <Skeleton className="h-[300px] rounded-[16px]" />
            <Skeleton className="h-[200px] rounded-[16px]" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 bg-[#FCFDFC] font-sans pb-10">
      
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative">
        <div className="z-10">
          <h1 className="text-[28px] sm:text-[32px] font-bold text-[#111827] tracking-tight">Support Center</h1>
          <p className="text-[#6B7280] text-[14px] mt-1.5 font-medium">We&apos;re here to help! Raise a ticket, track your issues and get the assistance you need.</p>
        </div>
        
        {/* Decorative Headset Graphic */}
        <div className="relative hidden sm:flex shrink-0">
          <div className="absolute -inset-4 opacity-50">
            <div className="absolute top-2 left-0 text-[#087A3D]">✦</div>
            <div className="absolute bottom-4 left-4 text-[#FF4D00]">✦</div>
            <div className="absolute top-6 right-0 text-[#F59E0B]">✦</div>
            <div className="absolute bottom-0 right-4 text-[#FF4D00]">✦</div>
          </div>
          <div className="h-20 w-20 bg-[#F3F9F5] rounded-full flex items-center justify-center relative z-10">
            <Headset className="h-10 w-10 text-[#075C30]" strokeWidth={1.5} />
            <div className="absolute bottom-5 right-5 h-5 w-5 bg-[#087A3D] rounded-full border-2 border-white flex items-center justify-center">
              <MessageSquare className="h-2.5 w-2.5 text-white fill-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {categories.map((cat) => {
          const Icon = cat.icon
          const isSelected = selectedCategory === cat.id
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "flex flex-col items-center text-center p-5 rounded-[16px] border bg-[#FFFFFF] transition-all duration-200 group text-left sm:text-center w-full",
                isSelected ? "border-[#087A3D] shadow-[0_4px_16px_rgba(8,122,61,0.08)] ring-1 ring-[#087A3D]" : "border-[#E5E7EB] hover:border-[#DCE8DF] shadow-[0_2px_10px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_16px_rgba(15,23,42,0.05)]"
              )}
            >
              <div className={cn("h-12 w-12 rounded-full flex items-center justify-center mb-3 sm:mb-4 transition-transform group-hover:scale-110 shrink-0", cat.bg)}>
                <Icon className={cn("h-5 w-5", cat.color)} strokeWidth={2} />
              </div>
              <h3 className="font-bold text-[14px] text-[#111827] leading-tight mb-1">{cat.label}</h3>
              <p className="text-[12px] text-[#6B7280] font-medium leading-snug">{cat.desc}</p>
            </button>
          )
        })}
      </div>

      {/* Main 3-Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-[300px_1fr] 2xl:grid-cols-[300px_1fr_300px] gap-6 xl:gap-8">
        
        {/* Left Column: Form */}
        <div className="flex flex-col">
          <Card className="rounded-[16px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_2px_10px_rgba(15,23,42,0.04)] flex-1 overflow-hidden">
            <div className="p-6">
              <h2 className="text-[16px] font-bold text-[#111827] mb-5">Raise a New Ticket</h2>
              <div className="space-y-5">
                
                {/* Category */}
                <div>
                  <label className="text-[13px] font-bold text-[#111827] mb-1.5 flex items-center">Category <span className="text-[#FF4D00] ml-1">*</span></label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="rounded-[8px] border-[#DDE2E7] bg-[#FFFFFF] h-10 text-[13px] focus:ring-[#087A3D]">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-[8px]">
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id} className="text-[13px]">{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject */}
                <div>
                  <label className="text-[13px] font-bold text-[#111827] mb-1.5 flex items-center">Subject <span className="text-[#FF4D00] ml-1">*</span></label>
                  <Input {...register("subject")} placeholder="Briefly describe your issue" className="rounded-[8px] border-[#DDE2E7] bg-[#FFFFFF] h-10 text-[13px] focus-visible:ring-[#087A3D] placeholder:text-[#9CA3AF]" />
                  {errors.subject && <p className="text-[11px] text-[#EF2B24] mt-1 font-medium">{errors.subject.message}</p>}
                </div>

                {/* Order ID */}
                <div>
                  <label className="text-[13px] font-bold text-[#111827] mb-1.5 flex items-center">Order ID <span className="text-[#9CA3AF] ml-1 font-medium">(Optional)</span></label>
                  <Input {...register("orderId")} placeholder="Enter your order ID (e.g. #RRC123456)" className="rounded-[8px] border-[#DDE2E7] bg-[#FFFFFF] h-10 text-[13px] focus-visible:ring-[#087A3D] placeholder:text-[#9CA3AF]" />
                </div>

                {/* Description */}
                <div>
                  <label className="text-[13px] font-bold text-[#111827] mb-1.5 flex items-center">Description <span className="text-[#FF4D00] ml-1">*</span></label>
                  <Textarea {...register("description")} placeholder="Please describe your issue in detail..." className="rounded-[8px] border-[#DDE2E7] bg-[#FFFFFF] text-[13px] min-h-[120px] resize-none focus-visible:ring-[#087A3D] placeholder:text-[#9CA3AF]" />
                  {errors.description && <p className="text-[11px] text-[#EF2B24] mt-1 font-medium">{errors.description.message}</p>}
                </div>

                {/* Upload */}
                <div>
                  <label className="text-[13px] font-bold text-[#111827] mb-1.5 flex items-center">Attach Images <span className="text-[#9CA3AF] ml-1 font-medium">(Optional)</span></label>
                  <CloudinaryUpload onUpload={(result) => setUploadedImages((prev) => [...prev, result.secure_url])}>
                    {({ uploading, startUpload }) => (
                      <div onClick={startUpload} role="button" tabIndex={0}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); startUpload() } }}
                        className="flex flex-col sm:flex-row sm:items-center justify-center gap-3 rounded-[10px] border border-dashed border-[#D5DDE0] bg-[#FFFFFF] p-4 cursor-pointer hover:bg-[#F3F9F5] transition-colors text-center sm:text-left">
                        <div className="h-9 w-9 rounded-full bg-[#EAF5ED] flex items-center justify-center shrink-0 mx-auto sm:mx-0">
                          {uploading ? <Loader2 className="h-4 w-4 text-[#087A3D] animate-spin" /> : <UploadCloud className="h-4 w-4 text-[#087A3D]" />}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-[#075C30]"><span className="font-bold underline text-[#087A3D]">Click to upload</span> or drag & drop</p>
                          <p className="text-[11px] text-[#6B7280] mt-0.5 font-medium">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                      </div>
                    )}
                  </CloudinaryUpload>
                  {uploadedImages.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {uploadedImages.map((url, i) => (
                        <div key={i} className="relative h-12 w-12 rounded-[8px] overflow-hidden border border-[#E5E7EB] group">
                          <Image src={url} alt={`Upload ${i}`} fill className="object-cover" sizes="48px" />
                          <button type="button" onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                            className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          ><X className="h-4 w-4 text-white" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button type="button" variant="outline" className="w-[80px] h-11 rounded-[8px] border-[#087A3D] text-[#087A3D] font-bold hover:bg-[#F3F9F5]" onClick={handleReset}>
                    Reset
                  </Button>
                  <Button type="button" onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending} className="flex-1 h-11 rounded-[8px] bg-[#FF4D00] hover:bg-[#E64500] text-white font-bold shadow-[0_2px_6px_rgba(255,77,0,0.12)] border border-[#FF4D00]">
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Navigation className="h-4 w-4 mr-2 -rotate-45" />}
                    Submit Ticket
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Column: Tickets */}
        <div className="flex flex-col">
          <Card className="rounded-[16px] border-[#E5E7EB] bg-[#FFFFFF] shadow-[0_2px_10px_rgba(15,23,42,0.04)] flex-1 overflow-hidden flex flex-col">
            <h2 className="text-[16px] font-bold text-[#111827] px-6 pt-6 pb-2">My Tickets</h2>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="px-6 border-b border-[#EEF0F2] overflow-x-auto hide-scrollbar">
                <TabsList className="w-max h-auto p-0 bg-transparent flex gap-6 border-none rounded-none">
                  {["All", "Open", "In Progress", "Resolved", "Closed"].map((tab) => (
                    <TabsTrigger
                      key={tab}
                      value={tab}
                      className="rounded-none px-0 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[2px] data-[state=active]:border-[#087A3D] data-[state=active]:text-[#087A3D] text-[#374151] font-bold text-[13px] transition-none whitespace-nowrap shadow-none"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              <TabsContent value={activeTab} className="p-6 m-0 space-y-4 flex-1">
                {filteredTickets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center h-full">
                    <Ticket className="h-10 w-10 text-[#DDE2E7] mb-3" />
                    <p className="text-[#6B7280] text-[13px] font-medium">No tickets found for this status.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTickets.map((ticket) => {
                      const statusInfo = statusConfig[ticket.status] || statusConfig.OPEN
                      const catInfo = categories.find((c) => c.id === ticket.category) || categories[0]
                      const CatIcon = catInfo.icon

                      return (
                        <Link href={`/support?ticket=${ticket.id}`} key={ticket.id} className="block group">
                          <div className="rounded-[12px] border border-[#E5E7EB] p-4 sm:p-5 transition-all hover:border-[#DCE8DF] bg-[#FFFFFF] relative overflow-hidden">
                            <div className="flex gap-4">
                              <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0", catInfo.bg)}>
                                <CatIcon className={cn("h-5 w-5", catInfo.color)} strokeWidth={2} />
                              </div>
                              <div className="flex-1 min-w-0 pr-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                                  <h3 className="font-bold text-[14px] text-[#111827] truncate pr-2">{ticket.subject}</h3>
                                  <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 border w-fit shrink-0 rounded-[8px] uppercase", statusInfo.color)}>
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center text-[12px] text-[#6B7280] font-medium mb-2 gap-2">
                                  {ticket.orderId && <span>Order ID: {ticket.orderId}</span>}
                                  {ticket.orderId && <span className="hidden sm:inline">•</span>}
                                  <span>{new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <p className="text-[13px] text-[#4B5563] line-clamp-1 mb-2.5 font-medium leading-relaxed">{ticket.description}</p>
                                <div className="flex items-center text-[11px] font-bold text-[#6B7280]">
                                  Priority: <span className={cn("ml-1", priorityColors[ticket.priority])}>{ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <ChevronRight className="h-5 w-5 text-[#9CA3AF] group-hover:text-[#087A3D] transition-colors" />
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                )}
                
                {filteredTickets.length > 0 && (
                  <Button variant="outline" className="w-full h-11 mt-4 rounded-[8px] border-[#B8D8C4] text-[#087A3D] font-bold hover:bg-[#F3F9F5]" onClick={() => setActiveTab("All")}>
                    View All Tickets
                  </Button>
                )}
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column: Support Info (Usually stacks on smaller screens) */}
        <div className="flex flex-col gap-6 xl:col-span-2 2xl:col-span-1">
          
          {/* How to Use Support */}
          <Card className="rounded-[16px] border-[#DCE8DF] bg-[#FFFFFF] shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <CardContent className="p-6">
              <h3 className="font-bold text-[#075C30] text-[16px] mb-2">How to Use Support</h3>
              <div className="h-[2px] w-8 bg-[#087A3D] mb-6 rounded-full" />
              
              <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-[#E5E7EB] before:via-[#E5E7EB] before:to-transparent">
                
                <div className="relative flex items-start gap-4">
                  <div className="h-6 w-6 rounded-full bg-[#087A3D] text-white flex items-center justify-center shrink-0 font-bold text-[11px] z-10 relative shadow-[0_2px_5px_rgba(8,122,61,0.2)]">1</div>
                  <div className="flex-1 min-w-0 pt-0.5 flex gap-3">
                    <div className="h-10 w-10 rounded-[8px] bg-[#EAF5ED] flex items-center justify-center shrink-0">
                      <div className="grid grid-cols-2 gap-0.5">
                        <div className="h-2 w-2 rounded-[2px] border border-[#087A3D]" />
                        <div className="h-2 w-2 rounded-[2px] border border-[#087A3D]" />
                        <div className="h-2 w-2 rounded-[2px] border border-[#087A3D]" />
                        <div className="h-2 w-2 rounded-[2px] border border-[#087A3D]" />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-[#111827]">Choose a Category</h4>
                      <p className="text-[12px] text-[#4B5563] leading-relaxed mt-0.5 font-medium">Select the category that best matches your issue.</p>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="h-6 w-6 rounded-full bg-[#087A3D] text-white flex items-center justify-center shrink-0 font-bold text-[11px] z-10 relative shadow-[0_2px_5px_rgba(8,122,61,0.2)]">2</div>
                  <div className="flex-1 min-w-0 pt-0.5 flex gap-3">
                    <div className="h-10 w-10 rounded-[8px] bg-[#EAF5ED] flex items-center justify-center shrink-0">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#087A3D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-[#111827]">Describe Your Issue</h4>
                      <p className="text-[12px] text-[#4B5563] leading-relaxed mt-0.5 font-medium">Provide a clear subject and detailed description.</p>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="h-6 w-6 rounded-full bg-[#087A3D] text-white flex items-center justify-center shrink-0 font-bold text-[11px] z-10 relative shadow-[0_2px_5px_rgba(8,122,61,0.2)]">3</div>
                  <div className="flex-1 min-w-0 pt-0.5 flex gap-3">
                    <div className="h-10 w-10 rounded-[8px] bg-[#EAF5ED] flex items-center justify-center shrink-0">
                      <UploadCloud className="h-5 w-5 text-[#087A3D]" strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-[#111827]">Attach Evidence</h4>
                      <p className="text-[12px] text-[#4B5563] leading-relaxed mt-0.5 font-medium">Upload images if needed for faster resolution.</p>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start gap-4">
                  <div className="h-6 w-6 rounded-full bg-[#087A3D] text-white flex items-center justify-center shrink-0 font-bold text-[11px] z-10 relative shadow-[0_2px_5px_rgba(8,122,61,0.2)]">4</div>
                  <div className="flex-1 min-w-0 pt-0.5 flex gap-3">
                    <div className="h-10 w-10 rounded-[8px] bg-[#EAF5ED] flex items-center justify-center shrink-0">
                      <Navigation className="h-5 w-5 text-[#087A3D] -rotate-45" strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[14px] text-[#111827]">Submit Ticket</h4>
                      <p className="text-[12px] text-[#4B5563] leading-relaxed mt-0.5 font-medium">Our team will review and respond to your ticket.</p>
                    </div>
                  </div>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Contact Details */}
          <Card className="rounded-[16px] border-[#DCE8DF] bg-[#FFFFFF] shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <CardContent className="p-6 space-y-6">
              
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#075C30] shrink-0 mt-0.5" strokeWidth={2} />
                <div>
                  <h4 className="font-bold text-[14px] text-[#075C30] mb-1">Support Hours</h4>
                  <p className="text-[13px] text-[#4B5563] font-medium leading-relaxed">We&apos;re available 24/7<br />Our support team typically responds within a few hours.</p>
                </div>
              </div>

              <div className="h-[1px] w-full bg-[#E5E7EB]" />

              <div>
                <h4 className="font-bold text-[14px] text-[#075C30] mb-4">Other Ways to Reach Us</h4>
                <div className="space-y-4">
                  <Link href="/support" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-[8px] border border-[#E5E7EB] bg-[#FCFDFC] flex items-center justify-center group-hover:border-[#087A3D] transition-colors">
                      <MessageSquare className="h-4 w-4 text-[#075C30]" strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[13px] text-[#111827]">Live Chat</h4>
                      <p className="text-[12px] text-[#4B5563] font-medium">Chat with our support team</p>
                    </div>
                  </Link>
                  <a href="mailto:support@rrckitchen.com" className="flex items-center gap-3 group">
                    <div className="h-10 w-10 rounded-[8px] border border-[#E5E7EB] bg-[#FCFDFC] flex items-center justify-center group-hover:border-[#087A3D] transition-colors">
                      <Mail className="h-4 w-4 text-[#075C30]" strokeWidth={2} />
                    </div>
                    <div>
                      <h4 className="font-bold text-[13px] text-[#111827]">Email Support</h4>
                      <p className="text-[12px] text-[#4B5563] font-medium">support@rrckitchen.com</p>
                    </div>
                  </a>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Features Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-[#F7FAF8] rounded-[16px] p-5 sm:p-6 border border-[#DCE9E0]">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-[#087A3D] flex items-center justify-center shrink-0">
            <ShieldCheck className="h-5 w-5 text-[#075C30]" strokeWidth={2} />
          </div>
          <div>
            <h4 className="font-bold text-[13px] text-[#075C30]">Secure & Confidential</h4>
            <p className="text-[11px] text-[#4B5563] font-medium mt-0.5">Your information is safe<br/>with us.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-[#087A3D] flex items-center justify-center shrink-0">
            <Timer className="h-5 w-5 text-[#075C30]" strokeWidth={2} />
          </div>
          <div>
            <h4 className="font-bold text-[13px] text-[#075C30]">Quick Resolution</h4>
            <p className="text-[11px] text-[#4B5563] font-medium mt-0.5">We aim to resolve all issues<br/>as quickly as possible.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-[#087A3D] flex items-center justify-center shrink-0">
            <UserCheck className="h-5 w-5 text-[#075C30]" strokeWidth={2} />
          </div>
          <div>
            <h4 className="font-bold text-[13px] text-[#075C30]">Expert Support</h4>
            <p className="text-[11px] text-[#4B5563] font-medium mt-0.5">Our support team is trained<br/>to help you better.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full border border-[#087A3D] flex items-center justify-center shrink-0">
            <ThumbsUp className="h-5 w-5 text-[#075C30]" strokeWidth={2} />
          </div>
          <div>
            <h4 className="font-bold text-[13px] text-[#075C30]">Customer First</h4>
            <p className="text-[11px] text-[#4B5563] font-medium mt-0.5">Your satisfaction is our<br/>top priority.</p>
          </div>
        </div>
      </div>

    </div>
  )
}
