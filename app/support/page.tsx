"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ArrowLeft, Ticket, Loader2, Send, Plus,
  CheckCircle2, Clock, AlertCircle, X, Upload,
  ChevronRight, HelpCircle, Package, User, ChefHat,
  Truck, CreditCard, AlertTriangle, ShieldCheck, BookOpen,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TicketMessage {
  id: string;
  senderId: string | null;
  message: string;
  mediaUrls: string[];
  createdAt: string;
}

interface SupportTicket {
  id: string;
  userId: string;
  orderId: string | null;
  subject: string;
  description: string;
  status: "OPEN" | "INPROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  category: string;
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

const ticketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject too long"),
  description: z.string().min(10, "Please provide at least 10 characters").max(2000, "Description too long"),
  orderId: z.string().max(100, "Order ID too long").optional(),
});

type TicketForm = z.infer<typeof ticketSchema>;

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  OPEN: { label: "Open", color: "text-blue-600 bg-blue-100", icon: AlertCircle },
  INPROGRESS: { label: "In Progress", color: "text-amber-600 bg-amber-100", icon: Clock },
  RESOLVED: { label: "Resolved", color: "text-green-600 bg-green-100", icon: CheckCircle2 },
  CLOSED: { label: "Closed", color: "text-gray-600 bg-gray-100", icon: CheckCircle2 },
};

const categories = [
  { id: "order", label: "Order Issue", icon: Package },
  { id: "delivery", label: "Delivery Issue", icon: Truck },
  { id: "food", label: "Food Quality", icon: ChefHat },
  { id: "payment", label: "Payment Issue", icon: CreditCard },
  { id: "account", label: "Account Issue", icon: User },
  { id: "kitchen", label: "Kitchen Partner", icon: ChefHat },
  { id: "delivery-partner", label: "Delivery Partner", icon: Truck },
  { id: "safety", label: "Safety Report", icon: AlertTriangle },
  { id: "other", label: "Other", icon: HelpCircle },
];

function HowToUseGuide() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            How to Use Support
          </h2>
          <Separator />
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</div>
              <div>
                <h3 className="font-semibold text-sm">Choose a Category</h3>
                <p className="text-sm text-muted-foreground mt-1">Select the category that best matches your issue — Order, Delivery, Food Quality, Payment, or Account.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</div>
              <div>
                <h3 className="font-semibold text-sm">Describe Your Issue</h3>
                <p className="text-sm text-muted-foreground mt-1">Provide a clear subject and detailed description. If related to an order, include the Order ID for faster resolution.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</div>
              <div>
                <h3 className="font-semibold text-sm">Attach Evidence (Optional)</h3>
                <p className="text-sm text-muted-foreground mt-1">Upload images of the issue — damaged packaging, incorrect items, or food quality concerns — for cross-verification and faster resolution.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">4</div>
              <div>
                <h3 className="font-semibold text-sm">Submit & Track</h3>
                <p className="text-sm text-muted-foreground mt-1">Submit your ticket and track its status in real-time. Our support team will respond and you can reply directly from the ticket.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Ticket Statuses Explained
          </h2>
          <Separator />
          <div className="space-y-4">
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn("text-xs", statusConfig.OPEN.color)}>
                  <AlertCircle className="h-3 w-3 mr-1" /> Open
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Your ticket is received and queued for review. Our team will assess your issue.</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn("text-xs", statusConfig.INPROGRESS.color)}>
                  <Clock className="h-3 w-3 mr-1" /> In Progress
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">A support agent is actively working on your issue. They may reach out for more details.</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn("text-xs", statusConfig.RESOLVED.color)}>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Resolved
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Your issue has been resolved. If you&apos;re satisfied, the ticket will be closed automatically.</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={cn("text-xs", statusConfig.CLOSED.color)}>
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Closed
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">The ticket is closed. You can create a new ticket if you need further assistance.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-3">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            Tips for Faster Resolution
          </h2>
          <Separator />
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /><span>Provide the correct Order ID when reporting order-related issues.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /><span>Upload clear images of the issue for faster cross-verification.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /><span>Be detailed in your description — include time, date, and what went wrong.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /><span>Reply promptly to support agent messages to avoid delays.</span></li>
            <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /><span>Check existing tickets before creating a duplicate for the same issue.</span></li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SupportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;

  const [activeTab, setActiveTab] = useState("tickets");
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState("");

  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: "", description: "", orderId: "" },
  });

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ["my-support-tickets"],
    queryFn: async () => {
      const res = await fetch("/api/support");
      if (!res.ok) throw new Error("Failed to fetch tickets");
      return res.json() as Promise<SupportTicket[]>;
    },
    enabled: isLoggedIn,
  });

  const createMutation = useMutation({
    mutationFn: async (data: TicketForm & { category: string; priority: string; mediaUrls: string[] }) => {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to create ticket" }));
        throw new Error(err.error || "Failed to create ticket");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      toast.success("Support ticket created!");
      setView("list");
      setCategory("");
      setPriority("MEDIUM");
      setUploadedImages([]);
      reset();
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to create ticket");
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
      const res = await fetch("/api/support", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, message }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-support-tickets"] });
      setReplyText("");
      toast.success("Reply sent");
    },
    onError: () => toast.error("Failed to send reply"),
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadedImages((prev) => [...prev, data.url]);
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = (formData: TicketForm) => {
    if (!category) { toast.error("Please select a category"); return; }
    createMutation.mutate({ ...formData, category, priority, mediaUrls: uploadedImages });
  };

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <Ticket className="h-16 w-16 text-muted-foreground/40" />
          <div>
            <h1 className="text-2xl font-bold">Login to access Support</h1>
            <p className="mt-2 text-sm text-muted-foreground">Please log in to create and track support tickets.</p>
          </div>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="mx-auto max-w-4xl px-4 lg:px-8 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => { if (view === "detail") { setView("list"); setSelectedTicket(null); } else { router.back(); } }} className="flex items-center gap-1.5 text-muted-foreground -ml-2 shrink-0 lg:ml-0">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
          <div className="flex items-center gap-3 mt-3 lg:mt-0">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Ticket className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Support</h1>
              <p className="text-sm text-muted-foreground">We&apos;re here to help resolve your issues</p>
            </div>
          </div>
        </div>

        {view !== "detail" && (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full overflow-x-auto flex-nowrap justify-start gap-1 bg-transparent p-0 pb-1 scrollbar-none">
              <TabsTrigger value="tickets" className="shrink-0 gap-1.5 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <Ticket className="h-4 w-4 shrink-0" /> My Tickets
              </TabsTrigger>
              <TabsTrigger value="guide" className="shrink-0 gap-1.5 px-4 py-2 rounded-lg text-sm font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <BookOpen className="h-4 w-4 shrink-0" /> How to Use Support
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tickets" className="mt-0">
              {view === "list" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">{tickets.length} ticket{tickets.length !== 1 ? "s" : ""}</p>
                    <Button size="sm" onClick={() => { setView("create"); setCategory(""); setPriority("MEDIUM"); setUploadedImages([]); reset(); }}>
                      <Plus className="h-4 w-4 mr-1.5" /> New Ticket
                    </Button>
                  </div>

                  {isLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
                      ))}
                    </div>
                  ) : tickets.length === 0 ? (
                    <Card>
                      <CardContent className="flex flex-col items-center py-16 text-center">
                        <ShieldCheck className="h-12 w-12 text-muted-foreground/40 mb-4" />
                        <h2 className="text-lg font-semibold">No support tickets yet</h2>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">Create a ticket and we&apos;ll get back to you</p>
                        <Button onClick={() => { setView("create"); reset(); }}><Plus className="h-4 w-4 mr-1.5" /> Create Ticket</Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {tickets.map((ticket) => {
                        const statusInfo = statusConfig[ticket.status];
                        const StatusIcon = statusInfo.icon;
                        const catInfo = categories.find((c) => c.id === ticket.category);
                        const CatIcon = catInfo?.icon || HelpCircle;
                        return (
                          <button key={ticket.id} type="button" onClick={() => { setSelectedTicket(ticket); setView("detail"); }}
                            className="w-full text-left rounded-xl border border-border p-4 hover:border-primary/30 hover:bg-muted/30 transition-all"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0 flex-1">
                                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                  <CatIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-semibold text-sm truncate">{ticket.subject}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ticket.description}</p>
                                </div>
                              </div>
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                            </div>
                            <div className="flex items-center gap-2 mt-3">
                              <Badge className={cn("text-xs", statusInfo.color)}>
                                <StatusIcon className="h-3 w-3 mr-1" /> {statusInfo.label}
                              </Badge>
                              {ticket.orderId && <span className="text-[10px] text-muted-foreground">Order #{ticket.orderId.slice(0, 8)}</span>}
                              <span className="text-[10px] text-muted-foreground ml-auto">{new Date(ticket.createdAt).toLocaleDateString("en-IN")}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {view === "create" && (
                <Card>
                  <CardContent className="p-6 space-y-5">
                    <h2 className="text-lg font-bold">Create Support Ticket</h2>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Category *</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.map((cat) => {
                          const Icon = cat.icon;
                          const isSelected = category === cat.id;
                          return (
                            <button key={cat.id} type="button" onClick={() => setCategory(cat.id)}
                              className={cn("flex items-center gap-2 rounded-xl border p-3 text-left transition-all text-sm", isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/30")}
                            >
                              <Icon className="h-4 w-4 text-primary shrink-0" />
                              <span className="font-medium">{cat.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <label className="text-sm font-medium mb-1 block">Subject *</label>
                      <Input {...register("subject")} placeholder="Brief summary of your issue" />
                      {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject.message}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Description *</label>
                      <textarea {...register("description")} placeholder="Describe your issue in detail..." rows={5}
                        className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                      {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Order ID <span className="text-muted-foreground font-normal">(optional)</span></label>
                      <Input {...register("orderId")} placeholder="Paste order ID if related to an order" />
                      {errors.orderId && <p className="text-xs text-destructive mt-1">{errors.orderId.message}</p>}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-1 block">Priority</label>
                      <div className="flex gap-2">
                        {(["LOW", "MEDIUM", "HIGH", "URGENT"] as const).map((p) => (
                          <button key={p} type="button" onClick={() => setPriority(p)}
                            className={cn("flex-1 rounded-xl border py-2 text-sm font-medium transition-all", priority === p ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:border-primary/30")}
                          >
                            {p === "URGENT" ? "Urgent" : p.charAt(0) + p.slice(1).toLowerCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Attach Images <span className="text-muted-foreground font-normal">(optional, max 5MB each)</span></label>
                      <label className="inline-flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 cursor-pointer hover:border-primary/30 transition-colors">
                        {uploading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : <Upload className="h-5 w-5 text-muted-foreground" />}
                        <span className="text-sm text-muted-foreground">{uploading ? "Uploading..." : "Upload Image"}</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                      </label>
                      {uploadedImages.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {uploadedImages.map((url, i) => (
                            <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-border group">
                              <Image src={url} alt={`Upload ${i + 1}`} fill className="object-cover" sizes="64px" />
                              <button type="button" onClick={() => setUploadedImages((prev) => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-0 right-0 h-5 w-5 bg-black/50 flex items-center justify-center rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                              ><X className="h-3 w-3 text-white" /></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" className="flex-1" onClick={() => setView("list")}>Cancel</Button>
                      <Button className="flex-1" onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending}>
                        {createMutation.isPending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</> : <><Send className="h-4 w-4 mr-2" /> Submit Ticket</>}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="guide" className="mt-0">
              <HowToUseGuide />
            </TabsContent>
          </Tabs>
        )}

        {view === "detail" && selectedTicket && (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {(() => { const ci = categories.find((c) => c.id === selectedTicket.category); const Ci = ci?.icon || HelpCircle; return <Ci className="h-5 w-5 text-primary" />; })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold">{selectedTicket.subject}</h2>
                    <p className="text-xs text-muted-foreground">Ticket #{selectedTicket.id.slice(0, 8)}{selectedTicket.orderId && <> · Order #{selectedTicket.orderId.slice(0, 8)}</>}</p>
                  </div>
                  <Badge className={cn("text-xs", statusConfig[selectedTicket.status].color)}>{statusConfig[selectedTicket.status].label}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{selectedTicket.description}</p>
                <p className="text-[10px] text-muted-foreground mt-2">Created {new Date(selectedTicket.createdAt).toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>

            {selectedTicket.messages.length > 0 && (
              <div className="space-y-3">
                {selectedTicket.messages.map((msg) => (
                  <Card key={msg.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold", msg.senderId ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                          {msg.senderId ? "A" : "Y"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium mb-1">{msg.senderId ? "Support Team" : "You"}</p>
                          <p className="text-sm">{msg.message}</p>
                          {msg.mediaUrls?.length > 0 && (
                            <div className="flex gap-2 mt-2">
                              {msg.mediaUrls.map((url, i) => (
                                <div key={i} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border">
                                  <Image src={url} alt={`Media ${i + 1}`} fill className="object-cover" sizes="80px" />
                                </div>
                              ))}
                            </div>
                          )}
                          <p className="text-[10px] text-muted-foreground mt-1">{new Date(msg.createdAt).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedTicket.status !== "CLOSED" && selectedTicket.status !== "RESOLVED" && (
              <Card>
                <CardContent className="p-4">
                  <div className="flex gap-2">
                    <textarea value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Type your message..." rows={2}
                      className="flex-1 rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                      onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && replyText.trim()) { e.preventDefault(); replyMutation.mutate({ ticketId: selectedTicket.id, message: replyText.trim() }); } }}
                    />
                    <Button onClick={() => replyMutation.mutate({ ticketId: selectedTicket.id, message: replyText.trim() })} disabled={!replyText.trim() || replyMutation.isPending} className="self-end">
                      {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
