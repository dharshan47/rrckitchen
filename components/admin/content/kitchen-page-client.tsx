"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  Plus,
  ExternalLink,
  Filter,
  Download,
  Star,
  Clock,
  X,
  Save,
  Monitor,
  Tablet,
  Smartphone,
  ImageIcon,
  GripVertical,
  Heart,
  MapPin,
  ShieldCheck,
  Leaf,
  Info,
  Trash2,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ChevronUp,
  Loader2,
  AlertTriangle,
  RotateCcw,
  ChefHat,
  UtensilsCrossed,
  ShoppingBag,
  Tag,
  ListOrdered,
  MoreVertical,
  SquarePen,
  Lightbulb,
  Flame,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Image from "next/image";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

import {
  getKitchenSearchPageContents,
  getKitchenSearchPageContent,
  getKitchenSearchPreview,
  createKitchenSearchPageContent,
  saveKitchenSearchPageContent,
  deleteKitchenSearchPageContent,
  type AdminKitchenSearchRow,
} from "@/actions/admin/kitchen-search-pages";

import {
  useKitchenSearchEditorActions,
  useKitchenSearchEditorDraft,
  useKitchenSearchEditorDirty,
  toKitchenSearchSaveInput,
} from "@/stores/kitchenSearchPageStore";

import {
  validateKitchenSearchSave,
  validateKitchenSearchCreate,
  KITCHEN_SEARCH_SORT_OPTIONS,
} from "@/lib/schemas/kitchen-search-page";

import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload";

type BooleanDraftKey =
  | "isActive"
  | "showHero"
  | "showRatings"
  | "showDeliveryTime"
  | "showDistance"
  | "showPureVegBadge"
  | "showHygienicBadge"
  | "showKitchenStory"
  | "showInternalNotes"
  | "showKitchenTiming"
  | "showFreshIngredients"
  | "showPackaging"
  | "showSupportLocalWomen";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "—";
  return formatDistanceToNow(date, { addSuffix: true });
}

/* ===================================================================
   SKELETONS
=================================================================== */

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-300 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-72" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-44" />
        </div>
      </div>
      <Card className="border-slate-200 shadow-sm overflow-hidden rounded-xl">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex gap-3 w-full lg:w-auto">
            <Skeleton className="h-10 w-full md:w-[350px]" />
            <Skeleton className="h-10 w-40" />
          </div>
          <Skeleton className="h-10 w-28" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-slate-50">
            <Skeleton className="h-5 w-6" />
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-5 w-28" />
          </div>
        ))}
      </Card>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-14 w-14 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-80" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex flex-col gap-6 mt-6">
          <div className="w-full space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
          <div className="w-full mt-6">
            <Skeleton className="h-[600px] w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   EDITOR
=================================================================== */

interface EditorProps {
  contentId: string;
  onCancel: () => void;
}

function Editor({ contentId, onCancel }: EditorProps) {
  const queryClient = useQueryClient();
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [selectedFilterIndex, setSelectedFilterIndex] = useState(0);
  const [editingFilterIndex, setEditingFilterIndex] = useState<number | null>(null);

  const draft = useKitchenSearchEditorDraft();
  const dirty = useKitchenSearchEditorDirty();
  const {
    openEditor,
    updateDraft,
    updateChip,
    addChip,
    removeChip,
    moveChip,
    updateFilter,
    addFilter,
    removeFilter,
    moveFilter,
    addFilterOption,
    removeFilterOption,
    updateMenuCategory,
    addMenuCategory,
    removeMenuCategory,
    moveMenuCategory,
    updateRecommendedItem,
    addRecommendedItem,
    removeRecommendedItem,
    moveRecommendedItem,
    markSaved,
  } = useKitchenSearchEditorActions();

  const { data: detail, isFetching, isError, refetch } = useQuery({
    queryKey: ["admin-kitchen-search-page-detail", contentId],
    queryFn: () => getKitchenSearchPageContent(contentId),
    enabled: !!contentId,
    staleTime: 60_000,
  });

  const openedRef = useRef<string | null>(null);
  useEffect(() => {
    if (detail && (!draft || draft.id !== detail.id) && openedRef.current !== detail.id) {
      openedRef.current = detail.id;
      openEditor(detail);
    }
  }, [detail, draft, openEditor]);

  const { data: preview } = useQuery({
    queryKey: ["admin-kitchen-search-preview", detail?.keyword ?? ""],
    queryFn: () => getKitchenSearchPreview(detail?.keyword ?? ""),
    enabled: !!detail?.keyword,
    staleTime: 60_000,
  });

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error("No draft");
      return saveKitchenSearchPageContent(draft.id, toKitchenSearchSaveInput(draft));
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to save changes");
        return;
      }
      markSaved();
      queryClient.invalidateQueries({ queryKey: ["admin-kitchen-search-page"] });
      queryClient.invalidateQueries({ queryKey: ["admin-kitchen-search-page-detail", contentId] });
      toast.success(`"${draft?.keyword ?? "Search"}" configuration saved & published`);
    },
    onError: () => toast.error("Failed to save changes"),
  });

  const handleSave = () => {
    if (!draft) return;
    const validation = validateKitchenSearchSave(toKitchenSearchSaveInput(draft));
    if (!validation.success) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }
    saveMutation.mutate();
  };

  if (isFetching && !detail) {
    return <EditorSkeleton />;
  }

  if (isError || !detail) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400" />
          <p className="text-red-500 font-semibold">Failed to load search configuration</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RotateCcw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!draft) return <EditorSkeleton />;

  const heroUrl = draft.desktopBannerUrl || draft.mobileBannerUrl;
  const enabledChips = draft.chips.filter((c) => c.isEnabled);
  const enabledFilters = draft.filters.filter((f) => f.isEnabled);
  const previewKitchens = preview?.kitchens ?? [];
  const previewItems = preview?.menuItems ?? [];
  const firstKitchen = previewKitchens[0];
  const safeFilterIndex = Math.min(Math.max(selectedFilterIndex, 0), Math.max(draft.filters.length - 1, 0));
  const selectedFilter = draft.filters[safeFilterIndex];

  const getFilterIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes("type") || n.includes("style")) return <ChefHat className="h-4 w-4 text-[#FF4B0B]" strokeWidth={1.8} />;
    if (n.includes("protein")) return <UtensilsCrossed className="h-4 w-4 text-[#10B981]" strokeWidth={1.8} />;
    if (n.includes("spice")) return <Flame className="h-4 w-4 text-[#FF4B0B]" strokeWidth={1.8} />;
    if (n.includes("rice")) return <Leaf className="h-4 w-4 text-[#10B981]" strokeWidth={1.8} />;
    if (n.includes("serve")) return <Users className="h-4 w-4 text-[#F59E0B]" strokeWidth={1.8} />;
    return <Filter className="h-4 w-4 text-[#94A3B8]" strokeWidth={1.8} />;
  };

  const infoItems: {
    key: BooleanDraftKey;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { key: "showRatings", label: "Rating & Reviews", icon: Star },
    { key: "showKitchenTiming", label: "Kitchen Timing", icon: Clock },
    { key: "showDeliveryTime", label: "Delivery Time", icon: Clock },
    { key: "showDistance", label: "Distance", icon: MapPin },
    { key: "showPureVegBadge", label: "Pure Veg Badge", icon: Leaf },
    { key: "showHygienicBadge", label: "Hygienic Badge", icon: ShieldCheck },
    { key: "showKitchenStory", label: "Kitchen Story / About", icon: Info },
    { key: "showFreshIngredients", label: "Fresh Ingredients", icon: Leaf },
    { key: "showPackaging", label: "Safe & Secure Packaging", icon: ShoppingBag },
    { key: "showSupportLocalWomen", label: "Support Local Women", icon: Heart },
    { key: "showInternalNotes", label: "Internal Notes", icon: Info },
  ];

  return (
    <div className="min-h-screen bg-[#FEFEFE] p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 font-sans pb-20">
      {/* Editor Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-[#FFF3ED] text-[#FF4B0B] rounded-xl border border-[#FFD6B8] hidden sm:block">
            <ChefHat className="h-7 w-7" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[22px] font-bold tracking-tight text-[#111827] mb-0.5 flex items-center gap-2">
              Kitchen Detail Page Management
            </h1>
            <p className="text-[13px] text-[#64748B]">
              Manage how kitchen detail page looks after customer clicks <strong className="text-[#334155]">View Menu</strong> from search results
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button
            variant="outline"
            className="h-[36px] bg-white border-[#E5E7EB] text-[#334155] font-semibold text-[13px] shadow-sm flex-1 md:flex-none"
            onClick={() => window.open(`/search?q=${encodeURIComponent(draft.keyword)}`, "_blank")}
          >
            <ExternalLink className="h-4 w-4 mr-2" strokeWidth={1.8} /> View Live Site 
          </Button>
          <Button
            className="h-[36px] bg-[#187A45] hover:bg-[#14663A] text-white font-semibold text-[13px] shadow-sm flex-1 md:flex-none px-5"
            disabled={saveMutation.isPending}
            onClick={handleSave}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" strokeWidth={1.8} />
            )}
            Save All Changes
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-[36px] w-[36px] rounded-lg text-[#64748B] hover:text-[#111827] hover:bg-slate-100"
            aria-label="Close Editor"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex justify-end mb-4">
        <div className="text-[12px] text-[#64748B] font-medium">Last updated: {formatRelativeTime(draft.updatedAt)}</div>
      </div>

      {dirty && (
        <div className="mb-5 flex items-center gap-2 text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit">
          <AlertTriangle className="h-4 w-4" />
          You have unsaved changes. Click Save All Changes to publish.
        </div>
      )}

      {/* Editor Subheader */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#EEF0F2]">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold text-[#64748B]">Status</span>
            {draft.isActive ? (
              <Badge variant="outline" className="border-[#A7F3D0] bg-[#ECFDF5] text-[#047857] gap-1.5 px-2.5 py-1 font-bold shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div> Published
              </Badge>
            ) : (
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 gap-1.5 px-2.5 py-1 font-bold shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Draft
              </Badge>
            )}
          </div>
        </div>

      </div>

      {/* Main Content Area */}
      <div className="flex flex-col gap-6 mt-6">
        {/* Top Panel - Settings */}
        <div className="w-full space-y-6">
          <Tabs defaultValue="page-settings" className="w-full">
            <TabsList className="bg-transparent border-b border-[#EEF0F2] rounded-none w-full justify-start h-auto p-0 space-x-6 sm:space-x-8 overflow-x-auto hide-scrollbar">
              <TabsTrigger value="page-settings" className="data-[state=active]:border-b-[3px] data-[state=active]:border-b-[#FF4B0B] data-[state=active]:text-[#FF4B0B] data-[state=active]:shadow-none rounded-none px-1 py-3 bg-transparent font-bold text-[#64748B] text-[14px] data-[state=active]:bg-transparent">
                Page Settings
              </TabsTrigger>
              <TabsTrigger value="filters-chips" className="data-[state=active]:border-b-[3px] data-[state=active]:border-b-[#FF4B0B] data-[state=active]:text-[#FF4B0B] data-[state=active]:shadow-none rounded-none px-1 py-3 bg-transparent font-bold text-[#64748B] text-[14px] data-[state=active]:bg-transparent">
                Filters & Chips
              </TabsTrigger>
              <TabsTrigger value="menu-display" className="data-[state=active]:border-b-[3px] data-[state=active]:border-b-[#FF4B0B] data-[state=active]:text-[#FF4B0B] data-[state=active]:shadow-none rounded-none px-1 py-3 bg-transparent font-bold text-[#64748B] text-[14px] data-[state=active]:bg-transparent">
                Menu Display
              </TabsTrigger>
              <TabsTrigger value="kitchen-info" className="data-[state=active]:border-b-[3px] data-[state=active]:border-b-[#FF4B0B] data-[state=active]:text-[#FF4B0B] data-[state=active]:shadow-none rounded-none px-1 py-3 bg-transparent font-bold text-[#64748B] text-[14px] data-[state=active]:bg-transparent">
                Kitchen Info
              </TabsTrigger>
              <TabsTrigger value="layout-design" className="data-[state=active]:border-b-[3px] data-[state=active]:border-b-[#FF4B0B] data-[state=active]:text-[#FF4B0B] data-[state=active]:shadow-none rounded-none px-1 py-3 bg-transparent font-bold text-[#64748B] text-[14px] data-[state=active]:bg-transparent">
                Layout & Design
              </TabsTrigger>
            </TabsList>

            {/* ----------------------- PAGE SETTINGS ----------------------- */}
            <TabsContent value="page-settings" className="pt-6 space-y-8">
              {/* 1. Hero Section Images */}
              <div>
                <h3 className="font-bold text-[#111827] mb-1 text-[15px]">1. Hero Section Images</h3>
                <p className="text-[13px] text-[#64748B] font-medium mb-4">
                  These images will be shown at the top of kitchen detail page
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {(
                    [
                      { key: "desktopBannerUrl" as const, res: "1200x400px" },
                      { key: "tabletBannerUrl" as const, res: "768x400px" },
                      { key: "mobileBannerUrl" as const, res: "375x400px" },
                    ]
                  ).map((h, i) => {
                    const value = i === 1 ? draft.mobileBannerUrl : draft.desktopBannerUrl;
                    return (
                      <div key={h.key} className="space-y-3">
                        <div className="relative h-28 bg-slate-100 rounded-[10px] overflow-hidden group border border-[#E5E7EB]">
                          {value ? (
                            <Image src={value} alt={`${h.key} hero`} fill sizes="300px" className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400">
                              <ImageIcon className="h-6 w-6" strokeWidth={1.5} />
                              <span className="text-[10px] font-semibold">No image</span>
                            </div>
                          )}
                        </div>
                        <p className="text-[11px] text-[#64748B] font-medium">
                          Recommended: {h.res}
                        </p>
                        <CloudinaryUpload
                          onUpload={({ secure_url }) => updateDraft({ [h.key as "desktopBannerUrl" | "mobileBannerUrl"]: secure_url })}
                        >
                          {({ uploading, startUpload }) => (
                            <Button
                              variant="outline"
                              className="w-full text-[#187A45] border-[#187A45] hover:bg-[#F3FAF5] font-bold h-9 text-[13px]"
                              onClick={startUpload}
                              disabled={uploading}
                            >
                              {uploading ? (
                                <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                              ) : (
                                <ImageIcon className="h-4 w-4 mr-1.5" strokeWidth={2} />
                              )}
                              Change Image
                            </Button>
                          )}
                        </CloudinaryUpload>
                      </div>
                    );
                  })}
                </div>
              </div>

              <hr className="border-[#EEF0F2]" />

              {/* 2. Search Chips */}
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-[#111827] text-[15px] mb-1">2. Search Chips <span className="text-[#64748B] font-medium">(Top Pills)</span></h3>
                    <p className="text-[13px] text-[#64748B] font-medium">Manage the quick filter chips shown below the search title</p>
                  </div>
                  <Button variant="outline" className="text-[#FF4B0B] border-[#FF4B0B] hover:bg-[#FFF3ED] font-bold h-9 px-4 shadow-sm text-[13px]" onClick={addChip}>
                    <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" /> Add Chip
                  </Button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {draft.chips.map((chip: { label: string; isEnabled: boolean }, idx: number) => (
                    <div key={idx} className="flex items-center gap-2.5 bg-white border border-[#E5E7EB] rounded-full shadow-sm px-3 h-[36px]">
                      <GripVertical className="h-4 w-4 text-[#CBD5E1] cursor-grab hidden md:block" />
                      <Switch
                        checked={chip.isEnabled}
                        onCheckedChange={(c) => updateChip(idx, { isEnabled: c })}
                        className="scale-[0.65] origin-left data-[state=checked]:bg-[#10B981]"
                      />
                      <span className={`text-[13px] font-bold ${chip.isEnabled ? "text-[#334155]" : "text-[#94A3B8] line-through"}`}>
                        {chip.label}
                      </span>
                      <X className="h-3.5 w-3.5 ml-1 text-[#94A3B8] cursor-pointer hover:text-red-500" onClick={() => removeChip(idx)} />
                    </div>
                  ))}
                  {draft.chips.length === 0 && (
                    <div className="text-[13px] text-[#94A3B8] font-medium py-2">
                      No chips yet. Click &ldquo;Add Chip&rdquo; to create a quick filter pill.
                    </div>
                  )}
                </div>
              </div>

              <hr className="border-[#EEF0F2]" />

              <div className={`grid grid-cols-1 ${device === 'mobile' ? 'grid-cols-1' : 'lg:grid-cols-2'} gap-8`}>
                {/* 3. Filter Categories */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-[#111827] text-[15px] mb-1">3. Filter Categories <span className="text-[#64748B] font-medium">(Left Sidebar)</span></h3>
                    <p className="text-[13px] text-[#64748B] font-medium">Enable/Disable and manage filters shown in the left sidebar</p>
                  </div>
                  
                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white shadow-sm">
                    <Table className="w-full text-left">
                      <TableHeader>
                        <TableRow className="border-b border-[#E5E7EB] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                          <TableHead className="font-semibold text-[11px] text-[#64748B] uppercase px-4 py-3 text-center"></TableHead>
                          <TableHead className="font-semibold text-[11px] text-[#64748B] uppercase px-2 py-3">Filter Category</TableHead>
                          <TableHead className="font-semibold text-[11px] text-[#64748B] uppercase px-2 py-3 text-center">Visible</TableHead>
                          <TableHead className="font-semibold text-[11px] text-[#64748B] uppercase px-2 py-3 text-center">Values</TableHead>
                          <TableHead className="font-semibold text-[11px] text-[#64748B] uppercase px-4 py-3 text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {draft.filters.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="px-4 py-8 text-center text-[13px] text-[#94A3B8] font-medium">
                              No filter categories yet. Add one below to show filters in the left sidebar.
                            </TableCell>
                          </TableRow>
                        ) : (
                          draft.filters.map((filter, idx) => (
                            <TableRow
                              key={idx}
                              onClick={() => setSelectedFilterIndex(idx)}
                              className={`cursor-pointer hover:bg-[#F8FAFC] ${idx !== draft.filters.length - 1 ? "border-b border-[#F1F5F9]" : ""} ${safeFilterIndex === idx ? "bg-[#FFF9F5]" : "bg-white"}`}
                            >
                              <TableCell className="px-4 py-2 w-10 text-center"><GripVertical className="h-4 w-4 text-[#CBD5E1] cursor-grab mx-auto" /></TableCell>
                              <TableCell className="px-2 py-2">
                                {editingFilterIndex === idx ? (
                                  <Input
                                    autoFocus
                                    defaultValue={filter.name}
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        updateFilter(idx, { name: e.currentTarget.value.trim() || filter.name });
                                        setEditingFilterIndex(null);
                                      }
                                    }}
                                    onBlur={(e) => {
                                      updateFilter(idx, { name: e.target.value.trim() || filter.name });
                                      setEditingFilterIndex(null);
                                    }}
                                    className="h-8 w-[180px] bg-white border-slate-200 shadow-sm text-[13px]"
                                  />
                                ) : (
                                  <div className="flex items-center gap-2">
                                    {getFilterIcon(filter.name)}
                                    <span className="text-[13px] font-semibold text-[#334155]">{filter.name}</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell className="px-2 py-2 text-center">
                                <Switch
                                  checked={filter.isEnabled}
                                  onCheckedChange={(c) => updateFilter(idx, { isEnabled: c })}
                                  className="scale-[0.75] data-[state=checked]:bg-[#10B981] mx-auto"
                                />
                              </TableCell>
                              <TableCell className="px-2 py-2 text-center">
                                <span className="text-[12px] font-semibold text-[#64748B]">{filter.options.length} values</span>
                              </TableCell>
                              <TableCell className="px-4 py-2">
                                <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => moveFilter(idx, -1)}>
                                    <ChevronUp className="h-4 w-4 text-[#94A3B8] hover:text-[#111827]" strokeWidth={1.8} />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === draft.filters.length - 1} onClick={() => moveFilter(idx, 1)}>
                                    <ChevronDown className="h-4 w-4 text-[#94A3B8] hover:text-[#111827]" strokeWidth={1.8} />
                                  </Button>
                                  <SquarePen
                                    className="h-4 w-4 text-[#94A3B8] cursor-pointer hover:text-[#111827] ml-1"
                                    strokeWidth={1.8}
                                    onClick={() => setEditingFilterIndex(editingFilterIndex === idx ? null : idx)}
                                  />
                                  <Trash2 className="h-4 w-4 text-[#FF4B0B] cursor-pointer hover:text-red-700 ml-1" strokeWidth={1.8} onClick={() => removeFilter(idx)} />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <Button variant="outline" className="w-full text-[#FF4B0B] border-[#FF4B0B] hover:bg-[#FFF3ED] font-bold h-[40px] shadow-sm text-[13px]" onClick={addFilter}>
                    <Plus className="h-4 w-4 mr-2 stroke-[2.5]" /> Add Filter Category
                  </Button>
                </div>

                {/* 4. Filter Values & 5. Kitchen Info */}
                <div className="space-y-8">
                  {/* Filter Values */}
                  <div>
                    <h3 className="font-bold text-[#111827] text-[15px] mb-1">4. Filter Values</h3>
                    <p className="text-[13px] text-[#64748B] font-medium mb-4">Manage values for selected filter</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[13px] font-bold text-[#111827]">Select Filter</span>
                      <Select
                        value={draft.filters.length > 0 ? String(safeFilterIndex) : undefined}
                        onValueChange={(v) => setSelectedFilterIndex(Number(v))}
                      >
                        <SelectTrigger className="h-[36px] w-[220px] bg-white border-[#E5E7EB] text-[#111827] font-semibold shadow-sm text-[13px] rounded-lg" disabled={draft.filters.length === 0}>
                          <SelectValue placeholder="No filters yet" />
                        </SelectTrigger>
                        <SelectContent>
                          {draft.filters.map((f, i) => (
                            <SelectItem key={i} value={String(i)}>{f.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedFilter ? (
                      <>
                        <div className="space-y-2 mb-4">
                          <span className="text-[13px] font-bold text-[#111827] block mb-2">Filter Values</span>
                          {selectedFilter.options.length === 0 && (
                            <div className="text-[13px] text-[#94A3B8] font-medium py-2">No values yet. Add a value below.</div>
                          )}
                          {selectedFilter.options.map((val, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-[#F1F5F9] last:border-0">
                              <div className="flex items-center gap-3">
                                <GripVertical className="h-4 w-4 text-[#CBD5E1] cursor-grab" />
                                <span className="text-[13px] font-semibold text-[#334155]">{val}</span>
                              </div>
                              <Trash2
                                className="h-4 w-4 text-[#FF4B0B] cursor-pointer hover:text-red-700"
                                strokeWidth={1.8}
                                onClick={() => removeFilterOption(safeFilterIndex, val)}
                              />
                            </div>
                          ))}
                        </div>

                        <AddValueInput onAdd={(value) => addFilterOption(safeFilterIndex, value)} />
                      </>
                    ) : (
                      <div className="text-[13px] text-[#94A3B8] font-medium py-6 border border-dashed border-[#E5E7EB] rounded-xl text-center">
                        Add a filter category in section 3 to manage its values here.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* ----------------------- FILTERS & CHIPS ----------------------- */}
            <TabsContent value="filters-chips" className="pt-6 space-y-8">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-[#111827] text-[15px] mb-1">Search Chips <span className="text-[#64748B] font-medium">(Top Pills)</span></h3>
                    <p className="text-[13px] text-[#64748B] font-medium">Edit chip labels, enable/disable, and reorder how they appear below the search title</p>
                  </div>
                  <Button variant="outline" className="text-[#FF4B0B] border-[#FF4B0B] hover:bg-[#FFF3ED] font-bold h-9 px-4 shadow-sm text-[13px]" onClick={addChip}>
                    <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" /> Add Chip
                  </Button>
                </div>

                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white shadow-sm">
                  {draft.chips.length === 0 ? (
                    <div className="p-8 text-center text-[13px] text-[#94A3B8] font-medium">
                      No chips yet. Add a chip to show quick filter pills above the menu.
                    </div>
                  ) : (
                    <Table className="w-full text-left">
                      <TableHeader>
                        <TableRow className="border-b border-[#E5E7EB] bg-[#F8FAFC] hover:bg-[#F8FAFC]">
                          <TableHead className="font-semibold text-[11px] text-[#64748B] uppercase px-4 py-3 text-center"></TableHead>
                          <TableHead className="font-semibold text-[11px] text-[#64748B] uppercase px-2 py-3">Chip Label</TableHead>
                          <TableHead className="font-semibold text-[11px] text-[#64748B] uppercase px-2 py-3 text-center">Enabled</TableHead>
                          <TableHead className="font-semibold text-[11px] text-[#64748B] uppercase px-4 py-3 text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {draft.chips.map((chip, idx) => (
                          <TableRow key={idx} className={`hover:bg-[#F8FAFC] ${idx !== draft.chips.length - 1 ? "border-b border-[#F1F5F9]" : "border-0"}`}>
                            <TableCell className="px-4 py-2 w-10 text-center"><GripVertical className="h-4 w-4 text-[#CBD5E1] cursor-grab mx-auto" /></TableCell>
                            <TableCell className="px-2 py-2">
                              <Input
                                value={chip.label}
                                onChange={(e) => updateChip(idx, { label: e.target.value })}
                                className="h-8 w-[240px] bg-white border-slate-200 shadow-sm text-[13px]"
                              />
                            </TableCell>
                            <TableCell className="px-2 py-2 text-center">
                              <Switch
                                checked={chip.isEnabled}
                                onCheckedChange={(c) => updateChip(idx, { isEnabled: c })}
                                className="scale-[0.75] data-[state=checked]:bg-[#10B981] mx-auto"
                              />
                            </TableCell>
                            <TableCell className="px-4 py-2">
                              <div className="flex items-center justify-center gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => moveChip(idx, -1)}>
                                  <ChevronUp className="h-4 w-4 text-[#94A3B8] hover:text-[#111827]" strokeWidth={1.8} />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === draft.chips.length - 1} onClick={() => moveChip(idx, 1)}>
                                  <ChevronDown className="h-4 w-4 text-[#94A3B8] hover:text-[#111827]" strokeWidth={1.8} />
                                </Button>
                                <Trash2 className="h-4 w-4 text-[#FF4B0B] cursor-pointer hover:text-red-700 ml-1" strokeWidth={1.8} onClick={() => removeChip(idx)} />
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ----------------------- MENU DISPLAY ----------------------- */}
            <TabsContent value="menu-display" className="pt-6 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-[#111827] text-[15px] mb-1">Menu Categories</h3>
                      <p className="text-[13px] text-[#64748B] font-medium">Categories shown as sections in the kitchen menu preview</p>
                    </div>
                    <Button variant="outline" className="text-[#FF4B0B] border-[#FF4B0B] hover:bg-[#FFF3ED] font-bold h-9 px-4 shadow-sm text-[13px]" onClick={addMenuCategory}>
                      <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" /> Add Category
                    </Button>
                  </div>
                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white shadow-sm">
                    {draft.menuCategories.length === 0 ? (
                      <div className="p-8 text-center text-[13px] text-[#94A3B8] font-medium">
                        No menu categories yet.
                      </div>
                    ) : (
                      draft.menuCategories.map((cat, idx) => (
                        <div key={idx} className={`flex items-center gap-3 px-4 py-2.5 ${idx !== draft.menuCategories.length - 1 ? "border-b border-[#F1F5F9]" : ""}`}>
                          <GripVertical className="h-4 w-4 text-[#CBD5E1] cursor-grab" />
                          <Input
                            value={cat.name}
                            onChange={(e) => updateMenuCategory(idx, e.target.value)}
                            className="h-8 flex-1 bg-white border-slate-200 shadow-sm text-[13px]"
                          />
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => moveMenuCategory(idx, -1)}>
                            <ChevronUp className="h-4 w-4 text-[#94A3B8] hover:text-[#111827]" strokeWidth={1.8} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === draft.menuCategories.length - 1} onClick={() => moveMenuCategory(idx, 1)}>
                            <ChevronDown className="h-4 w-4 text-[#94A3B8] hover:text-[#111827]" strokeWidth={1.8} />
                          </Button>
                          <Trash2 className="h-4 w-4 text-[#FF4B0B] cursor-pointer hover:text-red-700" strokeWidth={1.8} onClick={() => removeMenuCategory(idx)} />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-[#111827] text-[15px] mb-1">Recommended Items</h3>
                      <p className="text-[13px] text-[#64748B] font-medium">Featured items highlighted in the kitchen menu preview</p>
                    </div>
                    <Button variant="outline" className="text-[#FF4B0B] border-[#FF4B0B] hover:bg-[#FFF3ED] font-bold h-9 px-4 shadow-sm text-[13px]" onClick={addRecommendedItem}>
                      <Plus className="h-4 w-4 mr-1.5 stroke-[2.5]" /> Add Item
                    </Button>
                  </div>
                  <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white shadow-sm">
                    {draft.recommendedItems.length === 0 ? (
                      <div className="p-8 text-center text-[13px] text-[#94A3B8] font-medium">
                        No recommended items yet.
                      </div>
                    ) : (
                      draft.recommendedItems.map((item, idx) => (
                        <div key={idx} className={`flex items-center gap-3 px-4 py-2.5 ${idx !== draft.recommendedItems.length - 1 ? "border-b border-[#F1F5F9]" : ""}`}>
                          <GripVertical className="h-4 w-4 text-[#CBD5E1] cursor-grab" />
                          <Input
                            value={item.name}
                            onChange={(e) => updateRecommendedItem(idx, e.target.value)}
                            className="h-8 flex-1 bg-white border-slate-200 shadow-sm text-[13px]"
                          />
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === 0} onClick={() => moveRecommendedItem(idx, -1)}>
                            <ChevronUp className="h-4 w-4 text-[#94A3B8] hover:text-[#111827]" strokeWidth={1.8} />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" disabled={idx === draft.recommendedItems.length - 1} onClick={() => moveRecommendedItem(idx, 1)}>
                            <ChevronDown className="h-4 w-4 text-[#94A3B8] hover:text-[#111827]" strokeWidth={1.8} />
                          </Button>
                          <Trash2 className="h-4 w-4 text-[#FF4B0B] cursor-pointer hover:text-red-700" strokeWidth={1.8} onClick={() => removeRecommendedItem(idx)} />
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ----------------------- KITCHEN INFO ----------------------- */}
            <TabsContent value="kitchen-info" className="pt-6 space-y-8">
              <div>
                <h3 className="font-bold text-[#111827] text-[15px] mb-1">Kitchen Info Section <span className="text-[#64748B] font-medium">(Right Sidebar / Top)</span></h3>
                <p className="text-[13px] text-[#64748B] font-medium mb-4">Choose which kitchen information to show on the detail page</p>

                <div className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white shadow-sm">
                  {infoItems.map((item, idx) => (
                    <div key={item.key} className={`flex items-center justify-between px-4 py-3 ${idx !== infoItems.length - 1 ? "border-b border-[#F1F5F9]" : ""}`}>
                      <div className="flex items-center gap-3">
                        <div className="h-[36px] w-[36px] rounded-[10px] bg-[#FFF3ED] flex items-center justify-center">
                          <item.icon className="h-4 w-4 text-[#FF4B0B]" />
                        </div>
                        <span className="text-[13px] font-semibold text-[#334155]">{item.label}</span>
                      </div>
                      <Switch
                        checked={Boolean(draft[item.key])}
                        onCheckedChange={(c) => {
                          const patch: Partial<typeof draft> = {};
                          patch[item.key] = c;
                          updateDraft(patch);
                        }}
                        className="scale-[0.8] origin-right data-[state=checked]:bg-[#10B981]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ----------------------- LAYOUT & DESIGN ----------------------- */}
            <TabsContent value="layout-design" className="pt-6 space-y-8">
              <div>
                <h3 className="font-bold text-[#111827] text-[15px] mb-1">Header Content</h3>
                <p className="text-[13px] text-[#64748B] font-medium mb-4">Text shown at the top of the kitchen detail page</p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-[#111827]">Search Title</Label>
                    <Input
                      value={draft.searchTitle}
                      onChange={(e) => updateDraft({ searchTitle: e.target.value })}
                      placeholder="e.g. Best Biryani in Chennai"
                      className="bg-white border-[#E5E7EB] shadow-sm h-10 text-[13px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-[#111827]">Badge Text</Label>
                    <Input
                      value={draft.badgeText}
                      onChange={(e) => updateDraft({ badgeText: e.target.value })}
                      placeholder="e.g. Top Rated"
                      className="bg-white border-[#E5E7EB] shadow-sm h-10 text-[13px]"
                    />
                  </div>
                </div>

                <div className="space-y-2 mt-5">
                  <Label className="text-[13px] font-bold text-[#111827]">Description</Label>
                  <Textarea
                    value={draft.description}
                    onChange={(e) => updateDraft({ description: e.target.value })}
                    rows={4}
                    placeholder="Short description shown below the kitchen name"
                    className="bg-white border-[#E5E7EB] shadow-sm text-[13px]"
                  />
                </div>

                <hr className="border-[#EEF0F2] my-8" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="flex items-center justify-between bg-white border border-[#E5E7EB] rounded-xl px-4 py-3.5 shadow-sm">
                    <div>
                      <p className="text-[13px] font-bold text-[#111827]">Show Hero Section</p>
                      <p className="text-[12px] text-[#64748B] font-medium">Display the banner image at the top</p>
                    </div>
                    <Switch
                      checked={draft.showHero}
                      onCheckedChange={(c) => updateDraft({ showHero: c })}
                      className="scale-[0.85] data-[state=checked]:bg-[#10B981]"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[13px] font-bold text-[#111827]">Default Sort</Label>
                    <Select
                      value={draft.defaultSort}
                      onValueChange={(v) => updateDraft({ defaultSort: v as (typeof KITCHEN_SEARCH_SORT_OPTIONS)[number] })}
                    >
                      <SelectTrigger className="h-[44px] bg-white border-[#E5E7EB] shadow-sm text-[13px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {KITCHEN_SEARCH_SORT_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Preview Panel */}
        <div className="w-full mt-6">
          <div className="bg-white rounded-[24px] shadow-sm border border-[#E5E7EB] overflow-hidden">
            <div className="px-5 py-[18px] border-b border-[#F1F5F9] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white">
              <div>
                <h3 className="font-bold text-[#111827] text-[15px]">Live Preview</h3>
                <p className="text-[12px] font-medium text-[#64748B] mt-0.5">
                  How the kitchen page looks for &ldquo;{draft.keyword}&rdquo;
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[12px] font-bold text-[#64748B] hidden xl:block">Preview As</span>
                <div className="flex items-center p-1 bg-white border border-[#E5E7EB] shadow-sm rounded-[8px]">
                  {(
                    [
                      { id: "desktop", icon: Monitor, label: "Desktop" },
                      { id: "tablet", icon: Tablet, label: "Tablet" },
                      { id: "mobile", icon: Smartphone, label: "Mobile" },
                    ] as const
                  ).map((d) => (
                    <Button
                      key={d.id}
                      variant="ghost"
                      size="sm"
                      className={`h-7 px-3 rounded-md font-semibold text-[12px] ${
                        device === d.id
                          ? "bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0]"
                          : "text-[#64748B] hover:text-[#111827]"
                      }`}
                      onClick={() => setDevice(d.id)}
                    >
                      <d.icon className="h-3.5 w-3.5 sm:mr-1.5" strokeWidth={device===d.id?2:1.8} /> <span className="hidden sm:inline">{d.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-[#F8FAFC]">
              <div
                className={`bg-white rounded-[16px] border border-[#E5E7EB] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden mx-auto transition-all duration-300 ${
                  device === "mobile" ? "max-w-[360px]" : device === "tablet" ? "max-w-[600px]" : "max-w-[800px]"
                }`}
              >
                {/* Preview Hero */}
                <div className="relative h-[160px] w-full bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50">
                  {heroUrl && draft.showHero ? (
                    <Image src={heroUrl} alt="preview hero" fill sizes="300px" className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <ChefHat className="h-10 w-10 text-[#FF4B0B]/40" strokeWidth={1.5} />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button variant="secondary" size="icon" className="h-[32px] w-[32px] rounded-full bg-white/90 hover:bg-white text-[#94A3B8] hover:text-red-500 shadow-sm">
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Preview Info */}
                <div className="px-5 relative pb-6 border-b border-[#F1F5F9]">
                  <div className="absolute -top-10 left-5 h-[76px] w-[76px] rounded-full border-4 border-white overflow-hidden bg-white shadow-sm flex items-center justify-center">
                    {firstKitchen?.imageUrl ? (
                      <Image src={firstKitchen.imageUrl} alt="Avatar" fill sizes="76px" className="object-cover" />
                    ) : (
                      <ChefHat className="h-8 w-8 text-[#CBD5E1]" strokeWidth={1.5} />
                    )}
                  </div>

                  <div className="pt-12">
                    <h2 className="text-[18px] font-bold flex items-center gap-1.5 text-[#111827]">
                      {draft.searchTitle || `Best ${draft.keyword} from ${firstKitchen?.displayName ?? "Lakshmi's Kitchen"}`}
                      <Check className="h-4 w-4 text-white bg-[#3B82F6] rounded-full p-[2px]" />
                    </h2>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-[#64748B] mt-1.5 font-semibold">
                      {draft.showRatings && (
                        <span className="flex items-center text-[#111827] font-bold">
                          <Star className="h-3.5 w-3.5 mr-1 fill-[#F59E0B] text-[#F59E0B]" /> 
                          {firstKitchen?.avgRating.toFixed(1) ?? "4.5"}
                          <span className="text-[#64748B] ml-1 font-semibold underline underline-offset-2">(1.2k+ Reviews)</span>
                        </span>
                      )}
                      
                      {draft.showRatings && (draft.showDeliveryTime || draft.showDistance || draft.showPureVegBadge) && (
                        <span className="w-1 h-1 rounded-full bg-[#CBD5E1]"></span>
                      )}
                      
                      {draft.showDeliveryTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-[#64748B]" /> 25 - 30 min
                        </span>
                      )}
                      
                      {draft.showDeliveryTime && (draft.showDistance || draft.showPureVegBadge) && (
                        <span className="w-1 h-1 rounded-full bg-[#CBD5E1]"></span>
                      )}
                      
                      {draft.showDistance && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#64748B]" /> 1.5 km
                        </span>
                      )}
                      
                      {draft.showDistance && draft.showPureVegBadge && (
                        <span className="w-1 h-1 rounded-full bg-[#CBD5E1]"></span>
                      )}
                      
                      {draft.showPureVegBadge && (
                        <span className="flex items-center gap-1 text-[#087A3D] font-bold">
                          <Leaf className="h-3.5 w-3.5" /> Pure Veg
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[13px] text-[#64748B] mt-3 leading-[1.6] font-medium">
                      {draft.description || "Craving home-cooked meals? Lakshmi's Kitchen brings you authentic flavors, prepared with love and fresh ingredients."}
                    </p>

                    {/* Info badges */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {draft.showHygienicBadge && (
                        <Badge variant="outline" className="text-[#334155] border-[#E5E7EB] bg-white shadow-sm gap-1.5 py-1 px-3 font-semibold rounded-full text-[12px]">
                          <ShieldCheck className="h-3.5 w-3.5 text-[#087A3D]" /> Hygienic Kitchen
                        </Badge>
                      )}
                      {draft.showSupportLocalWomen && (
                        <Badge variant="outline" className="text-[#334155] border-[#E5E7EB] bg-white shadow-sm gap-1.5 py-1 px-3 font-semibold rounded-full text-[12px]">
                          <Heart className="h-3.5 w-3.5 text-[#E11D48] fill-[#E11D48]" /> Support Local Women
                        </Badge>
                      )}
                      {draft.showFreshIngredients && (
                        <Badge variant="outline" className="text-[#334155] border-[#E5E7EB] bg-white shadow-sm gap-1.5 py-1 px-3 font-semibold rounded-full text-[12px]">
                          <Leaf className="h-3.5 w-3.5 text-[#087A3D]" /> Fresh Ingredients
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview Tabs */}
                <div className="flex items-center gap-6 px-5 border-b border-[#F1F5F9] overflow-x-auto hide-scrollbar">
                  <div className="py-3.5 border-b-[3px] border-[#FF4B0B] text-[#FF4B0B] font-bold text-[13px] flex items-center whitespace-nowrap">
                    Menu
                  </div>
                  {draft.showKitchenStory && (
                    <div className="py-3.5 text-[#64748B] hover:text-[#111827] font-semibold text-[13px] flex items-center whitespace-nowrap cursor-pointer transition-colors">
                      About Kitchen
                    </div>
                  )}
                  {draft.showRatings && (
                    <div className="py-3.5 text-[#64748B] hover:text-[#111827] font-semibold text-[13px] flex items-center whitespace-nowrap cursor-pointer transition-colors">
                      Reviews ({firstKitchen?.totalReviews ?? 1240})
                    </div>
                  )}
                  <div className="py-3.5 text-[#64748B] hover:text-[#111827] font-semibold text-[13px] flex items-center whitespace-nowrap cursor-pointer transition-colors">
                    Kitchen Information
                  </div>
                </div>

                {/* Search Chips in Preview */}
                <div className="px-5 py-4 flex gap-2 overflow-x-auto hide-scrollbar">
                  {enabledChips.length > 0 ? enabledChips.map((chip, idx) => (
                    <Badge
                      key={chip.id ?? chip.label}
                      variant={idx === 0 ? "default" : "outline"}
                      className={`text-[12px] py-1.5 px-4 font-bold rounded-full whitespace-nowrap flex-shrink-0 cursor-pointer ${
                        idx === 0 
                          ? "bg-[#FF4B0B] text-white hover:bg-[#E63E00] border-transparent shadow-sm" 
                          : "border-[#E5E7EB] text-[#334155] hover:bg-[#F8FAFC] shadow-sm bg-white"
                      }`}
                    >
                      {chip.label}
                    </Badge>
                  )) : (
                    <>
                      <Badge variant="default" className="text-[12px] py-1.5 px-4 font-bold rounded-full bg-[#FF4B0B] text-white shadow-sm border-transparent">
                        All Biryani (6)
                      </Badge>
                      <Badge variant="outline" className="text-[12px] py-1.5 px-4 font-bold rounded-full border-[#E5E7EB] text-[#334155] bg-white shadow-sm">
                        Veg Biryani (3)
                      </Badge>
                      <Badge variant="outline" className="text-[12px] py-1.5 px-4 font-bold rounded-full border-[#E5E7EB] text-[#334155] bg-white shadow-sm">
                        Chicken Biryani (3)
                      </Badge>
                    </>
                  )}
                </div>

                {/* Preview Menu Content */}
                <div className="flex px-5 pb-6 gap-6">
                  {/* Filters Sidebar */}
                  {enabledFilters.length > 0 && (
                    <div className="w-[180px] flex-shrink-0 hidden sm:block border-r border-[#F1F5F9] pr-5">
                      <div className="flex items-center justify-between mb-5">
                        <span className="font-bold text-[14px] text-[#111827]">Filters</span>
                        <span className="text-[#FF4B0B] text-[11px] font-bold cursor-pointer">Clear All</span>
                      </div>
                      
                      <div className="space-y-6">
                        {enabledFilters.slice(0, 3).map((filter) => (
                          <div key={filter.id ?? filter.name}>
                            <div className="flex items-center justify-between mb-3 cursor-pointer">
                              <span className="font-bold text-[13px] text-[#334155]">{filter.name}</span>
                              <ChevronDown className="h-4 w-4 text-[#94A3B8]" />
                            </div>
                            <div className="space-y-3">
                              {filter.options.slice(0, 4).map((option, i) => (
                                <label key={option} className="flex items-center gap-2.5 text-[12px] font-semibold text-[#64748B] cursor-pointer">
                                  <div
                                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center ${
                                      i === 0 ? "bg-[#FF4B0B] border-[#FF4B0B]" : "bg-white border-[#CBD5E1]"
                                    }`}
                                  >
                                    {i === 0 && <Check className="h-3 w-3 text-white stroke-[3]" />}
                                  </div>
                                  {option}
                                </label>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Menu Items */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-[16px] text-[#111827]">Menu for &ldquo;{draft.keyword}&rdquo;</h3>
                      <div className="flex items-center gap-4">
                        <Search className="h-4 w-4 text-[#64748B] cursor-pointer" />
                        <div className="flex items-center gap-1.5 cursor-pointer">
                          <span className="text-[12px] font-semibold text-[#64748B]">Relevance</span>
                          <ChevronDown className="h-3.5 w-3.5 text-[#64748B]" />
                        </div>
                        <div className="h-6 w-6 bg-white border border-[#E5E7EB] rounded-[4px] flex items-center justify-center shadow-sm cursor-pointer">
                           <MoreHorizontal className="h-4 w-4 text-[#64748B]" />
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-[12px] text-[#64748B] font-semibold mb-5">Showing {Math.min(previewItems.length, 6)} of {preview?.menuItemCount ?? previewItems.length} results</p>

                    <div className={`grid gap-4 ${device === "desktop" ? "md:grid-cols-2" : "grid-cols-1"}`}>
                      {previewItems.slice(0, 6).map((item, idx) => (
                        <div key={item.id} className="flex bg-white rounded-[16px] border border-[#E5E7EB] p-3 gap-4 shadow-sm hover:shadow-md transition-shadow">
                          
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                               <div
                                 className={`h-[14px] w-[14px] rounded-[3px] border flex items-center justify-center flex-shrink-0 ${
                                   item.foodType === "VEG" ? "border-green-600 text-green-600" : "border-red-600 text-red-600"
                                 }`}
                               >
                                 <div className={`h-[8px] w-[8px] rounded-full ${item.foodType === "VEG" ? "bg-green-600" : "bg-red-600"}`} />
                               </div>
                               <h4 className="font-bold text-[14px] text-[#111827] leading-tight truncate">{item.name}</h4>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="font-bold text-[14px] text-[#111827]">₹{item.price}</span>
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <span className="flex items-center text-[#111827] text-[11px] font-bold">
                                <Star className="h-3.5 w-3.5 mr-0.5 fill-[#087A3D] text-[#087A3D]" /> 4.2
                              </span>
                              <span className="text-[#E5E7EB]">|</span>
                              <span className="text-[11px] text-[#64748B] font-semibold">45 mins</span>
                            </div>
                            
                            <p className="text-[11px] text-[#64748B] font-medium line-clamp-2 leading-[1.6]">
                              Traditional Hyderabadi biryani cooked with fragrant basmati rice, tender chicken, and secret spices...
                            </p>
                          </div>

                          <div className="h-[100px] w-[110px] relative rounded-[12px] overflow-visible flex-shrink-0 bg-slate-100 border border-[#F1F5F9]">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt={item.name} fill sizes="110px" className="object-cover rounded-[12px]" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-orange-50 rounded-[12px]">
                                <Image src="/placeholder-food.jpg" alt={item.name} fill sizes="110px" className="object-cover opacity-30 rounded-[12px]" />
                              </div>
                            )}
                            <div className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 z-10 w-[80%]">
                              <Button
                                variant="outline"
                                className="w-full h-[32px] text-[13px] border-[#E5E7EB] text-[#087A3D] hover:bg-[#F3FAF5] font-bold bg-white rounded-[8px] shadow-[0_2px_4px_rgba(0,0,0,0.05)]"
                              >
                                ADD
                              </Button>
                            </div>
                            {idx === 3 && (
                               <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 bg-[#FF4B0B] text-white hover:bg-[#FF4B0B] border-0 font-bold text-[8px] px-1.5 py-0 rounded-[4px] h-[16px] whitespace-nowrap shadow-sm">
                                 Bestseller
                               </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      className="w-full mt-8 text-[#111827] border-[#E5E7EB] font-bold hover:bg-[#F8FAFC] h-10 text-[13px] bg-white shadow-sm rounded-xl"
                    >
                      VIEW FULL MENU
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===================================================================
   ADD VALUE INPUT
=================================================================== */

function AddValueInput({ onAdd }: { onAdd: (value: string) => void }) {
  const [value, setValue] = useState("");
  const submit = () => {
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
  };
  return (
    <div className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            submit();
          }
        }}
        placeholder="Add a filter value and press Enter"
        className="h-8 bg-white border-slate-200 shadow-sm text-xs flex-1"
      />
      <Button
        variant="outline"
        size="sm"
        className="h-8 px-3 text-[#ff5a1f] border-[#ff5a1f]/30 hover:bg-[#ff5a1f]/10 font-bold bg-white shadow-sm"
        onClick={submit}
      >
        <Plus className="h-3.5 w-3.5 mr-1 stroke-[3]" /> Add
      </Button>
    </div>
  );
}


/* ===================================================================
   KITCHEN LIST PAGE
=================================================================== */

interface KitchenListProps {
  keyword: string;
  onCancel: () => void;
  onEditKitchen: (kitchenId: string) => void;
}

function KitchenList({ keyword, onCancel, onEditKitchen }: KitchenListProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-kitchen-preview", keyword],
    queryFn: () => getKitchenSearchPreview(keyword),
    enabled: !!keyword,
  });

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-300 font-sans">
      <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
        <Button variant="outline" size="icon" onClick={onCancel} className="h-9 w-9 md:h-10 md:w-10 border-slate-200 shrink-0">
          <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-slate-700" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 truncate">Select a Kitchen for &ldquo;{keyword}&rdquo;</h1>
          <p className="text-slate-500 text-xs md:text-sm">Choose a kitchen to edit its search page configuration.</p>
        </div>
      </div>
      
      <Card className="border-slate-200 shadow-sm overflow-hidden rounded-xl bg-white flex flex-col max-h-[calc(100vh-140px)]">
        <ScrollArea className="flex-1 w-full" type="auto">
          <Table>
            <TableHeader className="sticky top-0 bg-slate-50/95 backdrop-blur z-10">
              <TableRow>
                <TableHead className="font-semibold text-slate-600">Kitchen</TableHead>
                <TableHead className="font-semibold text-slate-600 hidden md:table-cell">Tags</TableHead>
                <TableHead className="font-semibold text-slate-600">Rating</TableHead>
                <TableHead className="text-right font-semibold text-slate-600">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-lg shrink-0" /><Skeleton className="h-4 w-24 md:h-5 md:w-32" /></div></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-12 md:h-5 md:w-16" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-8 w-16 md:w-20 inline-block" /></TableCell>
                  </TableRow>
                ))
              ) : !data || data.kitchens.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-slate-500 text-sm">
                    No kitchens found for this keyword.
                  </TableCell>
                </TableRow>
              ) : (
                data.kitchens.map((k) => (
                  <TableRow key={k.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-2 md:gap-3">
                        <div className="relative h-10 w-10 md:h-12 md:w-12 rounded-lg overflow-hidden border border-slate-100 flex-shrink-0 bg-slate-100">
                          {k.imageUrl ? (
                            <Image src={k.imageUrl} alt={k.displayName} fill sizes="48px" className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ChefHat className="h-4 w-4 md:h-5 md:w-5 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[#111827] text-sm md:text-base truncate">{k.displayName}</span>
                          <span className="text-[11px] md:text-[12px] text-slate-500 md:hidden truncate">{k.cuisineTags.slice(0, 2).join(", ")}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {k.cuisineTags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-[10px] md:text-[11px] font-normal">{tag}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 md:gap-1.5 font-semibold text-slate-700 text-sm md:text-base">
                        <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-amber-400 text-amber-400 shrink-0" />
                        {k.avgRating}
                        <span className="text-slate-400 text-[10px] md:text-xs font-normal">({k.totalReviews})</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => onEditKitchen(k.id)}
                        className="border-[#E5E7EB] text-[#334155] hover:bg-slate-50 shadow-sm whitespace-nowrap h-8 text-xs md:h-9 md:text-sm px-2 md:px-3"
                      >
                        <SquarePen className="h-3.5 w-3.5 md:h-4 md:w-4 mr-1.5 md:mr-2" /> Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>
    </div>
  );
}

/* ===================================================================
   DASHBOARD (LIST)
=================================================================== */

export default function KitchenSearchPagesManagement() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedKeywordId, setSelectedKeywordId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminKitchenSearchRow | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addKeyword, setAddKeyword] = useState("");

  const {
    data: contents = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-kitchen-search-page"],
    queryFn: getKitchenSearchPageContents,
    refetchInterval: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: ({ keyword }: { keyword: string }) => createKitchenSearchPageContent({ keyword }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to create configuration");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["admin-kitchen-search-page"] });
      toast.success("Search configuration created");
      setAddDialogOpen(false);
      setAddKeyword("");
      if (res.id) setEditingId(res.id);
    },
    onError: () => toast.error("Failed to create configuration"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteKitchenSearchPageContent(id),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to delete");
        setDeleteTarget(null);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["admin-kitchen-search-page"] });
      toast.success("Search configuration deleted");
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete");
      setDeleteTarget(null);
    },
  });

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    contents.forEach((c) => {
      const firstWord = c.keyword.trim().split(/\s+/)[0];
      if (firstWord) set.add(firstWord.toLowerCase());
    });
    return Array.from(set);
  }, [contents]);

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return contents.filter((c) => {
      const matchesSearch = !term || c.keyword.toLowerCase().includes(term);
      const matchesCategory =
        categoryFilter === "all" ||
        c.keyword.trim().toLowerCase().startsWith(categoryFilter);
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Published" && c.isActive) ||
        (statusFilter === "Draft" && !c.isActive);
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [contents, searchTerm, categoryFilter, statusFilter]);

  const stats = useMemo(() => {
    const total = contents.length;
    const published = contents.filter((c) => c.isActive).length;
    const topItems = contents.filter((c) => /biryani|dosa/.test(c.keyword.toLowerCase())).length;
    const categories = new Set(
      contents.map((c) => c.keyword.trim().split(/\s+/)[0].toLowerCase()).filter(Boolean)
    ).size;
    const lastUpdated = contents.reduce((max, c) => (c.updatedAt > max ? c.updatedAt : max), "");
    return { total, published, draftCount: total - published, topItems, categories, lastUpdated };
  }, [contents]);

  const hasActiveFilters = searchTerm.trim() !== "" || categoryFilter !== "all" || statusFilter !== "All";

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All");
    setCategoryFilter("all");
  };

  const columnHelper = createColumnHelper<AdminKitchenSearchRow>();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "index",
        header: "#",
        cell: (info) => (
          <span className="text-slate-500 font-medium text-[13px]">
            {info.row.index + 1}
          </span>
        ),
      }),
      columnHelper.accessor("keyword", {
        header: "Item Name",
        cell: (info) => {
          const keyword = info.getValue();
          // Mock image logic based on keyword for visual match
          const getMockImage = (k: string) => {
            const kl = k.toLowerCase();
            if (kl.includes("biryani")) return "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=200&h=150&fit=crop";
            if (kl.includes("dosa")) return "https://images.unsplash.com/photo-1668236543090-82eba5ee5976?w=200&h=150&fit=crop";
            if (kl.includes("idli")) return "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=200&h=150&fit=crop";
            if (kl.includes("parotta")) return "https://images.unsplash.com/photo-1625398407796-a29b205bce20?w=200&h=150&fit=crop";
            if (kl.includes("meal")) return "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=200&h=150&fit=crop";
            if (kl.includes("chicken")) return "https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=200&h=150&fit=crop";
            if (kl.includes("pongal")) return "https://images.unsplash.com/photo-1651840403316-25805e94bbfb?w=200&h=150&fit=crop";
            return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&h=150&fit=crop"; // generic
          };
          
          const isTopItem = ["biryani", "dosa"].some(k => keyword.toLowerCase().includes(k));

          return (
            <div className="flex items-center gap-4">
              <div className="relative h-[44px] w-[68px] rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                <Image src={getMockImage(keyword)} alt={keyword} fill sizes="68px" className="object-cover" />
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#111827] capitalize text-[14px]">{keyword}</span>
                {isTopItem && (
                  <Badge variant="outline" className="bg-[#EAF7EF] text-[#087A3D] border-0 rounded-full px-2.5 py-0.5 text-[12px] font-semibold h-6 flex items-center justify-center">
                    Top Item
                  </Badge>
                )}
              </div>
            </div>
          );
        },
      }),
      columnHelper.accessor("keyword", {
        id: "category",
        header: "Category",
        cell: (info) => {
          const keyword = info.getValue();
          const categoryName = keyword.split(' ')[0] || keyword;
          
          // Icon selection logic
          const getIcon = () => {
            const kl = keyword.toLowerCase();
            if (kl.includes("meal")) return <ShoppingBag className="h-4 w-4" strokeWidth={1.8} />;
            if (kl.includes("chicken") || kl.includes("starter")) return <UtensilsCrossed className="h-4 w-4" strokeWidth={1.8} />;
            if (kl.includes("dosa") || kl.includes("parotta")) return <SquarePen className="h-4 w-4" strokeWidth={1.8} />;
            return <ChefHat className="h-4 w-4" strokeWidth={1.8} />;
          };

          return (
            <div className="flex items-center gap-2 text-[#475569] text-[14px]">
              <div className="text-[#FF4B0B] flex items-center justify-center">
                {getIcon()}
              </div>
              <span className="capitalize">{categoryName}</span>
            </div>
          );
        },
      }),
      columnHelper.accessor("updatedAt", {
        header: "Last Edited",
        cell: (info) => {
          const dateStr = info.getValue();
          const date = new Date(dateStr);
          return (
            <div className="flex flex-col gap-0.5">
              <span className="text-[#111827] font-semibold text-[13px]">{formatRelativeTime(dateStr).replace('about ', '')}</span>
              <span className="text-[#64748B] text-[12px]">
                {date.toLocaleString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true
                })}
              </span>
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: () => <div className="text-right">Actions</div>,
        cell: (info) => {
          const row = info.row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedKeywordId(row.id)}
                className="h-[36px] w-[36px] border-[#E5E7EB] rounded-lg bg-white text-[#334155] hover:bg-slate-50 shadow-sm"
              >
                <SquarePen className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setDeleteTarget(row)}
                className="h-[36px] w-[36px] border-[#E5E7EB] rounded-lg bg-white text-[#334155] hover:bg-slate-50 shadow-sm"
              >
                <MoreVertical className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </Button>
            </div>
          );
        },
      }),
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: {
        pageSize: 8,
      },
    },
  });

  const onSubmitAdd = () => {
    const validation = validateKitchenSearchCreate({ keyword: addKeyword });
    if (!validation.success) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }
    createMutation.mutate({ keyword: addKeyword.trim() });
  };

  const onExport = () => {
    const header = ["Search Keyword", "Kitchens", "Menu Items", "Status", "Updated At"];
    const rows = contents.map((c) => [
      c.keyword,
      c.kitchensCount,
      c.menuItemsCount,
      c.isActive ? "Published" : "Draft",
      c.updatedAt,
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "kitchen-search-configurations.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  if (editingId) {
    return (
      <Editor contentId={selectedKeywordId || editingId} onCancel={() => setEditingId(null)} />
    );
  }

  if (selectedKeywordId) {
    const selectedKeyword = contents.find(c => c.id === selectedKeywordId)?.keyword || "";
    return (
      <KitchenList
        keyword={selectedKeyword}
        onCancel={() => setSelectedKeywordId(null)}
        onEditKitchen={(kitchenId) => {
          setEditingId(kitchenId);
        }}
      />
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#FEFEFE] p-6 md:p-8 max-w-[1440px] mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400" />
          <p className="text-red-500 font-semibold">Failed to load search configurations</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RotateCcw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFEFE] p-6 md:p-8 max-w-[1440px] mx-auto animate-in fade-in duration-300 font-sans pb-24">
      {/* Outer Shell Wrapper (White with large border radius and subtle shadow) */}
      <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[24px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
        
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-[#EEF0F2] bg-[#FFFFFF]">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="text-[#FF4B0B] stroke-[1.8px]">
                <ChefHat className="h-8 w-8" strokeWidth={1.8} />
              </div>
              <div>
                <h1 className="text-[24px] font-bold text-[#111827]">
                  Kitchen Detail Page Management
                </h1>
                <p className="text-[14px] text-[#64748B] mt-1">
                  Manage search related items that appear in search suggestions and kitchen detail pages.
                </p>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2 w-full lg:w-auto">
              <div className="flex w-full lg:w-auto items-center gap-3">
                <Button
                  variant="outline"
                  className="w-full lg:w-auto bg-[#FFFFFF] border-[#9BD0AE] text-[#087A3D] hover:bg-[#EAF7EF] rounded-[8px] h-[40px] px-4 font-semibold text-[14px]"
                  onClick={() => window.open("/search", "_blank")}
                >
                  View Live Site <ExternalLink className="h-4 w-4 ml-2" strokeWidth={1.8} />
                </Button>
                <Button
                  className="w-full lg:w-auto bg-[#FF4B0B] hover:bg-[#E94106] text-[#FFFFFF] rounded-[10px] h-[44px] px-[18px] font-semibold text-[14px] shadow-[0_2px_5px_rgba(255,75,11,0.12)]"
                  onClick={() => setAddDialogOpen(true)}
                >
                  <Plus className="h-[18px] w-[18px] mr-2" strokeWidth={2} /> Add New Search Item
                </Button>
              </div>
              <p className="text-[#64748B] text-[12px] pr-1">
                Last updated: {stats.lastUpdated ? formatRelativeTime(stats.lastUpdated).replace("about ", "") : "No activity yet"}
              </p>
            </div>
          </div>
        </div>

        {/* Main Content inside Shell */}
        <div className="p-8">
          
          {/* Controls Row */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
              {/* Search Input */}
              <div className="relative w-full md:w-[420px]">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-[18px] w-[18px] text-[#475569]" strokeWidth={1.8} />
                <Input
                  placeholder="Search items by name (e.g., biryani, dosa...)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-[38px] bg-[#FFFFFF] border-[#E2E8F0] rounded-[8px] h-[44px] text-[#1E293B] placeholder:text-[#94A3B8] focus-visible:ring-0 focus-visible:border-[#FF4B0B] focus-visible:shadow-[0_0_0_3px_rgba(255,75,11,0.10)]"
                />
              </div>
              
              {/* Categories Dropdown */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-[#FFFFFF] border-[#E2E8F0] rounded-[8px] h-[44px] text-[#1E293B] font-medium">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categoryOptions.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {/* Filter Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full md:w-auto bg-[#FFFFFF] border-[#E2E8F0] rounded-[8px] h-[44px] px-5 font-medium shadow-none hover:bg-slate-50 ${
                      hasActiveFilters ? "border-[#FF4B0B] text-[#FF4B0B]" : "text-[#1E293B]"
                    }`}
                  >
                    <Filter className="h-[17px] w-[17px] mr-2 text-[#334155]" strokeWidth={1.8} />
                    {statusFilter === "All" ? "Filter" : statusFilter}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-[12px] font-semibold text-[#64748B]">Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setStatusFilter("All")}>All</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Published")}>Published</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("Draft")}>Draft</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={resetFilters} className="text-[#FF4B0B] font-semibold">
                    Reset all filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {/* Export Button */}
            <Button 
              variant="outline" 
              className="w-full lg:w-auto bg-[#FFFFFF] border-[#E5E7EB] text-[#1E293B] rounded-[8px] h-[44px] px-5 font-medium shadow-none hover:bg-slate-50" 
              onClick={onExport}
            >
              <Download className="h-[17px] w-[17px] mr-2 text-[#087A3D]" strokeWidth={1.8} /> Export
            </Button>
          </div>

          {/* Table Container */}
          <div className="bg-[#FFFFFF] border border-[#E5E7EB] rounded-[10px] overflow-hidden">
            <ScrollArea className="w-full">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-b-[#EEF0F2] bg-[#FAFCFB] hover:bg-[#FAFCFB]">
                      {headerGroup.headers.map((header) => (
                        <TableHead 
                          key={header.id} 
                          className="text-[#1E293B] font-semibold text-[13px] h-[52px] first:pl-6 last:pr-6"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows?.length ? (
                    table.getRowModel().rows.map((row) => (
                      <React.Fragment key={row.id}>
                        <TableRow
                          data-state={row.getIsSelected() && "selected"}
                          className="border-b-[#EEF0F2] hover:bg-[#FAFCFB] transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell 
                              key={cell.id}
                              className="py-[16px] first:pl-6 last:pr-6 align-middle"
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      </React.Fragment>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Search className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
                          <p className="text-slate-500 font-medium text-sm">
                            {contents.length === 0
                              ? "No search items found."
                              : "No items match your search."}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            
            {/* Pagination Row */}
            <div className="p-4 border-t border-[#EEF0F2] bg-[#FFFFFF] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[14px] text-[#64748B]">
                Showing {table.getRowModel().rows.length > 0 ? table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1 : 0} to{" "}
                {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of{" "}
                {table.getFilteredRowModel().rows.length} items
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-[32px] w-[32px] border-[#E5E7EB] bg-[#FFFFFF] text-[#1E293B] hover:bg-slate-50 rounded-[7px] shadow-none p-0"
                  onClick={() => table.previousPage()}
                  disabled={!table.getCanPreviousPage()}
                >
                  <ChevronLeft className="h-[16px] w-[16px] text-[#64748B]" />
                </Button>
                
                {Array.from({ length: Math.min(table.getPageCount(), 5) }).map((_, i) => {
                  const page = i;
                  const isActive = table.getState().pagination.pageIndex === page;
                  return (
                    <Button
                      key={page}
                      variant="outline"
                      className={`h-[32px] w-[32px] rounded-[7px] shadow-none p-0 text-[14px] ${
                        isActive 
                          ? "border-[#FF4B0B] bg-[#FF4B0B] text-[#FFFFFF] font-semibold" 
                          : "border-[#E5E7EB] bg-[#FFFFFF] text-[#1E293B] hover:bg-slate-50 font-medium"
                      }`}
                      onClick={() => table.setPageIndex(page)}
                    >
                      {page + 1}
                    </Button>
                  );
                })}

                {table.getPageCount() > 5 && (
                  <div className="flex items-center justify-center h-[32px] w-[32px] text-[#64748B]">
                    ...
                  </div>
                )}
                {table.getPageCount() > 5 && (
                  <Button
                    variant="outline"
                    className={`h-[32px] w-[32px] rounded-[7px] shadow-none p-0 text-[14px] ${
                      table.getState().pagination.pageIndex === table.getPageCount() - 1 
                        ? "border-[#FF4B0B] bg-[#FF4B0B] text-[#FFFFFF] font-semibold" 
                        : "border-[#E5E7EB] bg-[#FFFFFF] text-[#1E293B] hover:bg-slate-50 font-medium"
                    }`}
                    onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                  >
                    {table.getPageCount()}
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="icon"
                  className="h-[32px] w-[32px] border-[#E5E7EB] bg-[#FFFFFF] text-[#1E293B] hover:bg-slate-50 rounded-[7px] shadow-none p-0"
                  onClick={() => table.nextPage()}
                  disabled={!table.getCanNextPage()}
                >
                  <ChevronRight className="h-[16px] w-[16px] text-[#64748B]" />
                </Button>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-5 mt-8">
            {/* Total Items */}
            <div className="flex items-center gap-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div className="h-[48px] w-[48px] rounded-[12px] bg-[#EAF7EF] flex items-center justify-center flex-shrink-0">
                <ListOrdered className="h-[22px] w-[22px] text-[#087A3D]" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-[#64748B] mb-0.5">Total Items</p>
                <h4 className="text-[18px] font-bold text-[#111827] leading-none mb-1">{stats.total}</h4>
                <p className="text-[11px] text-[#94A3B8] truncate">All search items</p>
              </div>
            </div>
            
            {/* Published Items */}
            <div className="flex items-center gap-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div className="h-[48px] w-[48px] rounded-[12px] bg-[#EEF4FF] flex items-center justify-center flex-shrink-0">
                <Save className="h-[22px] w-[22px] text-[#2563EB]" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-[#64748B] mb-0.5">Published Items</p>
                <h4 className="text-[18px] font-bold text-[#111827] leading-none mb-1">{stats.published}</h4>
                <p className="text-[11px] text-[#94A3B8] truncate">Currently live</p>
              </div>
            </div>

            {/* Draft Items */}
            <div className="flex items-center gap-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div className="h-[48px] w-[48px] rounded-[12px] bg-[#FFF7E8] flex items-center justify-center flex-shrink-0">
                <SquarePen className="h-[22px] w-[22px] text-[#F59E0B]" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-[#64748B] mb-0.5">Draft Items</p>
                <h4 className="text-[18px] font-bold text-[#111827] leading-none mb-1">{stats.draftCount}</h4>
                <p className="text-[11px] text-[#94A3B8] truncate">Need publishing</p>
              </div>
            </div>

            {/* Top Items */}
            <div className="flex items-center gap-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div className="h-[48px] w-[48px] rounded-[12px] bg-[#F5EDFF] flex items-center justify-center flex-shrink-0">
                <Star className="h-[22px] w-[22px] text-[#9333EA]" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-[#64748B] mb-0.5">Top Items</p>
                <h4 className="text-[18px] font-bold text-[#111827] leading-none mb-1">{stats.topItems}</h4>
                <p className="text-[11px] text-[#94A3B8] truncate">High priority items</p>
              </div>
            </div>

            {/* Categories */}
            <div className="flex items-center gap-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div className="h-[48px] w-[48px] rounded-[12px] bg-[#EAF9FC] flex items-center justify-center flex-shrink-0">
                <Tag className="h-[22px] w-[22px] text-[#0891B2]" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-[#64748B] mb-0.5">Categories</p>
                <h4 className="text-[18px] font-bold text-[#111827] leading-none mb-1">{stats.categories}</h4>
                <p className="text-[11px] text-[#94A3B8] truncate">Used categories</p>
              </div>
            </div>

            {/* Last Updated */}
            <div className="flex items-center gap-4 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] p-[16px] shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div className="h-[48px] w-[48px] rounded-[12px] bg-[#FFF0F2] flex items-center justify-center flex-shrink-0">
                <Clock className="h-[22px] w-[22px] text-[#EF233C]" strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <p className="text-[12px] font-medium text-[#64748B] mb-0.5">Last Updated</p>
                <h4 className="text-[18px] font-bold text-[#111827] leading-none mb-1">
                  {stats.lastUpdated ? formatRelativeTime(stats.lastUpdated).replace("about ", "") : "—"}
                </h4>
                <p className="text-[11px] text-[#94A3B8] truncate">Recent activity</p>
              </div>
            </div>
          </div>

          {/* Pro Tip Section */}
          <div className="mt-8 bg-[#FFFAF2] border border-[#FFD6B8] rounded-[12px] p-[20px] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="h-[48px] w-[48px] rounded-[12px] bg-[#FFF2D9] flex items-center justify-center flex-shrink-0 mt-1 md:mt-0">
                <Lightbulb className="h-[24px] w-[24px] text-[#F59E0B]" strokeWidth={1.8} />
              </div>
              <div>
                <h4 className="text-[#7C2D12] font-bold text-[16px] mb-1">Pro Tip</h4>
                <p className="text-[#475569] text-[14px]">
                  Mark important items as &quot;Top Item&quot; to highlight them in search suggestions and improve visibility on kitchen detail pages.
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full md:w-auto flex-shrink-0 h-[40px] px-5 rounded-[8px] border-[#FFB49A] text-[#FF4B0B] bg-[#FFFFFF] hover:bg-[#FFF3ED] font-semibold text-[14px]"
              onClick={() => window.open("/search", "_blank")}
            >
              Learn More <ExternalLink className="h-4 w-4 ml-2" strokeWidth={2} />
            </Button>
          </div>

        </div>
      </div>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#ff5a1f]" /> New Search Configuration
            </DialogTitle>
            <DialogDescription>
              Create a search experience for a keyword. E.g. &ldquo;biryani&rdquo;, &ldquo;dosa&rdquo;, &ldquo;meals&rdquo;, &ldquo;juice&rdquo;.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="keyword" className="text-sm font-bold text-slate-900">Search Keyword</Label>
            <Input
              id="keyword"
              value={addKeyword}
              onChange={(e) => setAddKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSubmitAdd();
              }}
              placeholder="e.g. biryani"
              className="bg-white border-slate-200 shadow-sm h-10"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" className="bg-white border-slate-200 text-slate-700" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#ff5a1f] hover:bg-[#e04918] text-white"
              disabled={createMutation.isPending}
              onClick={onSubmitAdd}
            >
              {createMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Plus className="h-4 w-4 mr-2" />}
              Create Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" /> Delete configuration?
            </AlertDialogTitle>
            <AlertDialogDescription>
              The &ldquo;{deleteTarget?.keyword}&rdquo; search configuration will be permanently deleted. Kitchens and menu items
              are never modified — only this search experience.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
            >
              {deleteMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

