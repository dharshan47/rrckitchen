"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Ticket,
  MessageSquare,
  Loader2,
  AlertCircle,
  Search,
  Send,
  UserRound,
  Package,
  ChefHat,
  Truck,
  CreditCard,
  ShieldCheck,
  Download,
  Eye,
  X,
  RotateCcw,
  Copy,
  Phone,
  Mail,
  Check,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  BadgeHelp,
  MessageCircle,
  UserRoundCog,
  BadgeCheck,
  Tag,
  Clock3,
  RefreshCw,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { subscribeAbly, unsubscribeAbly } from "@/lib/ably/client";
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
  flexRender,
  getCoreRowModel,
  useReactTable,
  createColumnHelper,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

const statusConfig: Record<string, { label: string; className: string }> = {
  OPEN: {
    label: "OPEN",
    className: "text-[#2563EB] bg-[#EFF6FF] border border-[#BFDBFE] font-bold text-[10px] px-2.5 py-1 rounded-[5px]",
  },
  INPROGRESS: {
    label: "IN PROGRESS",
    className: "text-[#EA580C] bg-[#FFF7ED] border border-[#FED7AA] font-bold text-[10px] px-2.5 py-1 rounded-[5px]",
  },
  RESOLVED: {
    label: "RESOLVED",
    className: "text-[#15803D] bg-[#F0FDF4] border border-[#BBF7D0] font-bold text-[10px] px-2.5 py-1 rounded-[5px]",
  },
  CLOSED: {
    label: "CLOSED",
    className: "text-[#334155] bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[10px] px-2.5 py-1 rounded-[5px]",
  },
};

const priorityConfig: Record<string, { label: string; className: string }> = {
  LOW: {
    label: "LOW",
    className: "text-[#475569] bg-[#F1F5F9] border border-[#E2E8F0] font-bold text-[10px] px-2.5 py-1 rounded-[5px]",
  },
  MEDIUM: {
    label: "MEDIUM",
    className: "text-[#F97316] bg-[#FFF7ED] border border-[#FED7AA] font-bold text-[10px] px-2.5 py-1 rounded-[5px]",
  },
  HIGH: {
    label: "HIGH",
    className: "text-[#EF4444] bg-[#FFF1F1] border border-[#FFD2D2] font-bold text-[10px] px-2.5 py-1 rounded-[5px]",
  },
  URGENT: {
    label: "URGENT",
    className: "text-[#EF3340] bg-[#FFF1F1] border border-[#FFD2D2] font-bold text-[10px] px-2.5 py-1 rounded-[5px]",
  },
};

const categoryConfig: Record<string, { icon: LucideIcon; label: string; description: string; barColor: string }> = {
  delivery: {
    icon: Truck,
    label: "Delivery Issue",
    description: "Related to delivery time, partner behavior, location or tracking issues.",
    barColor: "bg-[#7C3AED]",
  },
  payment: {
    icon: CreditCard,
    label: "Payment",
    description: "Related to payment or refund issues",
    barColor: "bg-[#F97316]",
  },
  food: {
    icon: ChefHat,
    label: "Food Quality",
    description: "Related to food quality or hygiene",
    barColor: "bg-[#3E9645]",
  },
  order: {
    icon: Package,
    label: "Order Issue",
    description: "Related to order placement or status",
    barColor: "bg-[#F59E0B]",
  },
  account: {
    icon: UserRound,
    label: "Account",
    description: "Related to account access or settings",
    barColor: "bg-[#64748B]",
  },
  coupons: {
    icon: Tag,
    label: "Coupons",
    description: "Related to coupon or offer issues",
    barColor: "bg-[#16A34A]",
  },
  safety: {
    icon: ShieldCheck,
    label: "Safety",
    description: "Related to safety concerns",
    barColor: "bg-[#EF4444]",
  },
  other: {
    icon: BadgeHelp,
    label: "Other",
    description: "General queries",
    barColor: "bg-[#64748B]",
  },
};

function getInitials(name: string | null | undefined) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function formatTicketId(id: string, publicCode?: string | null) {
  return publicCode ?? `TKT-${format(new Date(), "yyyy")}-${id.slice(-4).toUpperCase()}`;
}

const columnHelper = createColumnHelper<AdminSupportTicket>();

// --- Skeletons ---
function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-4 flex items-start gap-3">
          <Skeleton className="h-[44px] w-[44px] rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-2 pt-0.5">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function FiltersSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
        <Skeleton className="h-9 w-full md:max-w-[280px] rounded-[7px]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-[130px] rounded-[7px]" />
          <Skeleton className="h-9 w-[130px] rounded-[7px]" />
          <Skeleton className="h-9 w-[140px] rounded-[7px]" />
          <Skeleton className="h-9 w-[78px] rounded-[7px]" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-[34px] w-[112px] rounded-[8px]" />
        <Skeleton className="h-[34px] w-[88px] rounded-[8px]" />
        <Skeleton className="h-[34px] w-[104px] rounded-[8px]" />
        <Skeleton className="h-[34px] w-[92px] rounded-[8px]" />
        <Skeleton className="h-[34px] w-[82px] rounded-[8px]" />
      </div>
    </div>
  );
}

const tableCols = "grid-cols-[1.4fr_2fr_1.6fr_1.1fr_0.8fr_0.9fr_1fr_0.5fr]";

function TableSkeleton() {
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] shadow-none w-full overflow-hidden">
      <div className={cn("grid items-center gap-4 px-5 py-4 border-b border-[#EEF0F2]", tableCols)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className={cn("h-3", i === 7 ? "w-10" : "w-16")} />
        ))}
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className={cn("grid items-center gap-4 px-5 py-3.5 border-b border-[#EEF0F2]", tableCols)}>
          <div className="relative flex items-center">
            <Skeleton className="absolute -left-4 w-[2px] h-[28px] rounded-r-md" />
            <Skeleton className="h-3.5 w-24" />
          </div>
          <div className="flex items-center gap-3 min-w-0">
            <Skeleton className="h-[32px] w-[32px] rounded-full flex-shrink-0" />
            <div className="space-y-1.5 min-w-0 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-2.5 w-16" />
            </div>
          </div>
          <Skeleton className="h-3.5 w-28" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-[4px]" />
            <Skeleton className="h-3 w-16" />
          </div>
          <Skeleton className="h-[22px] w-14 rounded-[5px]" />
          <Skeleton className="h-[22px] w-[72px] rounded-[5px]" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-2.5 w-14" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      ))}
      <div className="flex items-center justify-between px-5 py-4">
        <Skeleton className="h-3 w-48" />
        <div className="flex items-center gap-1.5">
          <Skeleton className="h-[32px] w-[32px] rounded-[7px]" />
          <Skeleton className="h-[32px] w-[32px] rounded-[7px]" />
          <Skeleton className="h-[32px] w-[32px] rounded-[7px]" />
          <Skeleton className="h-[32px] w-[32px] rounded-[7px]" />
          <Skeleton className="h-[32px] w-[32px] rounded-[7px]" />
          <Skeleton className="h-[32px] w-[70px] rounded-[7px]" />
        </div>
      </div>
    </div>
  );
}

export default function AdminSupportPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [detailTab, setDetailTab] = useState("conversation");
  const chatBottomRef = useRef<HTMLDivElement>(null);
  
  const selectedTicket = useAdminSelectedSupportTicket();
  const { setSelectedTicket } = useAdminSupportActions();

  const { register, handleSubmit, reset } = useForm<{ message: string }>({
    resolver: zodResolver(replySchema),
    defaultValues: { message: "" },
  });
  const { data: tickets = [], isLoading, isFetching, isError, refetch } = useAdminSupportTicketsQuery();
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

  useEffect(() => {
    setDetailTab("conversation");
  }, [selectedTicket?.id]);

  // Subscribe to real-time chat for the selected ticket
  useEffect(() => {
    if (!selectedTicket?.id) return;
    
    const channelName = `live-chat:${selectedTicket.id}`;
    const handleNewMessage = () => {
      refetch();
    };

    subscribeAbly(channelName, handleNewMessage);
    return () => {
      unsubscribeAbly(channelName, handleNewMessage);
    };
  }, [selectedTicket?.id, refetch]);

  const tabCounts = useMemo(() => ({
    ALL: tickets.length,
    OPEN: tickets.filter((t) => t.status === "OPEN").length,
    INPROGRESS: tickets.filter((t) => t.status === "INPROGRESS").length,
    RESOLVED: tickets.filter((t) => t.status === "RESOLVED").length,
    CLOSED: tickets.filter((t) => t.status === "CLOSED").length,
  }), [tickets]);

  const totalTickets = tickets.length;
  const openCount = tabCounts.OPEN;
  const inProgressCount = tabCounts.INPROGRESS;
  const resolvedCount = tabCounts.RESOLVED;
  const closedCount = tabCounts.CLOSED;

  const weekStart = startOfDay(subDays(new Date(), 6)).getTime();
  const lastWeekStart = startOfDay(subDays(new Date(), 13)).getTime();
  const thisWeek = useMemo(() => tickets.filter((t) => new Date(t.createdAt).getTime() >= weekStart).length, [tickets, weekStart]);
  const lastWeek = useMemo(() => tickets.filter((t) => {
    const ts = new Date(t.createdAt).getTime();
    return ts >= lastWeekStart && ts < weekStart;
  }).length, [tickets, lastWeekStart, weekStart]);
  const weeklyChange = lastWeek > 0 ? ((thisWeek - lastWeek) / lastWeek) * 100 : null;

  const avgResponse = useMemo(() => {
    let avgMs: number | null = null;
    const withAdminReply = tickets
      .filter((t) => Array.isArray(t.messages) && t.messages.some((m) => m.senderId !== t.userId))
      .map((t) => {
        const firstAdmin = t.messages.find((m) => m.senderId !== t.userId)!;
        return new Date(firstAdmin.createdAt).getTime() - new Date(t.createdAt).getTime();
      })
      .filter((d) => !Number.isNaN(d) && d > 0);
    
    if (withAdminReply.length > 0) {
      avgMs = withAdminReply.reduce((s, d) => s + d, 0) / withAdminReply.length;
    }
    return avgMs === null ? "—" : avgMs < 3600000 ? `${Math.max(1, Math.round(avgMs / 60000))}m` : `${(avgMs / 3600000).toFixed(1)}h`;
  }, [tickets]);

  const filtered = useMemo(() => {
    return tickets
      .filter((t) => activeTab === "ALL" || t.status === activeTab)
      .filter((t) => statusFilter === "ALL" || t.status === statusFilter)
      .filter((t) => priorityFilter === "ALL" || t.priority === priorityFilter)
      .filter((t) => categoryFilter === "ALL" || t.category === categoryFilter)
      .filter((t) =>
        !search ||
        (t.subject && t.subject.toLowerCase().includes(search.toLowerCase())) ||
        ((t.publicCode || t.id)?.toLowerCase().includes(search.toLowerCase())) ||
        (t.user?.name || "").toLowerCase().includes(search.toLowerCase())
      );
  }, [tickets, activeTab, statusFilter, priorityFilter, categoryFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = useMemo(() => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize), [filtered, currentPage, pageSize]);

  const handleExport = () => {
    if (filtered.length === 0) {
      toast.error("No tickets to export");
      return;
    }
    const header = ["Ticket ID", "Customer", "Email", "Phone", "Subject", "Category", "Priority", "Status", "Created At"];
    const rows = filtered.map((t) => [
      formatTicketId(t.id, t.publicCode),
      `"${(t.user?.name ?? "Unknown").replace(/"/g, '""')}"`,
      `"${(t.user?.email ?? "").replace(/"/g, '""')}"`,
      `"${(t.user?.phoneNumber ?? "").replace(/"/g, '""')}"`,
      `"${t.subject.replace(/"/g, '""')}"`,
      t.category,
      t.priority,
      t.status,
      format(new Date(t.createdAt), "dd MMM yyyy, hh:mm a"),
    ]);
    const csvContent = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "support-tickets.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${filtered.length} tickets exported`);
  };

  const columns = useMemo(() => [
    columnHelper.accessor("id", {
      header: "Ticket ID",
      cell: (info) => {
        const ticket = info.row.original;
        const catInfo = categoryConfig[ticket.category] || categoryConfig.other;
        return (
          <div className="flex items-center gap-3 relative">
            <div className={cn("absolute -left-4 w-[2px] h-[28px] rounded-r-md", catInfo.barColor)} />
            <span className="text-[12px] font-bold text-[#1F2937] font-mono">
              {formatTicketId(ticket.id, ticket.publicCode)}
            </span>
          </div>
        );
      }
    }),
    columnHelper.accessor("userId", {
      header: "Customer",
      cell: (info) => {
        const ticket = info.row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="h-[32px] w-[32px] border border-[#E5E7EB]">
              {ticket.user?.image ? (
                <AvatarImage src={ticket.user.image} alt={ticket.user.name ?? "Customer"} className="object-cover" />
              ) : (
                <AvatarFallback className="bg-[#FAFAFB] text-[#334155] text-[11px] font-bold">
                  {getInitials(ticket.user?.name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-[12px] font-semibold text-[#111827]">
                {ticket.user?.name || "Unknown"}
              </p>
              <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
                {ticket.user?.phoneNumber || ticket.user?.email || "—"}
              </p>
            </div>
          </div>
        );
      }
    }),
    columnHelper.accessor("subject", {
      header: "Subject",
      cell: (info) => (
        <p className="text-[12px] font-medium text-[#334155] truncate max-w-[180px]">
          {info.getValue()}
        </p>
      )
    }),
    columnHelper.accessor("category", {
      header: "Category",
      cell: (info) => {
        const catInfo = categoryConfig[info.getValue()] || categoryConfig.other;
        const CatIcon = catInfo.icon;
        return (
          <div className="flex items-center gap-2 text-[12px] text-[#334155] font-medium">
            <CatIcon className="h-4 w-4 text-[#334155]" strokeWidth={1.8} />
            <span className="capitalize">{catInfo.label}</span>
          </div>
        );
      }
    }),
    columnHelper.accessor("priority", {
      header: "Priority",
      cell: (info) => {
        const pri = priorityConfig[info.getValue()] || priorityConfig.LOW;
        return <span className={pri.className}>{pri.label}</span>;
      }
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => {
        const stat = statusConfig[info.getValue()] || statusConfig.OPEN;
        return <span className={stat.className}>{stat.label}</span>;
      }
    }),
    columnHelper.accessor("createdAt", {
      header: "Created At",
      cell: (info) => (
        <div>
          <p className="text-[12px] font-medium text-[#334155]">
            {format(new Date(info.getValue()), "dd MMM yyyy")}
          </p>
          <p className="text-[11px] text-[#64748B] font-medium mt-0.5">
            {format(new Date(info.getValue()), "hh:mm a")}
          </p>
        </div>
      )
    }),
    columnHelper.display({
      id: "actions",
      header: "Actions",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTicket(info.row.original);
            }}
            className="h-8 w-8 rounded-full bg-[#FFFFFF] border border-[#E5E7EB] flex items-center justify-center text-[#334155] hover:bg-[#FAFAFC] hover:border-[#CBD5E1] transition-colors shadow-sm"
          >
            <Eye className="h-4 w-4" strokeWidth={1.8} />
          </button>
        </div>
      )
    })
  ], [setSelectedTicket]);

  const table = useReactTable({
    data: paginated,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex gap-0 min-h-[calc(100dvh-4rem)] -m-4 md:-m-6 lg:-m-8 bg-[#FEFEFE] items-start">
      {/* Left Panel */}
      <div className={cn("flex flex-col flex-1 min-w-0", selectedTicket ? "hidden lg:flex" : "flex")}>
        <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-[20px] md:text-[22px] font-bold text-[#111827]">
                Support Ticket Management
              </h1>
              <p className="text-[#475569] mt-1 text-[13px] font-medium">
                Manage customer queries, complaints and requests efficiently
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="h-9 rounded-[7px] px-4 text-[13px] font-semibold text-[#1F2937] bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] gap-2 shadow-none"
              >
                <Download className="h-4 w-4 text-[#334155]" strokeWidth={1.8} /> Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-9 rounded-[7px] px-4 text-[13px] font-semibold text-[#1F2937] bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] gap-2 shadow-none"
              >
                <RefreshCw className={`h-4 w-4 text-[#334155] ${isFetching ? "animate-spin" : ""}`} strokeWidth={1.8} /> Refresh
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-3">
              {[
                { label: "Total Tickets", value: totalTickets, change: weeklyChange === null ? "New this week" : `${weeklyChange >= 0 ? "+" : ""}${weeklyChange.toFixed(1)}% vs last week`, icon: Ticket, iconBg: "bg-[#EFF8F1]", iconColor: "text-[#3E9645]", border: "border-[#D9EDDB]", changeUp: true },
                { label: "Open Tickets", value: openCount, sub: `${totalTickets > 0 ? ((openCount / totalTickets) * 100).toFixed(1) : 0}% of total`, icon: MessageCircle, iconBg: "bg-[#FFF5E8]", iconColor: "text-[#F97316]", border: "border-[#FDE3BF]" },
                { label: "In Progress", value: inProgressCount, sub: `${totalTickets > 0 ? ((inProgressCount / totalTickets) * 100).toFixed(1) : 0}% of total`, icon: UserRoundCog, iconBg: "bg-[#EFF6FF]", iconColor: "text-[#2563EB]", border: "border-[#D8E7FF]" },
                { label: "Resolved", value: resolvedCount, sub: `${totalTickets > 0 ? ((resolvedCount / totalTickets) * 100).toFixed(1) : 0}% of total`, icon: ShieldCheck, iconBg: "bg-[#F5F0FF]", iconColor: "text-[#7C3AED]", border: "border-[#E4D9FF]" },
                { label: "Closed", value: closedCount, sub: `${totalTickets > 0 ? ((closedCount / totalTickets) * 100).toFixed(1) : 0}% of total`, icon: BadgeCheck, iconBg: "bg-[#EFF8F1]", iconColor: "text-[#3E9645]", border: "border-[#D9EDDB]" },
                { label: "Avg. Response", value: avgResponse, sub: "This week", icon: MessageSquare, iconBg: "bg-[#FFF0F0]", iconColor: "text-[#EF4444]", border: "border-[#FFDADA]" },
              ].map((card) => (
                <div key={card.label} className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-4 flex items-start gap-3">
                  <div className={cn("h-[44px] w-[44px] rounded-full flex items-center justify-center flex-shrink-0 border", card.border, card.iconBg)}>
                    <card.icon className={cn("h-[22px] w-[22px]", card.iconColor)} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-[#475569]">{card.label}</p>
                    <p className="text-[22px] font-bold text-[#111827] leading-tight mt-1">{card.value}</p>
                    {card.change ? (
                      <p className="text-[11px] font-semibold text-[#16A34A] flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" strokeWidth={2} /> {card.change}
                      </p>
                    ) : (
                      <p className="text-[11px] font-medium text-[#475569] mt-1">{card.sub}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters Row */}
          {isLoading ? (
            <FiltersSkeleton />
          ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row gap-3 justify-between items-start md:items-center">
              <div className="relative flex-1 w-full md:max-w-[280px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" strokeWidth={1.8} />
                <Input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Search tickets..."
                  className="pl-9 h-9 w-full rounded-[7px] bg-[#FFFFFF] border-[#E2E8F0] text-[13px] text-[#334155] placeholder:text-[#94A3B8] focus-visible:ring-[#FF5709] focus-visible:border-[#FF5709] shadow-none"
                />
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 w-[130px] rounded-[7px] bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#FAFAFB] hover:border-[#CBD5E1] text-[12px] font-semibold text-[#1F2937] shadow-none">
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

                <Select value={priorityFilter} onValueChange={(v) => { setPriorityFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 w-[130px] rounded-[7px] bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#FAFAFB] hover:border-[#CBD5E1] text-[12px] font-semibold text-[#1F2937] shadow-none">
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

                <Select value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v); setCurrentPage(1); }}>
                  <SelectTrigger className="h-9 w-[140px] rounded-[7px] bg-[#FFFFFF] border-[#E2E8F0] hover:bg-[#FAFAFB] hover:border-[#CBD5E1] text-[12px] font-semibold text-[#1F2937] shadow-none">
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
                  onClick={() => { setSearch(""); setStatusFilter("ALL"); setPriorityFilter("ALL"); setCategoryFilter("ALL"); setActiveTab("ALL"); setCurrentPage(1); }}
                  className="h-9 rounded-[7px] text-[12px] font-semibold text-[#1F2937] gap-1.5 hover:bg-[#FAFAFB]"
                >
                  <RotateCcw className="h-4 w-4 text-[#475569]" strokeWidth={1.8} /> Reset
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <div className="w-full pb-1 overflow-x-auto custom-scrollbar">
              <div className="flex items-center gap-2 w-max">
              {[
                { key: "ALL", label: "All Tickets", count: tabCounts.ALL, colors: activeTab === "ALL" ? "bg-[#F2FAF3] text-[#15803D] border-[#A7DDAE]" : "bg-transparent text-[#64748B] border-transparent", countBg: activeTab === "ALL" ? "bg-[#DCF2DF] text-[#15803D]" : "bg-[#F1F5F9] text-[#64748B]" },
                { key: "OPEN", label: "Open", count: tabCounts.OPEN, colors: activeTab === "OPEN" ? "bg-[#FFF8F1] text-[#F97316] border-[#FDE3BF]" : "bg-transparent text-[#64748B] border-transparent", countBg: activeTab === "OPEN" ? "bg-[#FFF0DD] text-[#EA580C]" : "bg-[#F1F5F9] text-[#64748B]" },
                { key: "INPROGRESS", label: "In Progress", count: tabCounts.INPROGRESS, colors: activeTab === "INPROGRESS" ? "bg-[#F3F7FF] text-[#2563EB] border-[#D8E7FF]" : "bg-transparent text-[#64748B] border-transparent", countBg: activeTab === "INPROGRESS" ? "bg-[#E6EFFF] text-[#2563EB]" : "bg-[#F1F5F9] text-[#64748B]" },
                { key: "RESOLVED", label: "Resolved", count: tabCounts.RESOLVED, colors: activeTab === "RESOLVED" ? "bg-[#F2FAF3] text-[#16A34A] border-[#A7DDAE]" : "bg-transparent text-[#64748B] border-transparent", countBg: activeTab === "RESOLVED" ? "bg-[#DCF2DF] text-[#16A34A]" : "bg-[#F1F5F9] text-[#64748B]" },
                { key: "CLOSED", label: "Closed", count: tabCounts.CLOSED, colors: activeTab === "CLOSED" ? "bg-[#FFFFFF] text-[#334155] border-[#E2E8F0]" : "bg-transparent text-[#64748B] border-transparent", countBg: activeTab === "CLOSED" ? "bg-[#F1F5F9] text-[#334155]" : "bg-[#F1F5F9] text-[#64748B]" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => { setActiveTab(tab.key); setCurrentPage(1); }}
                  className={cn("flex items-center gap-2 px-3.5 py-2 rounded-[8px] border text-[13px] font-bold transition-all whitespace-nowrap", tab.colors)}
                >
                  {tab.label}
                  <span className={cn("rounded-[5px] px-1.5 py-0.5 text-[10px] font-extrabold", tab.countBg)}>
                    {tab.count}
                  </span>
                </button>
              ))}
              </div>
            </div>
          </div>
          )}

          {/* Table */}
          {isError && (
            <div className="flex items-center gap-2.5 bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-[13px] font-semibold rounded-[10px] px-4 py-3">
              <AlertCircle className="h-4 w-4 shrink-0" /> Failed to load tickets.
              <button onClick={() => refetch()} className="underline font-bold ml-auto">Retry</button>
            </div>
          )}
          {isLoading ? (
            <TableSkeleton />
          ) : (
            <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] shadow-none w-full">
              <div className="w-full overflow-x-auto custom-scrollbar">
                <Table className="w-full text-sm min-w-[800px]">
                  <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="border-b border-[#EEF0F2] hover:bg-[#FFFFFF]">
                        {headerGroup.headers.map((header) => (
                          <TableHead
                            key={header.id}
                            className="text-left py-4 px-4 text-[11px] font-semibold text-[#475569] h-auto whitespace-nowrap"
                          >
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          onClick={() => setSelectedTicket(row.original)}
                          className="border-b border-[#EEF0F2] hover:bg-[#FAFBFC] transition-colors cursor-pointer group"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id} className="py-3 px-4">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={columns.length} className="h-24 text-center py-16 text-[#94A3B8] text-sm font-medium border-b-0">
                          No tickets found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-4 border-t border-[#EEF0F2] bg-[#FFFFFF] gap-4">
                <p className="text-[12px] font-medium text-[#64748B]">
                  Showing {filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} tickets
                </p>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Button
                    variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                    className="h-[32px] w-[32px] p-0 rounded-[7px] border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155]"
                  >
                    <ChevronLeft className="h-4 w-4" strokeWidth={1.8} />
                  </Button>
                  {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page} variant="ghost" size="sm" onClick={() => setCurrentPage(page)}
                        className={cn(
                          "h-[32px] w-[32px] p-0 rounded-[7px] text-[13px] font-bold border",
                          currentPage === page ? "bg-[#3E9645] text-[#FFFFFF] border-[#3E9645]" : "bg-[#FFFFFF] text-[#334155] border-[#E2E8F0] hover:bg-[#F0F8F1] hover:text-[#15803D]"
                        )}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-[12px] text-[#94A3B8] px-2 hidden sm:inline">...</span>
                      <Button
                        variant="ghost" size="sm" onClick={() => setCurrentPage(totalPages)}
                        className={cn(
                          "h-[32px] w-[32px] p-0 rounded-[7px] text-[13px] font-bold border hidden sm:inline-flex",
                          currentPage === totalPages ? "bg-[#3E9645] text-[#FFFFFF] border-[#3E9645]" : "bg-[#FFFFFF] text-[#334155] border-[#E2E8F0] hover:bg-[#F0F8F1] hover:text-[#15803D]"
                        )}
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                    className="h-[32px] w-[32px] p-0 rounded-[7px] border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#334155]"
                  >
                    <ChevronRight className="h-4 w-4" strokeWidth={1.8} />
                  </Button>
                  
                  <div className="ml-4 flex items-center gap-2">
                    <span className="text-[12px] text-[#334155] font-medium hidden sm:inline">Rows per page</span>
                    <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                      <SelectTrigger className="h-[32px] w-[70px] rounded-[7px] border-[#E2E8F0] bg-[#FFFFFF] text-[12px] font-bold text-[#111827] shadow-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="8">8</SelectItem>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Panel: Ticket Details */}
      {selectedTicket && (
        <div className="w-full lg:w-[420px] flex-shrink-0 border-l border-[#E5E7EB] bg-[#FFFFFF] flex flex-col shadow-[-4px_0_24px_rgba(15,23,42,0.02)] lg:sticky lg:top-0 lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedTicket(null)}
                className="h-8 w-8 rounded-full hover:bg-[#FAFAFB] flex items-center justify-center text-[#475569] lg:hidden"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-[15px] font-bold text-[#111827]">Ticket Details</h2>
            </div>
            <button
              onClick={() => setSelectedTicket(null)}
              className="h-8 w-8 rounded-full hover:bg-[#FAFAFB] hidden lg:flex items-center justify-center text-[#334155] hover:text-[#111827] transition-colors"
            >
              <X className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
          </div>

          <div className="px-6 flex-shrink-0">
            {/* Badges & ID */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className={statusConfig[selectedTicket.status]?.className}>
                  {statusConfig[selectedTicket.status]?.label}
                </span>
                <span className={priorityConfig[selectedTicket.priority]?.className}>
                  {selectedTicket.priority}
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#64748B] font-semibold mb-0.5">Ticket ID</p>
                <div className="flex items-center justify-end gap-1.5">
                  <span className="text-[13px] font-bold text-[#1F2937] font-mono">
                    {formatTicketId(selectedTicket.id, selectedTicket.publicCode)}
                  </span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(formatTicketId(selectedTicket.id, selectedTicket.publicCode));
                      toast.success("Copied!");
                    }}
                    className="text-[#64748B] hover:text-[#111827] transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" strokeWidth={1.8} />
                  </button>
                </div>
              </div>
            </div>

            {/* Customer Info Box */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar className="h-[44px] w-[44px]">
                  {selectedTicket.user?.image ? (
                    <AvatarImage src={selectedTicket.user.image} alt={selectedTicket.user.name ?? "Customer"} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-[#FAFAFB] border border-[#E5E7EB] text-[#334155] font-bold text-sm">
                      {getInitials(selectedTicket.user?.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-bold text-[#111827] text-[14px]">
                    {selectedTicket.user?.name || "Unknown Customer"}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Phone className="h-[12px] w-[12px] text-[#475569]" />
                    <span className="text-[12px] font-medium text-[#475569]">
                      {selectedTicket.user?.phoneNumber || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Mail className="h-[12px] w-[12px] text-[#334155]" />
                    <span className="text-[12px] font-medium text-[#334155]">
                      {selectedTicket.user?.email || "—"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#64748B] font-semibold mb-0.5">Order ID</p>
                <p className="text-[13px] font-bold text-[#16A34A] font-mono mb-2">
                  {selectedTicket.order?.publicCode ? `ORD-${selectedTicket.order.publicCode}` : selectedTicket.orderId ? `ORD-${selectedTicket.orderId.slice(-8).toUpperCase()}` : "—"}
                </p>
                <p className="text-[10px] text-[#64748B] font-semibold mb-0.5">Created At</p>
                <p className="text-[11px] font-semibold text-[#334155]">
                  {format(new Date(selectedTicket.createdAt), "dd MMM yyyy, hh:mm a")}
                </p>
              </div>
            </div>

            {/* Category Card */}
            {(() => {
              const catInfo = categoryConfig[selectedTicket.category] || categoryConfig.other;
              const CatIcon = catInfo.icon;
              return (
                <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] p-4 flex items-start gap-4 mb-6">
                  <div className="h-[44px] w-[44px] rounded-[12px] bg-[#EFF8F1] flex items-center justify-center flex-shrink-0">
                    <CatIcon className="h-[22px] w-[22px] text-[#16A34A]" strokeWidth={1.8} />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-[14px] font-bold text-[#1F2937]">{catInfo.label}</p>
                    <p className="text-[12px] font-medium text-[#64748B] mt-0.5 leading-relaxed">
                      {catInfo.description}
                    </p>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Detail Tabs */}
          <div className="border-b border-[#E5E7EB] flex-shrink-0 px-6">
            <div className="flex gap-6">
              {["conversation", "order", "customer", "notes"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDetailTab(tab)}
                  className={cn(
                    "py-3 text-[12px] font-bold border-b-[2px] transition-colors capitalize",
                    detailTab === tab
                      ? "border-[#16A34A] text-[#15803D]"
                      : "border-transparent text-[#475569] hover:text-[#1F2937]"
                  )}
                >
                  {tab === "order" ? "Order Details" : tab === "customer" ? "Customer Info" : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation Thread */}
          {detailTab === "conversation" && (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 bg-[#FFFFFF]">
              {selectedTicket.messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
                  <MessageCircle className="h-10 w-10 text-[#64748B]" strokeWidth={1.5} />
                  <p className="text-[13px] font-bold text-[#334155]">No messages yet</p>
                </div>
              ) : (
                selectedTicket.messages.map((msg) => {
                  const isAdmin = msg.senderId !== selectedTicket.userId;
                  return (
                    <div key={msg.id} className={cn("flex gap-3", isAdmin ? "flex-row-reverse" : "flex-row")}>
                      <Avatar className="h-[32px] w-[32px]">
                        {!isAdmin && selectedTicket.user?.image ? (
                          <AvatarImage src={selectedTicket.user.image} alt="Customer" className="object-cover" />
                        ) : (
                          <AvatarFallback className={cn("text-[11px] font-bold border border-[#E5E7EB]", isAdmin ? "bg-[#F0F8F1] text-[#15803D]" : "bg-[#FFFFFF] text-[#334155]")}>
                            {isAdmin ? "A" : getInitials(selectedTicket.user?.name)}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className={cn("flex-1", isAdmin ? "items-end flex flex-col" : "")}>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className={cn("text-[11px] font-bold", isAdmin ? "text-[#15803D]" : "text-[#1F2937]")}>
                            {isAdmin ? "Admin Reply" : selectedTicket.user?.name}
                          </span>
                          <span className="text-[10px] text-[#94A3B8] font-medium">
                            {format(new Date(msg.createdAt), "dd MMM yyyy, hh:mm a")}
                          </span>
                        </div>
                        <div className={cn("px-4 py-3 text-[13px] font-medium leading-relaxed max-w-[90%]", isAdmin ? "bg-[#F0F8F1] border border-[#DCEEDD] text-[#334155] rounded-[10px] rounded-tr-none" : "bg-[#FFFFFF] border border-[#EEF0F2] text-[#334155] rounded-[10px] rounded-tl-none")}>
                          {msg.message}
                          {isAdmin && (
                            <div className="flex justify-end mt-1.5">
                              <Check className="h-3.5 w-3.5 text-[#16A34A]" strokeWidth={2.5} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatBottomRef} />
            </div>
          )}

          {/* Order Details */}
          {detailTab === "order" && (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#FFFFFF]">
              {selectedTicket.order ? (
                <>
                  <div className="rounded-[10px] border border-[#E5E7EB] p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#475569]">Order ID</span>
                      <span className="text-[13px] font-bold text-[#16A34A] font-mono">
                        {selectedTicket.order.publicCode ? `ORD-${selectedTicket.order.publicCode}` : `ORD-${selectedTicket.order.id.slice(-8).toUpperCase()}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#475569]">Order Amount</span>
                      <span className="text-[13px] font-bold text-[#111827]">₹{Number(selectedTicket.order.totalAmount).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#475569]">Order Status</span>
                      <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-[5px] uppercase border bg-[#EFF6FF] text-[#2563EB] border-[#BFDBFE]">
                        {selectedTicket.order.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-[#475569]">Placed On</span>
                      <span className="text-[12px] font-semibold text-[#334155]">
                        {format(new Date(selectedTicket.order.createdAt), "dd MMM yyyy, hh:mm a")}
                      </span>
                    </div>
                  </div>
                  <div className="rounded-[10px] border border-[#E5E7EB] p-4 flex flex-col gap-3">
                    <p className="text-[11px] font-bold text-[#475569]">Order Items</p>
                    {selectedTicket.order.orderItems.length > 0 ? (
                      selectedTicket.order.orderItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between gap-3">
                          <span className="text-[13px] font-medium text-[#334155] flex-1">{item.menuItem.name}</span>
                          <span className="text-[12px] font-semibold text-[#64748B]">x{item.quantity}</span>
                          <span className="text-[13px] font-bold text-[#111827]">₹{(Number(item.unitPrice) * item.quantity).toLocaleString("en-IN")}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-[12px] font-medium text-[#94A3B8]">No items recorded for this order.</p>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-10">
                  <Package className="h-10 w-10 text-[#64748B]" strokeWidth={1.5} />
                  <p className="text-[13px] font-bold text-[#334155]">No order linked to this ticket</p>
                  <p className="text-[12px] font-medium text-[#94A3B8] max-w-[240px]">This ticket was raised without a related order.</p>
                </div>
              )}
            </div>
          )}

          {/* Customer Info */}
          {detailTab === "customer" && (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#FFFFFF]">
              <div className="rounded-[10px] border border-[#E5E7EB] p-4 flex flex-col items-center gap-3 text-center">
                <Avatar className="h-[64px] w-[64px]">
                  {selectedTicket.user?.image ? (
                    <AvatarImage src={selectedTicket.user.image} alt={selectedTicket.user.name ?? "Customer"} className="object-cover" />
                  ) : (
                    <AvatarFallback className="bg-[#FAFAFB] border border-[#E5E7EB] text-[#334155] font-bold text-lg">
                      {getInitials(selectedTicket.user?.name)}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <p className="font-bold text-[#111827] text-[15px]">{selectedTicket.user?.name || "Unknown Customer"}</p>
                  <p className="text-[12px] font-medium text-[#64748B] mt-0.5">Customer ID: {selectedTicket.userId ? selectedTicket.userId.slice(-8).toUpperCase() : "Unknown"}</p>
                </div>
              </div>
              <div className="rounded-[10px] border border-[#E5E7EB] p-4 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-[32px] w-[32px] rounded-[8px] bg-[#F1F5F9] flex items-center justify-center">
                    <Phone className="h-4 w-4 text-[#475569]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#94A3B8]">Phone Number</p>
                    <p className="text-[13px] font-bold text-[#334155]">{selectedTicket.user?.phoneNumber || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-[32px] w-[32px] rounded-[8px] bg-[#F1F5F9] flex items-center justify-center">
                    <Mail className="h-4 w-4 text-[#475569]" strokeWidth={1.8} />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-[#94A3B8]">Email Address</p>
                    <p className="text-[13px] font-bold text-[#334155] break-all">{selectedTicket.user?.email || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {detailTab === "notes" && (
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-[#FFFFFF]">
              <div className="rounded-[10px] border border-[#E5E7EB] p-4 flex flex-col gap-3">
                <p className="text-[11px] font-bold text-[#475569] flex items-center gap-2">
                  <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.8} /> Original Issue
                </p>
                <p className="text-[13px] font-medium text-[#334155] leading-relaxed">{selectedTicket.description}</p>
                <p className="text-[10px] font-medium text-[#94A3B8]">
                  {format(new Date(selectedTicket.createdAt), "dd MMM yyyy, hh:mm a")} · {categoryConfig[selectedTicket.category]?.label ?? "Other"}
                </p>
              </div>
              <div className="rounded-[10px] border border-[#E5E7EB] p-4 flex flex-col gap-3">
                <p className="text-[11px] font-bold text-[#475569]">Subject</p>
                <p className="text-[13px] font-semibold text-[#111827]">{selectedTicket.subject}</p>
              </div>
            </div>
          )}

          {/* Reply Box */}
          {detailTab === "conversation" && (
            <div className="border-t border-[#EEF0F2] px-6 py-5 flex-shrink-0 bg-[#FFFFFF]">
              <p className="text-[12px] font-bold text-[#111827] mb-3">Reply to customer</p>
              <Textarea
                {...register("message")}
                placeholder="Type your reply..."
                rows={3}
                className="resize-none rounded-[7px] border-[#E2E8F0] bg-[#FFFFFF] text-[13px] text-[#334155] placeholder:text-[#94A3B8] focus-visible:ring-[#3E9645] focus-visible:border-[#3E9645] shadow-none mb-3"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium text-[#94A3B8]">Replies are sent as Admin</span>
                </div>
                <Button
                  onClick={handleSubmit(
                    (data) =>
                      replyMutation.mutateAsync({ ticketId: selectedTicket.id, message: data.message })
                        .then(() => { reset(); toast.success("Reply sent"); })
                        .catch(() => toast.error("Failed to send reply")),
                    (errors) => {
                      if (errors.message?.message) {
                        toast.error(errors.message.message as string);
                      }
                    }
                  )}
                  disabled={replyMutation.isPending}
                  size="sm"
                  className="h-[36px] px-5 rounded-[7px] bg-[#159447] hover:bg-[#12803C] text-[#FFFFFF] font-bold gap-2 shadow-none border-none"
                >
                  {replyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" strokeWidth={1.8} />}
                  Send Reply
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t border-[#EEF0F2] px-6 py-4 flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 flex-shrink-0 bg-[#FFFFFF]">
            <Button
              size="sm" variant="outline"
              onClick={() => handleStatusChange("INPROGRESS")}
              disabled={selectedTicket.status === "INPROGRESS" || updateMutation.isPending}
              className="flex-1 min-w-[120px] h-10 rounded-[7px] text-[12px] font-bold border border-[#D4EAD6] bg-[#F2FAF3] text-[#15803D] hover:bg-[#E8F5EA] gap-1.5 shadow-none"
            >
              <Clock3 className="h-[14px] w-[14px] text-[#16A34A]" strokeWidth={2.5} /> Mark In Progress
            </Button>
            <Button
              size="sm" variant="outline"
              onClick={() => handleStatusChange("RESOLVED")}
              disabled={selectedTicket.status === "RESOLVED" || updateMutation.isPending}
              className="flex-1 min-w-[120px] h-10 rounded-[7px] text-[12px] font-bold border border-[#D4EAD6] bg-[#F2FAF3] text-[#15803D] hover:bg-[#E8F5EA] gap-1.5 shadow-none"
            >
              <Check className="h-[14px] w-[14px] text-[#16A34A]" strokeWidth={2.5} /> Mark Resolved
            </Button>
            <Button
              size="sm" variant="outline"
              onClick={() => handleStatusChange("CLOSED")}
              disabled={selectedTicket.status === "CLOSED" || updateMutation.isPending}
              className="flex-1 min-w-[120px] h-10 rounded-[7px] text-[12px] font-bold border border-[#E2E8F0] bg-[#F8FAFC] text-[#334155] hover:bg-[#F1F5F9] gap-1.5 shadow-none"
            >
              <Lock className="h-[14px] w-[14px] text-[#475569]" strokeWidth={2} /> Close Ticket
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}