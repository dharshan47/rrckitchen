"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Ticket, Plus, RefreshCw, Send, X, Upload, Loader2, HelpCircle, ChefHat, ClipboardList, Package, Truck, Wheat, Settings } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CloudinaryUpload } from "@/components/cloudinary/cloudinary-upload"
import { toast } from "sonner"

interface SupportTicket {
  id: string
  subject: string
  status: string
  priority: string
  category: string
  createdAt: string
}

interface UploadedImage {
  secure_url: string
  public_id: string
}

const statusStyles: Record<string, { label: string; color: string }> = {
  OPEN: { label: "Open", color: "text-blue-600 bg-blue-100" },
  INPROGRESS: { label: "In Progress", color: "text-amber-600 bg-amber-100" },
  RESOLVED: { label: "Resolved", color: "text-green-600 bg-green-100" },
  CLOSED: { label: "Closed", color: "text-gray-600 bg-gray-100" },
}

const priorityStyles: Record<string, string> = {
  URGENT: "bg-red-100 text-red-700",
  HIGH: "bg-orange-100 text-orange-700",
  MEDIUM: "bg-blue-100 text-blue-700",
  LOW: "bg-gray-100 text-gray-600",
}

const categories = [
  { id: "kitchen", label: "Kitchen Issue", icon: ChefHat },
  { id: "menu", label: "Menu Related", icon: ClipboardList },
  { id: "order", label: "Order Related", icon: Package },
  { id: "delivery-partner", label: "Delivery Person/Rider", icon: Truck },
  { id: "ingredient", label: "Ingredient Issue", icon: Wheat },
  { id: "equipment", label: "Equipment Issue", icon: Settings },
  { id: "other", label: "Other", icon: HelpCircle },
]

const ticketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  description: z.string().min(10, "Please provide at least 10 characters"),
  orderId: z.string().optional(),
})

type TicketForm = z.infer<typeof ticketSchema>

export default function KitchenSupportPage() {
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [category, setCategory] = useState("")

  const { data: tickets = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["kitchen-support-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/support")
      if (!res.ok) throw new Error("Failed to fetch tickets")
      return res.json() as Promise<SupportTicket[]>
    },
  })

  const form = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: "", description: "", orderId: "" },
  })

  const createMutation = useMutation({
    mutationFn: async (data: TicketForm & { category: string; mediaUrls: string[] }) => {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, priority: "MEDIUM" }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create ticket" }))
        throw new Error(err.error || "Failed to create ticket")
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-support-tickets"] })
      toast.success("Support ticket created")
      form.reset()
      setUploadedImages([])
      setCategory("")
      setShowForm(false)
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create ticket")
    },
  })

  const onSubmit = (data: TicketForm) => {
    if (!category) { toast.error("Please select a category"); return }
    createMutation.mutate({
      ...data,
      category,
      mediaUrls: uploadedImages.map((img) => img.secure_url),
    })
  }

  const removeImage = (publicId: string) => {
    setUploadedImages((prev) => prev.filter((img) => img.public_id !== publicId))
  }

  const filtered = statusFilter
    ? tickets.filter((t) => t.status === statusFilter)
    : tickets

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Ticket className="h-5 w-5 text-primary" />
          Support Tickets
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
            Refresh
          </Button>
          {!showForm && (
            <Button size="sm" className="text-xs gap-1" onClick={() => setShowForm(true)}>
              <Plus className="h-3 w-3" />
              New Ticket
            </Button>
          )}
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Create Support Ticket</CardTitle>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { setShowForm(false); form.reset(); setUploadedImages([]); setCategory("") }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {categories.map((cat) => {
                    const Icon = cat.icon
                    const isSelected = category === cat.id
                    return (
                      <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                        className={cn("flex items-center gap-2 rounded-lg border p-2.5 text-left transition-all text-xs font-medium", isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-input hover:border-primary/30")}
                      >
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <span>{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" {...form.register("subject")} placeholder="Brief summary of your issue" />
                {form.formState.errors.subject && (
                  <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <textarea
                  id="description"
                  {...form.register("description")}
                  rows={4}
                  className="flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  placeholder="Describe your issue in detail"
                />
                {form.formState.errors.description && (
                  <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID (optional)</Label>
                <Input id="orderId" {...form.register("orderId")} placeholder="If related to a specific order" />
              </div>

              <div className="space-y-2">
                <Label>Attachments (optional)</Label>
                <CloudinaryUpload
                  onUpload={(result) => {
                    setUploadedImages((prev) => [...prev, result])
                    toast.success("Image uploaded")
                  }}
                >
                  {({ uploading, startUpload, cancelUpload }) => (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={startUpload}
                        disabled={uploading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-input bg-background px-3 py-2 text-xs font-medium hover:bg-muted transition-colors disabled:opacity-50"
                      >
                        {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
                        {uploading ? "Uploading..." : "Upload Image"}
                      </button>
                      {uploading && (
                        <button
                          type="button"
                          onClick={cancelUpload}
                          className="inline-flex items-center gap-1 text-xs text-destructive hover:underline"
                        >
                          <X className="h-3 w-3" /> Cancel
                        </button>
                      )}
                    </div>
                  )}
                </CloudinaryUpload>
                {uploadedImages.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {uploadedImages.map((img) => (
                      <div key={img.public_id} className="relative group">
                        <Image
                          src={img.secure_url}
                          alt="Uploaded"
                          width={64}
                          height={64}
                          className="h-16 w-16 rounded-lg object-cover border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(img.public_id)}
                          className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button type="submit" size="sm" className="gap-1" disabled={createMutation.isPending}>
                  <Send className="h-3 w-3" />
                  {createMutation.isPending ? "Submitting..." : "Submit Ticket"}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => { setShowForm(false); form.reset(); setUploadedImages([]); setCategory("") }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2 flex-wrap border-b border-border pb-3">
        <button
          onClick={() => setStatusFilter(null)}
          className={cn(
            "px-3 py-1.5 text-xs font-semibold rounded-full transition-colors",
            !statusFilter ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-muted"
          )}
        >
          All ({tickets.length})
        </button>
        {Object.entries(statusStyles).map(([key, val]) => {
          const count = tickets.filter((t) => t.status === key).length
          return (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              className={cn(
                "px-3 py-1.5 text-xs font-semibold rounded-full transition-colors",
                statusFilter === key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground bg-muted"
              )}
            >
              {val.label} ({count})
            </button>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-6 w-16 rounded-full" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="p-8 text-center">
              <p className="text-sm text-muted-foreground mb-3">Failed to load tickets</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>Try again</Button>
            </div>
          ) : filtered.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {statusFilter ? `No tickets with status "${statusFilter}"` : "No support tickets yet"}
            </p>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((ticket) => {
                const s = statusStyles[ticket.status] ?? { label: ticket.status, color: "text-gray-600 bg-gray-100" }
                const p = priorityStyles[ticket.priority] ?? "bg-gray-100 text-gray-600"
                const cat = categories.find((c) => c.id === ticket.category)
                const CatIcon = cat?.icon || HelpCircle
                return (
                  <div key={ticket.id} className="flex items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <CatIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <p className="text-sm font-medium truncate">{ticket.subject}</p>
                        <Badge className={cn("text-[10px] px-1.5 py-0", p)}>{ticket.priority}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ticket.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <Badge className={cn("text-xs shrink-0", s.color)}>{s.label}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
