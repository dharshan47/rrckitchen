"use client";

import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Ticket,
  MessageSquare,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Send,
  User,
  Package,
  ChefHat,
  Truck,
  CreditCard,
  HelpCircle,
  Shield,
  Download,
  Eye,
  X,
  RotateCcw,
  Copy,
  Phone,
  Mail,
  Smile,
  Paperclip,
  ImageIcon,
  Lock,
  Check,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format, subDays, startOfDay } from "date-fns";
import {
  useAdminSupportTicketsQuery,
  useAdminSelectedSupportTicket,
  useAdminSupportActions,
  useAdminUpdateTicketStatusMutation,
  useAdminReplyToTicketMutation,
  type AdminSupportTicket,
} from "@/stores";

const replySchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(2000, "Message too long"),
});

const statusConfig: Record<
  string,
  { label: string; className: string; dotColor: string }
> = {
  OPEN: {
    label: "OPEN",
    className:
      "text-blue-600 bg-blue-50 border border-blue-200 font-bold text-[10px] px-2.5 py-1 rounded-md",
    dotColor: "bg-blue-600",
  },
  INPROGRESS: {
    label: "IN PROGRESS",
    className:
      "text-orange-600 bg-orange-50 border border-orange-200 font-bold text-[10px] px-2.5 py-1 rounded-md",
    dotColor: "bg-orange-500",
  },
  RESOLVED: {
    label: "RESOLVED",
    className:
      "text-emerald-600 bg-emerald-50 border border-emerald-200 font-bold text-[10px] px-2.5 py-1 rounded-md",
    dotColor: "bg-emerald-500",
  },
  CLOSED: {
    label: "CLOSED",
    className:
      "text-slate-500 bg-slate-100 border border-slate-200 font-bold text-[10px] px-2.5 py-1 rounded-md",
    dotColor: "bg-slate-400",
  },
};

const priorityConfig: Record<
  string,
  { label: string; className: string }
> = {
  LOW: {
    label: "LOW",
    className:
      "text-slate-600 bg-slate-100 border border-slate-200 font-bold text-[10px] px-2.5 py-1 rounded-md",
  },
  MEDIUM: {
    label: "MEDIUM",
    className:
      "text-orange-600 bg-orange-50 border border-orange-200 font-bold text-[10px] px-2.5 py-1 rounded-md",
  },
  HIGH: {
    label: "HIGH",
    className:
      "text-red-600 bg-red-50 border border-red-200 font-bold text-[10px] px-2.5 py-1 rounded-md",
  },
  URGENT: {
    label: "URGENT",
    className:
      "text-red-700 bg-red-100 border border-red-300 font-bold text-[10px] px-2.5 py-1 rounded-md",
  },
};

const categoryConfig: Record<
  string,
  { icon: typeof HelpCircle; label: string; description: string }
> = {
  order: {
    icon: Package,
    label: "Order Issue",
    description: "Related to order placement or status",
  },
  delivery: {
    icon: Truck,
    label: "Delivery Issue",
    description: "Related to delivery time, partner behavior, location or tracking issues.",
  },
  food: {
    icon: ChefHat,
    label: "Food Quality",
    description: "Related to food quality or hygiene",
  },
  payment: {
    icon: CreditCard,
    label: "Payment",
    description: "Related to payment or refund issues",
  },
  account: {
    icon: User,
    label: "Account",
    description: "Related to account access or settings",
  },
  kitchen: {
    icon: ChefHat,
    label: "Kitchen Issue",
    description: "Related to kitchen operations",
  },
  coupons: {
    icon: Package,
    label: "Coupons",
    description: "Related to coupon or offer issues",
  },
  safety: {
    icon: Shield,
    label: "Safety",
    description: "Related to safety concerns",
  },
  other: {
    icon: HelpCircle,
    label: "Other",
    description: "General queries",
  },
};

const PAGE_SIZE = 8;

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTicketId(id: string) {
  return `TKT-${format(new Date(), "yyyy")}-${id.slice(-4).toUpperCase()}`;
}

/* ------------------------- Skeleton components ------------------------- */

function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-2 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <Skeleton className="h-2.5 w-20 rounded-md" />
          <Skeleton className="h-7 w-14 rounded-md" />
          <Skeleton className="h-2.5 w-24 rounded-md" />
        </div>
      ))}
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
      <div className="flex items-center gap-6 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
        <Skeleton className="h-2.5 w-24 rounded-md" />
        <Skeleton className="h-2.5 w-28 rounded-md" />
        <Skeleton className="h-2.5 w-32 rounded-md" />
        <Skeleton className="h-2.5 w-20 rounded-md" />
        <Skeleton className="h-2.5 w-14 rounded-md" />
        <Skeleton className="h-2.5 w-16 rounded-md" />
        <Skeleton className="h-2.5 w-20 rounded-md" />
        <Skeleton className="h-2.5 w-12 rounded-md" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-6 px-4 py-4 border-b border-slate-50"
        >
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-0.5 rounded-full" />
            <Skeleton className="h-3 w-24 rounded-md" />
          </div>
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-2.5 w-20 rounded-md" />
              <Skeleton className="h-2 w-24 rounded-md" />
            </div>
          </div>
          <Skeleton className="h-3 w-32 rounded-md" />
          <Skeleton className="h-3 w-16 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-16 rounded-md" />
          <div className="space-y-1.5">
            <Skeleton className="h-2.5 w-20 rounded-md" />
            <Skeleton className="h-2 w-12 rounded-md" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function FilterRowSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <Skeleton className="h-10 w-full max-w-sm rounded-xl" />
        <div className="flex items-center gap-2 flex-wrap">
          <Skeleton className="h-10 w-[130px] rounded-xl" />
          <Skeleton className="h-10 w-[140px] rounded-xl" />
          <Skeleton className="h-10 w-[145px] rounded-xl" />
          <Skeleton className="h-10 w-20 rounded-xl" />
        </div>
      </div>
      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-28 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ticketsToCSV(tickets: AdminSupportTicket[]) {
  const header = [
    "Ticket ID",
    "Customer",
    "Email",
    "Phone",
    "Subject",
    "Category",
    "Priority",
    "Status",
    "Created At",
  ];
  const rows = tickets.map((t) => [
    `TKT-${t.id.slice(-4).toUpperCase()}`,
    `"${(t.user?.name ?? "Unknown").replace(/"/g, '""')}"`,
    `"${(t.user?.email ?? "").replace(/"/g, '""')}"`,
    `"${(t.user?.phoneNumber ?? "").replace(/"/g, '""')}"`,
    `"${t.subject.replace(/"/g, '""')}"`,
    t.category,
    t.priority,
    t.status,
    format(new Date(t.createdAt), "dd MMM yyyy, hh:mm a"),
  ]);
  return [header, ...rows].map((r) => r.join(",")).join("\n");
}

function downloadCSV(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function AdminSupportPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [detailTab, setDetailTab] = useState("conversation");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const selectedTicket = useAdminSelectedSupportTicket();
  const { setSelectedTicket } = useAdminSupportActions();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<{ message: string }>({
    resolver: zodResolver(replySchema),
    defaultValues: { message: "" },
  });

  const { data: tickets = [], isLoading, isError, refetch } = useAdminSupportTicketsQuery();

  const updateMutation = useAdminUpdateTicketStatusMutation();

  const replyMutation = useAdminReplyToTicketMutation();

  const handleStatusChange = (status: string) => {
    if (!selectedTicket) return;
    updateMutation
      .mutateAsync({ ticketId: selectedTicket.id, status })
      .then(() => toast.success("Ticket status updated"))
      .catch(() => toast.error("Failed to update ticket"));
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedTicket?.messages]);

  // Tab counts
  const tabCounts = {
    ALL: tickets.length,
    OPEN: tickets.filter((t) => t.status === "OPEN").length,
    INPROGRESS: tickets.filter((t) => t.status === "INPROGRESS").length,
    RESOLVED: tickets.filter((t) => t.status === "RESOLVED").length,
    CLOSED: tickets.filter((t) => t.status === "CLOSED").length,
  };

  // Top stats (all real)
  const totalTickets = tickets.length;
  const openCount = tabCounts.OPEN;
  const inProgressCount = tabCounts.INPROGRESS;
  const resolvedCount = tabCounts.RESOLVED;
  const closedCount = tabCounts.CLOSED;

  // Real weekly ticket change
  const weekStart = startOfDay(subDays(new Date(), 6)).getTime();
  const lastWeekStart = startOfDay(subDays(new Date(), 13)).getTime();
  const thisWeek = tickets.filter((t) => new Date(t.createdAt).getTime() >= weekStart).length;
  const lastWeek = tickets.filter((t) => {
    const ts = new Date(t.createdAt).getTime();
    return ts >= lastWeekStart && ts < weekStart;
  }).length;
  const weeklyChange =
    lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : null;

  // Real avg response time: avg time from ticket creation to first admin reply
  let avgMs: number | null = null;
  const withAdminReply = tickets
    .filter((t) => t.messages.some((m) => m.senderId !== t.userId))
    .map((t) => {
      const firstAdmin = t.messages.find((m) => m.senderId !== t.userId)!;
      return new Date(firstAdmin.createdAt).getTime() - new Date(t.createdAt).getTime();
    })
    .filter((d) => d > 0);
  if (withAdminReply.length > 0) {
    avgMs = withAdminReply.reduce((s, d) => s + d, 0) / withAdminReply.length;
  }
  const avgResponse =
    avgMs === null
      ? "—"
      : avgMs < 3600000
      ? `${Math.max(1, Math.round(avgMs / 60000))}m`
      : `${(avgMs / 3600000).toFixed(1)}h`;

  // Filtering
  const filtered = tickets
    .filter((t) => activeTab === "ALL" || t.status === activeTab)
    .filter((t) => priorityFilter === "ALL" || t.priority === priorityFilter)
    .filter((t) => categoryFilter === "ALL" || t.category === categoryFilter)
    .filter(
      (t) =>
        !search ||
        t.subject.toLowerCase().includes(search.toLowerCase()) ||
        t.id.toLowerCase().includes(search.toLowerCase()) ||
        (t.user?.name || "").toLowerCase().includes(search.toLowerCase())
    );

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const statCards = [
    {
      label: "Total Tickets",
      value: totalTickets,
      change: weeklyChange === null ? "New this week" : `${weeklyChange >= 0 ? "+" : ""}${weeklyChange.toFixed(1)}%`,
      changeUp: weeklyChange === null ? true : weeklyChange >= 0,
      icon: Ticket,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      label: "Open Tickets",
      value: openCount,
      sub: `${totalTickets > 0 ? ((openCount / totalTickets) * 100).toFixed(1) : 0}% of total`,
      icon: AlertCircle,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      label: "In Progress",
      value: inProgressCount,
      sub: `${totalTickets > 0 ? ((inProgressCount / totalTickets) * 100).toFixed(1) : 0}% of total`,
      icon: Clock,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Resolved",
      value: resolvedCount,
      sub: `${totalTickets > 0 ? ((resolvedCount / totalTickets) * 100).toFixed(1) : 0}% of total`,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      label: "Closed",
      value: closedCount,
      sub: `${totalTickets > 0 ? ((closedCount / totalTickets) * 100).toFixed(1) : 0}% of total`,
      icon: Lock,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
    {
      label: "Avg. Response",
      value: avgResponse,
      sub: "First reply time",
      icon: TrendingUp,
      iconBg: "bg-rose-50",
      iconColor: "text-rose-500",
    },
  ];

  return (
    <div className="flex h-[calc(100vh-80px)] gap-0 overflow-hidden -m-4 md:-m-6 lg:-m-8">
      {/* Left Panel */}
      <div
        className={cn(
          "flex flex-col flex-1 min-w-0 overflow-hidden",
          selectedTicket ? "hidden lg:flex" : "flex"
        )}
      >
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900">
                Support Ticket Management
              </h1>
              <p className="text-slate-500 mt-1 text-sm font-medium">
                Manage customer queries, complaints and requests efficiently
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (filtered.length === 0) {
                    toast.error("No tickets to export");
                    return;
                  }
                  downloadCSV("support-tickets.csv", ticketsToCSV(filtered));
                  toast.success(`${filtered.length} tickets exported`);
                }}
                className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-700 border-slate-200 gap-2"
              >
                <Download className="h-4 w-4" /> Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-700 border-slate-200 gap-2"
              >
                <RotateCcw className={cn("h-4 w-4", isLoading && "animate-spin")} /> Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {isLoading ? (
            <StatsRowSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow"
              >
                <div
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center",
                    card.iconBg
                  )}
                >
                  <card.icon className={cn("h-4 w-4", card.iconColor)} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {card.label}
                  </p>
                  <p className="text-2xl font-extrabold text-slate-900 leading-tight">
                    {isLoading ? (
                      <Skeleton className="h-7 w-10 inline-block" />
                    ) : (
                      card.value
                    )}
                  </p>
                  {card.changeUp !== undefined ? (
                    <p
                      className={cn(
                        "text-[10px] font-semibold flex items-center gap-0.5",
                        card.changeUp ? "text-emerald-600" : "text-rose-500"
                      )}
                    >
                      <TrendingUp className={cn("h-3 w-3", !card.changeUp && "rotate-180")} />{" "}
                      {card.change}
                    </p>
                  ) : (
                    <p className="text-[10px] font-medium text-slate-400">
                      {card.sub}
                    </p>
                  )}
                </div>
              </div>
            ))}
            </div>
          )}

          {/* Filters Row */}
          {isLoading ? (
            <FilterRowSkeleton />
          ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search tickets..."
                  className="pl-10 h-10 rounded-xl border-slate-200 text-sm font-medium"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 w-[130px] rounded-xl border-slate-200 text-xs font-semibold">
                    <SelectValue placeholder="Status: All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Status: All</SelectItem>
                    <SelectItem value="OPEN">Open</SelectItem>
                    <SelectItem value="INPROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={(v) => {
                    setPriorityFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 w-[140px] rounded-xl border-slate-200 text-xs font-semibold">
                    <SelectValue placeholder="Priority: All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Priority: All</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={categoryFilter}
                  onValueChange={(v) => {
                    setCategoryFilter(v);
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-10 w-[145px] rounded-xl border-slate-200 text-xs font-semibold">
                    <SelectValue placeholder="Category: All" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Category: All</SelectItem>
                    <SelectItem value="order">Order</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                    <SelectItem value="food">Food Quality</SelectItem>
                    <SelectItem value="payment">Payment</SelectItem>
                    <SelectItem value="account">Account</SelectItem>
                    <SelectItem value="coupons">Coupons</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("ALL");
                    setPriorityFilter("ALL");
                    setCategoryFilter("ALL");
                    setActiveTab("ALL");
                    setCurrentPage(1);
                  }}
                  className="h-10 rounded-xl text-xs font-semibold text-slate-500 gap-1.5 hover:bg-slate-100"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 flex-wrap">
              {[
                { key: "ALL", label: `All Tickets`, count: tabCounts.ALL },
                { key: "OPEN", label: "Open", count: tabCounts.OPEN },
                { key: "INPROGRESS", label: "In Progress", count: tabCounts.INPROGRESS },
                { key: "RESOLVED", label: "Resolved", count: tabCounts.RESOLVED },
                { key: "CLOSED", label: "Closed", count: tabCounts.CLOSED },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setActiveTab(tab.key);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all",
                    activeTab === tab.key
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-200"
                      : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {tab.label}
                  <span
                    className={cn(
                      "rounded-full px-1.5 py-0.5 text-[10px] font-extrabold",
                      activeTab === tab.key
                        ? "bg-white/20 text-white"
                        : "bg-slate-100 text-slate-600"
                    )}
                  >
                    {isLoading ? "..." : tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
          )}

          {/* Table */}
          {isLoading ? (
            <TableSkeleton />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <AlertCircle className="h-12 w-12 text-red-400" />
              <p className="text-red-500 font-semibold">Failed to load tickets</p>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center">
                <Ticket className="h-8 w-8 text-slate-400" />
              </div>
              <p className="text-slate-600 font-semibold">No tickets found</p>
              <p className="text-sm text-slate-400">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Ticket ID
                      </th>
                      <th className="text-left py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="text-left py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="text-left py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="text-left py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="text-left py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="text-left py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="text-center py-3.5 px-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((ticket) => {
                      const categoryInfo =
                        categoryConfig[ticket.category] || categoryConfig.other;
                      const CategoryIcon = categoryInfo.icon;
                      const isSelected = selectedTicket?.id === ticket.id;

                      return (
                        <tr
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={cn(
                            "border-b border-slate-50 cursor-pointer transition-colors group",
                            isSelected
                              ? "bg-emerald-50/40"
                              : "hover:bg-slate-50/60"
                          )}
                        >
                          {/* Left accent bar */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <div
                                className={cn(
                                  "w-0.5 h-7 rounded-full flex-shrink-0",
                                  ticket.priority === "HIGH" || ticket.priority === "URGENT"
                                    ? "bg-red-500"
                                    : ticket.priority === "MEDIUM"
                                    ? "bg-orange-400"
                                    : "bg-slate-200"
                                )}
                              />
                              <span className="text-xs font-bold text-slate-600 font-mono">
                                {formatTicketId(ticket.id)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2.5">
                              <Avatar className="h-8 w-8">
                                {ticket.user?.image ? (
                                  <AvatarImage asChild src={ticket.user.image} alt={ticket.user.name ?? "Customer"}>
                                    <Image
                                      src={ticket.user.image}
                                      alt={ticket.user.name ?? "Customer"}
                                      fill
                                      sizes="32px"
                                      className="object-cover"
                                    />
                                  </AvatarImage>
                                ) : (
                                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-bold">
                                    {getInitials(ticket.user?.name)}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="text-xs font-bold text-slate-900">
                                  {ticket.user?.name || "Unknown"}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  {ticket.user?.phoneNumber || ticket.user?.email || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 max-w-[200px]">
                            <p className="text-xs font-semibold text-slate-800 truncate">
                              {ticket.subject}
                            </p>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                              <CategoryIcon className="h-3.5 w-3.5 text-slate-400 flex-shrink-0" />
                              <span className="capitalize">
                                {ticket.category.replace("-", " ")}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={
                                priorityConfig[ticket.priority]?.className || ""
                              }
                            >
                              {ticket.priority}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <span
                              className={
                                statusConfig[ticket.status]?.className || ""
                              }
                            >
                              {statusConfig[ticket.status]?.label || ticket.status}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div>
                              <p className="text-xs font-semibold text-slate-700">
                                {format(new Date(ticket.createdAt), "dd MMM yyyy")}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {format(new Date(ticket.createdAt), "hh:mm a")}
                              </p>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTicket(ticket);
                              }}
                              className="h-8 w-8 rounded-full hover:bg-emerald-50 flex items-center justify-center mx-auto text-slate-400 hover:text-emerald-600 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3.5 border-t border-slate-100 bg-slate-50/30">
                <p className="text-xs font-medium text-slate-500">
                  Showing {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1} to{" "}
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
                  {filtered.length} tickets
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          "h-8 w-8 p-0 rounded-lg text-xs font-bold",
                          currentPage === page
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-xs text-slate-400 px-1">...</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setCurrentPage(totalPages)}
                        className={cn(
                          "h-8 w-8 p-0 rounded-lg text-xs font-bold",
                          currentPage === totalPages
                            ? "bg-emerald-600 text-white hover:bg-emerald-700"
                            : "text-slate-600 hover:bg-slate-100"
                        )}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="h-8 w-8 p-0 rounded-lg"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>

                  <div className="ml-3 flex items-center gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">Rows per page</span>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-lg">
                      {PAGE_SIZE}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Ticket Details */}
      {selectedTicket && (
        <div className="w-full lg:w-[380px] xl:w-[420px] flex-shrink-0 border-l border-slate-100 bg-white flex flex-col overflow-hidden">
          {/* Ticket Details Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedTicket(null)}
                className="h-7 w-7 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-700 lg:hidden"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h2 className="text-sm font-extrabold text-slate-900">Ticket Details</h2>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="h-7 w-7 rounded-full hover:bg-slate-100 hidden lg:flex items-center justify-center text-slate-400 hover:text-slate-700"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Badges & Ticket ID */}
          <div className="px-5 pt-4 pb-3 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-center gap-2 mb-3">
              <span className={statusConfig[selectedTicket.status]?.className}>
                {statusConfig[selectedTicket.status]?.label}
              </span>
              <span className={priorityConfig[selectedTicket.priority]?.className}>
                {selectedTicket.priority}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
                  Ticket ID
                </p>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    {formatTicketId(selectedTicket.id)}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(formatTicketId(selectedTicket.id));
                      toast.success("Copied!");
                    }}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="px-5 py-4 border-b border-slate-100 flex-shrink-0">
            <div className="flex items-start gap-3">
              <Avatar className="h-11 w-11">
                {selectedTicket.user?.image ? (
                  <AvatarImage asChild src={selectedTicket.user.image} alt={selectedTicket.user.name ?? "Customer"}>
                    <Image
                      src={selectedTicket.user.image}
                      alt={selectedTicket.user.name ?? "Customer"}
                      fill
                      sizes="44px"
                      className="object-cover"
                    />
                  </AvatarImage>
                ) : (
                  <AvatarFallback className="bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold">
                    {getInitials(selectedTicket.user?.name)}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">
                  {selectedTicket.user?.name || "Unknown Customer"}
                </p>
                <div className="flex items-center gap-1.5 mt-1">
                  <Phone className="h-3 w-3 text-slate-400" />
                  <span className="text-[11px] font-medium text-slate-600">
                    {selectedTicket.user?.phoneNumber || "—"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Mail className="h-3 w-3 text-slate-400" />
                  <span className="text-[11px] font-medium text-slate-600 truncate">
                    {selectedTicket.user?.email || "—"}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                {selectedTicket.orderId && (
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold">Order ID</p>
                    <p className="text-xs font-bold text-emerald-600">
                      ORD-{selectedTicket.orderId.slice(-8).toUpperCase()}
                    </p>
                  </div>
                )}
                <div className="mt-1">
                  <p className="text-[10px] text-slate-400 font-semibold">Created At</p>
                  <p className="text-[11px] font-semibold text-slate-700">
                    {format(new Date(selectedTicket.createdAt), "dd MMM yyyy, hh:mm a")}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Category Badge */}
          {(() => {
            const catInfo = categoryConfig[selectedTicket.category] || categoryConfig.other;
            const CatIcon = catInfo.icon;
            return (
              <div className="px-5 py-3 border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <div className="h-9 w-9 rounded-full bg-white border border-slate-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                    <CatIcon className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{catInfo.label}</p>
                    <p className="text-[10px] font-medium text-slate-500">
                      {catInfo.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Detail Tabs */}
          <div className="border-b border-slate-100 flex-shrink-0">
            <div className="flex px-5 gap-0">
              {["conversation", "order", "customer", "notes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={cn(
                    "py-3 px-3 text-[11px] font-bold border-b-2 transition-colors capitalize",
                    detailTab === tab
                      ? "border-emerald-600 text-emerald-700"
                      : "border-transparent text-slate-400 hover:text-slate-600"
                  )}
                >
                  {tab === "order"
                    ? "Order Details"
                    : tab === "customer"
                    ? "Customer Info"
                    : tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Thread */}
          {detailTab === "conversation" && (
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {selectedTicket.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
                  <MessageSquare className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-400">
                    No messages yet
                  </p>
                  <p className="text-xs text-slate-400">
                    Be the first to respond to this ticket
                  </p>
                </div>
              ) : (
                selectedTicket.messages.map((msg) => {
                  const isAdmin = msg.senderId !== selectedTicket.userId;
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex gap-3",
                        isAdmin ? "flex-row-reverse" : "flex-row"
                      )}
                    >
                      <Avatar className={cn("h-8 w-8", isAdmin && "bg-emerald-100 text-emerald-700")}>
                        {!isAdmin && selectedTicket.user?.image ? (
                          <AvatarImage asChild src={selectedTicket.user.image} alt={selectedTicket.user.name ?? "Customer"}>
                            <Image
                              src={selectedTicket.user.image}
                              alt={selectedTicket.user.name ?? "Customer"}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          </AvatarImage>
                        ) : (
                          <AvatarFallback
                            className={cn(
                              "text-xs font-bold",
                              isAdmin
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gradient-to-br from-emerald-400 to-teal-500 text-white"
                            )}
                          >
                            {isAdmin ? "A" : getInitials(selectedTicket.user?.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div
                        className={cn(
                          "flex-1",
                          isAdmin ? "items-end flex flex-col" : ""
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={cn(
                              "text-[10px] font-bold",
                              isAdmin ? "text-emerald-700" : "text-slate-700"
                            )}
                          >
                            {isAdmin ? "Admin Reply" : selectedTicket.user?.name}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {format(new Date(msg.createdAt), "dd MMM yyyy, hh:mm a")}
                          </span>
                        </div>
                        <div
                          className={cn(
                            "rounded-2xl px-4 py-3 text-xs font-medium leading-relaxed max-w-[90%]",
                            isAdmin
                              ? "bg-emerald-50 text-emerald-900 rounded-tr-sm"
                              : "bg-slate-100 text-slate-700 rounded-tl-sm"
                          )}
                        >
                          {msg.message}
                          {isAdmin && (
                            <div className="flex justify-end mt-1">
                              <Check className="h-3 w-3 text-emerald-500" />
                            </div>
                          )}
                        </div>
                        {msg.mediaUrls?.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {msg.mediaUrls.map((url, i) => (
                              <div
                                key={i}
                                className="relative h-20 w-20 rounded-xl overflow-hidden border border-slate-200"
                              >
                                <Image
                                  src={url}
                                  alt={`Media ${i + 1}`}
                                  fill
                                  className="object-cover"
                                  sizes="80px"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>
          )}

          {detailTab === "order" && (
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {selectedTicket.orderId ? (
                <div className="bg-slate-50 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Order ID
                  </p>
                  <p className="font-bold text-slate-900 font-mono">
                    ORD-{selectedTicket.orderId.slice(-8).toUpperCase()}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-400 text-center py-10">
                  No order linked to this ticket
                </p>
              )}
            </div>
          )}

          {detailTab === "customer" && (
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {[
                { label: "Name", value: selectedTicket.user?.name },
                { label: "Email", value: selectedTicket.user?.email },
                { label: "Phone", value: selectedTicket.user?.phoneNumber },
              ].map((info) => (
                <div key={info.label} className="flex justify-between py-2 border-b border-slate-50">
                  <p className="text-xs font-bold text-slate-400">{info.label}</p>
                  <p className="text-xs font-semibold text-slate-700">{info.value || "—"}</p>
                </div>
              ))}
            </div>
          )}

          {detailTab === "notes" && (
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <p className="text-sm text-slate-400 text-center py-10">
                No notes added yet
              </p>
            </div>
          )}

          {/* Reply Box - only for conversation tab */}
          {detailTab === "conversation" && (
            <div className="border-t border-slate-100 px-5 py-4 flex-shrink-0 space-y-3 bg-white">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Reply to customer
              </p>
              <Textarea
                {...register("message")}
                placeholder="Type your reply..."
                rows={3}
                className="resize-none rounded-xl border-slate-200 text-sm font-medium focus-visible:ring-emerald-500"
              />
              {errors.message && (
                <p className="text-xs text-red-500">{errors.message.message}</p>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <button className="h-7 w-7 hover:bg-slate-100 rounded-lg flex items-center justify-center hover:text-slate-600 transition-colors">
                    <Smile className="h-4 w-4" />
                  </button>
                  <button className="h-7 w-7 hover:bg-slate-100 rounded-lg flex items-center justify-center hover:text-slate-600 transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button className="h-7 w-7 hover:bg-slate-100 rounded-lg flex items-center justify-center hover:text-slate-600 transition-colors">
                    <ImageIcon className="h-4 w-4" />
                  </button>
                </div>
                <Button
                  onClick={handleSubmit((data) =>
                    replyMutation
                      .mutateAsync({ ticketId: selectedTicket.id, message: data.message })
                      .then(() => {
                        reset();
                        toast.success("Reply sent");
                      })
                      .catch(() => toast.error("Failed to send reply"))
                  )}
                  disabled={replyMutation.isPending}
                  size="sm"
                  className="h-9 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-sm shadow-emerald-200"
                >
                  {replyMutation.isPending ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  Send Reply
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-slate-100 px-5 py-4 flex items-center gap-2 flex-shrink-0 bg-white">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleStatusChange("INPROGRESS")
              }
              disabled={selectedTicket.status === "INPROGRESS" || updateMutation.isPending}
              className={cn(
                "flex-1 h-9 rounded-xl text-xs font-bold border gap-1.5",
                selectedTicket.status === "INPROGRESS"
                  ? "border-orange-200 text-orange-600 bg-orange-50"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <Clock className="h-3.5 w-3.5" /> Mark In Progress
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleStatusChange("RESOLVED")
              }
              disabled={selectedTicket.status === "RESOLVED" || updateMutation.isPending}
              className={cn(
                "flex-1 h-9 rounded-xl text-xs font-bold border gap-1.5",
                selectedTicket.status === "RESOLVED"
                  ? "border-emerald-200 text-emerald-600 bg-emerald-50"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <Check className="h-3.5 w-3.5" /> Mark Resolved
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                handleStatusChange("CLOSED")
              }
              disabled={selectedTicket.status === "CLOSED" || updateMutation.isPending}
              className={cn(
                "h-9 rounded-xl text-xs font-bold border px-3 gap-1.5",
                selectedTicket.status === "CLOSED"
                  ? "border-slate-300 text-slate-500 bg-slate-100"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              )}
            >
              <Lock className="h-3.5 w-3.5" />
              {updateMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Close"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}