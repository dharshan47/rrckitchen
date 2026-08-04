"use client";

import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Ticket, Loader2, CheckCircle2, Clock, AlertCircle, X, 
  ChevronRight, Package, User, ChefHat,
  Truck, CreditCard, UploadCloud, ShieldCheck, Timer, 
  ThumbsUp, MoreHorizontal, MessageSquare, Mail, Edit3, 
  Navigation, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "@/lib/auth-client";
import { SupportSkeleton } from "@/components/account/support-skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  useSupportTicketsQuery,
  useCreateSupportTicketMutation,
  useSupportTickets,
  useSupportActiveTab,
  useSupportCategory,
  useSupportPriority,
  useSupportUploadedImages,
  useSupportUploading,
  useSupportActions,
} from "@/stores/supportStore";

const ticketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject too long"),
  description: z.string().min(10, "Please provide at least 10 characters").max(2000, "Description too long"),
  orderId: z.string().max(100, "Order ID too long").optional(),
});

type TicketForm = z.infer<typeof ticketSchema>;

const statusConfig: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  OPEN: { label: "OPEN", color: "text-blue-600 bg-blue-50 border-blue-200", icon: AlertCircle },
  INPROGRESS: { label: "IN PROGRESS", color: "text-amber-600 bg-amber-50 border-amber-200", icon: Clock },
  RESOLVED: { label: "RESOLVED", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle2 },
  CLOSED: { label: "CLOSED", color: "text-gray-600 bg-gray-50 border-gray-200", icon: CheckCircle2 },
};

const priorityColors: Record<string, string> = {
  LOW: "text-green-600",
  MEDIUM: "text-amber-600",
  HIGH: "text-red-500",
  URGENT: "text-red-700 font-bold",
};

const categories = [
  { id: "order", label: "Order Issue", desc: "Track, cancel, modify orders", icon: Package, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "delivery", label: "Delivery Issue", desc: "Delivery delays, wrong address", icon: Truck, color: "text-orange-500", bg: "bg-orange-50" },
  { id: "food", label: "Food Quality", desc: "Quality, taste, packaging issues", icon: ChefHat, color: "text-green-600", bg: "bg-green-50" },
  { id: "payment", label: "Payment Issue", desc: "Refunds, failed payments", icon: CreditCard, color: "text-red-500", bg: "bg-red-50" },
  { id: "account", label: "Account Issue", desc: "Login, profile, account settings", icon: User, color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "other", label: "Other", desc: "Other queries and concerns", icon: MoreHorizontal, color: "text-orange-500", bg: "bg-orange-50" },
];

export function SupportContent() {
  const { data: session, isPending: sessionPending } = useSession();
  const isLoggedIn = !!session?.user;

  const activeTab = useSupportActiveTab();
  const selectedCategory = useSupportCategory();
  const priority = useSupportPriority();
  const uploadedImages = useSupportUploadedImages();
  const uploading = useSupportUploading();
  const {
    setActiveTab,
    setSelectedCategory,
    setUploadedImages,
    setUploading,
  } = useSupportActions();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { subject: "", description: "", orderId: "" },
  });

  const { isLoading } = useSupportTicketsQuery(isLoggedIn);

  const tickets = useSupportTickets();

  const filteredTickets = tickets.filter(t => {
    if (activeTab === "All") return true;
    if (activeTab === "Open") return t.status === "OPEN";
    if (activeTab === "In Progress") return t.status === "INPROGRESS";
    if (activeTab === "Resolved") return t.status === "RESOLVED";
    if (activeTab === "Closed") return t.status === "CLOSED";
    return true;
  });

  const createMutation = useCreateSupportTicketMutation(() => {
    reset();
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
    if (!selectedCategory) { toast.error("Please select a category"); return; }
    createMutation.mutate({ ...formData, category: selectedCategory, priority, mediaUrls: uploadedImages });
  };

  const handleReset = () => {
    reset();
    setSelectedCategory("");
    setUploadedImages([]);
  };

  if (sessionPending || isLoading) {
    return <SupportSkeleton />;
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#F8F9FA] text-foreground">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <Ticket className="h-16 w-16 text-muted-foreground/40" />
          <div>
            <h1 className="text-2xl font-bold">Login to access Support Center</h1>
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
    <main className="min-h-screen bg-[#F8F9FA] text-foreground pb-20 font-sans">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Support Center</h1>
            <p className="text-gray-500 text-sm sm:text-base">We&apos;re here to help! Raise a ticket, track your issues and get the assistance you need.</p>
          </div>
          <div className="hidden md:flex h-24 w-24 bg-green-50 rounded-full items-center justify-center shrink-0 border-[4px] border-white shadow-sm relative">
            <div className="absolute inset-0 rounded-full border-2 border-green-100 animate-pulse" />
            <MessageSquare className="h-10 w-10 text-green-600" />
            <div className="absolute top-2 right-2 h-4 w-4 bg-green-500 rounded-full border-2 border-white" />
          </div>
        </div>

        {/* Categories Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-200 bg-white hover:shadow-md group",
                  isSelected ? "border-primary shadow-sm ring-1 ring-primary" : "border-gray-100 hover:border-gray-200"
                )}
              >
                <div className={cn("h-12 w-12 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110", cat.bg)}>
                  <Icon className={cn("h-6 w-6", cat.color)} />
                </div>
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{cat.label}</h3>
                <p className="text-[10px] text-gray-500 leading-tight">{cat.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Raise a New Ticket (Form) */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">Raise a New Ticket</h2>
            <Card className="rounded-2xl border-gray-100 shadow-sm flex-1 flex flex-col">
              <CardContent className="p-6 space-y-5 flex-1 flex flex-col">
                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center">Category <span className="text-red-500 ml-1">*</span></label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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
                  <Input {...register("orderId")} placeholder="Enter your order ID (e.g. #RRC123456)" className="rounded-xl border-gray-200 bg-gray-50/50" />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center">Description <span className="text-red-500 ml-1">*</span></label>
                  <Textarea {...register("description")} placeholder="Please describe your issue in detail..." className="rounded-xl border-gray-200 bg-gray-50/50 resize-none flex-1 min-h-[120px]" />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 mb-1.5 flex items-center">Attach Images <span className="text-gray-400 ml-1 font-normal">(Optional)</span></label>
                  <label className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center shrink-0">
                      {uploading ? <Loader2 className="h-5 w-5 text-green-600 animate-spin" /> : <UploadCloud className="h-5 w-5 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-700"><span className="underline">Click to upload</span> or drag & drop</p>
                      <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
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
                  <Button type="button" variant="outline" className="w-24 rounded-xl border-gray-200 text-gray-600 font-semibold" onClick={handleReset}>Reset</Button>
                  <Button type="button" onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending} className="flex-1 rounded-xl bg-[#F05522] hover:bg-[#D94819] text-white font-semibold">
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Navigation className="h-4 w-4 mr-2 -rotate-45" />}
                    Submit Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column: My Tickets */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <h2 className="text-lg font-bold text-gray-900 mb-4 px-1">My Tickets</h2>
            <Card className="rounded-2xl border-gray-100 shadow-sm flex-1 flex flex-col bg-white overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="px-6 pt-4 border-b border-gray-100">
                  <TabsList className="w-full h-auto p-0 bg-transparent flex justify-start gap-6 border-none overflow-x-auto scrollbar-none">
                    {["All", "Open", "In Progress", "Resolved", "Closed"].map((tab) => (
                      <TabsTrigger 
                        key={tab} 
                        value={tab} 
                        className="rounded-none px-0 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-green-600 data-[state=active]:text-green-700 text-gray-500 font-medium text-sm transition-none"
                      >
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                <TabsContent value={activeTab} className="p-6 m-0 flex-1 flex flex-col space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredTickets.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                      <Ticket className="h-12 w-12 text-gray-200 mb-3" />
                      <p className="text-gray-500 text-sm">No tickets found for this status.</p>
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const statusInfo = statusConfig[ticket.status] || statusConfig.OPEN;
                      const catInfo = categories.find((c) => c.id === ticket.category) || categories[0];
                      const CatIcon = catInfo.icon;
                      
                      return (
                        <Link href={`/support?ticket=${ticket.id}`} key={ticket.id} className="block group">
                          <div className="rounded-2xl border border-gray-100 p-4 transition-all hover:border-gray-300 hover:shadow-sm bg-white">
                            <div className="flex gap-4">
                              <div className={cn("h-12 w-12 rounded-full flex items-center justify-center shrink-0", catInfo.bg)}>
                                <CatIcon className={cn("h-6 w-6", catInfo.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <h3 className="font-bold text-sm text-gray-900 truncate pr-2">{ticket.subject}</h3>
                                  <Badge variant="outline" className={cn("text-[10px] font-bold px-2 py-0.5 border", statusInfo.color)}>
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-xs text-gray-500 mb-2 gap-2">
                                  {ticket.orderId && <span>Order ID: {ticket.orderId}</span>}
                                  {ticket.orderId && <span>•</span>}
                                  <span>{new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-1 mb-2">{ticket.description}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[10px] font-medium text-gray-400">
                                    Priority: <span className={priorityColors[ticket.priority]}>{ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}</span>
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </TabsContent>
                
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                  <Button variant="outline" className="w-full bg-white text-gray-700 font-semibold border-gray-200 rounded-xl hover:bg-gray-50" asChild>
                    <Link href="/support">View All Tickets</Link>
                  </Button>
                </div>
              </Tabs>
            </Card>
          </div>

          {/* Right Column: Information */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            
            {/* How to Use Support */}
            <Card className="rounded-2xl border-gray-100 shadow-sm border-t-4 border-t-green-600 bg-white">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-6">How to Use Support</h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                  
                  <div className="relative flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-sm z-10">1</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center"><Package className="h-3.5 w-3.5 text-gray-600" /></div>
                        <h4 className="font-bold text-xs text-gray-900">Choose a Category</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-snug">Select the category that best matches your issue.</p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-sm z-10">2</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center"><Edit3 className="h-3.5 w-3.5 text-gray-600" /></div>
                        <h4 className="font-bold text-xs text-gray-900">Describe Your Issue</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-snug">Provide a clear subject and detailed description.</p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-sm z-10">3</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center"><UploadCloud className="h-3.5 w-3.5 text-gray-600" /></div>
                        <h4 className="font-bold text-xs text-gray-900">Attach Evidence</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-snug">Upload images if needed for faster resolution.</p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-green-700 text-white flex items-center justify-center shrink-0 font-bold text-xs shadow-sm z-10">4</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded bg-gray-100 flex items-center justify-center"><Navigation className="h-3.5 w-3.5 text-gray-600" /></div>
                        <h4 className="font-bold text-xs text-gray-900">Submit Ticket</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-snug">Our team will review and respond to your ticket.</p>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="rounded-2xl border-gray-100 shadow-sm bg-white">
              <CardContent className="p-5 flex items-start gap-3">
                <div className="mt-0.5"><Clock className="h-5 w-5 text-gray-400" /></div>
                <div>
                  <h4 className="font-bold text-sm text-gray-900 mb-1">Support Hours</h4>
                  <p className="text-xs text-gray-500 font-medium">We&apos;re available 24/7</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Our support team typically responds within a few hours.</p>
                </div>
              </CardContent>
            </Card>

            {/* Other Ways to Reach Us */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3 px-1 text-sm">Other Ways to Reach Us</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 transition-colors cursor-pointer">
                  <MessageSquare className="h-5 w-5 text-gray-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">Live Chat</h4>
                    <p className="text-[11px] text-gray-500">Chat with our support team</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-white shadow-sm hover:border-gray-200 transition-colors cursor-pointer">
                  <Mail className="h-5 w-5 text-gray-400 shrink-0" />
                  <div>
                    <h4 className="font-bold text-xs text-gray-900">Email Support</h4>
                    <p className="text-[11px] text-gray-500">support@rrckitchen.com</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F2F8F4] rounded-2xl p-6 border border-green-100/50">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-green-700 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-gray-900">Secure & Confidential</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Your information is safe with us.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Timer className="h-8 w-8 text-green-700 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-gray-900">Quick Resolution</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">We aim to resolve all issues as quickly as possible.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UserCheck className="h-8 w-8 text-green-700 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-gray-900">Expert Support</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Our support team is trained to help you better.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThumbsUp className="h-8 w-8 text-green-700 shrink-0" />
            <div>
              <h4 className="font-bold text-xs text-gray-900">Customer First</h4>
              <p className="text-[10px] text-gray-500 mt-0.5">Your satisfaction is our top priority.</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
