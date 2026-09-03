"use client";

import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Ticket, Loader2, X, 
  ChevronRight, Package, UserRound, ChefHat,
  Truck, CreditCard, ShieldCheck, 
  ThumbsUp, Ellipsis, MessageCircle, Mail, Pencil, 
  Upload, Send, Grid2X2, Clock3, UsersRound, Headphones
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
import { CloudinaryUpload } from "@/components/cloudinary/cloudinary-upload";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { LiveChatWidget } from "@/components/chat/live-chat-widget";
import { useLiveChatStore } from "@/stores";
import {
  useSupportTicketsQuery,
  useCreateSupportTicketMutation,
  useSupportTickets,
  useSupportActiveTab,
  useSupportCategory,
  useSupportPriority,
  useSupportUploadedImages,
  useSupportActions,
} from "@/stores/supportStore";

const ticketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject too long"),
  description: z.string().min(10, "Please provide at least 10 characters").max(2000, "Description too long"),
  orderId: z.string().max(100, "Order ID too long").optional(),
});

type TicketForm = z.infer<typeof ticketSchema>;

const statusConfig: Record<string, { label: string; color: string; }> = {
  OPEN: { label: "OPEN", color: "text-[#2563EB] bg-[#EFF6FF] border-[#DBEAFE]" },
  INPROGRESS: { label: "IN PROGRESS", color: "text-[#D97706] bg-[#FFF7ED] border-[#FED7AA]" },
  RESOLVED: { label: "RESOLVED", color: "text-[#087A35] bg-[#EAF5ED] border-[#D8EBDD]" },
  CLOSED: { label: "CLOSED", color: "text-[#475569] bg-[#F3F4F6] border-[#E5E7EB]" },
};

const priorityColors: Record<string, string> = {
  LOW: "text-[#087A35]",
  MEDIUM: "text-[#F59E0B]",
  HIGH: "text-[#FF4B00]",
  URGENT: "text-[#DC2626] font-bold",
};

const categories = [
  { id: "order", label: "Order Issue", desc: "Track, cancel, modify orders", icon: Package, color: "text-[#087A35]", bg: "bg-[#EAF5ED]" },
  { id: "delivery", label: "Delivery Issue", desc: "Delivery delays, wrong address", icon: Truck, color: "text-[#FF4B00]", bg: "bg-[#FFF0E9]" },
  { id: "food", label: "Food Quality", desc: "Quality, taste, packaging issues", icon: ChefHat, color: "text-[#087A35]", bg: "bg-[#EAF5ED]" },
  { id: "payment", label: "Payment Issue", desc: "Refunds, failed payments", icon: CreditCard, color: "text-[#FF4B00]", bg: "bg-[#FFF0E9]" },
  { id: "account", label: "Account Issue", desc: "Login, profile, account settings", icon: UserRound, color: "text-[#087A35]", bg: "bg-[#EAF5ED]" },
  { id: "other", label: "Other", desc: "Other queries and concerns", icon: Ellipsis, color: "text-[#FF4B00]", bg: "bg-[#FFF0E9]" },
];

export function SupportContent() {
  const { data: session, isPending: sessionPending } = useSession();
  const isLoggedIn = !!session?.user;

  const activeTab = useSupportActiveTab();
  const selectedCategory = useSupportCategory();
  const openChat = useLiveChatStore((state) => state.openChat);
  const priority = useSupportPriority();
  const uploadedImages = useSupportUploadedImages();
  const {
    setActiveTab,
    setSelectedCategory,
    setUploadedImages,
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

  const handleImageUpload = (secureUrl: string) => {
    setUploadedImages((prev) => [...prev, secureUrl]);
    toast.success("Image uploaded");
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
      <main className="min-h-screen bg-[#FAFAFA] text-[#111827]">
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 px-4 py-24 text-center">
          <Ticket className="h-16 w-16 text-[#9CA3AF]" />
          <div>
            <h1 className="text-2xl font-bold">Login to access Support Center</h1>
            <p className="mt-2 text-sm text-[#4B5563]">Please login to create and track support tickets.</p>
          </div>
          <Button asChild className="bg-[#087A35] hover:bg-[#066B2E] text-white">
            <Link href="/login">Login</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#FAFAFA] text-[#111827] pb-20 font-sans">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-[#FAFAFA] p-2 sm:p-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-[#6B7280] mb-4">
              <Link href="/" className="hover:text-[#087A35] transition-colors">Home</Link>
              <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
              <Link href="/account" className="hover:text-[#087A35] transition-colors">Account</Link>
              <ChevronRight className="h-4 w-4 text-[#9CA3AF]" />
              <span className="text-[#111827] font-medium">Support</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-[#111827] mb-2">Support Center</h1>
            <p className="text-[#4B5563] text-sm sm:text-base">We&apos;re here to help! Raise a ticket, track your issues and get the assistance you need.</p>
          </div>
          <div className="hidden md:flex h-24 w-24 rounded-full items-center justify-center shrink-0 relative bg-[#F7F9F7]">
            <Headphones className="h-10 w-10 text-[#087A35] stroke-[1.5px]" />
            <div className="absolute top-4 right-4 h-2 w-2 bg-[#FFB347] rounded-full" />
            <div className="absolute top-1/2 left-4 h-1.5 w-1.5 bg-[#FFB347] rounded-full" />
            <div className="absolute bottom-4 right-6 h-1 w-1 bg-[#087A35] rounded-full" />
            <div className="absolute top-6 left-6 h-1.5 w-1.5 bg-[#087A35] rounded-full" />
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
                  "flex flex-col items-center text-center p-6 rounded-[12px] border transition-all duration-200 bg-[#FFFFFF]",
                  isSelected ? "border-[#087A35] shadow-[0_2px_8px_rgba(17,24,39,0.04)] ring-1 ring-[#087A35]" : "border-[#E5E7EB] hover:border-[#D1D5DB] shadow-[0_2px_8px_rgba(17,24,39,0.04)]"
                )}
              >
                <div className={cn("h-[52px] w-[52px] rounded-full flex items-center justify-center mb-4", cat.bg)}>
                  <Icon className={cn("h-6 w-6 stroke-[1.8px]", cat.color)} />
                </div>
                <h3 className="font-semibold text-sm text-[#111827] mb-1">{cat.label}</h3>
                <p className="text-[11px] text-[#4B5563] leading-snug">{cat.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Main 3-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Raise a New Ticket (Form) */}
          <div className="lg:col-span-4 flex flex-col h-full">
            <h2 className="text-lg font-bold text-[#111827] mb-6 px-1 relative after:content-[''] after:block after:w-[25px] after:h-[2px] after:bg-[#FF4B00] after:mt-2">Raise a New Ticket</h2>
            <Card className="rounded-[12px] border-[#E5E7EB] shadow-[0_2px_8px_rgba(17,24,39,0.04)] flex-1 flex flex-col bg-[#FFFFFF]">
              <CardContent className="p-6 space-y-5 flex-1 flex flex-col">
                <div>
                  <label className="text-xs font-semibold text-[#1F2937] mb-1.5 flex items-center">Category <span className="text-[#FF4B00] ml-1">*</span></label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="rounded-[7px] border-[#D1D5DB] bg-[#FFFFFF] h-[44px] text-[#374151] focus:border-[#087A35] focus:ring-[3px] focus:ring-[#087A35]/10">
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
                  <label className="text-xs font-semibold text-[#1F2937] mb-1.5 flex items-center">Subject <span className="text-[#FF4B00] ml-1">*</span></label>
                  <Input {...register("subject")} placeholder="Briefly describe your issue" className="rounded-[7px] border-[#D1D5DB] bg-[#FFFFFF] h-[44px] text-[#374151] placeholder:text-[#9CA3AF] focus-visible:ring-0 focus-visible:border-[#087A35] focus-visible:shadow-[0_0_0_3px_rgba(8,122,53,0.1)]" />
                  {errors.subject && <p className="text-xs text-[#DC2626] mt-1">{errors.subject.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2937] mb-1.5 flex items-center">Order ID <span className="text-[#9CA3AF] ml-1 font-normal">(Optional)</span></label>
                  <Input {...register("orderId")} placeholder="Enter your order ID (e.g. #RRC123456)" className="rounded-[7px] border-[#D1D5DB] bg-[#FFFFFF] h-[44px] text-[#374151] placeholder:text-[#9CA3AF] focus-visible:ring-0 focus-visible:border-[#087A35] focus-visible:shadow-[0_0_0_3px_rgba(8,122,53,0.1)]" />
                </div>

                <div className="flex-1 flex flex-col">
                  <label className="text-xs font-semibold text-[#1F2937] mb-1.5 flex items-center">Description <span className="text-[#FF4B00] ml-1">*</span></label>
                  <Textarea {...register("description")} placeholder="Please describe your issue in detail..." className="rounded-[7px] border-[#D1D5DB] bg-[#FFFFFF] text-[#374151] placeholder:text-[#9CA3AF] resize-none flex-1 min-h-[120px] focus-visible:ring-0 focus-visible:border-[#087A35] focus-visible:shadow-[0_0_0_3px_rgba(8,122,53,0.1)]" />
                  {errors.description && <p className="text-xs text-[#DC2626] mt-1">{errors.description.message}</p>}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#1F2937] mb-1.5 flex items-center">Attach Images <span className="text-[#9CA3AF] ml-1 font-normal">(Optional)</span></label>
                  <CloudinaryUpload onUpload={(res) => handleImageUpload(res.secure_url)}>
                    {({ uploading, startUpload }) => (
                      <button
                        type="button"
                        onClick={startUpload}
                        disabled={uploading}
                        className="w-full flex items-center gap-3 rounded-[8px] border border-dashed border-[#D1D5DB] p-4 cursor-pointer hover:bg-[#F3F9F4] transition-colors bg-[#FFFFFF] disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        <div className="h-10 w-10 flex items-center justify-center shrink-0">
                          {uploading ? <Loader2 className="h-5 w-5 text-[#087A35] animate-spin stroke-[1.8px]" /> : <Upload className="h-5 w-5 text-[#087A35] stroke-[1.8px]" />}
                        </div>
                        <div className="flex-1 min-w-0 text-left">
                          <p className="text-sm font-medium text-[#087A35]"><span className="underline">Click to upload</span> <span className="text-[#374151] no-underline">or drag & drop</span></p>
                          <p className="text-[11px] text-[#6B7280] mt-0.5">PNG, JPG, JPEG up to 5MB</p>
                        </div>
                      </button>
                    )}
                  </CloudinaryUpload>
                  {uploadedImages.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {uploadedImages.map((url, i) => (
                        <div key={i} className="relative h-14 w-14 rounded-lg overflow-hidden border border-[#E5E7EB] group">
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
                  <Button type="button" variant="outline" className="w-24 rounded-[7px] border-[#087A35] text-[#087A35] font-semibold hover:bg-[#F3F9F4] bg-[#FFFFFF] shadow-none h-[44px]" onClick={handleReset}>Reset</Button>
                  <Button type="button" onClick={handleSubmit(onSubmit)} disabled={createMutation.isPending} className="flex-1 rounded-[8px] bg-[#FF4B00] hover:bg-[#E94100] text-white font-semibold hover:-translate-y-[1px] transition-transform shadow-[0_3px_8px_rgba(255,75,0,0.15)] h-[44px]">
                    {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2 stroke-[1.8px]" />}
                    Submit Ticket
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Middle Column: My Tickets */}
          <div className="lg:col-span-5 flex flex-col h-full">
            <h2 className="text-lg font-bold text-[#111827] mb-6 px-1 relative after:content-[''] after:block after:w-[25px] after:h-[2px] after:bg-[#FF4B00] after:mt-2">My Tickets</h2>
            <Card className="rounded-[12px] border-[#E5E7EB] shadow-[0_2px_8px_rgba(17,24,39,0.04)] flex-1 flex flex-col bg-[#FFFFFF] overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <div className="px-6 pt-4 border-b border-[#ECEFF1]">
                  <TabsList className="w-full h-auto p-0 bg-transparent flex justify-start gap-6 border-none overflow-x-auto scrollbar-none">
                    {["All", "Open", "In Progress", "Resolved", "Closed"].map((tab) => (
                      <TabsTrigger 
                        key={tab} 
                        value={tab} 
                        className="rounded-none border-x-0 border-t-0 border-b-2 border-b-transparent px-0 py-3 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[#087A35] data-[state=active]:text-[#087A35] text-[#6B7280] font-semibold text-sm transition-none hover:bg-transparent focus-visible:ring-0 outline-none"
                      >
                        {tab}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>
                
                <TabsContent value={activeTab} className="p-6 m-0 flex-1 flex flex-col space-y-4 max-h-[600px] overflow-y-auto">
                  {filteredTickets.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
                      <Ticket className="h-12 w-12 text-[#9CA3AF] mb-3" />
                      <p className="text-[#6B7280] text-sm">No tickets found for this status.</p>
                    </div>
                  ) : (
                    filteredTickets.map((ticket) => {
                      const statusInfo = statusConfig[ticket.status] || statusConfig.OPEN;
                      const catInfo = categories.find((c) => c.id === ticket.category) || categories[0];
                      const CatIcon = catInfo.icon;
                      
                      return (
                        <Link href={`/support?ticket=${ticket.publicCode ?? ticket.id}`} key={ticket.id} className="block group">
                          <div className="rounded-[10px] border border-[#E9ECEF] p-4 transition-all hover:border-[#D1D5DB] hover:shadow-[0_2px_8px_rgba(17,24,39,0.04)] bg-[#FFFFFF]">
                            <div className="flex gap-4">
                              <div className={cn("h-[52px] w-[52px] rounded-full flex items-center justify-center shrink-0", catInfo.bg)}>
                                <CatIcon className={cn("h-6 w-6 stroke-[1.8px]", catInfo.color)} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                  <h3 className="font-bold text-sm text-[#111827] truncate pr-2">
                                    {ticket.publicCode ?? `#${ticket.id.slice(-6).toUpperCase()}`} - {ticket.subject}
                                  </h3>
                                  <Badge variant="outline" className={cn("text-[10px] font-bold px-2.5 py-0.5 border rounded-[6px] uppercase", statusInfo.color)}>
                                    {statusInfo.label}
                                  </Badge>
                                </div>
                                <div className="flex items-center text-xs text-[#6B7280] mb-2 gap-2">
                                  {ticket.orderId && <span>Order ID: {ticket.orderId}</span>}
                                  {ticket.orderId && <span>•</span>}
                                  <span>{new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                <p className="text-xs text-[#6B7280] line-clamp-1 mb-2">{ticket.description}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[11px] font-medium text-[#6B7280]">
                                    Priority: <span className={cn("ml-1", priorityColors[ticket.priority])}>{ticket.priority.charAt(0) + ticket.priority.slice(1).toLowerCase()}</span>
                                  </span>
                                  <ChevronRight className="h-4 w-4 text-[#9CA3AF] group-hover:text-[#6B7280] transition-colors stroke-[1.8px]" />
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      );
                    })
                  )}
                </TabsContent>
                
                <div className="p-4 border-t border-[#ECEFF1] bg-[#FFFFFF]">
                  <Button variant="outline" className="w-full bg-[#FFFFFF] text-[#087A35] font-semibold border-[#087A35] rounded-[6px] hover:bg-[#F3F9F4] h-[40px]" asChild>
                    <Link href="/support">View All Tickets</Link>
                  </Button>
                </div>
              </Tabs>
            </Card>
          </div>

          {/* Right Column: Information */}
          <div className="lg:col-span-3 flex flex-col space-y-6">
            
            {/* How to Use Support */}
            <Card className="rounded-[10px] border-[#DCE9DF] shadow-[0_2px_8px_rgba(17,24,39,0.04)] bg-[#FBFDFC]">
              <CardContent className="p-6">
                <h3 className="font-bold text-[#087A35] mb-6 text-sm relative after:content-[''] after:block after:w-[25px] after:h-[2px] after:bg-[#FF4B00] after:mt-2">How to Use Support</h3>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-[#DDE9E0]">
                  
                  <div className="relative flex items-start gap-4">
                    <div className="h-6 w-6 rounded-full bg-[#087A35] text-white flex items-center justify-center shrink-0 font-bold text-[11px] z-10">1</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded bg-[#EAF5ED] flex items-center justify-center"><Grid2X2 className="h-3.5 w-3.5 text-[#087A35] stroke-[1.8px]" /></div>
                        <h4 className="font-bold text-xs text-[#111827]">Choose a Category</h4>
                      </div>
                      <p className="text-[11px] text-[#4B5563] leading-snug">Select the category that best matches your issue.</p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className="h-6 w-6 rounded-full bg-[#087A35] text-white flex items-center justify-center shrink-0 font-bold text-[11px] z-10">2</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded bg-[#EAF5ED] flex items-center justify-center"><Pencil className="h-3.5 w-3.5 text-[#087A35] stroke-[1.8px]" /></div>
                        <h4 className="font-bold text-xs text-[#111827]">Describe Your Issue</h4>
                      </div>
                      <p className="text-[11px] text-[#4B5563] leading-snug">Provide a clear subject and detailed description.</p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className="h-6 w-6 rounded-full bg-[#087A35] text-white flex items-center justify-center shrink-0 font-bold text-[11px] z-10">3</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded bg-[#EAF5ED] flex items-center justify-center"><Upload className="h-3.5 w-3.5 text-[#087A35] stroke-[1.8px]" /></div>
                        <h4 className="font-bold text-xs text-[#111827]">Attach Evidence</h4>
                      </div>
                      <p className="text-[11px] text-[#4B5563] leading-snug">Upload images if needed for faster resolution.</p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className="h-6 w-6 rounded-full bg-[#087A35] text-white flex items-center justify-center shrink-0 font-bold text-[11px] z-10">4</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-6 w-6 rounded bg-[#EAF5ED] flex items-center justify-center"><Send className="h-3.5 w-3.5 text-[#087A35] stroke-[1.8px]" /></div>
                        <h4 className="font-bold text-xs text-[#111827]">Submit Ticket</h4>
                      </div>
                      <p className="text-[11px] text-[#4B5563] leading-snug">Our team will review and respond to your ticket.</p>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card className="rounded-[10px] border-[#DCE9DF] shadow-[0_2px_8px_rgba(17,24,39,0.04)] bg-[#FBFDFC]">
              <CardContent className="p-5 flex items-start gap-3">
                <div className="mt-0.5"><Clock3 className="h-5 w-5 text-[#087A35] stroke-[1.8px]" /></div>
                <div>
                  <h4 className="font-bold text-sm text-[#087A35] mb-1">Support Hours</h4>
                  <p className="text-xs text-[#4B5563] font-medium">We&apos;re available 24/7</p>
                  <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">Our support team typically responds within a few hours.</p>
                </div>
              </CardContent>
            </Card>

            {/* Other Ways to Reach Us */}
            <div>
              <h3 className="font-bold text-[#111827] mb-4 px-1 text-sm relative after:content-[''] after:block after:w-[25px] after:h-[2px] after:bg-[#FF4B00] after:mt-2">Other Ways to Reach Us</h3>
              <div className="space-y-3">
                <div 
                  className="flex items-center gap-3 p-3.5 rounded-[10px] border border-[#DCE9DF] bg-[#FBFDFC] shadow-[0_2px_8px_rgba(17,24,39,0.04)] hover:border-[#D8EBDD] transition-colors cursor-pointer"
                  onClick={openChat}
                >
                  <MessageCircle className="h-5 w-5 text-[#087A35] shrink-0 stroke-[1.8px]" />
                  <div>
                    <h4 className="font-bold text-xs text-[#087A35]">Live Chat</h4>
                    <p className="text-[11px] text-[#4B5563]">Chat with our support team</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-[10px] border border-[#DCE9DF] bg-[#FBFDFC] shadow-[0_2px_8px_rgba(17,24,39,0.04)] hover:border-[#D8EBDD] transition-colors cursor-pointer">
                  <Mail className="h-5 w-5 text-[#087A35] shrink-0 stroke-[1.8px]" />
                  <div>
                    <h4 className="font-bold text-xs text-[#087A35]">Email Support</h4>
                    <p className="text-[11px] text-[#4B5563]">support@rrckitchen.com</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Banner */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#F5FAF6] rounded-[12px] p-6 border border-[#DDE9E0]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-[#087A35] shrink-0 stroke-[1.8px]" />
            <div>
              <h4 className="font-bold text-xs text-[#087A35]">Secure & Confidential</h4>
              <p className="text-[10px] text-[#6B7280] mt-0.5">Your information is safe with us.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock3 className="h-8 w-8 text-[#087A35] shrink-0 stroke-[1.8px]" />
            <div>
              <h4 className="font-bold text-xs text-[#087A35]">Quick Resolution</h4>
              <p className="text-[10px] text-[#6B7280] mt-0.5">We aim to resolve all issues as quickly as possible.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <UsersRound className="h-8 w-8 text-[#087A35] shrink-0 stroke-[1.8px]" />
            <div>
              <h4 className="font-bold text-xs text-[#087A35]">Expert Support</h4>
              <p className="text-[10px] text-[#6B7280] mt-0.5">Our support team is trained to help you better.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ThumbsUp className="h-8 w-8 text-[#087A35] shrink-0 stroke-[1.8px]" />
            <div>
              <h4 className="font-bold text-xs text-[#087A35]">Customer First</h4>
              <p className="text-[10px] text-[#6B7280] mt-0.5">Your satisfaction is our top priority.</p>
            </div>
          </div>
        </div>

      </div>
      <LiveChatWidget />
    </main>
  );
}
