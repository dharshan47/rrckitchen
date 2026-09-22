"use client";

import { useMemo, useState, useCallback } from "react";
import {
  AdminCategory,
  useAdminCategories,
  useAdminCategoriesQuery,
  useToggleCategoryMutation,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} from "@/stores";
import { format, subDays, startOfDay } from "date-fns";
import {
  Download,
  Plus,
  Search,
  Pencil,
  MoreVertical,
  LayoutGrid,
  CircleCheck,
  ChefHat,
  Eye,
  TrendingUp,
  Star,
  Lightbulb,
  Headset,
  ArrowRight,
  RotateCcw,
  Store,
  ChevronDown,
  X,
  ChartNoAxesCombined,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Loader2,
  Trash2,
  ImagePlus
} from "lucide-react";
import Image from "next/image";
import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const DONUT_COLORS = ["#1D9333", "#F97316", "#FB923C", "#7C3AED", "#EF4444", "#2563EB"];

function categoriesToCSV(categories: AdminCategory[]) {
  const header = ["Name", "Description", "Kitchens", "Status", "Created At"];
  const rows = categories.map((c) => [
    `"${c.name.replace(/"/g, '""')}"`,
    `"${(c.description ?? "").replace(/"/g, '""')}"`,
    c.kitchenCount,
    c.isActive ? "Active" : "Disabled",
    format(new Date(c.createdAt), "yyyy-MM-dd"),
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

function daysAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-[#FFFFFF] rounded-[10px] p-5 border border-[#E7EBE8] flex items-center gap-4">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-24 rounded-md" />
            <Skeleton className="h-7 w-14 rounded-md" />
            <Skeleton className="h-3 w-28 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="bg-white rounded-[10px] border border-[#E7EBE8] p-5">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-4 w-36 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="flex justify-center py-4">
          <Skeleton className="h-40 w-40 rounded-full" />
        </div>
        <div className="mt-6 space-y-3.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                <Skeleton className="h-3.5 w-24 rounded-md" />
              </div>
              <Skeleton className="h-3.5 w-8 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminCategory | null>(null);
  const [addName, setAddName] = useState("");
  const [addDescription, setAddDescription] = useState("");
  const [addImageUrl, setAddImageUrl] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState<string | null>(null);
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  const { isLoading, isError, refetch } = useAdminCategoriesQuery();
  const categories = useAdminCategories();
  const toggleMutation = useToggleCategoryMutation();
  const addMutation = useAddCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();
  const deleteMutation = useDeleteCategoryMutation();

  const handleToggle = useCallback((id: string, isActive: boolean) => {
    setPendingToggleId(id);
    toggleMutation.mutateAsync({ id, isActive }).then(() => {
      toast.success("Category status updated");
    }).catch(() => {
      toast.error("Failed to update status");
    }).finally(() => {
      setPendingToggleId(null);
    });
  }, [toggleMutation]);

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase()) || (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = statusFilter === "All" || (statusFilter === "Active" && cat.isActive) || (statusFilter === "Disabled" && !cat.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [categories, searchTerm, statusFilter]);

  const sortedCategories = useMemo(() => {
    return [...filteredCategories].sort((a, b) => {
      if (sortBy === "kitchens") return b.kitchenCount - a.kitchenCount;
      if (sortBy === "date") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return a.name.localeCompare(b.name);
    });
  }, [filteredCategories, sortBy]);

  const totalPages = Math.max(1, Math.ceil(sortedCategories.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = useMemo(() => {
    return sortedCategories.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  }, [sortedCategories, safePage, rowsPerPage]);
  const showingFrom = sortedCategories.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(safePage * rowsPerPage, sortedCategories.length);

  const activeCategoriesCount = categories.filter((c) => c.isActive).length;
  const totalKitchensUsing = categories.reduce((acc, cat) => acc + cat.kitchenCount, 0);
  const totalCategories = categories.length;
  const activePercentage = totalCategories > 0 ? Math.round((activeCategoriesCount / totalCategories) * 100) : 0;

  const weekStart = startOfDay(subDays(new Date(), 6)).getTime();
  const lastWeekStart = startOfDay(subDays(new Date(), 13)).getTime();
  const addedThisWeek = categories.filter((c) => new Date(c.createdAt).getTime() >= weekStart).length;
  const addedLastWeek = categories.filter((c) => {
    const ts = new Date(c.createdAt).getTime();
    return ts >= lastWeekStart && ts < weekStart;
  }).length;
  const weeklyGrowth = addedLastWeek > 0 ? ((addedThisWeek - addedLastWeek) / addedLastWeek) * 100 : null;

  const kitchenDistribution = useMemo(() => {
    const sorted = [...categories].sort((a, b) => b.kitchenCount - a.kitchenCount);
    const top = sorted.slice(0, 4);
    const rest = sorted.slice(4).reduce((acc, c) => acc + c.kitchenCount, 0);
    const list = top.map((c) => ({ name: c.name, kitchenCount: c.kitchenCount }));
    if (rest > 0) list.push({ name: "Others", kitchenCount: rest });
    return list;
  }, [categories]);

  const mostPopular = useMemo(() => {
    return [...categories].sort((a, b) => b.kitchenCount - a.kitchenCount)[0];
  }, [categories]);
  const newestCategory = useMemo(() => {
    return [...categories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }, [categories]);

  const openEdit = (cat: AdminCategory) => {
    setEditTarget(cat);
    setEditName(cat.name);
    setEditDescription(cat.description ?? "");
    setEditImageUrl(cat.imageUrl ?? null);
  };

  const submitAdd = () => {
    if (!addName.trim()) { toast.error("Category name is required"); return; }
    addMutation.mutateAsync({ name: addName.trim(), description: addDescription.trim() || null, imageUrl: addImageUrl }).then((res) => {
      if (!res.success) { toast.error(res.error || "Failed to add category"); return; }
      toast.success("Category added");
      setAddDialogOpen(false); setAddName(""); setAddDescription(""); setAddImageUrl(null);
    }).catch(() => { toast.error("Failed to add category"); });
  };

  const submitEdit = () => {
    if (!editTarget) return;
    if (!editName.trim()) { toast.error("Category name is required"); return; }
    updateMutation.mutateAsync({ id: editTarget.id, data: { name: editName.trim(), description: editDescription.trim() || null, imageUrl: editImageUrl } }).then(() => {
      toast.success("Category updated");
      setEditTarget(null);
    }).catch(() => { toast.error("Failed to update category"); });
  };

  const handleDelete = () => {
    if (!editTarget) return;
    if (confirm("Are you sure you want to delete this category?")) {
      deleteMutation.mutateAsync(editTarget.id).then(() => {
        toast.success("Category deleted");
        setEditTarget(null);
      }).catch(() => { toast.error("Failed to delete category"); });
    }
  };

  const statCards = [
    { label: "Total Categories", value: totalCategories, sub: "100% of total", icon: LayoutGrid, iconBg: "bg-[#EEF8F0]", iconColor: "text-[#1D9333]" },
    { label: "Active Categories", value: activeCategoriesCount, sub: `${activePercentage}% of total`, icon: CircleCheck, iconBg: "bg-[#EFF6FF]", iconColor: "text-[#2563EB]" },
    { label: "Kitchens Using", value: totalKitchensUsing, sub: "Total across all categories", icon: ChefHat, iconBg: "bg-[#FFF7ED]", iconColor: "text-[#F97316]" },
    { label: "Added This Week", value: addedThisWeek, sub: (
      weeklyGrowth !== null ? (
        <span className="flex items-center text-[#1D9333]">
          <ArrowUp className="h-3 w-3 mr-1" /> {weeklyGrowth.toFixed(1)}% <span className="text-[#475467] ml-1">vs last week</span>
        </span>
      ) : (
        <span className="text-[#475467]">In the last 7 days</span>
      )
    ), icon: Eye, iconBg: "bg-[#F5F0FF]", iconColor: "text-[#7C3AED]" },
  ];

  const columns = useMemo<ColumnDef<AdminCategory>[]>(() => [
    {
      accessorKey: "name",
      header: "Category",
      cell: ({ row }) => {
        const cat = row.original;
        const isPopular = cat.kitchenCount > 5;
        const isNew = new Date(cat.createdAt).getTime() > Date.now() - 7 * 86400000;
        const isTrending = cat.kitchenCount > 2 && !isPopular;
        return (
          <div className="flex items-center gap-3 w-max py-2">
            <Avatar className="h-[50px] w-[50px] border-none shadow-none">
              <AvatarImage asChild src={cat.imageUrl} alt={cat.name}>
                <Image src={cat.imageUrl} alt={cat.name} fill sizes="50px" className="object-cover" />
              </AvatarImage>
              <AvatarFallback className="bg-slate-100 text-slate-500 font-medium">
                {cat.name.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start gap-1">
              <span className="font-semibold text-[13px] text-[#101828]">{cat.name}</span>
              <div className="flex gap-1">
                {isPopular && <Badge variant="outline" className="bg-[#EEF8F0] text-[#147A2B] border-[#D7EEDD] h-[20px] px-1.5 text-[10px] rounded-[5px] font-semibold">Popular</Badge>}
                {isNew && <Badge variant="outline" className="bg-[#EFF6FF] text-[#2563EB] border-[#CFE0FF] h-[20px] px-1.5 text-[10px] rounded-[5px] font-semibold">New</Badge>}
                {isTrending && <Badge variant="outline" className="bg-[#FFF7ED] text-[#EA580C] border-[#FED7AA] h-[20px] px-1.5 text-[10px] rounded-[5px] font-semibold">Trending</Badge>}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <span className="text-[12px] text-[#475467] leading-[18px] max-w-[220px] inline-block">
          {row.original.description || "No description provided"}
        </span>
      ),
    },
    {
      accessorKey: "kitchenCount",
      header: "Kitchens",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-[#475467] text-[13px]">
          <Store className="h-[15px] w-[15px] text-[#475467]" />
          {row.original.kitchenCount} {row.original.kitchenCount === 1 ? "Kitchen" : "Kitchens"}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const cat = row.original;
        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={cat.isActive}
              disabled={pendingToggleId === cat.id}
              onCheckedChange={(checked) => handleToggle(cat.id, checked)}
              className={cn(
                "h-[20px] w-[36px] transition-colors",
                cat.isActive ? "data-[state=checked]:bg-[#1D9333]" : "data-[state=unchecked]:bg-[#D0D5DD]"
              )}
            />
            {cat.isActive ? (
               <Badge variant="outline" className="bg-[#EEF8F0] text-[#147A2B] border-[#D7EEDD] h-[22px] px-2 text-[11px] rounded-[5px] font-semibold uppercase tracking-wide">
                 Active
               </Badge>
            ) : (
               <Badge variant="outline" className="bg-[#F8FAFC] text-[#667085] border-[#E2E8F0] h-[22px] px-2 text-[11px] rounded-[5px] font-semibold uppercase tracking-wide">
                 Disabled
               </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="text-[#101828] text-[13px] font-medium">
            {format(new Date(row.original.createdAt), "MMM dd, yyyy")}
          </span>
          <span className="text-[#667085] text-[12px] mt-0.5">
            {format(new Date(row.original.createdAt), "hh:mm a")}
          </span>
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-[32px] w-[32px] bg-[#F8FCF9] border-[#D7EBDD] text-[#1D9333] hover:bg-[#EEF8F0] hover:border-[#CDE8D2] rounded-[7px]"
            onClick={() => openEdit(row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
             variant="outline"
             size="icon"
             className="h-[32px] w-[32px] bg-[#FFFFFF] border-[#E2E8E4] text-[#344054] rounded-[7px] hover:bg-[#F8FAF9]"
          >
             <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ], [pendingToggleId, handleToggle]);

  const table = useReactTable({
    data: pageItems,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="flex flex-col 2xl:flex-row gap-6 w-full max-w-[1600px] mx-auto min-h-screen bg-[#FCFCFD] pb-10 overflow-x-hidden">
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[24px] font-bold text-[#101828] tracking-tight">Category Management</h1>
              <Badge variant="outline" className="bg-[#EEF8F0] text-[#147A2B] border-none rounded-[9999px] font-semibold text-[11px] h-[22px] px-2 shrink-0">
                {totalCategories} Categories
              </Badge>
            </div>
            <p className="text-[13px] text-[#475467] mt-1">
              Manage food categories to help customers discover the right kitchens and cuisines
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              className="h-[38px] w-full sm:w-auto bg-[#FFFFFF] text-[#344054] border-[#E2E8E4] rounded-[7px] hover:bg-[#F8FAF9] hover:border-[#D0D7D2] gap-2"
              onClick={() => {
                if (sortedCategories.length === 0) { toast.error("No categories to export"); return; }
                downloadCSV("categories.csv", categoriesToCSV(sortedCategories));
                toast.success(`${sortedCategories.length} categories exported`);
              }}
            >
              <Download className="h-[15px] w-[15px] shrink-0" /> Export
            </Button>
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-[#1D9333] hover:bg-[#147A2B] text-[#FFFFFF] border-[#1D9333] h-[38px] w-full sm:w-auto rounded-[7px] gap-2 shadow-[0_2px_5px_rgba(29,147,51,0.15)]"
            >
              <Plus className="h-[16px] w-[16px] shrink-0" /> <span className="truncate">Add New Category</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <StatsRowSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card, i) => (
              <div key={i} className="bg-[#FFFFFF] border border-[#E7EBE8] rounded-[10px] p-5 flex items-center gap-4 shadow-none">
                <div className={cn("h-[48px] w-[48px] rounded-full flex items-center justify-center shrink-0", card.iconBg)}>
                  <card.icon className={cn("h-[24px] w-[24px]", card.iconColor)} />
                </div>
                <div className="flex flex-col">
                  <p className="text-[12px] font-medium text-[#344054] mb-1">{card.label}</p>
                  <h3 className="text-[24px] font-bold text-[#101828] leading-none mb-1">{card.value}</h3>
                  <div className="text-[12px] text-[#475467]">{card.sub}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
          <div className="relative flex-1 w-full lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[17px] w-[17px] text-[#475467]" />
            <Input
              placeholder="Search by name or description..."
              className="pl-9 h-[40px] w-full bg-[#FFFFFF] border-[#E2E8E4] rounded-[7px] text-[#344054] placeholder:text-[#98A2B3] focus-visible:ring-0 focus-visible:border-[#1D9333] focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_3px_rgba(29,147,51,0.08)]"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[140px] h-[40px] bg-[#FFFFFF] border-[#E2E8E4] rounded-[7px] text-[#344054] focus:ring-0">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Status: All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => { setSortBy(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full sm:w-[150px] h-[40px] bg-[#FFFFFF] border-[#E2E8E4] rounded-[7px] text-[#344054] focus:ring-0">
                <SelectValue placeholder="Sort by: Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by: Name</SelectItem>
                <SelectItem value="kitchens">Sort by: Kitchens</SelectItem>
                <SelectItem value="date">Sort by: Date</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              className="w-full sm:w-auto h-[40px] bg-[#FFFFFF] border-[#E2E8E4] text-[#344054] rounded-[7px] hover:bg-[#F8FAF9] px-4 gap-2 shrink-0"
              onClick={() => { setSearchTerm(""); setStatusFilter("All"); setSortBy("name"); setCurrentPage(1); }}
            >
              <RotateCcw className="h-4 w-4 shrink-0" /> Reset
            </Button>
          </div>
        </div>

        {isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-[#FFFFFF] rounded-[10px] border border-[#E7EBE8] shadow-none">
            <X className="h-12 w-12 text-red-400" />
            <p className="text-red-500 font-semibold">Failed to load categories</p>
            <Button variant="outline" onClick={() => refetch()}><RotateCcw className="h-4 w-4 mr-2" /> Retry</Button>
          </div>
        ) : (
          <div className="bg-[#FFFFFF] border border-[#E7EBE8] rounded-[10px] overflow-hidden flex-1 flex flex-col shadow-none w-full min-w-0">
            <ScrollArea className="w-[calc(100vw-32px)] sm:w-full max-w-full flex-1 rounded-t-[10px]">
              <Table className="min-w-[800px]">
                <TableHeader className="bg-[#F5FAF6]">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-[#E7EBE8]">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="text-[#344054] text-[11px] font-semibold uppercase h-auto py-4 px-6">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i} className="border-b border-[#EEF1EF]">
                        <TableCell className="px-6 py-4"><Skeleton className="h-10 w-32" /></TableCell>
                        <TableCell className="px-6 py-4"><Skeleton className="h-4 w-48" /></TableCell>
                        <TableCell className="px-6 py-4"><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                        <TableCell className="px-6 py-4"><Skeleton className="h-8 w-24" /></TableCell>
                        <TableCell className="px-6 py-4"><Skeleton className="h-8 w-16" /></TableCell>
                      </TableRow>
                    ))
                  ) : table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow
                        key={row.id}
                        data-state={row.getIsSelected() && "selected"}
                        className="border-b border-[#EEF1EF] hover:bg-[#FAFCFA] transition-colors"
                      >
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-6 py-2">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-24 text-center">
                        No categories found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            {!isLoading && (
              <div className="p-4 border-t border-[#E7EBE8] flex flex-col xl:flex-row items-center justify-between gap-4 text-[13px] text-[#475467] bg-[#FFFFFF]">
                <div className="text-center xl:text-left">
                  Showing {showingFrom} to {showingTo} of {sortedCategories.length} categories
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full xl:w-auto justify-center xl:justify-end">
                  <Pagination className="mx-0 w-auto">
                    <PaginationContent>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="icon"
                          className={cn("h-[32px] w-[32px] bg-[#FFFFFF] border-[#E2E8E4] text-[#344054] rounded-[6px] mr-1", safePage <= 1 && "pointer-events-none opacity-50")}
                          onClick={(e) => { e.preventDefault(); if(safePage > 1) setCurrentPage(safePage - 1); }}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      </PaginationItem>
                      {Array.from({ length: totalPages }).map((_, i) => (
                        <PaginationItem key={i}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }}
                            isActive={safePage === i + 1}
                            className={cn("h-[32px] w-[32px] rounded-[6px] text-[13px] font-medium", safePage === i + 1 ? "bg-[#1D9333] text-white border-none hover:bg-[#147A2B] hover:text-white" : "bg-white text-[#344054] border border-[#E2E8E4] hover:bg-[#EEF8F0] hover:text-[#147A2B] hover:border-[#CDE8D2]")}
                          >
                            {i + 1}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="icon"
                          className={cn("h-[32px] w-[32px] bg-[#FFFFFF] border-[#E2E8E4] text-[#344054] rounded-[6px] ml-1", safePage >= totalPages && "pointer-events-none opacity-50")}
                          onClick={(e) => { e.preventDefault(); if(safePage < totalPages) setCurrentPage(safePage + 1); }}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                  <div className="flex items-center gap-2">
                    Rows per page
                    <Select value={String(rowsPerPage)} onValueChange={(v) => { setRowsPerPage(Number(v)); setCurrentPage(1); }}>
                      <SelectTrigger className="h-[32px] w-[70px] bg-[#FFFFFF] border-[#E2E8E4] rounded-[7px] text-[#344054] focus:ring-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <SidebarSkeleton />
      ) : (
        <div className="w-full 2xl:w-[320px] flex flex-col gap-6">
          <div className="bg-[#FFFFFF] rounded-[10px] border border-[#E7EBE8] p-5 shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[16px] text-[#101828]">Category Overview</h3>
              <div className="flex items-center gap-1 px-3 py-1 border border-[#E2E8E4] rounded-[7px] text-[#344054] text-[12px] cursor-pointer hover:bg-[#F8FAF9]">
                 This Week <ChevronDown className="h-3 w-3 ml-1 text-[#667085]" />
              </div>
            </div>
            
            <div className="flex items-center justify-center flex-col">
               <div className="relative w-[180px] h-[180px] shrink-0 mb-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={kitchenDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="kitchenCount"
                        stroke="none"
                      >
                        {kitchenDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[22px] font-bold text-[#101828]">{totalKitchensUsing}</span>
                    <span className="text-[11px] text-[#667085]">Total Kitchens</span>
                  </div>
               </div>
               
               <div className="w-full flex flex-col gap-3 px-2">
                  {kitchenDistribution.map((d, i) => (
                     <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-[10px] h-[10px] rounded-full" style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                           <span className="text-[13px] text-[#344054]">{d.name}</span>
                        </div>
                        <span className="text-[13px] text-[#344054] font-medium">{d.kitchenCount}</span>
                     </div>
                  ))}
               </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-[10px] border border-[#E7EBE8] p-5 shadow-none">
            <h3 className="font-bold text-[16px] text-[#101828] mb-4">Quick Insights</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 p-3 rounded-[10px] border border-[#DDEDE0] bg-[#FFFFFF]">
                 <div className="h-[40px] w-[40px] rounded-[10px] bg-[#EEF8F0] flex items-center justify-center shrink-0">
                    <ChartNoAxesCombined className="h-[20px] w-[20px] text-[#1D9333]" />
                 </div>
                 <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#101828]">Most Popular</p>
                    <p className="text-[12px] text-[#475467]">{mostPopular?.name ?? "—"}</p>
                  </div>
                  <div className="text-[12px] text-[#475467]">
                     {mostPopular?.kitchenCount ?? 0} Kitchens
                 </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-[10px] border border-[#FDE3CC] bg-[#FFFFFF]">
                 <div className="h-[40px] w-[40px] rounded-[10px] bg-[#FFF7ED] flex items-center justify-center shrink-0">
                    <Star className="h-[20px] w-[20px] text-[#F97316]" />
                 </div>
                 <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#101828]">New Addition</p>
                    <p className="text-[12px] text-[#475467]">{newestCategory?.name ?? "—"}</p>
                  </div>
                  <div className="text-[12px] text-[#475467]">
                     {newestCategory ? daysAgo(newestCategory.createdAt) : "—"}
                  </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-[10px] border border-[#D9E7FF] bg-[#FFFFFF]">
                 <div className="h-[40px] w-[40px] rounded-[10px] bg-[#EFF6FF] flex items-center justify-center shrink-0">
                    <TrendingUp className="h-[20px] w-[20px] text-[#2563EB]" />
                 </div>
                 <div className="flex-1">
                    <p className="text-[13px] font-semibold text-[#101828]">Growth This Week</p>
                    <p className="text-[13px] font-semibold text-[#1D9333] flex items-center mt-0.5">
                       <ArrowUp className="h-3 w-3 mr-1" />
                       {weeklyGrowth !== null ? `${weeklyGrowth.toFixed(1)}%` : "0%"}
                    </p>
                 </div>
                 <div className="text-[12px] text-[#475467]">
                    More kitchen usage
                 </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-[16px] text-[#101828] mb-3">Tips</h3>
            <div className="bg-[#FFFFFF] rounded-[10px] border border-[#E7EBE8] p-4 shadow-none">
               <div className="bg-[#EEF8F0] border border-[#D8EBDD] rounded-[8px] p-3 flex items-start gap-3">
                  <Lightbulb className="h-[20px] w-[20px] text-[#1D9333] shrink-0 mt-0.5" />
                  <p className="text-[12px] text-[#147A2B] leading-[18px]">
                     Well organized categories help customers find kitchens faster and improve conversions.
                  </p>
               </div>
            </div>
          </div>

          <div className="bg-[#FFFFFF] rounded-[10px] border border-[#E7EBE8] p-5 shadow-none flex items-start gap-4">
            <Headset className="h-[28px] w-[28px] text-[#1D9333] shrink-0 mt-1" />
            <div className="flex flex-col">
              <h3 className="font-bold text-[14px] text-[#101828] mb-1">Need Help?</h3>
              <p className="text-[12px] text-[#475467] leading-relaxed mb-3">
                 Learn how to manage categories effectively.
              </p>
              <a href="#" className="flex items-center text-[#1D9333] text-[13px] font-semibold hover:underline">
                 View Documentation <ArrowRight className="h-4 w-4 ml-1" />
              </a>
            </div>
          </div>
        </div>
      )}

      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>Create a new food category to help customers discover kitchens.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category Image</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 rounded-md">
                  {addImageUrl ? (
                    <AvatarImage asChild src={addImageUrl} alt="Preview">
                      <Image src={addImageUrl} alt="Preview" fill sizes="64px" className="object-cover" />
                    </AvatarImage>
                  ) : (
                    <AvatarFallback className="rounded-md bg-slate-100 text-slate-500">
                      <ImagePlus className="h-6 w-6" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <CloudinaryUpload onUpload={(res) => setAddImageUrl(res.secure_url)}>
                  {({ uploading, startUpload }) => (
                    <Button type="button" variant="outline" size="sm" onClick={startUpload} disabled={uploading}>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImagePlus className="h-4 w-4 mr-2" />}
                      {addImageUrl ? "Change Image" : "Upload Image"}
                    </Button>
                  )}
                </CloudinaryUpload>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input id="cat-name" placeholder="e.g. Biryani" value={addName} onChange={(e) => setAddName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea id="cat-desc" placeholder="Short description (optional)" value={addDescription} onChange={(e) => setAddDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>Cancel</Button>
            <Button onClick={submitAdd} disabled={addMutation.isPending} className="bg-[#1D9333] hover:bg-[#147A2B] text-white gap-2">
              {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editTarget !== null} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>Update the name and description of this category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Category Image</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 rounded-md">
                  {editImageUrl ? (
                    <AvatarImage asChild src={editImageUrl} alt="Preview">
                      <Image src={editImageUrl} alt="Preview" fill sizes="64px" className="object-cover" />
                    </AvatarImage>
                  ) : (
                    <AvatarFallback className="rounded-md bg-slate-100 text-slate-500">
                      <ImagePlus className="h-6 w-6" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <CloudinaryUpload onUpload={(res) => setEditImageUrl(res.secure_url)}>
                  {({ uploading, startUpload }) => (
                    <Button type="button" variant="outline" size="sm" onClick={startUpload} disabled={uploading}>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ImagePlus className="h-4 w-4 mr-2" />}
                      {editImageUrl ? "Change Image" : "Upload Image"}
                    </Button>
                  )}
                </CloudinaryUpload>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cat-name">Name</Label>
              <Input id="edit-cat-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cat-desc">Description</Label>
              <Textarea id="edit-cat-desc" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
            </div>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row items-center sm:justify-between w-full gap-2">
            <Button variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50 w-full sm:w-auto" onClick={handleDelete} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setEditTarget(null)}>Cancel</Button>
              <Button onClick={submitEdit} disabled={updateMutation.isPending} className="flex-1 sm:flex-none bg-[#1D9333] hover:bg-[#147A2B] text-white gap-2">
                {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
