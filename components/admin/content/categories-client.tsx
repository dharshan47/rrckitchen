"use client";

import { useMemo, useState } from "react";
import {
  AdminCategory,
  useAdminCategories,
  useAdminCategoriesQuery,
  useToggleCategoryMutation,
  useAddCategoryMutation,
  useUpdateCategoryMutation,
} from "@/stores";
import { format, subDays, startOfDay } from "date-fns";
import {
  Download,
  Plus,
  Search,
  Edit2,
  Info,
  LayoutGrid,
  CheckCircle2,
  ChefHat,
  Eye,
  ArrowUp,
  TrendingUp,
  HelpCircle,
  ArrowRight,
  Loader2,
  RotateCcw,
  X,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
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

const DONUT_COLORS = ["#10b981", "#f97316", "#3b82f6", "#a855f7", "#ef4444", "#94a3b8"];

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

/* ------------------------- Skeleton components ------------------------- */

function StatsRowSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4"
        >
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
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
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
        <Skeleton className="h-4 w-28 rounded-md mb-5" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24 rounded-md" />
                <Skeleton className="h-3 w-32 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------- Main page ------------------------- */

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
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  const { isLoading, isError, refetch } = useAdminCategoriesQuery();
  const categories = useAdminCategories();

  const toggleMutation = useToggleCategoryMutation();
  const addMutation = useAddCategoryMutation();
  const updateMutation = useUpdateCategoryMutation();

  const handleToggle = (id: string, isActive: boolean) => {
    setPendingToggleId(id);
    toggleMutation
      .mutateAsync({ id, isActive })
      .then(() => {
        toast.success("Category status updated");
      })
      .catch(() => {
        toast.error("Failed to update status");
      })
      .finally(() => {
        setPendingToggleId(null);
      });
  };

  const filteredCategories = useMemo(() => {
    return categories.filter((cat) => {
      const matchesSearch =
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (cat.description && cat.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Active" && cat.isActive) ||
        (statusFilter === "Disabled" && !cat.isActive);
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
  const pageItems = sortedCategories.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const showingFrom = sortedCategories.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(safePage * rowsPerPage, sortedCategories.length);

  const activeCategoriesCount = categories.filter((c) => c.isActive).length;
  const totalKitchensUsing = categories.reduce((acc, cat) => acc + cat.kitchenCount, 0);
  const popularCount = categories.filter((c) => c.kitchenCount > 5).length;
  const totalCategories = categories.length;
  const activePercentage =
    totalCategories > 0 ? Math.round((activeCategoriesCount / totalCategories) * 100) : 0;
  const popularPercentage = totalCategories > 0 ? Math.round((popularCount / totalCategories) * 100) : 0;

  const weekStart = startOfDay(subDays(new Date(), 6)).getTime();
  const lastWeekStart = startOfDay(subDays(new Date(), 13)).getTime();
  const addedThisWeek = categories.filter((c) => new Date(c.createdAt).getTime() >= weekStart).length;
  const addedLastWeek = categories.filter((c) => {
    const ts = new Date(c.createdAt).getTime();
    return ts >= lastWeekStart && ts < weekStart;
  }).length;
  const weeklyGrowth =
    addedLastWeek > 0 ? ((addedThisWeek - addedLastWeek) / addedLastWeek) * 100 : null;

  const kitchenDistribution = useMemo(() => {
    const sorted = [...categories].sort((a, b) => b.kitchenCount - a.kitchenCount);
    const top = sorted.slice(0, 5);
    const rest = sorted.slice(5).reduce((acc, c) => acc + c.kitchenCount, 0);
    const list = top.map((c) => ({ name: c.name, kitchenCount: c.kitchenCount }));
    if (rest > 0) list.push({ name: "Others", kitchenCount: rest });
    return list;
  }, [categories]);

  const donutGradient =
    totalKitchensUsing > 0
      ? kitchenDistribution
          .reduce<{ stops: string[]; acc: number }>(
            (state, d) => {
              const start = state.acc;
              state.acc += (d.kitchenCount / totalKitchensUsing) * 100;
              state.stops.push(
                `${DONUT_COLORS[state.stops.length % DONUT_COLORS.length]} ${start}% ${state.acc}%`
              );
              return state;
            },
            { stops: [], acc: 0 }
          )
          .stops.join(", ")
      : undefined;

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
  };

  const submitAdd = () => {
    if (!addName.trim()) {
      toast.error("Category name is required");
      return;
    }
    addMutation
      .mutateAsync({ name: addName.trim(), description: addDescription.trim() || undefined })
      .then((res) => {
        if (!res.success) {
          toast.error(res.error || "Failed to add category");
          return;
        }
        toast.success("Category added");
        setAddDialogOpen(false);
        setAddName("");
        setAddDescription("");
      })
      .catch(() => {
        toast.error("Failed to add category");
      });
  };

  const submitEdit = () => {
    if (!editTarget) return;
    if (!editName.trim()) {
      toast.error("Category name is required");
      return;
    }
    updateMutation
      .mutateAsync({
        id: editTarget.id,
        data: { name: editName.trim(), description: editDescription.trim() || null },
      })
      .then(() => {
        toast.success("Category updated");
        setEditTarget(null);
      })
      .catch(() => {
        toast.error("Failed to update category");
      });
  };

  const statCards = [
    {
      label: "Total Categories",
      value: totalCategories,
      sub: "100% of total",
      icon: LayoutGrid,
      iconBg: "bg-[#f0fdf4]",
      iconColor: "text-[#10b981]",
      watermark: true,
    },
    {
      label: "Active Categories",
      value: activeCategoriesCount,
      sub: `${activePercentage}% of total`,
      icon: CheckCircle2,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      label: "Kitchens Using",
      value: totalKitchensUsing,
      sub: "Total across all categories",
      icon: ChefHat,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      label: "Popular Categories",
      value: popularCount,
      sub: `5+ kitchens · ${popularPercentage}% of total`,
      icon: Eye,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <div className="flex flex-col xl:flex-row gap-6 w-full max-w-[1600px] mx-auto">
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Category Management</h1>
              <Badge variant="outline" className="bg-[#eefcf3] text-[#10b981] border-[#dcfce7] font-semibold text-xs">
                {totalCategories} Categories
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Manage food categories to help customers discover the right kitchens and cuisines
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              className="gap-2 h-10 w-full sm:w-auto shadow-sm"
              onClick={() => {
                if (sortedCategories.length === 0) {
                  toast.error("No categories to export");
                  return;
                }
                downloadCSV("categories.csv", categoriesToCSV(sortedCategories));
                toast.success(`${sortedCategories.length} categories exported`);
              }}
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="bg-[#10b981] hover:bg-[#059669] text-white gap-2 h-10 w-full sm:w-auto shadow-sm shadow-[#10b981]/20"
            >
              <Plus className="h-4 w-4" />
              Add New Category
            </Button>
          </div>
        </div>

        {/* Top Stat Cards */}
        {isLoading ? (
          <StatsRowSkeleton />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {statCards.map((card) => (
              <div
                key={card.label}
                className="bg-white rounded-xl p-5 border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden"
              >
                {card.watermark && (
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <LayoutGrid className="h-16 w-16" />
                  </div>
                )}
                <div
                  className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center shrink-0",
                    card.iconBg
                  )}
                >
                  <card.icon className={cn("h-6 w-6", card.iconColor)} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-1">{card.label}</p>
                  <h3 className="text-2xl font-bold text-slate-900">{card.value}</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">{card.sub}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Table Filters */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by name or description..."
              className="pl-9 h-10 w-full lg:max-w-md bg-white border-slate-200"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[140px] h-10 bg-white">
                <SelectValue placeholder="Status: All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">Status: All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-[150px] h-10 bg-white">
                <SelectValue placeholder="Sort by: Name" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by: Name</SelectItem>
                <SelectItem value="kitchens">Sort by: Kitchens</SelectItem>
                <SelectItem value="date">Sort by: Date</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              className="h-10 text-slate-500 hover:text-slate-900"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setSortBy("name");
                setCurrentPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Table Area */}
        {isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <X className="h-12 w-12 text-red-400" />
            <p className="text-red-500 font-semibold">Failed to load categories</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RotateCcw className="h-4 w-4 mr-2" /> Retry
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-slate-500 bg-slate-50 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 rounded-tl-xl">Category</th>
                    <th className="px-6 py-4">Description</th>
                    <th className="px-6 py-4">Kitchens</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Created At</th>
                    <th className="px-6 py-4 rounded-tr-xl text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-8 w-16 mx-auto" /></td>
                      </tr>
                    ))
                  ) : pageItems.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        No categories found.
                      </td>
                    </tr>
                  ) : (
                    pageItems.map((cat) => (
                      <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3 w-max">
                            <Avatar className="h-10 w-10 border border-slate-100 shadow-sm">
                              <AvatarImage asChild src={cat.imageUrl} alt={cat.name}>
                                <Image
                                  src={cat.imageUrl}
                                  alt={cat.name}
                                  fill
                                  sizes="40px"
                                  className="object-cover"
                                />
                              </AvatarImage>
                              <AvatarFallback className="bg-slate-100 text-slate-500 font-medium">
                                {cat.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{cat.name}</span>
                              {cat.kitchenCount > 5 && (
                                <Badge
                                  variant="secondary"
                                  className="w-fit mt-1 text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-50 border-none h-4 px-1.5 rounded"
                                >
                                  Popular
                                </Badge>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-500 max-w-[280px] truncate">
                          {cat.description || "No description provided"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-600 font-medium">
                            <ChefHat className="h-4 w-4 text-slate-400" />
                            {cat.kitchenCount} Kitchens
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={cat.isActive}
                              disabled={pendingToggleId === cat.id}
                              onCheckedChange={(checked) => handleToggle(cat.id, checked)}
                              className={cat.isActive ? "data-[state=checked]:bg-[#10b981]" : ""}
                            />
                            <Badge
                              variant="outline"
                              className={cn(
                                "ml-2 text-[10px] uppercase font-bold border-none px-2 py-0.5 rounded-full",
                                cat.isActive ? "bg-[#f0fdf4] text-[#10b981]" : "bg-slate-100 text-slate-500"
                              )}
                            >
                              {cat.isActive ? "Active" : "Disabled"}
                            </Badge>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-slate-700 text-sm font-medium">
                              {format(new Date(cat.createdAt), "MMM dd, yyyy")}
                            </span>
                            <span className="text-slate-400 text-xs mt-0.5">
                              {format(new Date(cat.createdAt), "hh:mm a")}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 text-[#10b981] border-slate-200 hover:bg-[#10b981]/10 hover:text-[#10b981] hover:border-[#10b981]/30"
                              onClick={() => openEdit(cat)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-200 flex items-center justify-between text-sm text-slate-500 bg-slate-50/50">
              <div>
                Showing <span className="font-semibold text-slate-900">{showingFrom}</span> to{" "}
                <span className="font-semibold text-slate-900">{showingTo}</span> of{" "}
                <span className="font-semibold text-slate-900">{sortedCategories.length}</span> categories
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  Rows per page
                  <Select
                    value={String(rowsPerPage)}
                    onValueChange={(v) => {
                      setRowsPerPage(Number(v));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="h-8 w-16 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage(safePage - 1)}
                  >
                    <span className="sr-only">Previous page</span>
                    &lt;
                  </Button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <Button
                      key={i}
                      variant="outline"
                      size="icon"
                      className={cn(
                        "h-8 w-8",
                        safePage === i + 1
                          ? "bg-[#10b981] text-white hover:bg-[#059669] hover:text-white border-none"
                          : "bg-white"
                      )}
                      onClick={() => setCurrentPage(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 bg-white"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage(safePage + 1)}
                  >
                    <span className="sr-only">Next page</span>
                    &gt;
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Sidebar */}
      {isLoading ? (
        <SidebarSkeleton />
      ) : (
        <div className="w-full xl:w-[320px] 2xl:w-[360px] flex flex-col gap-6">
          {/* Category Overview Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Category Overview</h3>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Kitchens per category
              </span>
            </div>

            <div className="flex items-center justify-center py-4 relative">
              <div
                className="relative w-40 h-40 rounded-full bg-slate-100 flex items-center justify-center shadow-inner"
                style={
                  donutGradient
                    ? { background: `conic-gradient(${donutGradient})` }
                    : undefined
                }
              >
                <div className="absolute inset-0 m-5 rounded-full bg-white shadow-sm flex flex-col items-center justify-center z-10">
                  <span className="text-3xl font-bold text-slate-900">{totalKitchensUsing}</span>
                  <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider text-center px-2 mt-0.5">
                    Total Kitchens
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3.5">
              {kitchenDistribution.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: DONUT_COLORS[i % DONUT_COLORS.length] }}
                    />
                    <span className="text-slate-600 font-medium">{d.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{d.kitchenCount}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Insights Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="font-bold text-slate-900 mb-5">Quick Insights</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="h-10 w-10 rounded-full bg-[#f0fdf4] flex items-center justify-center shrink-0">
                  <TrendingUp className="h-5 w-5 text-[#10b981]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">Most Popular</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {mostPopular?.name ?? "—"}
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-700 text-right">
                  {mostPopular?.kitchenCount ?? 0} Kitchens
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  <Plus className="h-5 w-5 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">New Addition</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {newestCategory?.name ?? "—"}
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-700 text-right whitespace-nowrap">
                  {newestCategory ? daysAgo(newestCategory.createdAt) : "—"}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50/50">
                <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                  <ArrowUp className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900">Growth This Week</p>
                  <p
                    className={cn(
                      "text-xs font-semibold flex items-center mt-0.5",
                      weeklyGrowth === null || weeklyGrowth >= 0 ? "text-[#10b981]" : "text-rose-500"
                    )}
                  >
                    <ArrowUp
                      className={cn("h-3 w-3 mr-0.5", weeklyGrowth !== null && weeklyGrowth < 0 && "rotate-180")}
                    />
                    {weeklyGrowth === null ? "New this week" : `${weeklyGrowth >= 0 ? "+" : ""}${weeklyGrowth.toFixed(1)}%`}
                  </p>
                </div>
                <div className="text-xs font-semibold text-slate-700 text-right whitespace-nowrap">
                  Categories added
                </div>
              </div>
            </div>
          </div>

          {/* Tips Card */}
          <div className="bg-[#f0fdf4] rounded-xl border border-[#dcfce7] p-5">
            <h3 className="font-bold text-slate-900 mb-3">Tips</h3>
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-[#10b981] shrink-0 mt-0.5" />
              <p className="text-sm text-slate-700 font-medium leading-relaxed">
                Well organized categories help customers find kitchens faster and improve conversions.
              </p>
            </div>
          </div>

          {/* Need Help Card */}
          <div className="bg-slate-50 rounded-xl border border-slate-100 p-5 mt-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0 text-[#10b981]">
                <HelpCircle className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-slate-900">Need Help?</h3>
            </div>
            <p className="text-sm text-slate-600 mb-4 ml-11">
              Learn how to manage categories effectively.
            </p>
            <Button
              variant="link"
              className="text-[#10b981] font-semibold h-auto p-0 ml-11 flex items-center gap-1 hover:text-[#059669]"
            >
              View Documentation <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
            <DialogDescription>
              Create a new food category to help customers discover kitchens.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                placeholder="e.g. Biryani"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cat-desc">Description</Label>
              <Textarea
                id="cat-desc"
                placeholder="Short description (optional)"
                value={addDescription}
                onChange={(e) => setAddDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={submitAdd}
              disabled={addMutation.isPending}
              className="bg-[#10b981] hover:bg-[#059669] text-white gap-2"
            >
              {addMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editTarget !== null} onOpenChange={(open) => !open && setEditTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
            <DialogDescription>
              Update the name and description of this category.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-cat-name">Name</Label>
              <Input
                id="edit-cat-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-cat-desc">Description</Label>
              <Textarea
                id="edit-cat-desc"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={submitEdit}
              disabled={updateMutation.isPending}
              className="bg-[#10b981] hover:bg-[#059669] text-white gap-2"
            >
              {updateMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
