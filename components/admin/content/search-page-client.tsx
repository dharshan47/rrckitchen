"use client";

import { useEffect, useMemo, useState,useRef } from "react";
import { useReactTable, getCoreRowModel, getPaginationRowModel, flexRender, createColumnHelper } from "@tanstack/react-table";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  Eye,
  Plus,
  Layers,
  CheckCircle2,
  History,
  Filter,
  List,
  ChevronDown,
  Pencil,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  X,
  Save,
  Check,
  GripVertical,
  MapPin,
  User,
  ShoppingCart,
  Clock,
  Star,
  ShieldCheck,
  Heart,
  Leaf,
  Users,
  Loader2,
  RotateCcw,
  AlertTriangle,
  Tag,
  Info,
  Upload,
  ChefHat,
  BadgeCheck,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
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

import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Trophy, Sparkles, Egg, Drumstick, Image as ImageIcon } from "lucide-react";

import {
  getSearchPageContents,
  getSearchPageContent,
  getSearchPageKitchens,
  createSearchPageContent,
  saveSearchPageContent,
  deleteSearchPageContent,
  toggleSearchPageContent,
  type AdminSearchPageRow,
  type AdminSearchKitchen,
} from "@/actions/admin/search-page";

import {
  useSearchEditorActions,
  useSearchEditorDraft,
  useSearchEditorDirty,
  toSaveInput,
} from "@/stores/searchEditorStore";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const WEEK_START = Date.now() - 7 * 24 * 60 * 60 * 1000;

const INFO_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Heart,
  ShieldCheck,
  Clock,
  Leaf,
  Users,
};

/* ===================================================================
   SKELETONS — exact shape with animation
   =================================================================== */


function EditorSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56 rounded-md" />
          <Skeleton className="h-4 w-80 rounded-md" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
          <Skeleton className="h-10 w-40 rounded-md" />
        </div>
      </div>

      <Skeleton className="h-11 w-full rounded-md mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-3 space-y-6">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="shadow-sm border-gray-200/60 bg-white">
              <div className="p-4 border-b border-gray-100">
                <Skeleton className="h-5 w-32 rounded-md" />
              </div>
              <div className="p-4 space-y-4">
                <Skeleton className="h-[140px] w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
                <Skeleton className="h-9 w-full rounded-md" />
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-3 space-y-6">
          {[0, 1].map((i) => (
            <Card key={i} className="shadow-sm border-gray-200/60 bg-white">
              <div className="p-4 border-b border-gray-100">
                <Skeleton className="h-5 w-40 rounded-md" />
              </div>
              <div className="p-4 space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-40 rounded-md" />
                    <Skeleton className="h-5 w-9 rounded-full" />
                  </div>
                ))}
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[calc(100vh-140px)]">
          <div className="bg-gray-50/80 border-b border-gray-100 p-4">
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
          <div className="p-6 space-y-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-6 w-40 rounded-md" />
            <div className="flex gap-4">
              <Skeleton className="h-40 w-40 rounded-lg" />
              <Skeleton className="h-40 w-40 rounded-lg" />
              <Skeleton className="h-40 w-40 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ======================================================================
   EDITOR VIEW
   ====================================================================== */

interface EditorProps {
  contentId: string;
  onCancel: () => void;
}

function ImageUrlInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [prevValue, setPrevValue] = useState(value);
  if (prevValue !== value) {
    setPrevValue(value);
    setDraft(value);
  }
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          placeholder="Paste image URL..."
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="h-9 text-sm flex-1"
        />
        <Button
          type="button"
          variant="outline"
          className="h-9 text-xs border-orange-200 text-[#FF5722] hover:bg-orange-50 hover:text-orange-600"
          onClick={() => draft.trim() && onChange(draft.trim())}
        >
          <Check className="h-4 w-4 mr-1" /> Apply
        </Button>
      </div>
      <div className="flex items-center justify-between rounded-md border border-dashed border-orange-200 bg-orange-50/40 px-3 py-2">
        <span className="text-[11px] text-gray-500 font-medium">
          Upload banner image
        </span>
        <CloudinaryUpload
          onUpload={(result) => {
            onChange(result.secure_url);
            setDraft(result.secure_url);
            toast.success("Banner image uploaded");
          }}
        >
          {({ uploading, startUpload }) => (
            <Button
              type="button"
              variant="outline"
              className="h-8 text-xs border-orange-200 text-[#FF5722] hover:bg-orange-50 hover:text-orange-600"
              onClick={startUpload}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="h-3.5 w-3.5" />
              )}
              {uploading ? "Uploading..." : "Upload Image"}
            </Button>
          )}
        </CloudinaryUpload>
      </div>
    </div>
  );
}

function Editor({ contentId, onCancel }: EditorProps) {
  const queryClient = useQueryClient();
  const draft = useSearchEditorDraft();
  const dirty = useSearchEditorDirty();
  const {
    openEditor,
    updateDraft,
    updateFilter,
    addFilter,
    updateBadge,
    addBadge,
    updateInfoItem,
    markSaved,
    updateKitchenCard,
  } = useSearchEditorActions();

  const { data: detail, isFetching, isError, refetch } = useQuery({
    queryKey: ["admin-search-page-detail", contentId],
    queryFn: () => getSearchPageContent(contentId),
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

  const saveMutation = useMutation({
    mutationFn: () => {
      if (!draft) throw new Error("No draft");
      return saveSearchPageContent(draft.id, toSaveInput(draft));
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to save changes");
        return;
      }
      markSaved();
      queryClient.invalidateQueries({ queryKey: ["admin-search-page"] });
      queryClient.invalidateQueries({ queryKey: ["admin-search-page-detail", contentId] });
      toast.success(`"${draft?.keyword ?? "Search page"}" content saved`);
      onCancel();
    },
    onError: () => toast.error("Failed to save changes"),
  });

  const { data: previewKitchens = [] } = useQuery<AdminSearchKitchen[]>({
    queryKey: ["admin-search-page-kitchens"],
    queryFn: () => getSearchPageKitchens(12),
    staleTime: 60_000,
  });

  if (isFetching && !detail) {
    return <EditorSkeleton />;
  }

  if (isError || !detail) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400" />
          <p className="text-red-500 font-semibold">Failed to load search content</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RotateCcw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!draft) return <EditorSkeleton />;

  const banner = draft.bannerImageUrl;
  const enabledInfoItems = draft.infoItems.filter((i) => i.isEnabled);
  const enabledFilters = draft.filters.filter((f) => f.isEnabled);
  const enabledBadges = draft.badges.filter((b) => b.isEnabled);

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300 text-[#111827]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-[22px] md:text-[26px] font-bold tracking-tight text-[#0F172A]">
            Search Page Content
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage what customers see on the search page.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-[#9DD4B4] text-[#087A3E] hover:bg-[#EAF7EF] hover:text-[#056331] h-10 bg-[#FFFFFF] shadow-sm rounded-[8px]"
            onClick={() => window.open(`/search?q=${encodeURIComponent(draft.keyword)}`, "_blank")}
          >
            <Eye className="mr-2 h-4 w-4 text-[#087A3E]" />
            Preview Live Page
          </Button>
          <Button
            className="bg-[#FF4D00] hover:bg-[#E84300] text-[#FFFFFF] h-10 border border-[#FF4D00] shadow-[0_2px_6px_rgba(255,77,0,0.12)] rounded-[8px]"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4 text-[#FFFFFF]" />
            )}
            {dirty ? "Save Changes" : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* Warn if dirty */}
      {dirty && (
        <div className="mb-5 flex items-center gap-2 text-[13px] text-[#D97706] bg-[#FFF7E8] border border-[#F8DFA8] rounded-lg px-3 py-2 w-fit">
          <AlertTriangle className="h-4 w-4" />
          You have unsaved changes. Click Save Changes to publish.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start relative">
        <div className="lg:col-span-7 flex flex-col">
          <Tabs defaultValue="search_content" className="w-full">
            <TabsList className="bg-transparent border-b border-[#E5E7EB] rounded-none w-full justify-start h-auto p-0 mb-6 space-x-6 md:space-x-8 overflow-x-auto custom-scrollbar flex-nowrap">
              <TabsTrigger value="search_content" className="data-[state=active]:border-[#FF4D00] data-[state=active]:text-[#FF4D00] data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-0 py-3 text-[#1F2937] data-[state=active]:shadow-none font-medium whitespace-nowrap">Search Content</TabsTrigger>
              <TabsTrigger value="images" className="data-[state=active]:border-[#FF4D00] data-[state=active]:text-[#FF4D00] data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-0 py-3 text-[#1F2937] data-[state=active]:shadow-none font-medium whitespace-nowrap">Images</TabsTrigger>
              <TabsTrigger value="filters" className="data-[state=active]:border-[#FF4D00] data-[state=active]:text-[#FF4D00] data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-0 py-3 text-[#1F2937] data-[state=active]:shadow-none font-medium whitespace-nowrap">Filters</TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:border-[#FF4D00] data-[state=active]:text-[#FF4D00] data-[state=active]:bg-transparent border-b-2 border-transparent rounded-none px-0 py-3 text-[#1F2937] data-[state=active]:shadow-none font-medium whitespace-nowrap">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="search_content" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                
                {/* Left Sub-Column */}
                <div className="flex flex-col gap-6">
                  {/* Search Banner Block */}
                  <div className="bg-[#FFFFFF] border border-[#E8ECEA] rounded-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
                    <div className="p-4 flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-[#111827] text-[15px]">Search Banner</h3>
                        <div className="bg-[#EAF7EF] text-[#087A3E] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Active
                        </div>
                      </div>
                      <p className="text-[13px] text-[#64748B]">
                        Customize the banner that appears on top of search results.
                      </p>
                    </div>
                    <div className="px-4 pb-5 space-y-4">
                      <div className="rounded-[10px] overflow-hidden border border-[#E8ECEA] bg-[#FFF8F3] relative h-[120px]">
                        {banner ? (
                          <div className="absolute right-0 top-0 bottom-0 w-1/2">
                            <Image
                              src={banner}
                              fill
                              sizes="320px"
                              className="object-cover"
                              alt="Banner"
                            />
                          </div>
                        ) : null}
                        <div className="absolute inset-0 p-4 flex flex-col justify-center z-10">
                          <p className="text-[10px] font-semibold text-[#334155] mb-0.5">
                            Search Results for
                          </p>
                          <h2 className="text-xl md:text-2xl font-bold text-[#087A3E] tracking-tight flex items-center">
                            <span className="text-[#FF4D00]">“</span>{draft.keyword}<span className="text-[#FF4D00]">”</span>
                          </h2>
                          <p className="text-[10px] text-[#334155] mt-1.5 max-w-[65%] font-medium leading-snug">
                            We found <span className="text-[#FF4D00] font-bold">{draft.kitchensCount} kitchens</span> serving delicious {draft.keyword} near you.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-2">
                         <div className="relative cursor-pointer bg-[#FFFFFF] text-[#FF4D00] border border-[#FFB89A] hover:bg-[#FFF1EB] rounded-[7px] px-3 py-1.5 flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-colors">
                           <ImageIcon className="h-3.5 w-3.5" /> Change Image
                           <div className="absolute inset-0 opacity-0 overflow-hidden cursor-pointer">
                              <ImageUrlInput
                                value={draft.bannerImageUrl}
                                onChange={(url) => updateDraft({ bannerImageUrl: url })}
                              />
                           </div>
                         </div>
                      </div>

                      <div className="space-y-4 pt-1">
                        <div>
                          <div className="flex justify-between mb-1.5">
                            <label className="text-xs font-semibold text-[#111827]">
                              Banner Heading
                            </label>
                            <span className="text-[10px] text-[#64748B]">
                              {draft.heading.length}/60
                            </span>
                          </div>
                          <Input
                            value={draft.heading}
                            maxLength={60}
                            onChange={(e) => updateDraft({ heading: e.target.value })}
                            className="h-9 text-sm text-[#111827] border-[#DDE3E0] rounded-[7px] focus-visible:border-[#FF4D00] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-[0_0_0_3px_rgba(255,77,0,0.10)]"
                          />
                        </div>
                        <div>
                          <div className="flex justify-between mb-1.5">
                            <label className="text-xs font-semibold text-[#111827]">
                              Banner Sub Text
                            </label>
                            <span className="text-[10px] text-[#64748B]">
                              {draft.subHeading.length}/120
                            </span>
                          </div>
                          <textarea
                            className="flex w-full rounded-[7px] border border-[#DDE3E0] bg-[#FFFFFF] px-3 py-2 text-sm text-[#111827] focus-visible:outline-none focus-visible:border-[#FF4D00] focus-visible:shadow-[0_0_0_3px_rgba(255,77,0,0.10)] min-h-[70px] resize-none"
                            value={draft.subHeading}
                            maxLength={120}
                            onChange={(e) => updateDraft({ subHeading: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Top Info Items Block */}
                  <div className="bg-[#FFFFFF] border border-[#E8ECEA] rounded-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
                    <div className="p-4 pb-2">
                      <h3 className="font-semibold text-[#111827] text-[15px]">
                        Top Info Items
                      </h3>
                      <p className="text-[13px] text-[#64748B] mt-1">
                        Manage the quick info items shown below the search results.
                      </p>
                    </div>
                    <div className="px-4 pb-5 space-y-4 mt-2">
                      <div className="space-y-4">
                        {draft.infoItems.map((item, i) => {
                          const IconComp = INFO_ICON_MAP[item.icon] ?? Heart;
                          const isGreen = ["ShieldCheck", "Leaf"].includes(item.icon);
                          const iconBg = isGreen ? "bg-[#EAF7EF]" : "bg-[#FFF1EB]";
                          const iconColor = isGreen ? "text-[#087A3E]" : "text-[#FF4D00]";

                          return (
                            <div key={item.id ?? i} className="flex items-center justify-between group">
                              <div className="flex gap-2.5 items-center w-full min-w-0 pr-2">
                                <GripVertical className="h-4 w-4 text-[#FF4D00] opacity-85 cursor-grab shrink-0" />
                                <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 ${iconBg}`}>
                                  <IconComp className={`h-4 w-4 ${iconColor}`} />
                                </div>
                                <div className="flex flex-col flex-1 min-w-0">
                                  <input
                                    className="text-xs font-semibold text-[#111827] bg-transparent outline-none border border-transparent hover:border-[#E8ECEA] rounded px-1 -mx-1 w-full truncate"
                                    value={item.title}
                                    onChange={(e) =>
                                      updateInfoItem(i, { title: e.target.value })
                                    }
                                  />
                                  <input
                                    className="text-[10px] text-[#64748B] bg-transparent outline-none border border-transparent hover:border-[#E8ECEA] rounded px-1 -mx-1 w-full block truncate"
                                    value={item.subtitle}
                                    onChange={(e) =>
                                      updateInfoItem(i, { subtitle: e.target.value })
                                    }
                                  />
                                </div>
                              </div>
                              <Switch
                                checked={item.isEnabled}
                                onCheckedChange={(checked) =>
                                  updateInfoItem(i, { isEnabled: checked })
                                }
                                className="data-[state=checked]:bg-[#087A3E] data-[state=unchecked]:bg-[#D1D5DB] scale-90 shrink-0"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Results Settings Block */}
                  <div className="bg-[#FFFFFF] border border-[#E8ECEA] rounded-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
                    <div className="p-4 pb-2">
                      <h3 className="font-semibold text-[#111827] text-[15px]">
                        Results Settings
                      </h3>
                      <p className="text-[13px] text-[#64748B] mt-1">
                        Configure how results are displayed.
                      </p>
                    </div>
                    <div className="px-4 pb-5 space-y-4 mt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-[#111827] block mb-1.5">
                            Kitchens Per Page
                          </label>
                          <Select
                            value={String(draft.cardsPerPage)}
                            onValueChange={(v) =>
                              updateDraft({ cardsPerPage: Number(v) })
                            }
                          >
                            <SelectTrigger className="h-9 w-full bg-[#FFFFFF] border-[#DDE3E0] rounded-[7px] text-sm text-[#111827] focus:ring-0 focus:border-[#FF4D00]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="12">12</SelectItem>
                              <SelectItem value="24">24</SelectItem>
                              <SelectItem value="48">48</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-[#111827] block mb-1.5">
                            Default Sort By
                          </label>
                          <Select
                            value={draft.defaultSort}
                            onValueChange={(v) => updateDraft({ defaultSort: v })}
                          >
                            <SelectTrigger className="h-9 w-full bg-[#FFFFFF] border-[#DDE3E0] rounded-[7px] text-sm text-[#111827] focus:ring-0 focus:border-[#FF4D00]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["Relevance", "Rating", "Distance", "Newest", "Recommended"].map(
                                (s) => (
                                  <SelectItem key={s} value={s}>
                                    {s}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1">
                        <label className="text-xs font-semibold text-[#111827]">
                          Show Ratings
                        </label>
                        <Switch
                          checked={draft.showRatings}
                          onCheckedChange={(checked) =>
                            updateDraft({ showRatings: checked })
                          }
                          className="data-[state=checked]:bg-[#087A3E] data-[state=unchecked]:bg-[#D1D5DB] scale-90"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Sub-Column */}
                <div className="flex flex-col gap-6">
                  {/* Filters Configuration */}
                  <div className="bg-[#FFFFFF] border border-[#E8ECEA] rounded-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
                    <div className="p-4 pb-2">
                      <h3 className="font-semibold text-[#111827] text-[15px]">
                        Filters Configuration
                      </h3>
                      <p className="text-[13px] text-[#64748B] mt-1">
                        Choose and order filters to show on the search page.
                      </p>
                    </div>
                    <div className="px-4 pb-5 space-y-4 mt-2">
                      <div className="space-y-2">
                        {draft.filters.map((filter, i) => (
                          <div
                            key={filter.id ?? i}
                            className="bg-[#FFFFFF] border border-[#E8ECEA] p-3 rounded-[8px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] flex items-center justify-between hover:border-[#FFB89A] transition-colors"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <GripVertical className="h-4 w-4 text-[#94A3B8] cursor-grab shrink-0" />
                              <Checkbox
                                checked={filter.isEnabled}
                                onCheckedChange={(checked) =>
                                  updateFilter(i, { isEnabled: !!checked })
                                }
                                className="h-4 w-4 rounded-sm border-[#CBD5E1] data-[state=checked]:bg-[#FF4D00] data-[state=checked]:border-[#FF4D00]"
                              />
                              <div className="flex-1 min-w-0 flex flex-col">
                                <input
                                  className="text-xs font-semibold text-[#111827] bg-transparent outline-none border border-transparent hover:border-[#E8ECEA] rounded px-1 -mx-1 w-full truncate"
                                  value={filter.name}
                                  onChange={(e) =>
                                    updateFilter(i, { name: e.target.value })
                                  }
                                />
                                <span className="text-[10px] text-[#64748B] ml-0.5">
                                  {filter.options.length} options
                                </span>
                              </div>
                              <ChevronDown className="h-4 w-4 text-[#475569]" />
                            </div>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        className="w-full text-[#FF4D00] border-[#FFB89A] hover:bg-[#FFF1EB] hover:text-[#FF4D00] h-10 rounded-[8px] mt-2 bg-[#FFFFFF]"
                        onClick={addFilter}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Filter
                      </Button>
                    </div>
                  </div>

                  {/* Featured Badges */}
                  <div className="bg-[#FFFFFF] border border-[#E8ECEA] rounded-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.04)] overflow-hidden">
                    <div className="p-4 pb-2">
                      <h3 className="font-semibold text-[#111827] text-[15px]">
                        Featured Badges
                      </h3>
                      <p className="text-[13px] text-[#64748B] mt-1">
                        Manage badges shown on kitchen cards.
                      </p>
                    </div>
                    <div className="px-4 pb-5 space-y-4 mt-2">
                      <div className="space-y-4 pl-1">
                        {draft.badges.map((badge, i) => {
                           let badgeClass = "text-[#FF4D00] bg-[#FFF1EB] border-[#FFD0BF]";
                           let IconB = Trophy;
                           const nameLow = badge.name.toLowerCase();
                           if(nameLow.includes("top rated")) { badgeClass = "text-[#0891B2] bg-[#EFFAFF] border-[#BCEAF3]"; IconB = Star; }
                           else if(nameLow.includes("new")) { badgeClass = "text-[#7C3AED] bg-[#F4EEFF] border-[#DDD0FF]"; IconB = Sparkles; }
                           else if(nameLow.includes("pure veg")) { badgeClass = "text-[#087A3E] bg-[#EAF7EF] border-[#C9E8D4]"; IconB = Leaf; }
                           else if(nameLow.includes("egg")) { badgeClass = "text-[#D97706] bg-[#FFF7E8] border-[#F8DFA8]"; IconB = Egg; }
                           else if(nameLow.includes("chicken")) { badgeClass = "text-[#EA580C] bg-[#FFF1EB] border-[#FFD0BF]"; IconB = Drumstick; }

                           return (
                              <div key={badge.id ?? i} className="flex items-center justify-between gap-3 group">
                                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${badgeClass}`}>
                                  <IconB className="h-3.5 w-3.5" />
                                  <input
                                    value={badge.name}
                                    onChange={(e) => updateBadge(i, { name: e.target.value })}
                                    className="bg-transparent outline-none w-20 md:w-24 placeholder:text-current/50 truncate"
                                  />
                                </div>
                                <div className="flex items-center gap-2">
                                   <div className="flex items-center gap-0.5 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] p-0.5">
                                     <button
                                       type="button"
                                       onClick={() => updateBadge(i, { position: "left" })}
                                       title="Show on left side of kitchen card"
                                       className={cn(
                                         "text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors",
                                         badge.position === "left"
                                           ? "bg-[#FF4D00] text-[#FFFFFF]"
                                           : "text-[#64748B] hover:text-[#111827]"
                                       )}
                                     >
                                       Left
                                     </button>
                                     <button
                                       type="button"
                                       onClick={() => updateBadge(i, { position: "right" })}
                                       title="Show on right side of kitchen card"
                                       className={cn(
                                         "text-[10px] font-bold px-2 py-0.5 rounded-full transition-colors",
                                         badge.position === "right"
                                           ? "bg-[#FF4D00] text-[#FFFFFF]"
                                           : "text-[#64748B] hover:text-[#111827]"
                                       )}
                                     >
                                       Right
                                     </button>
                                   </div>
                                   <Switch
                                     checked={badge.isEnabled}
                                     onCheckedChange={(checked) =>
                                       updateBadge(i, { isEnabled: checked })
                                     }
                                     className="data-[state=checked]:bg-[#087A3E] data-[state=unchecked]:bg-[#D1D5DB] scale-90"
                                   />
                                </div>
                              </div>
                           )
                        })}
                      </div>

                      <Button
                        variant="outline"
                        className="w-full text-[#FF4D00] border-[#FFB89A] hover:bg-[#FFF1EB] hover:text-[#FF4D00] h-10 rounded-[8px] mt-2 bg-[#FFFFFF]"
                        onClick={addBadge}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Badge
                      </Button>
                    </div>
                  </div>
                </div>

              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-5 bg-[#FFFFFF] border border-[#E5E7EB] rounded-[12px] shadow-[0_2px_8px_rgba(15,23,42,0.04)] overflow-hidden flex flex-col h-[700px] lg:h-[calc(100vh-120px)] lg:sticky lg:top-6 mt-6 lg:mt-0">
          <div className="bg-[#FFFFFF] border-b border-[#EEF1EF] p-4 flex flex-col gap-1 z-20 shadow-sm relative">
            <div className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-[#087A3E] animate-pulse" />
                 <h3 className="font-bold text-[#111827] text-sm">Live Preview</h3>
               </div>
               <span className="text-[10px] text-[#94A3B8] hidden sm:inline-block">(Scroll to preview full page)</span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              This is exactly how the search page appears to customers on desktop devices.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto bg-[#FAFBFA] pb-8 relative custom-scrollbar">
            <div className="bg-[#FFFFFF] min-h-full w-full mx-auto pb-8 overflow-x-hidden">
              {/* Navbar mock */}
              <div className="px-4 py-3 border-b border-[#EEF1EF] flex items-center justify-between bg-[#FFFFFF] sticky top-0 z-10">
                <div className="flex flex-col">
                  <span className="font-bold italic text-base md:text-lg leading-tight flex gap-1 text-[#087A3E]">
                    <span className="text-[#FF4D00]">RRC</span> Kitchen
                  </span>
                  <span className="text-[6px] md:text-[7px] text-[#64748B] tracking-wider uppercase font-medium mt-0.5">
                    Every Homemaker is a Chef
                  </span>
                </div>
                <div className="hidden sm:flex items-center text-[10px] font-semibold text-[#111827] gap-1">
                  <MapPin className="h-3 w-3 text-[#FF4D00]" />
                  <span>Select Location</span>
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </div>
                <div className="hidden md:flex relative flex-1 max-w-[200px] mx-4">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#475569]" />
                  <input
                    className="w-full border border-[#DDE3E0] rounded-[7px] pl-7 py-1.5 text-[10px] bg-[#FFFFFF] outline-none font-medium text-[#111827]"
                    value={draft.keyword}
                    readOnly
                  />
                  <X className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-[#475569] cursor-pointer" />
                </div>
                <div className="flex items-center gap-3 text-[10px] font-semibold text-[#334155]">
                  <div className="hidden sm:flex items-center gap-1 cursor-pointer">
                    <User className="h-3.5 w-3.5 text-[#334155]" /> Login
                  </div>
                  <div className="relative cursor-pointer">
                    <ShoppingCart className="h-4 w-4 text-[#334155]" />
                    <span className="absolute -top-1.5 -right-1.5 bg-[#FF4D00] text-[#FFFFFF] text-[8px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center border-2 border-[#FFFFFF]">
                      3
                    </span>
                  </div>
                </div>
              </div>

              {/* Nav links mock */}
              <div className="hidden md:flex items-center justify-center gap-4 lg:gap-6 py-2.5 border-b border-[#EEF1EF] text-[8px] font-bold text-[#111827] tracking-wider bg-[#FFFFFF]">
                {["HOME", "CATEGORIES", "KITCHENS", "TODAY'S SPECIALS", "ABOUT US", "BECOME A CHEF"].map(
                  (item, i) => (
                    <span
                      key={item}
                      className={
                        i === 2
                          ? "text-[#FF4D00] cursor-pointer"
                          : "hover:text-[#FF4D00] cursor-pointer"
                      }
                    >
                      {item}
                    </span>
                  )
                )}
              </div>

              {/* Banner */}
              <div className="w-full h-32 md:h-40 relative overflow-hidden bg-[#FFF8F3]">
                {banner ? (
                  <div className="absolute right-0 top-0 bottom-0 w-[60%] sm:w-[55%]">
                     <Image
                       src={banner}
                       fill
                       sizes="(max-width: 768px) 100vw, 50vw"
                       className="object-cover"
                       alt="Banner"
                     />
                     <div className="absolute inset-0 bg-gradient-to-r from-[#FFF8F3] to-transparent" />
                  </div>
                ) : null}
                <div className="absolute inset-0 p-4 md:p-8 flex flex-col justify-center z-10 w-3/4 sm:w-2/3">
                  <p className="text-[10px] font-semibold text-[#334155] mb-0.5">
                    Search Results for
                  </p>
                  <h2 className="text-xl md:text-3xl font-bold text-[#087A3E] tracking-tight">
                    <span className="text-[#FF4D00]">“</span>{draft.keyword}<span className="text-[#FF4D00]">”</span>
                  </h2>
                  <p className="text-[9px] md:text-[10px] text-[#334155] mt-1.5 md:mt-2 font-medium leading-relaxed max-w-[90%]">
                    We found <span className="text-[#FF4D00] font-bold">{draft.kitchensCount} kitchens</span> serving delicious {draft.keyword} near you.
                  </p>
                </div>
              </div>

              {/* Content Layout */}
              <div className="p-3 md:p-5 flex gap-4 md:gap-5 flex-col md:flex-row">
                {/* Left Filters - Responsive Hidden */}
                <div className="hidden md:block w-32 xl:w-36 shrink-0">
                  <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#EEF1EF]">
                    <h4 className="font-bold text-xs text-[#111827]">Filters</h4>
                    <span className="text-[9px] text-[#FF4D00] font-semibold cursor-pointer">
                      Clear All
                    </span>
                  </div>

                  <div className="space-y-4">
                    {enabledFilters.map((filter, fi) => (
                      <div
                        key={filter.id ?? fi}
                        className={fi === 0 ? "" : "pt-3 border-t border-[#EEF1EF]"}
                      >
                        <div className="flex justify-between items-center text-[10px] font-bold text-[#111827] mb-2">
                          <span>{filter.name}</span>
                          <ChevronDown className="h-3 w-3 text-[#475569]" />
                        </div>
                        <div className="space-y-2">
                          {(filter.options.length ? filter.options : ["Option 1", "Option 2"]).slice(0, 5).map(
                            (option, oi) => {
                               const isChecked = fi === 0 && oi < 2; // Mock some checked states
                               return (
                                  <div
                                    key={`${option}-${oi}`}
                                    className="flex items-center gap-2 cursor-pointer group"
                                  >
                                    <div className={`w-3 h-3 rounded-[3px] border flex items-center justify-center transition-colors ${isChecked ? "bg-[#FF4D00] border-[#FF4D00]" : "bg-[#FFFFFF] border-[#CBD5E1] group-hover:border-[#FFB89A]"}`}>
                                      {isChecked && <Check className="h-2 w-2 text-[#FFFFFF]" />}
                                    </div>
                                    <span className="text-[10px] text-[#475569] font-medium group-hover:text-[#111827] transition-colors">
                                      {option}
                                    </span>
                                  </div>
                               )
                            }
                          )}
                        </div>
                      </div>
                    ))}
                    {enabledFilters.length === 0 && (
                      <p className="text-[10px] text-[#94A3B8] font-medium">
                        No active filters.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Products */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 mb-4 pb-2 border-b border-[#EEF1EF] text-[10px] font-bold">
                    <span className="text-[#111827]">
                      Showing 1 - {previewKitchens.length} of {previewKitchens.length} Kitchens
                    </span>
                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      <span className="text-[#475569] font-medium">Sort by:</span>
                      <div className="flex items-center gap-1 border border-[#DDE3E0] px-2 py-1 rounded-[7px] bg-[#FFFFFF] cursor-pointer hover:border-[#FFB89A]">
                        <span className="text-[#111827]">{draft.defaultSort}</span>
                        <ChevronDown className="h-3 w-3 text-[#475569]" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xl:gap-4">
                    {previewKitchens.map((kitchen, i) => {
                       const leftBadges = enabledBadges.filter((b) => b.position !== "right");
                       const rightBadges = enabledBadges.filter((b) => b.position === "right");
                       const badge = leftBadges[i % Math.max(leftBadges.length, 1)];
                       const rightBadge = rightBadges[i % Math.max(rightBadges.length, 1)];
                       let badgeClass = "text-[#FFFFFF] bg-[#FF4D00]"; // Default bestseller
                       if(badge) {
                          const nameLow = badge.name.toLowerCase();
                          if(nameLow.includes("top rated")) badgeClass = "text-[#FFFFFF] bg-[#087A3E]";
                          else if(nameLow.includes("new")) badgeClass = "text-[#FFFFFF] bg-[#7C3AED]";
                       }

                       // Find if the image was explicitly overridden in this draft
                       const override = draft.kitchenCards?.find(c => c.kitchenPartnerId === kitchen.id);
                       const displayImage = override?.imageUrl ?? kitchen.imageUrl;

                       return (
                          <div
                            key={kitchen.id}
                            className="border border-[#E5E7EB] rounded-[10px] bg-[#FFFFFF] shadow-[0_1px_3px_rgba(15,23,42,0.05)] hover:shadow-md transition-shadow flex flex-col group relative"
                          >
                            <div className="relative h-28 sm:h-24 overflow-hidden rounded-t-[9px] bg-[#F3F4F6]">
                              {displayImage ? (
                                <Image
                                  src={displayImage}
                                  fill
                                  sizes="(max-width: 640px) 100vw, 200px"
                                  className="object-cover transition-transform group-hover:scale-105"
                                  alt={kitchen.displayName}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full bg-[#FFF1EB]">
                                  <ChefHat className="h-6 w-6 text-[#FFB89A]" />
                                </div>
                              )}

                              {/* Kitchen Card Image Upload Button */}
                              <CloudinaryUpload
                                onUpload={(result) => {
                                  updateKitchenCard(kitchen.id, { imageUrl: result.secure_url });
                                }}
                              >
                                {({ uploading, startUpload }) => (
                                   <button
                                     onClick={(e) => { e.preventDefault(); e.stopPropagation(); startUpload(); }}
                                     disabled={uploading}
                                     className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 hover:text-[#FF4D00] shadow-sm p-1.5 rounded-[6px] z-20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                                     title="Change kitchen image for this search"
                                   >
                                     {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ImageIcon className="h-3 w-3" />}
                                   </button>
                                )}
                              </CloudinaryUpload>

                              {badge && (
                                <div className={`absolute top-2 left-2 text-[8px] font-bold px-1.5 py-0.5 rounded-[4px] shadow-sm ${badgeClass} z-10`}>
                                  {badge.name}
                                </div>
                              )}
                              
                              {rightBadge && (
                                <div className="absolute top-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded-[4px] shadow-sm text-[#FFFFFF] bg-[#00512F] z-10">
                                  {rightBadge.name}
                                </div>
                              )}
                              
                              <div className="absolute -bottom-3 left-2.5 w-8 h-8 rounded-full border-[1.5px] border-[#FFFFFF] overflow-hidden shadow-sm bg-[#FFF1EB] z-10 flex items-center justify-center text-[#FF4D00] font-bold text-xs">
                                {kitchen.displayName.charAt(0).toUpperCase()}
                                {kitchen.profileImage && <Image src={kitchen.profileImage} fill className="object-cover" alt="" />}
                              </div>
                            </div>
                            
                            <div className="p-3 pt-4 flex-1 flex flex-col">
                              <h5 className="font-bold text-[#111827] text-[11px] xl:text-xs leading-tight flex items-center gap-1 truncate">
                                <span className="truncate">{kitchen.displayName}</span>
                                <BadgeCheck className="h-3 w-3 xl:h-3.5 xl:w-3.5 text-[#087A3E] shrink-0" />
                              </h5>
                              
                              <div className="flex items-center gap-1 mt-1 mb-2 text-[#475569] text-[8px] xl:text-[9px] font-medium truncate">
                                 <span className="truncate">{kitchen.cuisineTags[0] || "South Indian"}</span>
                                 <span>·</span>
                                 <span className="truncate">{kitchen.cuisineTags[1] || "Homemade"}</span>
                              </div>

                              <div className="flex items-center gap-2 mb-2">
                                <div className="flex items-center gap-0.5 text-[#FF4D00]">
                                  <Star className="h-2 w-2 xl:h-2.5 xl:w-2.5 fill-[#FF4D00]" />
                                  <span className="text-[9px] xl:text-[10px] font-bold ml-0.5">
                                    {kitchen.avgRating > 0 ? kitchen.avgRating.toFixed(1) : "NEW"}
                                  </span>
                                </div>
                                <span className="text-[8px] xl:text-[9px] text-[#64748B] font-medium">
                                  ({kitchen.totalReviews.toLocaleString()})
                                </span>
                              </div>
                              
                              <div className="flex items-center justify-between text-[8px] xl:text-[9px] font-medium text-[#475569] mt-auto pt-2 border-t border-[#EEF1EF]">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-2.5 w-2.5 xl:h-3 xl:w-3 text-[#475569]" /> {kitchen.estimatedPrepTime ?? 25}-{kitchen.estimatedPrepTime ? kitchen.estimatedPrepTime + 15 : 40} mins
                                </div>
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-2.5 w-2.5 xl:h-3 xl:w-3 text-[#475569]" /> 2.1 km
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between mt-2.5">
                                <div className="flex items-center gap-1 text-[7px] xl:text-[8px] font-bold text-[#087A3E] bg-[#F0FAF3] px-1.5 py-1 rounded-[4px] border border-[#CFE9D8]">
                                  <ShieldCheck className="h-2.5 w-2.5" /> 100% Hygienic
                                </div>
                                <Button
                                  variant="outline"
                                  className="h-5 xl:h-6 text-[8px] xl:text-[9px] px-1.5 xl:px-2 font-bold text-[#FF4D00] border-[#FF8F6B] hover:bg-[#FFF1EB] hover:text-[#FF4D00] rounded-[4px] xl:rounded-[6px] shadow-none"
                                >
                                  View Menu
                                </Button>
                              </div>
                            </div>
                          </div>
                       )
                    })}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center mt-6 mb-4">
                     <Pagination>
                       <PaginationContent className="flex-wrap justify-center gap-1">
                         <PaginationItem>
                           <PaginationPrevious href="#" className="h-6 w-6 xl:h-7 xl:w-7 text-[#64748B] border border-[#E5E7EB] bg-[#FFFFFF] rounded-[7px] p-0 flex items-center justify-center opacity-50 hover:bg-[#F3F4F6]" />
                         </PaginationItem>
                         <PaginationItem>
                           <PaginationLink href="#" isActive className="h-6 w-6 xl:h-7 xl:w-7 bg-[#FF4D00] text-[#FFFFFF] border border-[#FF4D00] rounded-[7px] font-bold text-[10px] xl:text-[11px] flex items-center justify-center hover:bg-[#FF4D00] hover:text-[#FFFFFF]">1</PaginationLink>
                         </PaginationItem>
                         <PaginationItem>
                           <PaginationLink href="#" className="h-6 w-6 xl:h-7 xl:w-7 bg-[#FFFFFF] text-[#334155] border border-[#E5E7EB] rounded-[7px] font-bold text-[10px] xl:text-[11px] flex items-center justify-center hover:bg-[#F3F4F6]">2</PaginationLink>
                         </PaginationItem>
                         <PaginationItem className="hidden sm:inline-block">
                           <PaginationLink href="#" className="h-6 w-6 xl:h-7 xl:w-7 bg-[#FFFFFF] text-[#334155] border border-[#E5E7EB] rounded-[7px] font-bold text-[10px] xl:text-[11px] flex items-center justify-center hover:bg-[#F3F4F6]">3</PaginationLink>
                         </PaginationItem>
                         <PaginationItem>
                           <PaginationEllipsis className="h-6 w-6 xl:h-7 xl:w-7 flex items-center justify-center text-[#64748B]" />
                         </PaginationItem>
                         <PaginationItem>
                           <PaginationLink href="#" className="h-6 w-6 xl:h-7 xl:w-7 bg-[#FFFFFF] text-[#334155] border border-[#E5E7EB] rounded-[7px] font-bold text-[10px] xl:text-[11px] flex items-center justify-center hover:bg-[#F3F4F6]">6</PaginationLink>
                         </PaginationItem>
                         <PaginationItem>
                           <PaginationNext href="#" className="h-6 w-6 xl:h-7 xl:w-7 text-[#64748B] border border-[#E5E7EB] bg-[#FFFFFF] rounded-[7px] p-0 flex items-center justify-center hover:bg-[#F3F4F6]" />
                         </PaginationItem>
                       </PaginationContent>
                     </Pagination>
                  </div>
                </div>
              </div>

              {/* Bottom Info Bar mock */}
              <div className="border-t border-[#EEF1EF] bg-[#FFFFFF] py-4 mt-2">
                <div className="flex flex-wrap justify-center gap-x-6 lg:gap-x-8 gap-y-4 max-w-5xl mx-auto px-4">
                  {enabledInfoItems.length ? (
                    enabledInfoItems.map((item, i) => {
                      const IconComp = INFO_ICON_MAP[item.icon] ?? Heart;
                      const isGreen = ["ShieldCheck", "Leaf"].includes(item.icon);
                      const iconColor = isGreen ? "text-[#087A3E]" : "text-[#FF4D00]";
                      return (
                        <div key={item.id ?? i} className="flex items-center gap-1.5 md:gap-2">
                          <IconComp className={`h-4 w-4 md:h-5 md:w-5 ${iconColor}`} />
                          <div className="flex flex-col">
                            <span className="text-[9px] md:text-[10px] font-bold text-[#111827]">
                              {item.title}
                            </span>
                            <span className="text-[7px] md:text-[8px] text-[#64748B] font-medium mt-0.5 max-w-[80px] md:max-w-none truncate">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[10px] text-[#94A3B8] font-medium py-2">
                      No info items enabled.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

}

/* ======================================================================
   DASHBOARD / PAGE
   ====================================================================== */

export default function SearchPageContent() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSearchPageRow | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addKeyword, setAddKeyword] = useState("");
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

  const {
    data: contents = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["admin-search-page"],
    queryFn: getSearchPageContents,
    refetchInterval: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: ({ keyword }: { keyword: string }) => createSearchPageContent({ keyword }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to create content");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["admin-search-page"] });
      toast.success("Search content created");
      setAddDialogOpen(false);
      setAddKeyword("");
      if (res.id) setEditingId(res.id);
    },
    onError: () => toast.error("Failed to create content"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteSearchPageContent(id),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to delete");
        setDeleteTarget(null);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["admin-search-page"] });
      toast.success("Search content deleted");
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete");
      setDeleteTarget(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleSearchPageContent(id, isActive),
    onMutate: ({ id }) => setPendingToggleId(id),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to update status");
      } else {
        queryClient.invalidateQueries({ queryKey: ["admin-search-page"] });
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
        (statusFilter === "Active" && c.isActive) ||
        (statusFilter === "Inactive" && !c.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [contents, searchTerm, statusFilter]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === "Latest") arr.sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
    if (sortBy === "Oldest") arr.sort((a, b) => +new Date(a.updatedAt) - +new Date(b.updatedAt));
    if (sortBy === "A-Z") arr.sort((a, b) => a.keyword.localeCompare(b.keyword));
    if (sortBy === "Kitchens") arr.sort((a, b) => b.kitchensCount - a.kitchensCount);
    return arr;
  }, [filtered, sortBy]);

  const stats = useMemo(() => {
    return {
      total: contents.length,
      live: contents.filter((c) => c.isActive).length,
      recentlyUpdated: contents.filter((c) => +new Date(c.updatedAt) >= WEEK_START).length,
      totalFilters: contents.reduce((sum, c) => sum + c.filtersCount, 0),
    };
  }, [contents]);

  const columnHelper = createColumnHelper<AdminSearchPageRow>();

  const columns = useMemo(() => [
    columnHelper.accessor("keyword", {
      header: "Search Keyword",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2">
            {row.isActive && (
              <div className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
            )}
            <div className="flex flex-col">
              <span className="font-semibold text-[#166534] capitalize">
                {row.keyword}
              </span>
              {row.keyword === "default" && (
                <span className="text-xs text-[#94A3B8]">
                  Fallback search page
                </span>
              )}
            </div>
          </div>
        );
      },
    }),
    columnHelper.accessor("bannerImageUrl", {
      header: "Banner Preview",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="w-[120px] h-[40px] rounded-[10px] overflow-hidden relative border border-[#E5E7EB] bg-gray-50">
            {row.keyword === "default" ? (
              <div className="absolute inset-0 bg-[#FFF3EC] flex flex-col items-center justify-center">
                <span className="text-[#F4511E] font-bold italic text-[10px]">
                  RRC Kitchen
                </span>
              </div>
            ) : row.bannerImageUrl ? (
              <Image
                src={row.bannerImageUrl}
                alt={row.keyword}
                fill
                sizes="120px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-[#FFF3EC] flex flex-col items-center justify-center">
                <span className="text-[#F4511E] font-bold italic text-[10px]">
                  RRC Kitchen
                </span>
              </div>
            )}
          </div>
        );
      },
    }),
    columnHelper.accessor("filtersCount", {
      header: "Filters",
      cell: (info) => {
        const count = info.getValue();
        return (
          <div className="flex flex-row items-center gap-2">
            <span className="text-sm font-medium text-[#334155]">
              {count} filters
            </span>
            {count > 0 && (
              <Badge variant="outline" className="bg-[#ECFDF3] text-[#15803D] border-[#D1FAE5] px-2 py-0 h-5 text-[11px] rounded-[7px]">
                Modified
              </Badge>
            )}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: "section",
      header: "Section",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-1.5 flex-wrap max-w-[140px]">
            <Badge variant="outline" className="bg-[#FFF3EC] text-[#F4511E] border-[#FED7C3] px-2 py-0 h-5 text-[11px] gap-1 rounded-[7px]">
              <Tag className="h-3 w-3" />
              {row.badgesCount}
            </Badge>
            <Badge variant="outline" className="bg-[#EFF6FF] text-[#2563EB] border-[#DBEAFE] px-2 py-0 h-5 text-[11px] gap-1 rounded-[7px]">
              <Info className="h-3 w-3" />
              {row.infoItemsCount}
            </Badge>
          </div>
        );
      },
    }),
    columnHelper.accessor("kitchensCount", {
      header: "Kitchens",
      cell: (info) => (
        <span className="text-sm font-medium text-[#334155]">
          {info.getValue()} kitchens
        </span>
      ),
    }),
    columnHelper.accessor("isActive", {
      header: "Status",
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <Switch
              checked={row.isActive}
              disabled={pendingToggleId === row.id}
              onCheckedChange={(checked) =>
                toggleMutation.mutate({ id: row.id, isActive: checked })
              }
              className={row.isActive ? "data-[state=checked]:bg-[#15803D]" : ""}
            />
            <Badge
              variant="outline"
              className={
                row.isActive
                  ? "bg-[#ECFDF3] text-[#15803D] border-[#D1FAE5] px-2 py-0 h-5 text-[11px] rounded-[7px]"
                  : "bg-gray-100 text-gray-500 border-gray-200 px-2 py-0 h-5 text-[11px] rounded-[7px]"
              }
            >
              {row.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
        );
      },
    }),
    columnHelper.accessor("updatedBy", {
      header: "Updated By",
      cell: (info) => (
        <span className="text-sm font-medium text-[#334155]">
          {info.getValue() ?? "Admin"}
        </span>
      ),
    }),
    columnHelper.accessor("updatedAt", {
      header: "Updated At",
      cell: (info) => (
        <span className="text-sm text-[#64748B]">
          {formatDateStats(info.getValue())}
        </span>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: () => <div className="text-right w-full">Actions</div>,
      cell: (info) => {
        const row = info.row.original;
        return (
          <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingId(row.id)}
              className="h-8 border-[#9BD5B2] text-[#15803D] hover:bg-[#F0FDF4] hover:border-[#15803D] hover:text-[#15803D] px-3 flex gap-1 font-medium rounded-[8px]"
            >
              <Pencil className="h-3.5 w-3.5" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteTarget(row)}
              className="h-8 w-8 p-0 border-[#FCA5A5] text-[#EF4444] hover:bg-[#FEF2F2] hover:border-[#FCA5A5] hover:text-[#EF4444] shrink-0 rounded-[8px]"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    }),
  ], [pendingToggleId, toggleMutation, columnHelper]);

  const table = useReactTable({
    data: sorted,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    state: {
      pagination,
    },
  });

  const onSubmitAdd = () => {
    if (!addKeyword.trim()) {
      toast.error("Keyword is required");
      return;
    }
    createMutation.mutate({ keyword: addKeyword.trim() });
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
      <div className="min-h-screen bg-[#FFFFFF] p-6 md:p-8 max-w-[1400px] mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-[#EF4444]" />
          <p className="text-[#EF4444] font-semibold">Failed to load search page content</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RotateCcw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300 text-[#111827]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-[#FFF1EA] h-16 w-16 rounded-[16px] flex items-center justify-center">
            <Search className="h-8 w-8 text-[#F4511E]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#111827]">
              Search Page Content
            </h1>
            <p className="text-sm text-[#475569] mt-0.5">
              Manage search page content, images and filters that customers see
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-[#86CFA6] text-[#166534] hover:bg-[#F0FDF4] hover:text-[#166534] hover:border-[#15803D] font-medium h-10 bg-[#FFFFFF] shadow-none rounded-[8px]"
            onClick={() => window.open("/search", "_blank")}
          >
            <Eye className="mr-2 h-4 w-4 text-[#15803D]" />
            Preview Live Page
          </Button>
          <Button
            className="bg-[#F4511E] hover:bg-[#EA3F0C] text-[#FFFFFF] font-medium h-10 shadow-none border-none rounded-[8px]"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4 text-[#FFFFFF]" />
            Add New Search Content
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-[#FFFFFF] border-[#E5E7EB] rounded-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-[#FFF0E8] border border-[#FDE2D3] p-3 rounded-[10px] mt-0.5">
                <Layers className="h-6 w-6 text-[#F4511E]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#64748B]">Total Search Contents</p>
                <h3 className="text-3xl font-bold text-[#F4511E] mt-1">{stats.total}</h3>
                <p className="text-xs text-[#94A3B8] mt-1">Active search configurations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFFFF] border-[#E5E7EB] rounded-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-[#EAF8EF] border border-[#D9F0E1] p-3 rounded-[10px] mt-0.5">
                <CheckCircle2 className="h-6 w-6 text-[#15803D]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#64748B]">Live on Website</p>
                <h3 className="text-3xl font-bold text-[#15803D] mt-1">{stats.live}</h3>
                <p className="text-xs text-[#94A3B8] mt-1">Currently visible to users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFFFF] border-[#E5E7EB] rounded-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-[#EDF4FF] border border-[#DCE8FA] p-3 rounded-[10px] mt-0.5">
                <History className="h-6 w-6 text-[#2563EB]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#64748B]">Recently Updated</p>
                <h3 className="text-3xl font-bold text-[#2563EB] mt-1">{stats.recentlyUpdated}</h3>
                <p className="text-xs text-[#94A3B8] mt-1">In last 7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#FFFFFF] border-[#E5E7EB] rounded-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.04)]">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-[#F3EDFF] border border-[#E9DFFF] p-3 rounded-[10px] mt-0.5">
                <Filter className="h-6 w-6 text-[#7C3AED]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#64748B]">Total Filters Used</p>
                <h3 className="text-3xl font-bold text-[#7C3AED] mt-1">{stats.totalFilters}</h3>
                <p className="text-xs text-[#94A3B8] mt-1">Across all search contents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Section */}
      <Card className="bg-[#FFFFFF] border-[#E5E7EB] rounded-[12px] shadow-[0_1px_3px_rgba(15,23,42,0.035)] overflow-hidden">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-[#E5E7EB] bg-white flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#EFF6FF] p-2.5 rounded-[10px]">
              <List className="h-5 w-5 text-[#2563EB]" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Search Content History</h2>
              <p className="text-sm text-[#475569]">
                View and manage all search page configurations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#64748B]" />
              <Input
                placeholder="Search by keyword..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  table.setPageIndex(0);
                }}
                className="pl-9 h-10 bg-[#FFFFFF] border-[#DDE3EA] text-[#334155] placeholder:text-[#94A3B8] rounded-[8px]"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-32 h-10 bg-[#FFFFFF] border-[#DDE3EA] text-[#334155] font-medium rounded-[8px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={sortBy}
              onValueChange={(v) => {
                setSortBy(v);
                table.setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-36 h-10 bg-[#FFFFFF] border-[#DDE3EA] text-[#334155] font-medium rounded-[8px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Latest">Sort: Latest</SelectItem>
                <SelectItem value="Oldest">Sort: Oldest</SelectItem>
                <SelectItem value="A-Z">Sort: A–Z</SelectItem>
                <SelectItem value="Kitchens">Sort: Kitchens</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              className="h-10 text-[#64748B] hover:text-[#111827] rounded-[8px]"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setSortBy("Latest");
                table.setPageIndex(0);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Table */}
        <ScrollArea className="bg-[#FFFFFF] w-full">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b-[#E5E7EB] bg-[#FCFDFE] hover:bg-[#FCFDFE]">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-12 font-semibold text-[#334155] text-[13px] tracking-wider py-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
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
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b-[#EEF1F4] bg-[#FFFFFF] hover:bg-[#FAFCFB] transition-colors cursor-pointer"
                    onClick={() => setEditingId(row.original.id)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-[#94A3B8]">
                    No search content found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>

        {/* Pagination & Footer */}
        <div className="p-4 border-t border-[#E5E7EB] bg-[#FFFFFF] flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#475569]">
          <div className="flex items-center gap-2">
            <div className="bg-[#EFF6FF] p-1.5 rounded-[6px] text-[#2563EB]">
              <FileText className="h-4 w-4" />
            </div>
            <span className="font-medium text-[#475569]">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{" "}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                sorted.length
              )}{" "}
              of {sorted.length} entries
            </span>
            <div className="flex items-center gap-2 ml-4">
              <span className="text-xs text-[#94A3B8]">Rows</span>
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(v) => table.setPageSize(Number(v))}
              >
                <SelectTrigger className="h-8 w-16 bg-[#FFFFFF] border-[#DDE3EA] rounded-[8px] text-[#334155]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-1">
             <Pagination>
               <PaginationContent className="gap-1">
                 <PaginationItem>
                   <Button
                     variant="outline"
                     size="icon"
                     className="h-8 w-8 rounded-[8px] border-[#E2E8F0] bg-[#FFFFFF] text-[#64748B] hover:text-[#111827] shadow-none disabled:opacity-50"
                     onClick={(e) => { e.preventDefault(); table.previousPage(); }}
                     disabled={!table.getCanPreviousPage()}
                   >
                     <ChevronLeft className="h-4 w-4" />
                   </Button>
                 </PaginationItem>
                 
                 {table.getPageOptions().slice(0, 5).map((pageIdx) => {
                   const isActive = pageIdx === table.getState().pagination.pageIndex;
                   return (
                     <PaginationItem key={pageIdx}>
                       <PaginationLink
                         href="#"
                         onClick={(e) => { e.preventDefault(); table.setPageIndex(pageIdx); }}
                         className={`h-8 w-8 rounded-[8px] font-medium text-[13px] flex items-center justify-center border transition-colors ${
                           isActive 
                             ? "bg-[#F4511E] text-[#FFFFFF] border-[#F4511E] hover:bg-[#F4511E] hover:text-[#FFFFFF]" 
                             : "bg-[#FFFFFF] text-[#334155] border-[#E2E8F0] hover:bg-[#F8FAFC]"
                         }`}
                       >
                         {pageIdx + 1}
                       </PaginationLink>
                     </PaginationItem>
                   );
                 })}
                 
                 {table.getPageCount() > 5 && (
                   <PaginationItem>
                     <PaginationEllipsis className="h-8 w-8 text-[#64748B]" />
                   </PaginationItem>
                 )}

                 <PaginationItem>
                   <Button
                     variant="outline"
                     size="icon"
                     className="h-8 w-8 rounded-[8px] border-[#E2E8F0] bg-[#FFFFFF] text-[#64748B] hover:text-[#111827] shadow-none disabled:opacity-50"
                     onClick={(e) => { e.preventDefault(); table.nextPage(); }}
                     disabled={!table.getCanNextPage()}
                   >
                     <ChevronRight className="h-4 w-4" />
                   </Button>
                 </PaginationItem>
               </PaginationContent>
             </Pagination>
          </div>
        </div>
      </Card>
      
      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="max-w-md rounded-[12px]">
          <DialogHeader>
            <DialogTitle>Add Search Page Content</DialogTitle>
            <DialogDescription>
              Create a new search configuration for a specific keyword.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#111827]">
                Search Keyword
              </label>
              <Input
                placeholder="e.g. biryani, pizza, sweet"
                value={addKeyword}
                onChange={(e) => setAddKeyword(e.target.value)}
                className="border-[#DDE3EA] rounded-[8px]"
                onKeyDown={(e) => {
                  if (e.key === "Enter") onSubmitAdd();
                }}
              />
              <p className="text-xs text-[#64748B]">
                This will trigger when users search for this exact term.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
              className="rounded-[8px]"
            >
              Cancel
            </Button>
            <Button
              onClick={onSubmitAdd}
              disabled={createMutation.isPending || !addKeyword.trim()}
              className="bg-[#F4511E] text-[#FFFFFF] hover:bg-[#EA3F0C] rounded-[8px]"
            >
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <AlertDialogContent className="rounded-[12px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the search configuration for &quot;
              <span className="font-semibold text-[#111827]">
                {deleteTarget?.keyword}
              </span>
              &quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-[8px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-[#EF4444] text-[#FFFFFF] hover:bg-[#DC2626] rounded-[8px]"
              disabled={deleteMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#FFFFFF] p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-16 w-16 rounded-[16px]" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded-md" />
            <Skeleton className="h-4 w-72 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-40 rounded-[8px]" />
          <Skeleton className="h-10 w-48 rounded-[8px]" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-[#E5E7EB] shadow-[0_1px_3px_rgba(15,23,42,0.04)] bg-[#FFFFFF] rounded-[12px]">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-[10px]" />
                <div className="flex-1 space-y-2 pt-0.5">
                  <Skeleton className="h-3 w-32 rounded-md" />
                  <Skeleton className="h-8 w-16 rounded-md" />
                  <Skeleton className="h-3 w-36 rounded-md" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="shadow-[0_1px_3px_rgba(15,23,42,0.035)] border-[#E5E7EB] rounded-[12px] overflow-hidden bg-[#FFFFFF]">
        <div className="p-5 border-b border-[#E5E7EB] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-[10px]" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-4 w-72 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64 rounded-[8px]" />
            <Skeleton className="h-10 w-32 rounded-[8px]" />
            <Skeleton className="h-10 w-36 rounded-[8px]" />
          </div>
        </div>
        <ScrollArea className="bg-[#FFFFFF] w-full">
          <Table>
            <TableHeader>
              <TableRow className="border-b-[#E5E7EB] bg-[#FCFDFE]">
                {Array.from({ length: 7 }).map((_, i) => (
                  <TableHead key={i} className="h-12">
                    <Skeleton className="h-3.5 w-20 rounded-md" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b-[#EEF1F4]">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-2.5 w-2.5 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-20 rounded-md" />
                        <Skeleton className="h-3 w-12 rounded-md" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-[40px] w-[120px] rounded-[10px]" />
                  </TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-[7px]" /></TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-12 rounded-[7px]" />
                      <Skeleton className="h-5 w-12 rounded-[7px]" />
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-20 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-24 rounded-[7px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20 rounded-md" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 rounded-md" /></TableCell>
                  <TableCell className="text-right flex justify-end gap-2">
                    <Skeleton className="h-8 w-16 rounded-[8px]" />
                    <Skeleton className="h-8 w-8 rounded-[8px]" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </Card>
    </div>
  );
}

function formatDateStats(iso: string) {
  try {
    return format(new Date(iso), "dd MMM yyyy, hh:mm a");
  } catch {
    return iso;
  }
}
