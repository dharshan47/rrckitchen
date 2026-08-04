"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  Plus,
  ExternalLink,
  Filter,
  Download,
  Edit,
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
  Eye,
  Layers,
  Tag,
  ListOrdered,
  Sparkles,
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

import {
  getKitchenSearchPageContents,
  getKitchenSearchPageContent,
  getKitchenSearchPreview,
  createKitchenSearchPageContent,
  saveKitchenSearchPageContent,
  deleteKitchenSearchPageContent,
  toggleKitchenSearchPageContent,
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
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-6">
        <div className="xl:col-span-7 space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
        <div className="xl:col-span-5">
          <Skeleton className="h-[600px] w-full rounded-2xl" />
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
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 font-sans pb-20">
      {/* Editor Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-[#ff5a1f] rounded-xl border border-orange-100/50 hidden sm:block">
            <ChefHat className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1 flex items-center gap-2">
              Search Experience Editor
              <Badge className="bg-[#ff5a1f]/10 text-[#ff5a1f] border-[#ff5a1f]/20 capitalize text-xs font-bold">
                &ldquo;{draft.keyword}&rdquo;
              </Badge>
            </h1>
            <p className="text-sm text-slate-500">
              How kitchen detail pages look when customers click <strong className="text-slate-700">View Menu</strong> after searching{" "}
              <strong className="text-slate-700">&ldquo;{draft.keyword}&rdquo;</strong>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <Button variant="ghost" size="icon" onClick={onCancel} className="h-10 w-10 text-slate-500 hover:bg-slate-200">
            <X className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="h-10 bg-white border-slate-200 text-slate-700 font-semibold shadow-sm flex-1 md:flex-none"
            onClick={() => window.open(`/search?q=${encodeURIComponent(draft.keyword)}`, "_blank")}
          >
            View Live Site <ExternalLink className="h-4 w-4 ml-2" />
          </Button>
          <Button
            className="h-10 bg-green-600 hover:bg-green-700 text-white font-semibold shadow-sm flex-1 md:flex-none"
            disabled={saveMutation.isPending}
            onClick={handleSave}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {dirty ? "Save All Changes" : "Saved"}
          </Button>
        </div>
      </div>

      {dirty && (
        <div className="mb-5 flex items-center gap-2 text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit">
          <AlertTriangle className="h-4 w-4" />
          You have unsaved changes. Click Save All Changes to publish.
        </div>
      )}

      {/* Editor Subheader */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 py-4 mb-2 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Status</span>
            {draft.isActive ? (
              <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 gap-1.5 px-2.5 py-1 font-bold shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Published
              </Badge>
            ) : (
              <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 gap-1.5 px-2.5 py-1 font-bold shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Draft
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wide">Live</span>
            <Switch
              checked={draft.isActive}
              onCheckedChange={(checked) => updateDraft({ isActive: checked })}
              className="data-[state=checked]:bg-green-500"
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <Layers className="h-4 w-4 text-slate-400" /> v{draft.version}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold">
            <Clock className="h-4 w-4 text-slate-400" /> Updated {formatRelativeTime(draft.updatedAt)}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wide hidden sm:block">Preview As</span>
          <div className="flex items-center p-1 bg-white border border-slate-200 shadow-sm rounded-lg">
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
                className={`h-7 px-3 rounded-md font-semibold ${
                  device === d.id
                    ? "bg-green-50 text-green-700 border border-green-100"
                    : "text-slate-500 hover:text-slate-900"
                }`}
                onClick={() => setDevice(d.id)}
              >
                <d.icon className="h-4 w-4 sm:mr-2" /> <span className="hidden sm:inline">{d.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mt-6">
        {/* Left Panel */}
        <div className="xl:col-span-7 space-y-6">
          <Tabs defaultValue="page-settings" className="w-full">
            <TabsList className="bg-transparent border-b border-slate-200 rounded-none w-full justify-start h-auto p-0 space-x-8 overflow-x-auto hide-scrollbar">
              <TabsTrigger value="page-settings" className="data-[state=active]:border-b-2 data-[state=active]:border-[#ff5a1f] data-[state=active]:text-[#ff5a1f] data-[state=active]:shadow-none rounded-none px-1 py-3 bg-transparent font-bold text-slate-500 data-[state=active]:bg-transparent">
                Page Settings
              </TabsTrigger>
              <TabsTrigger value="chips-filters" className="data-[state=active]:border-b-2 data-[state=active]:border-[#ff5a1f] data-[state=active]:text-[#ff5a1f] data-[state=active]:shadow-none rounded-none px-1 py-3 bg-transparent font-bold text-slate-500 data-[state=active]:bg-transparent">
                Chips & Filters
              </TabsTrigger>
              <TabsTrigger value="menu" className="data-[state=active]:border-b-2 data-[state=active]:border-[#ff5a1f] data-[state=active]:text-[#ff5a1f] data-[state=active]:shadow-none rounded-none px-1 py-3 bg-transparent font-bold text-slate-500 data-[state=active]:bg-transparent">
                Menu Display
              </TabsTrigger>
              <TabsTrigger value="info" className="data-[state=active]:border-b-2 data-[state=active]:border-[#ff5a1f] data-[state=active]:text-[#ff5a1f] data-[state=active]:shadow-none rounded-none px-1 py-3 bg-transparent font-bold text-slate-500 data-[state=active]:bg-transparent">
                Kitchen Info
              </TabsTrigger>
            </TabsList>

            {/* ----------------------- PAGE SETTINGS ----------------------- */}
            <TabsContent value="page-settings" className="pt-8 space-y-10">
              {/* 1. Hero Banners */}
              <div>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 text-sm">1. Hero Banner</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      A search-specific banner instead of the kitchen banner
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-600">Show Hero</span>
                    <Switch
                      checked={draft.showHero}
                      onCheckedChange={(checked) => updateDraft({ showHero: checked })}
                      className="scale-[0.8] data-[state=checked]:bg-green-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {(
                    [
                      { key: "desktopBannerUrl" as const, res: "1200x400px" },
                      { key: "mobileBannerUrl" as const, res: "768x400px" },
                    ]
                  ).map((h) => {
                    const value = draft[h.key];
                    return (
                      <div key={h.key} className="space-y-3 p-3 border border-slate-100 bg-white rounded-xl shadow-sm">
                        <div className="relative h-28 bg-slate-100 rounded-lg overflow-hidden group border border-slate-200">
                          {value ? (
                            <Image src={value} alt={`${h.key} hero`} fill className="object-cover" />
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-slate-400">
                              <ChefHat className="h-8 w-8" strokeWidth={1.5} />
                              <span className="text-[10px] font-semibold">No banner set</span>
                            </div>
                          )}
                          {value && (
                            <Badge
                              className="absolute top-2 right-2 bg-white text-slate-700 hover:bg-slate-50 text-[10px] border border-slate-200 shadow-sm font-semibold px-2 py-0.5 cursor-pointer"
                              onClick={() => updateDraft({ [h.key]: "" })}
                            >
                              <X className="h-3 w-3 mr-1" /> Remove
                            </Badge>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold text-center">
                          Recommended: {h.res}
                        </p>
                        <CloudinaryUpload
                          onUpload={({ secure_url }) => updateDraft({ [h.key]: secure_url })}
                        >
                          {({ uploading, startUpload }) => (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full text-green-700 border-green-200 bg-green-50/50 hover:bg-green-100 font-bold h-8"
                              onClick={startUpload}
                              disabled={uploading}
                            >
                              {uploading ? (
                                <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                              ) : (
                                <ImageIcon className="h-3.5 w-3.5 mr-2" />
                              )}
                              {value ? "Change Image" : "Upload Image"}
                            </Button>
                          )}
                        </CloudinaryUpload>
                      </div>
                    );
                  })}
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* 2. Search Title */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="search-title" className="text-sm font-bold text-slate-900">
                    2. Search Title
                  </Label>
                  <p className="text-xs text-slate-500 font-medium">
                    Shown instead of the kitchen name, e.g.{" "}
                    <span className="text-[#ff5a1f] font-semibold">&ldquo;Best Biryani from Lakshmi Kitchen&rdquo;</span>
                  </p>
                  <Input
                    id="search-title"
                    value={draft.searchTitle}
                    onChange={(e) => updateDraft({ searchTitle: e.target.value })}
                    placeholder={`Best ${draft.keyword} near you`}
                    className="bg-white border-slate-200 shadow-sm h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="badge-text" className="text-sm font-bold text-slate-900">
                    Badge Text
                  </Label>
                  <p className="text-xs text-slate-500 font-medium">Small badge near the title, e.g. &ldquo;68+ Kitchens&rdquo;</p>
                  <Input
                    id="badge-text"
                    value={draft.badgeText}
                    onChange={(e) => updateDraft({ badgeText: e.target.value })}
                    placeholder={`${draft.kitchensCount}+ Kitchens`}
                    className="bg-white border-slate-200 shadow-sm h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-bold text-slate-900">
                  3. Description
                </Label>
                <p className="text-xs text-slate-500 font-medium">Short intro shown under the kitchen header</p>
                <Textarea
                  id="description"
                  value={draft.description}
                  onChange={(e) => updateDraft({ description: e.target.value })}
                  placeholder={`Explore the best ${draft.keyword} from verified home kitchens near you.`}
                  rows={3}
                  className="bg-white border-slate-200 shadow-sm resize-none"
                />
              </div>

              <hr className="border-slate-200" />

              {/* 4. Default Sorting */}
              <div className="space-y-2 max-w-md">
                <Label htmlFor="default-sort" className="text-sm font-bold text-slate-900">
                  4. Default Sorting
                </Label>
                <p className="text-xs text-slate-500 font-medium">
                  How menu items are ordered when the customer opens the page
                </p>
                <Select
                  value={draft.defaultSort}
                  onValueChange={(value) =>
                    updateDraft({ defaultSort: value as (typeof KITCHEN_SEARCH_SORT_OPTIONS)[number] })
                  }
                >
                  <SelectTrigger id="default-sort" className="bg-white border-slate-200 shadow-sm h-10 font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {KITCHEN_SEARCH_SORT_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            {/* ----------------------- CHIPS & FILTERS ----------------------- */}
            <TabsContent value="chips-filters" className="pt-8 space-y-10">
              {/* Search Chips */}
              <div>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">1. Search Chips <span className="text-slate-500 font-medium">(Quick Filters)</span></h3>
                    <p className="text-xs text-slate-500 font-medium">Pills shown below the search title. Clicking a chip filters the menu.</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-[#ff5a1f] border-[#ff5a1f]/30 hover:bg-[#ff5a1f]/10 font-bold h-8 px-4 bg-white shadow-sm" onClick={addChip}>
                    <Plus className="h-4 w-4 mr-1.5 stroke-[3]" /> Add Chip
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {draft.chips.map((chip, index) => (
                    <div key={chip.id ?? index} className="flex items-center gap-2.5 py-2 px-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <GripVertical className="h-4 w-4 text-slate-400 cursor-grab opacity-70 flex-shrink-0" />
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => moveChip(index, -1)}>
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => moveChip(index, 1)}>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Input
                        value={chip.label}
                        onChange={(e) => updateChip(index, { label: e.target.value })}
                        className="h-9 bg-white border-slate-200 shadow-sm font-semibold text-sm flex-1 min-w-0"
                      />
                      <Switch
                        checked={chip.isEnabled}
                        onCheckedChange={(checked) => updateChip(index, { isEnabled: checked })}
                        className="scale-[0.7] origin-right data-[state=checked]:bg-green-500 shadow-sm flex-shrink-0"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0" onClick={() => removeChip(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  {draft.chips.length === 0 && (
                    <p className="text-xs text-slate-400 font-semibold text-center py-6 border border-dashed border-slate-200 rounded-xl bg-white/50">
                      No chips yet. Add chips customers can tap to filter the menu.
                    </p>
                  )}
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Filters */}
              <div>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">2. Filters <span className="text-slate-500 font-medium">(Sidebar)</span></h3>
                    <p className="text-xs text-slate-500 font-medium">Enable / disable and manage filter groups shown on the kitchen page</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-[#ff5a1f] border-[#ff5a1f]/30 hover:bg-[#ff5a1f]/10 font-bold h-8 px-4 bg-white shadow-sm" onClick={addFilter}>
                    <Plus className="h-4 w-4 mr-1.5 stroke-[3]" /> Add Filter
                  </Button>
                </div>

                <div className="space-y-4">
                  {draft.filters.map((filter, index) => (
                    <div key={filter.id ?? index} className="border border-slate-100 bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="flex items-center gap-2.5 p-3 border-b border-slate-50 bg-slate-50/40">
                        <GripVertical className="h-4 w-4 text-slate-400 cursor-grab opacity-70 flex-shrink-0" />
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => moveFilter(index, -1)}>
                          <ChevronUp className="h-4 w-4 text-slate-400" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => moveFilter(index, 1)}>
                          <ChevronDown className="h-4 w-4 text-slate-400" />
                        </Button>
                        <Input
                          value={filter.name}
                          onChange={(e) => updateFilter(index, { name: e.target.value })}
                          className="h-9 bg-white border-slate-200 shadow-sm font-bold text-sm flex-1 min-w-0"
                        />
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[11px] font-bold text-slate-600">Visible</span>
                          <Switch
                            checked={filter.isEnabled}
                            onCheckedChange={(checked) => updateFilter(index, { isEnabled: checked })}
                            className="scale-[0.7] origin-right data-[state=checked]:bg-green-500 shadow-sm"
                          />
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0" onClick={() => removeFilter(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="p-3">
                        <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Values</p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {filter.options.map((option) => (
                            <span
                              key={option}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-700 rounded-full text-xs font-bold"
                            >
                              {option}
                              <X
                                className="h-3.5 w-3.5 text-slate-400 hover:text-red-500 cursor-pointer"
                                onClick={() => removeFilterOption(index, option)}
                              />
                            </span>
                          ))}
                          {filter.options.length === 0 && (
                            <span className="text-xs text-slate-400 font-semibold">No values yet</span>
                          )}
                        </div>
                        <AddValueInput onAdd={(value) => addFilterOption(index, value)} />
                      </div>
                    </div>
                  ))}
                  {draft.filters.length === 0 && (
                    <p className="text-xs text-slate-400 font-semibold text-center py-6 border border-dashed border-slate-200 rounded-xl bg-white/50">
                      No filters configured.
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* ----------------------- MENU DISPLAY ----------------------- */}
            <TabsContent value="menu" className="pt-8 space-y-10">
              {/* Menu Categories */}
              <div>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">1. Menu Categories</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Category sections shown instead of the kitchen&apos;s usual ones (e.g. Breakfast, Juices)
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-[#ff5a1f] border-[#ff5a1f]/30 hover:bg-[#ff5a1f]/10 font-bold h-8 px-4 bg-white shadow-sm" onClick={addMenuCategory}>
                    <Plus className="h-4 w-4 mr-1.5 stroke-[3]" /> Add Category
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {draft.menuCategories.map((category, index) => (
                    <div key={category.id ?? index} className="flex items-center gap-2.5 py-2 px-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <GripVertical className="h-4 w-4 text-slate-400 cursor-grab opacity-70 flex-shrink-0" />
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => moveMenuCategory(index, -1)}>
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => moveMenuCategory(index, 1)}>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Input
                        value={category.name}
                        onChange={(e) => updateMenuCategory(index, e.target.value)}
                        className="h-9 bg-white border-slate-200 shadow-sm font-semibold text-sm flex-1 min-w-0"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0" onClick={() => removeMenuCategory(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <hr className="border-slate-200" />

              {/* Recommended Items */}
              <div>
                <div className="flex justify-between items-center mb-5">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm mb-1">2. Recommended Items <span className="text-slate-500 font-medium">(Recommended for You)</span></h3>
                    <p className="text-xs text-slate-500 font-medium">Side dishes & combos shown as recommendations alongside {draft.keyword}</p>
                  </div>
                  <Button variant="outline" size="sm" className="text-[#ff5a1f] border-[#ff5a1f]/30 hover:bg-[#ff5a1f]/10 font-bold h-8 px-4 bg-white shadow-sm" onClick={addRecommendedItem}>
                    <Plus className="h-4 w-4 mr-1.5 stroke-[3]" /> Add Item
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {draft.recommendedItems.map((item, index) => (
                    <div key={item.id ?? index} className="flex items-center gap-2.5 py-2 px-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <GripVertical className="h-4 w-4 text-slate-400 cursor-grab opacity-70 flex-shrink-0" />
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => moveRecommendedItem(index, -1)}>
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={() => moveRecommendedItem(index, 1)}>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </Button>
                      <Input
                        value={item.name}
                        onChange={(e) => updateRecommendedItem(index, e.target.value)}
                        className="h-9 bg-white border-slate-200 shadow-sm font-semibold text-sm flex-1 min-w-0"
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0" onClick={() => removeRecommendedItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ----------------------- KITCHEN INFO ----------------------- */}
            <TabsContent value="info" className="pt-8">
              <div>
                <h3 className="font-bold text-slate-900 text-sm mb-1">Kitchen Information Sections</h3>
                <p className="text-xs text-slate-500 font-medium mb-5">Choose which kitchen information appears on this search-specific page</p>

                <div className="space-y-3">
                  {infoItems.map((item) => {
                    const Icon = item.icon;
                    const enabled = draft[item.key] as boolean;
                    return (
                      <div key={item.key} className="flex items-center justify-between py-2.5 px-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${enabled ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="text-[13px] font-bold text-slate-700">{item.label}</span>
                        </div>
                        <Switch
                          checked={enabled}
                          onCheckedChange={(checked) => updateDraft({ [item.key]: checked })}
                          className="scale-[0.75] origin-right data-[state=checked]:bg-green-500 shadow-sm"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Preview Panel */}
        <div className="xl:col-span-5">
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Live Preview</h3>
                <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                  How the kitchen page looks for &ldquo;{draft.keyword}&rdquo;
                </p>
              </div>
              <Badge className="bg-[#ff5a1f] hover:bg-[#ff5a1f] text-white border-0 font-bold text-[10px] rounded-md">
                {draft.kitchensCount}+ Kitchens
              </Badge>
            </div>

            <div className="p-4 bg-slate-50/80">
              <div
                className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mx-auto transition-all duration-300 ${
                  device === "mobile" ? "max-w-[360px]" : device === "tablet" ? "max-w-[600px]" : "max-w-full"
                }`}
              >
                {/* Preview Hero */}
                <div className="relative h-40 w-full bg-gradient-to-br from-orange-100 via-amber-50 to-orange-50">
                  {heroUrl && draft.showHero ? (
                    <Image src={heroUrl} alt="preview hero" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                      <ChefHat className="h-12 w-12 text-[#ff5a1f]/60" strokeWidth={1.25} />
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">No hero banner</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge className="bg-[#ff5a1f] hover:bg-[#ff5a1f] text-white border-0 font-bold px-2 py-0.5 shadow-sm text-[10px] rounded-md">
                      {draft.badgeText || `${draft.kitchensCount}+ Kitchens`}
                    </Badge>
                  </div>
                  <div className="absolute top-3 right-3 flex gap-2">
                    {draft.showPureVegBadge && (
                      <Badge variant="outline" className="bg-white text-green-700 border-green-200 shadow-sm gap-1.5 py-0.5 px-2 rounded-md">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>{" "}
                        <span className="font-bold text-[9px] uppercase tracking-wider">Pure Veg</span>
                      </Badge>
                    )}
                    <Button variant="secondary" size="icon" className="h-6 w-6 rounded-full bg-white text-slate-400 hover:text-red-500 shadow-sm">
                      <Heart className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Preview Info */}
                <div className="px-5 relative pb-5 border-b border-slate-100">
                  <div className="absolute -top-10 left-5 h-20 w-20 rounded-full border-4 border-white overflow-hidden bg-slate-100 shadow-md flex items-center justify-center">
                    {firstKitchen?.imageUrl ? (
                      <Image src={firstKitchen.imageUrl} alt="Avatar" fill className="object-cover" />
                    ) : (
                      <ChefHat className="h-8 w-8 text-slate-300" strokeWidth={1.5} />
                    )}
                  </div>

                  <div className="pt-12">
                    <h2 className="text-lg font-bold flex items-center gap-1.5 text-slate-900">
                      {draft.searchTitle || `Best ${draft.keyword} from ${firstKitchen?.displayName ?? "Home Kitchen"}`}
                      <Check className="h-4 w-4 text-green-500" />
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-600 mt-2 font-bold">
                      {draft.showRatings && (
                        <span className="flex items-center text-amber-500">
                          <Star className="h-3 w-3 mr-1 fill-current" /> {firstKitchen?.avgRating.toFixed(1) ?? "4.5"}{" "}
                          <span className="text-slate-400 ml-1 font-medium">({firstKitchen?.totalReviews ?? 0} Reviews)</span>
                        </span>
                      )}
                      {draft.showDeliveryTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" /> {firstKitchen?.estimatedPrepTime ?? 25}-{(firstKitchen?.estimatedPrepTime ?? 25) + 5} mins
                        </span>
                      )}
                      {draft.showDistance && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-slate-400" /> 2.1 km
                        </span>
                      )}
                      {draft.showPureVegBadge && (
                        <span className="flex items-center gap-1 text-green-700">
                          <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div> Pure Veg
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-3 leading-relaxed font-medium">
                      {draft.description || `Explore the best ${draft.keyword} from verified home kitchens near you.`}
                    </p>

                    {/* Search Chips */}
                    <div className="flex flex-wrap gap-2 mt-4">
                      {enabledChips.map((chip) => (
                        <Badge
                          key={chip.id ?? chip.label}
                          variant="outline"
                          className="text-[10px] border-[#ff5a1f]/30 bg-orange-50/30 text-[#ff5a1f] py-1 px-2.5 font-bold rounded-full shadow-sm"
                        >
                          {chip.label}
                        </Badge>
                      ))}
                      {enabledChips.length === 0 && (
                        <span className="text-[10px] text-slate-400 font-semibold">No chips enabled</span>
                      )}
                    </div>

                    {/* Info badges */}
                    <div className="flex flex-wrap gap-2 mt-3">
                      {draft.showHygienicBadge && (
                        <Badge variant="outline" className="text-slate-600 border-slate-200 bg-white shadow-sm gap-1.5 py-1 px-2.5 font-semibold rounded-md">
                          <ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Hygienic Kitchen
                        </Badge>
                      )}
                      {draft.showFreshIngredients && (
                        <Badge variant="outline" className="text-slate-600 border-slate-200 bg-white shadow-sm gap-1.5 py-1 px-2.5 font-semibold rounded-md">
                          <Leaf className="h-3.5 w-3.5 text-green-600" /> Fresh Ingredients
                        </Badge>
                      )}
                      {draft.showPackaging && (
                        <Badge variant="outline" className="text-slate-600 border-slate-200 bg-white shadow-sm gap-1.5 py-1 px-2.5 font-semibold rounded-md">
                          <ShoppingBag className="h-3.5 w-3.5 text-[#ff5a1f]" /> Safe & Secure Packaging
                        </Badge>
                      )}
                      {draft.showSupportLocalWomen && (
                        <Badge variant="outline" className="text-slate-600 border-slate-200 bg-white shadow-sm gap-1.5 py-1 px-2.5 font-semibold rounded-md">
                          <Heart className="h-3.5 w-3.5 text-rose-500" /> Support Local Women
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview Tabs */}
                <div className="flex items-center justify-between px-5 border-b border-slate-100 overflow-x-auto hide-scrollbar">
                  <div className="py-3 border-b-2 border-[#ff5a1f] text-[#ff5a1f] font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap">
                    <UtensilsCrossed className="h-3.5 w-3.5" /> Menu
                  </div>
                  {draft.showKitchenStory && (
                    <div className="py-3 text-slate-500 font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap">
                      <Info className="h-3.5 w-3.5" /> About Kitchen
                    </div>
                  )}
                  {draft.showRatings && (
                    <div className="py-3 text-slate-500 font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap">
                      <Star className="h-3.5 w-3.5" /> Reviews ({firstKitchen?.totalReviews ?? 0})
                    </div>
                  )}
                  <div className="py-3 text-slate-500 font-bold text-[11px] flex items-center gap-1.5 whitespace-nowrap">
                    <Info className="h-3.5 w-3.5" /> Kitchen Information
                  </div>
                </div>

                {/* Preview Menu Content */}
                <div className="flex p-4 gap-4 bg-slate-50/50">
                  {/* Filters Sidebar */}
                  {enabledFilters.length > 0 && (
                    <div className="w-[120px] flex-shrink-0 hidden sm:block">
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-bold text-[11px] text-slate-900">Filters</span>
                        <span className="text-[#ff5a1f] text-[9px] font-bold cursor-pointer">Clear All</span>
                      </div>
                      <div className="space-y-5">
                        {enabledFilters.slice(0, 3).map((filter) => (
                          <div key={filter.id ?? filter.name}>
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-[10px] text-slate-900">{filter.name}</span>
                              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
                            </div>
                            {filter.options.slice(0, 4).map((option, i) => (
                              <div key={option} className="flex items-center gap-2 text-[10px] font-semibold text-slate-600 mb-2">
                                <div
                                  className={`w-3.5 h-3.5 rounded-[3px] shadow-sm border flex items-center justify-center ${
                                    i === 0 ? "bg-[#ff5a1f] border-[#ff5a1f]" : "bg-white border-slate-300"
                                  }`}
                                >
                                  {i === 0 && <Check className="h-2.5 w-2.5 text-white stroke-[3]" />}
                                </div>
                                {option}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Menu Items */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">Menu for &ldquo;{draft.keyword}&rdquo;</h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                          Showing {Math.min(previewItems.length, 6)} of {draft.menuItemsCount} results
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1.5 text-[9px]">
                          <span className="text-slate-500 font-semibold">Sort by:</span>
                          <span className="font-bold flex items-center border border-slate-200 px-2 py-1 rounded bg-white shadow-sm">
                            {draft.defaultSort} <ChevronDown className="h-3 w-3 ml-1" />
                          </span>
                        </div>
                        {draft.showKitchenTiming && (
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-[10px] font-bold bg-white shadow-sm">
                            <Clock className="h-3 w-3 mr-1.5" /> Kitchen Timings
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {previewItems.slice(0, 6).map((item) => (
                        <div key={item.id} className="flex border border-slate-200 bg-white rounded-xl overflow-hidden shadow-sm p-2 gap-2.5">
                          <div className="h-16 w-16 relative rounded-lg overflow-hidden flex-shrink-0 bg-slate-100 border border-slate-100">
                            {item.imageUrl ? (
                              <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <UtensilsCrossed className="h-5 w-5 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col flex-1 justify-between py-0.5 min-w-0">
                            <div>
                              <div className="flex items-start justify-between gap-1 mb-1">
                                <h4 className="font-bold text-[11px] text-slate-900 leading-tight truncate">{item.name}</h4>
                                <div
                                  className={`h-3 w-3 rounded-[3px] border flex items-center justify-center flex-shrink-0 ${
                                    item.foodType === "VEG" ? "border-green-600 text-green-600" : "border-red-600 text-red-600"
                                  }`}
                                >
                                  <div className={`h-1.5 w-1.5 rounded-full ${item.foodType === "VEG" ? "bg-green-600" : "bg-red-600"}`} />
                                </div>
                              </div>
                              <p className="text-[9px] text-slate-500 font-medium line-clamp-1">{item.kitchenName}</p>
                            </div>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="font-bold text-[12px] text-green-700">₹{item.price}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-6 px-2.5 text-[9px] border-[#ff5a1f]/40 text-[#ff5a1f] font-bold hover:bg-[#ff5a1f]/5 bg-white rounded-md shadow-sm"
                              >
                                ADD <Plus className="h-2.5 w-2.5 ml-1 stroke-[3]" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {previewItems.length === 0 && (
                        <div className="col-span-full py-8 flex flex-col items-center gap-2 text-center">
                          <Search className="h-6 w-6 text-slate-300" />
                          <p className="text-[11px] text-slate-400 font-semibold">
                            No live menu items match &ldquo;{draft.keyword}&rdquo; yet
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Recommended */}
                    {draft.recommendedItems.length > 0 && (
                      <div className="mt-5">
                        <h4 className="font-bold text-[11px] text-slate-900 mb-2.5 flex items-center gap-1.5">
                          <Sparkles className="h-3.5 w-3.5 text-[#ff5a1f]" /> Recommended for You
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {draft.recommendedItems.map((item) => (
                            <Badge
                              key={item.id ?? item.name}
                              variant="outline"
                              className="text-slate-700 border-slate-200 bg-white shadow-sm gap-1.5 py-1 px-2.5 font-bold rounded-full text-[9px]"
                            >
                              <Plus className="h-2.5 w-2.5 text-[#ff5a1f] stroke-[3]" /> {item.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full mt-4 text-[#ff5a1f] border-[#ff5a1f]/30 font-bold hover:bg-[#ff5a1f]/5 h-9 text-[11px] bg-white shadow-sm"
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
   DASHBOARD (LIST)
=================================================================== */

export default function KitchenSearchPageManagement() {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminKitchenSearchRow | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addKeyword, setAddKeyword] = useState("");
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

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

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleKitchenSearchPageContent(id, isActive),
    onMutate: ({ id }) => setPendingToggleId(id),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to update status");
      } else {
        queryClient.invalidateQueries({ queryKey: ["admin-kitchen-search-page"] });
        toast.success("Status updated");
      }
    },
    onError: () => toast.error("Failed to update status"),
    onSettled: () => setPendingToggleId(null),
  });

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return contents.filter((c) => {
      const matchesSearch = !term || c.keyword.toLowerCase().includes(term);
      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Published" && c.isActive) ||
        (statusFilter === "Draft" && !c.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [contents, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const showingFrom = filtered.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(safePage * rowsPerPage, filtered.length);

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
      <Editor
        contentId={editingId}
        onCancel={() => {
          setEditingId(null);
        }}
      />
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8 max-w-[1400px] mx-auto flex items-center justify-center">
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
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-8 max-w-[1400px] mx-auto animate-in fade-in duration-300 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-[#ff5a1f] rounded-xl border border-orange-100/50">
            <ChefHat className="h-8 w-8" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-1">
              Search Experience Management
            </h1>
            <p className="text-sm text-slate-500">
              How every kitchen detail page looks for a specific search keyword — without changing the kitchen itself.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 w-full md:w-auto">
          <div className="flex w-full md:w-auto items-center gap-3">
            <Button
              variant="outline"
              className="w-full md:w-auto bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm h-10 font-medium"
              onClick={() => window.open("/search", "_blank")}
            >
              <Eye className="h-4 w-4 mr-2" /> View Live Site
            </Button>
            <Button
              className="w-full md:w-auto bg-[#ff5a1f] hover:bg-[#e04918] text-white shadow-sm shadow-[#ff5a1f]/20 h-10 font-medium"
              onClick={() => setAddDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-2" /> Add New Search Item
            </Button>
          </div>
          <p className="text-xs text-slate-400 font-medium hidden md:block">
            {contents.length} configurations · auto-refreshes
          </p>
        </div>
      </div>

      {/* Table */}
      <Card className="border-slate-200 shadow-sm overflow-hidden mb-8 bg-white rounded-xl">
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search keyword (e.g., biryani, dosa...)"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 bg-white border-slate-200 shadow-sm h-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[180px] bg-white border-slate-200 shadow-sm h-10">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Statuses</SelectItem>
                <SelectItem value="Published">Published</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full md:w-auto bg-white border-slate-200 shadow-sm text-slate-700 h-10" onClick={() => { setSearchTerm(""); setStatusFilter("All"); setCurrentPage(1); }}>
              <Filter className="h-4 w-4 mr-2" /> Clear
            </Button>
          </div>
          <Button variant="outline" className="w-full lg:w-auto bg-white border-slate-200 shadow-sm text-slate-700 h-10" onClick={onExport}>
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                <TableHead className="text-slate-600 font-semibold h-11 text-xs pl-5">#</TableHead>
                <TableHead className="text-slate-600 font-semibold h-11 text-xs">Search Keyword</TableHead>
                <TableHead className="text-slate-600 font-semibold h-11 text-xs text-center">Kitchens</TableHead>
                <TableHead className="text-slate-600 font-semibold h-11 text-xs text-center">Menu Items</TableHead>
                <TableHead className="text-slate-600 font-semibold h-11 text-xs">Status</TableHead>
                <TableHead className="text-slate-600 font-semibold h-11 text-xs">Updated</TableHead>
                <TableHead className="text-slate-600 font-semibold h-11 text-xs text-right pr-5">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length ? (
                pageItems.map((row, index) => (
                  <TableRow key={row.id} className="border-b-slate-100 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="py-3 align-middle pl-5 text-slate-500 font-medium text-sm">
                      {(safePage - 1) * rowsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="py-3 align-middle">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-[#ff5a1f]" />
                        <span className="font-bold text-slate-900 capitalize">{row.keyword}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 align-middle text-center">
                      <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 font-bold shadow-sm">
                        {row.kitchensCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 align-middle text-center">
                      <Badge variant="outline" className="border-slate-200 bg-white text-slate-700 font-bold shadow-sm">
                        {row.menuItemsCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 align-middle">
                      {row.isActive ? (
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700 gap-1.5 px-2.5 py-1 font-bold shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> Published
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600 gap-1.5 px-2.5 py-1 font-bold shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div> Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3 align-middle">
                      <div className="flex flex-col">
                        <span className="text-slate-900 font-medium text-sm">{formatRelativeTime(row.updatedAt)}</span>
                        <span className="text-slate-500 text-xs mt-0.5">
                          {new Date(row.updatedAt).toLocaleString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 align-middle pr-5">
                      <div className="flex items-center justify-end gap-2">
                        <Switch
                          checked={row.isActive}
                          disabled={pendingToggleId === row.id}
                          onCheckedChange={(checked) => toggleMutation.mutate({ id: row.id, isActive: checked })}
                          className="scale-[0.8] data-[state=checked]:bg-green-500"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingId(row.id)}
                          className="h-8 w-8 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteTarget(row)}
                          className="h-8 w-8 border-slate-200 text-red-500 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-40 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ListOrdered className="h-8 w-8 text-slate-300" />
                      <p className="text-slate-500 font-medium text-sm">
                        {contents.length === 0
                          ? "No search configurations yet. Create your first one."
                          : "No configurations match your filters."}
                      </p>
                      {contents.length === 0 && (
                        <Button className="bg-[#ff5a1f] hover:bg-[#e04918] text-white h-9 font-medium" onClick={() => setAddDialogOpen(true)}>
                          <Plus className="h-4 w-4 mr-2" /> Add New Search Item
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-slate-500">
            Showing <span className="font-medium text-slate-900">{showingFrom}</span> to{" "}
            <span className="font-medium text-slate-900">{showingTo}</span> of{" "}
            <span className="font-medium text-slate-900">{filtered.length}</span> configurations
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-slate-200 text-slate-600 hover:bg-slate-50"
              disabled={safePage === 1}
              onClick={() => setCurrentPage(safePage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant="outline"
                  size="icon"
                  className={`h-8 w-8 font-medium text-sm ${
                    page === safePage
                      ? "border-[#ff5a1f] text-[#ff5a1f] bg-[#ff5a1f]/10 hover:bg-[#ff5a1f]/20 hover:text-[#ff5a1f]"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            {totalPages > 5 && (
              <div className="h-8 w-8 flex items-center justify-center text-slate-400">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 border-slate-200 text-slate-600 hover:bg-slate-50"
              disabled={safePage === totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

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
