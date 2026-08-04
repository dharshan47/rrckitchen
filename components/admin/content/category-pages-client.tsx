"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ExternalLink,
  Save,
  FileEdit,
  Layout,
  Settings as SettingsIcon,
  X,
  GripVertical,
  ChefHat,
  ShieldCheck,
  Leaf,
  Heart,
  Trash2,
  Edit2,
  CheckCircle2,
  Monitor,
  Tablet,
  Smartphone,
  Star,
  Clock,
  MapPin,
  ChevronRight,
  Plus,
  Search,
  Eye,
  Layers,
  History,
  List,
  Loader2,
  RotateCcw,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Upload,
  Users,
  Tag,
  Info,
  Check,
  ChevronUp,
  ChevronsUpDown,
  ChevronLeft,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { toast } from "sonner";
import { CloudinaryUpload } from "@/components/patterns/cloudinary-upload";
import Image from "next/image";

import {
  getCategoryOptions,
  getCategoryPageContents,
  getCategoryPageContent,
  getCategoryPreviewKitchens,
  createCategoryPageContent,
  saveCategoryPageContent,
  deleteCategoryPageContent,
  toggleCategoryPageContent,
  type AdminCategoryPageRow,
  type AdminCategoryOption,
  type AdminCategoryPreviewKitchen,
} from "@/actions/admin/category-pages";

import {
  useCategoryPageEditorDraft,
  useCategoryPageEditorDirty,
  useCategoryPageEditorActions,
  toCategoryPageSaveInput,
} from "@/stores/categoryPageEditorStore";

const WEEK_START = Date.now() - 7 * 24 * 60 * 60 * 1000;

const FEATURE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ChefHat,
  ShieldCheck,
  Leaf,
  Heart,
  Users,
  Clock,
  Star,
  Tag,
  Info,
  TrendingUp,
  HelpCircle,
};

const COLOR_OPTIONS = [
  { value: "text-orange-500", label: "Orange" },
  { value: "text-emerald-500", label: "Emerald" },
  { value: "text-green-500", label: "Green" },
  { value: "text-blue-500", label: "Blue" },
  { value: "text-pink-500", label: "Pink" },
  { value: "text-purple-500", label: "Purple" },
  { value: "text-red-500", label: "Red" },
  { value: "text-slate-600", label: "Slate" },
];

/* ===================================================================
   SKELETONS — exact shape with animation
   =================================================================== */

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-60 rounded-md" />
            <Skeleton className="h-4 w-80 rounded-md" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-10 w-40 rounded-md" />
          <Skeleton className="h-10 w-52 rounded-md" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-gray-100/80 shadow-sm bg-white">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Skeleton className="h-12 w-12 rounded-lg" />
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

      <Card className="shadow-sm border-gray-200/60 overflow-hidden bg-white">
        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-48 rounded-md" />
              <Skeleton className="h-4 w-72 rounded-md" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-64 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-36 rounded-md" />
          </div>
        </div>
        <div className="overflow-x-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b-gray-100 bg-gray-50/50">
                {Array.from({ length: 8 }).map((_, i) => (
                  <TableHead key={i} className="h-12">
                    <Skeleton className="h-3.5 w-20 rounded-md" />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-b-gray-100">
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-2 w-2 rounded-full" />
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-20 rounded-md" />
                        <Skeleton className="h-3 w-12 rounded-md" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-[52px] w-[170px] rounded-md" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-10 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="p-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Skeleton className="h-4 w-64 rounded-md" />
          <div className="flex items-center gap-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-8 rounded-md" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

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
        <div className="lg:col-span-8 space-y-6">
          {[0, 1].map((i) => (
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

        <div className="lg:col-span-4 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden h-[calc(100vh-140px)]">
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
   IMAGE UPLOAD FIELD — Cloudinary upload + URL input
   ====================================================================== */

function ImageUploadField({
  value,
  onChange,
  label,
  aspectClass = "aspect-[16/9]",
  hint,
}: {
  value: string;
  onChange: (url: string) => void;
  label: string;
  aspectClass?: string;
  hint?: string;
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
          className="h-9 text-sm flex-1 bg-white border-slate-200"
        />
        <Button
          type="button"
          variant="outline"
          className="h-9 text-xs border-[#10b981]/30 text-[#10b981] hover:bg-[#10b981]/5"
          onClick={() => draft.trim() && onChange(draft.trim())}
        >
          <Check className="h-4 w-4 mr-1" /> Apply
        </Button>
      </div>

      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <div className={`${aspectClass} bg-slate-100 relative group`}>
          {value ? (
            <Image src={value} alt={label} fill className="object-cover" unoptimized />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Upload className="h-6 w-6" />
              <span className="text-xs font-medium">No image uploaded</span>
            </div>
          )}
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black text-white rounded-full p-1 h-6 w-6 flex items-center justify-center backdrop-blur-sm transition-colors"
              aria-label="Remove image"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="p-3 bg-white border-t border-slate-200 flex justify-center">
          <CloudinaryUpload
            onUpload={(result) => {
              onChange(result.secure_url);
              setDraft(result.secure_url);
              toast.success(`${label} uploaded`);
            }}
          >
            {({ uploading, startUpload }) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/5"
                onClick={startUpload}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4 mr-2" />
                )}
                {uploading ? "Uploading..." : "Upload Image"}
              </Button>
            )}
          </CloudinaryUpload>
        </div>
      </div>
      {hint && <p className="text-[10px] text-slate-400 text-center">{hint}</p>}
    </div>
  );
}

/* ======================================================================
   EDITOR VIEW
   ====================================================================== */

interface EditorProps {
  contentId: string;
  onCancel: () => void;
  onOpenContent: (id: string) => void;
}

function Editor({ contentId, onCancel, onOpenContent }: EditorProps) {
  const queryClient = useQueryClient();
  const draft = useCategoryPageEditorDraft();
  const dirty = useCategoryPageEditorDirty();
  const {
    openEditor,
    updateDraft,
    updateFeature,
    addFeature,
    removeFeature,
    moveFeature,
    updateOffer,
    addOffer,
    removeOffer,
    updateFaq,
    addFaq,
    removeFaq,
    markSaved,
  } = useCategoryPageEditorActions();

  const [previewDevice, setPreviewDevice] = useState("Desktop");

  const { data: detail, isFetching, isError, refetch } = useQuery({
    queryKey: ["admin-category-page-detail", contentId],
    queryFn: () => getCategoryPageContent(contentId),
    enabled: !!contentId,
    staleTime: 60_000,
  });

  const { data: categories = [] } = useQuery<AdminCategoryOption[]>({
    queryKey: ["admin-category-options"],
    queryFn: getCategoryOptions,
    staleTime: 60_000,
  });

  const { data: contents = [] } = useQuery<AdminCategoryPageRow[]>({
    queryKey: ["admin-category-page"],
    queryFn: getCategoryPageContents,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
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
      return saveCategoryPageContent(draft.id, toCategoryPageSaveInput(draft));
    },
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to save changes");
        return;
      }
      markSaved();
      queryClient.invalidateQueries({ queryKey: ["admin-category-page"] });
      queryClient.invalidateQueries({ queryKey: ["admin-category-page-detail", contentId] });
      toast.success(`"${draft?.title ?? "Category page"}" changes saved`);
      onCancel();
    },
    onError: () => toast.error("Failed to save changes"),
  });

  const previewCategoryName = draft?.categoryName ?? "";
  const { data: previewKitchens = [] } = useQuery<AdminCategoryPreviewKitchen[]>({
    queryKey: ["admin-category-page-kitchens", previewCategoryName.toLowerCase()],
    queryFn: () => getCategoryPreviewKitchens(previewCategoryName),
    enabled: !!previewCategoryName,
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
          <p className="text-red-500 font-semibold">Failed to load category page content</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RotateCcw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!draft) return <EditorSkeleton />;

  const handleCategoryChange = (categoryId: string) => {
    if (categoryId === draft.categoryId) return;
    const target = contents.find((c) => c.categoryId === categoryId);
    if (!target) {
      toast.info("This category has no managed page yet. Create one from the list view.");
      return;
    }
    onOpenContent(target.id);
  };

  const liveUrl = `/categories/${draft.slug}`;
  const enabledFeatures = draft.features.filter((f) => f.isEnabled);
  const enabledOffers = draft.offers.filter((o) => o.isEnabled);

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Category Slug Page Editor
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage everything customers see at{" "}
            <span className="font-semibold text-[#10b981]">/categories/{draft.slug}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {dirty && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 animate-in fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Unsaved changes
            </span>
          )}
          <Button
            variant="outline"
            className="text-slate-700 h-10 border-slate-200 bg-white shadow-sm hover:bg-slate-50"
            onClick={onCancel}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back
          </Button>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm font-medium border border-[#10b981] text-[#10b981] hover:bg-[#10b981]/5 transition-colors bg-white shadow-sm"
          >
            View Live Page <ExternalLink className="h-4 w-4" />
          </a>
          <Button
            className="h-10 bg-[#10b981] hover:bg-[#059669] text-white shadow-sm shadow-[#10b981]/20"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !dirty}
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Category selector + tabs */}
      <Tabs defaultValue="page-content" className="w-full">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 bg-white rounded-xl border border-slate-200 shadow-sm p-3">
          <div className="flex items-center gap-2 px-2">
            <span className="text-sm text-slate-500 whitespace-nowrap">Select Category</span>
            <Select value={draft.categoryId} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-9 w-[200px] border-slate-200 bg-white font-semibold text-slate-900">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <TabsList className="bg-slate-100 h-10 w-full lg:w-auto">
            <TabsTrigger value="page-content" className="gap-1.5 text-sm">
              <FileEdit className="h-4 w-4" /> Page Content
            </TabsTrigger>
            <TabsTrigger value="features" className="gap-1.5 text-sm">
              <Layers className="h-4 w-4" /> Features
            </TabsTrigger>
            <TabsTrigger value="offers" className="gap-1.5 text-sm">
              <Tag className="h-4 w-4" /> Offers
            </TabsTrigger>
            <TabsTrigger value="faqs" className="gap-1.5 text-sm">
              <HelpCircle className="h-4 w-4" /> FAQs
            </TabsTrigger>
            <TabsTrigger value="seo" className="gap-1.5 text-sm">
              <SettingsIcon className="h-4 w-4" /> SEO & Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* LEFT SIDE - SETTINGS */}
        <div className="flex-1 min-w-0 space-y-6">
          <TabsContent value="page-content" className="mt-0 space-y-6">
            {/* Hero Section Card */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Hero Section</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Banner, icon and intro content shown at the top of the category page
                </p>
              </div>
              <div className="p-5 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Hero Layout */}
                  <div className="md:col-span-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Hero Layout</p>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "LEFT_TEXT", label: "Left Text" },
                        { value: "CENTER_TEXT", label: "Center Text" },
                        { value: "RIGHT_TEXT", label: "Right Text" },
                        { value: "FULL_WIDTH", label: "Full Width" },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateDraft({ heroLayout: opt.value })}
                          className={`rounded-lg p-3 flex flex-col items-center justify-center gap-2 aspect-[4/3] transition-all ${
                            draft.heroLayout === opt.value
                              ? "border-2 border-[#10b981] bg-[#10b981]/5 text-[#10b981]"
                              : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                        >
                          <div
                            className={`w-8 h-6 rounded flex items-center p-1 ${
                              draft.heroLayout === opt.value
                                ? "bg-white border border-[#10b981]"
                                : "bg-white border border-slate-200"
                            } ${
                              opt.value === "LEFT_TEXT"
                                ? ""
                                : opt.value === "CENTER_TEXT"
                                ? "justify-center"
                                : opt.value === "RIGHT_TEXT"
                                ? "justify-end"
                                : "justify-center flex-col"
                            }`}
                          >
                            {opt.value === "FULL_WIDTH" ? (
                              <>
                                <div className="w-4 h-1 bg-slate-300 rounded-sm mb-1"></div>
                                <div className="w-6 h-1 bg-slate-300 rounded-sm"></div>
                              </>
                            ) : (
                              <div
                                className={`w-2 h-2 rounded-sm ${
                                  draft.heroLayout === opt.value ? "bg-[#10b981]" : "bg-slate-300"
                                }`}
                              ></div>
                            )}
                          </div>
                          <span className="text-xs font-semibold">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Desktop Banner */}
                  <div className="md:col-span-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Desktop Banner Image</p>
                    <ImageUploadField
                      label="Desktop banner"
                      value={draft.desktopBannerUrl}
                      onChange={(url) => updateDraft({ desktopBannerUrl: url })}
                      hint="Recommended: 1600x600px"
                    />
                  </div>

                  {/* Mobile Banner */}
                  <div className="md:col-span-4">
                    <p className="text-sm font-semibold text-slate-700 mb-3">Mobile Banner Image</p>
                    <ImageUploadField
                      label="Mobile banner"
                      value={draft.mobileBannerUrl}
                      onChange={(url) => updateDraft({ mobileBannerUrl: url })}
                      hint="Recommended: 800x600px"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Category Icon */}
                  <div className="md:col-span-2 flex flex-col items-center">
                    <p className="text-sm font-semibold text-slate-700 mb-3 self-start">Category Icon</p>
                    <div className="relative mb-3 mt-2">
                      <div className="h-20 w-20 rounded-full bg-[#10b981] flex items-center justify-center text-white border-4 border-white shadow-md overflow-hidden">
                        {draft.iconUrl ? (
                          <Image src={draft.iconUrl} alt="Category icon" fill className="object-cover" unoptimized />
                        ) : (
                          <ChefHat className="h-9 w-9" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => updateDraft({ iconUrl: "" })}
                        className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-[#10b981] hover:bg-slate-50"
                        aria-label="Remove icon"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                    <CloudinaryUpload
                      onUpload={(result) => {
                        updateDraft({ iconUrl: result.secure_url });
                        toast.success("Category icon uploaded");
                      }}
                    >
                      {({ uploading, startUpload }) => (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/5 rounded-full px-3"
                          onClick={startUpload}
                          disabled={uploading}
                        >
                          {uploading ? (
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                          ) : (
                            <Edit2 className="h-3 w-3 mr-1" />
                          )}
                          {uploading ? "Uploading..." : "Upload Icon"}
                        </Button>
                      )}
                    </CloudinaryUpload>
                  </div>

                  {/* Title & Badge */}
                  <div className="md:col-span-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <p className="text-sm font-semibold text-slate-700">Title</p>
                        <span className="text-[10px] text-slate-400">{draft.title.length} / 50</span>
                      </div>
                      <Input
                        value={draft.title}
                        maxLength={50}
                        onChange={(e) => updateDraft({ title: e.target.value })}
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>

                    <div className="flex items-center gap-6 mt-6">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1.5">
                          <p className="text-sm font-semibold text-slate-700">Kitchen Count Badge</p>
                          <span className="text-[10px] text-slate-400">{draft.badgeText.length} / 20</span>
                        </div>
                        <Input
                          value={draft.badgeText}
                          maxLength={20}
                          onChange={(e) => updateDraft({ badgeText: e.target.value })}
                          placeholder="e.g. 120+ Kitchens"
                          className="bg-slate-50 border-slate-200"
                        />
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <p className="text-sm font-semibold text-slate-700">Show Hero</p>
                        <Switch
                          checked={draft.showHero}
                          onCheckedChange={(checked) => updateDraft({ showHero: checked })}
                          className="data-[state=checked]:bg-[#10b981]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subtitle / Description */}
                  <div className="md:col-span-5">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-sm font-semibold text-slate-700">Subtitle / Description</p>
                      <span className="text-[10px] text-slate-400">{draft.description.length} / 400</span>
                    </div>
                    <Textarea
                      value={draft.description}
                      maxLength={400}
                      onChange={(e) => updateDraft({ description: e.target.value })}
                      className="bg-slate-50 border-slate-200 resize-none h-full min-h-[110px]"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="mt-0 space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Features Section</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Top highlights shown below the hero section (max 6)
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 h-9 border-[#10b981] text-[#10b981] hover:bg-[#10b981]/5"
                  onClick={addFeature}
                  disabled={draft.features.length >= 6}
                >
                  <Plus className="h-4 w-4" /> Add Feature
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-slate-100 bg-slate-50/50">
                      <TableHead className="w-16 font-semibold text-slate-500 text-xs uppercase tracking-wider">Order</TableHead>
                      <TableHead className="w-16 text-center font-semibold text-slate-500 text-xs uppercase tracking-wider">Icon</TableHead>
                      <TableHead className="px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Title</TableHead>
                      <TableHead className="px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Subtitle</TableHead>
                      <TableHead className="w-28 font-semibold text-slate-500 text-xs uppercase tracking-wider">Color</TableHead>
                      <TableHead className="text-center w-20 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-center w-40 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draft.features.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                          No features yet. Click &quot;Add Feature&quot; to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      draft.features.map((feature, index) => {
                        const Icon = FEATURE_ICON_MAP[feature.icon] ?? ChefHat;
                        return (
                          <TableRow key={feature.id ?? index} className="border-b-slate-100">
                            <TableCell className="py-3">
                              <div className="flex items-center gap-1 text-slate-400">
                                <GripVertical className="h-4 w-4" />
                                <span className="text-xs font-semibold">{index + 1}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f0fdf4] text-[#10b981] border border-[#dcfce7]">
                                <Icon className="h-5 w-5" />
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Select
                                  value={feature.icon}
                                  onValueChange={(icon) => updateFeature(index, { icon })}
                                >
                                  <SelectTrigger className="h-8 w-[120px] bg-white border-slate-200">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.keys(FEATURE_ICON_MAP).map((icon) => (
                                      <SelectItem key={icon} value={icon}>
                                        {icon}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={feature.title}
                                  onChange={(e) => updateFeature(index, { title: e.target.value })}
                                  className="h-8 bg-white border-slate-200"
                                />
                              </div>
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <Input
                                value={feature.subtitle}
                                onChange={(e) => updateFeature(index, { subtitle: e.target.value })}
                                className="h-8 bg-white border-slate-200"
                              />
                            </TableCell>
                            <TableCell className="py-3 px-4">
                              <Select
                                value={feature.color}
                                onValueChange={(color) => updateFeature(index, { color })}
                              >
                                <SelectTrigger className="h-8 w-[110px] bg-white border-slate-200">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {COLOR_OPTIONS.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                      <span className="inline-flex items-center gap-2">
                                        <span className={`h-2.5 w-2.5 rounded-full ${c.value}`} />
                                        {c.label}
                                      </span>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell className="py-3 text-center">
                              <Switch
                                checked={feature.isEnabled}
                                onCheckedChange={(checked) => updateFeature(index, { isEnabled: checked })}
                                className="data-[state=checked]:bg-[#10b981]"
                              />
                            </TableCell>
                            <TableCell className="py-3">
                              <div className="flex justify-center gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-400 hover:text-slate-600"
                                  onClick={() => moveFeature(index, -1)}
                                  disabled={index === 0}
                                  aria-label="Move up"
                                >
                                  <ChevronUp className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-slate-400 hover:text-slate-600"
                                  onClick={() => moveFeature(index, 1)}
                                  disabled={index === draft.features.length - 1}
                                  aria-label="Move down"
                                >
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="h-8 w-8 text-red-500 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                  onClick={() => removeFeature(index)}
                                  aria-label="Delete feature"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="offers" className="mt-0 space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Promotional Offers</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Offer cards displayed automatically on the category page
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 h-9 border-[#10b981] text-[#10b981] hover:bg-[#10b981]/5"
                  onClick={addOffer}
                >
                  <Plus className="h-4 w-4" /> Add Offer
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-slate-100 bg-slate-50/50">
                      <TableHead className="w-16 font-semibold text-slate-500 text-xs uppercase tracking-wider">Order</TableHead>
                      <TableHead className="px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Title</TableHead>
                      <TableHead className="px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Subtitle</TableHead>
                      <TableHead className="px-4 font-semibold text-slate-500 text-xs uppercase tracking-wider">Badge</TableHead>
                      <TableHead className="text-center w-20 font-semibold text-slate-500 text-xs uppercase tracking-wider">Status</TableHead>
                      <TableHead className="text-center w-24 font-semibold text-slate-500 text-xs uppercase tracking-wider">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draft.offers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                          No offers yet. Click &quot;Add Offer&quot; to create one.
                        </TableCell>
                      </TableRow>
                    ) : (
                      draft.offers.map((offer, index) => (
                        <TableRow key={offer.id ?? index} className="border-b-slate-100">
                          <TableCell className="py-3">
                            <div className="flex items-center gap-1 text-slate-400">
                              <GripVertical className="h-4 w-4" />
                              <span className="text-xs font-semibold">{index + 1}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <Input
                              value={offer.title}
                              onChange={(e) => updateOffer(index, { title: e.target.value })}
                              className="h-8 bg-white border-slate-200"
                            />
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <Input
                              value={offer.subtitle}
                              onChange={(e) => updateOffer(index, { subtitle: e.target.value })}
                              className="h-8 bg-white border-slate-200"
                            />
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            <Input
                              value={offer.badge}
                              onChange={(e) => updateOffer(index, { badge: e.target.value })}
                              placeholder="e.g. 20% OFF"
                              className="h-8 bg-white border-slate-200"
                            />
                          </TableCell>
                          <TableCell className="py-3 text-center">
                            <Switch
                              checked={offer.isEnabled}
                              onCheckedChange={(checked) => updateOffer(index, { isEnabled: checked })}
                              className="data-[state=checked]:bg-[#10b981]"
                            />
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex justify-center">
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 text-red-500 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                                onClick={() => removeOffer(index)}
                                aria-label="Delete offer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="faqs" className="mt-0 space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">FAQ Section</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Frequently asked questions displayed at the bottom of the page
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 h-9 border-[#10b981] text-[#10b981] hover:bg-[#10b981]/5"
                  onClick={addFaq}
                >
                  <Plus className="h-4 w-4" /> Add FAQ
                </Button>
              </div>
              <div className="p-5 space-y-4">
                {draft.faqs.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No FAQs yet. Click &quot;Add FAQ&quot; to create one.
                  </div>
                ) : (
                  draft.faqs.map((faq, index) => (
                    <div
                      key={faq.id ?? index}
                      className="border border-slate-200 rounded-lg p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-300"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-bold text-slate-400">Q{index + 1}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 text-red-500 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          onClick={() => removeFaq(index)}
                          aria-label="Delete FAQ"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <Input
                        value={faq.question}
                        onChange={(e) => updateFaq(index, { question: e.target.value })}
                        placeholder="Question"
                        className="h-9 bg-white border-slate-200 font-semibold"
                      />
                      <Textarea
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, { answer: e.target.value })}
                        placeholder="Answer"
                        className="bg-white border-slate-200 resize-none"
                      />
                    </div>
                  ))
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="mt-0 space-y-6">
            <Card className="border-slate-200 shadow-sm bg-white">
              <div className="p-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">SEO & Settings</h2>
                <p className="text-sm text-slate-500 mt-1">
                  Search engine metadata and category page behaviour
                </p>
              </div>
              <div className="p-5 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-sm font-semibold text-slate-700">Meta Title</p>
                      <span className="text-[10px] text-slate-400">{draft.metaTitle.length} / 60</span>
                    </div>
                    <Input
                      value={draft.metaTitle}
                      maxLength={60}
                      onChange={(e) => updateDraft({ metaTitle: e.target.value })}
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-sm font-semibold text-slate-700">Canonical URL</p>
                    </div>
                    <Input
                      value={draft.canonicalUrl}
                      onChange={(e) => updateDraft({ canonicalUrl: e.target.value })}
                      placeholder="https://rrckitchen.in/categories/{slug}"
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <p className="text-sm font-semibold text-slate-700">Meta Description</p>
                    <span className="text-[10px] text-slate-400">{draft.metaDescription.length} / 160</span>
                  </div>
                  <Textarea
                    value={draft.metaDescription}
                    maxLength={160}
                    onChange={(e) => updateDraft({ metaDescription: e.target.value })}
                    className="bg-slate-50 border-slate-200 resize-none"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-700 mb-1.5">Keywords</p>
                  <Input
                    value={draft.keywords}
                    onChange={(e) => updateDraft({ keywords: e.target.value })}
                    placeholder="biryani, dum biryani, hyderabadi"
                    className="bg-slate-50 border-slate-200"
                  />
                  <p className="text-xs text-slate-400 mt-1">Comma separated keywords</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1.5">Default Sort</p>
                    <Select
                      value={draft.defaultSort}
                      onValueChange={(defaultSort) => updateDraft({ defaultSort })}
                    >
                      <SelectTrigger className="h-10 bg-white border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {["Popularity", "Rating", "Newest", "Price Low", "Price High", "Recommended"].map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-1.5">Cards Per Page</p>
                    <Input
                      type="number"
                      min={4}
                      max={48}
                      value={draft.cardsPerPage}
                      onChange={(e) =>
                        updateDraft({ cardsPerPage: Math.max(4, Number(e.target.value) || 12) })
                      }
                      className="bg-slate-50 border-slate-200"
                    />
                  </div>
                  <div className="flex items-end gap-6 pb-1">
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm font-semibold text-slate-700">Show Ratings</p>
                      <Switch
                        checked={draft.showRatings}
                        onCheckedChange={(checked) => updateDraft({ showRatings: checked })}
                        className="data-[state=checked]:bg-[#10b981]"
                      />
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <p className="text-sm font-semibold text-slate-700">Publish on Website</p>
                      <Switch
                        checked={draft.isActive}
                        onCheckedChange={(checked) => updateDraft({ isActive: checked })}
                        className="data-[state=checked]:bg-[#10b981]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Page URL</p>
                    <p className="text-xs text-slate-500 mt-0.5">Customer-visible category page</p>
                  </div>
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-[#10b981] hover:text-[#059669] transition-colors"
                  >
                    /categories/{draft.slug} <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </Card>
          </TabsContent>
        </div>

        {/* RIGHT SIDE - LIVE PREVIEW */}
        <div className="w-full lg:w-[480px] xl:w-[560px] shrink-0">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full sticky top-6">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Live Preview</h2>
              <p className="text-xs text-slate-500 mt-1">This is how the category page looks to your users</p>

              <div className="flex items-center mt-5 bg-slate-50 p-1 rounded-lg border border-slate-200">
                {[
                  { id: "Desktop", icon: Monitor },
                  { id: "Tablet", icon: Tablet },
                  { id: "Mobile", icon: Smartphone },
                ].map((device) => (
                  <button
                    key={device.id}
                    type="button"
                    onClick={() => setPreviewDevice(device.id)}
                    className={`flex-1 flex justify-center items-center gap-2 py-1.5 rounded-md text-sm font-semibold transition-all ${
                      previewDevice === device.id
                        ? "bg-white text-[#10b981] shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    <device.icon className="h-4 w-4" /> {device.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview Container */}
            <div
              className={`bg-white flex-1 overflow-y-auto p-4 custom-scrollbar transition-all duration-500 ${
                previewDevice === "Desktop"
                  ? "w-full"
                  : previewDevice === "Tablet"
                  ? "w-full max-w-[640px] mx-auto border-x border-slate-100"
                  : "w-full max-w-[375px] mx-auto border-x border-slate-100"
              }`}
              style={{ maxHeight: "800px" }}
            >
              {/* Breadcrumb */}
              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mb-4 font-medium">
                <span>Home</span> <ChevronRight className="h-3 w-3" /> <span>Categories</span>{" "}
                <ChevronRight className="h-3 w-3" />{" "}
                <span className="text-slate-900 font-bold">{draft.title || draft.categoryName}</span>
              </div>

              {/* Hero Section */}
              <div className="flex gap-4 mb-6 relative animate-in fade-in duration-500">
                <div className="flex-1 z-10 pt-2">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-12 w-12 rounded-full bg-[#10b981] flex items-center justify-center text-white shrink-0 shadow-md overflow-hidden relative">
                      {draft.iconUrl ? (
                        <Image src={draft.iconUrl} alt="Icon" fill className="object-cover" unoptimized />
                      ) : (
                        <ChefHat className="h-6 w-6" />
                      )}
                    </div>
                    <div className="flex flex-col items-start gap-1">
                      <h2 className="text-xl font-bold text-slate-900">
                        {draft.title || draft.categoryName}
                      </h2>
                      {draft.badgeText && (
                        <Badge
                          variant="outline"
                          className="text-[9px] font-bold text-red-600 border-red-200 bg-red-50 rounded-full px-2 py-0"
                        >
                          {draft.badgeText}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {draft.showHero && (
                    <p className="text-[11px] text-slate-600 leading-relaxed max-w-[200px]">
                      {draft.description || "No description added yet."}
                    </p>
                  )}
                </div>
                <div className="w-[200px] h-[120px] rounded-2xl overflow-hidden shrink-0 shadow-sm relative">
                  {draft.desktopBannerUrl ? (
                    <Image
                      src={draft.desktopBannerUrl}
                      alt="Banner"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[#f0fdf4] flex items-center justify-center">
                      <span className="text-[9px] text-slate-400 font-medium">No banner</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-white via-white/40 to-transparent"></div>
                </div>
              </div>

              {/* Features Grid */}
              {enabledFeatures.length > 0 && (
                <div
                  className={`grid gap-2 mb-8 bg-[#fdfbf7] p-2 rounded-xl border border-orange-50/50 ${
                    enabledFeatures.length === 3
                      ? "grid-cols-3"
                      : enabledFeatures.length <= 2
                      ? "grid-cols-2"
                      : "grid-cols-4"
                  }`}
                >
                  {enabledFeatures.slice(0, 8).map((feature, i) => {
                    const Icon = FEATURE_ICON_MAP[feature.icon] ?? ChefHat;
                    return (
                      <div
                        key={feature.id ?? i}
                        className="flex flex-col items-center text-center gap-1.5 p-2 bg-white rounded-lg shadow-sm border border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${i * 60}ms` }}
                      >
                        <Icon className={`h-4 w-4 ${feature.color}`} />
                        <div>
                          <p className="text-[9px] font-bold text-slate-900">{feature.title}</p>
                          <p className="text-[8px] text-slate-500">{feature.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Offers Row */}
              {enabledOffers.length > 0 && (
                <div className="mb-6 space-y-2">
                  <span className="text-xs font-bold text-slate-900">Offers</span>
                  <div className="grid grid-cols-2 gap-2">
                    {enabledOffers.map((offer, i) => (
                      <div
                        key={offer.id ?? i}
                        className="border border-orange-100 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${i * 80}ms` }}
                      >
                        {offer.badge && (
                          <Badge className="bg-[#f97316] hover:bg-[#f97316] border-none text-[8px] px-1.5 py-0 h-4 mb-1.5">
                            {offer.badge}
                          </Badge>
                        )}
                        <p className="text-[10px] font-bold text-slate-900">{offer.title}</p>
                        <p className="text-[8px] text-slate-500 mt-0.5">{offer.subtitle}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kitchens Area */}
              <div className="flex gap-4">
                {/* Filters Sidebar */}
                <div className="w-[120px] shrink-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">Filters</span>
                    <span className="text-[9px] text-[#f97316] font-semibold cursor-pointer">
                      Clear All
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 cursor-pointer">
                      <span className="text-[10px] font-bold text-slate-800">Meal Type</span>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {["Breakfast", "Lunch", "Dinner"].map((meal) => (
                        <label key={meal} className="flex items-center gap-1.5 cursor-pointer">
                          <div className="w-3 h-3 rounded bg-[#f97316] flex items-center justify-center">
                            <CheckCircle2 className="h-2.5 w-2.5 text-white" />
                          </div>
                          <span className="text-[10px] font-medium text-slate-700">{meal}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-slate-100 cursor-pointer">
                      <span className="text-[10px] font-bold text-slate-800">Veg Preference</span>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </div>
                    <div className="space-y-1.5 pt-1">
                      {["All", "Pure Veg", "Veg"].map((v) => (
                        <label key={v} className="flex items-center gap-1.5 cursor-pointer">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              v === "All"
                                ? "border-[3px] border-[#f97316]"
                                : "border border-slate-300"
                            }`}
                          ></div>
                          <span
                            className={`text-[10px] ${
                              v === "All" ? "font-medium text-slate-700" : "text-slate-500"
                            }`}
                          >
                            {v}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="button"
                    className="w-full h-7 text-[10px] bg-[#f97316] hover:bg-[#ea580c] text-white"
                  >
                    APPLY FILTERS
                  </Button>
                </div>

                {/* Kitchen Grid */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold text-slate-900">
                      {previewKitchens.length === 0
                        ? "No kitchens found"
                        : `Showing ${previewKitchens.length} Kitchen${
                            previewKitchens.length > 1 ? "s" : ""
                          }`}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[9px] text-slate-500">Sort by:</span>
                      <div className="flex items-center gap-1 text-[9px] font-bold text-slate-900 border border-slate-200 rounded px-1.5 py-0.5">
                        {draft.defaultSort} <ChevronDown className="h-2.5 w-2.5" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {previewKitchens.length === 0 ? (
                      <div className="col-span-2 border border-dashed border-slate-200 rounded-xl p-6 text-center">
                        <span className="text-[10px] text-slate-400">
                          No active kitchens found for this category yet.
                        </span>
                      </div>
                    ) : (
                      previewKitchens.slice(0, 4).map((kitchen, i) => (
                        <a
                          key={kitchen.id}
                          href={`/kitchen/${kitchen.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="border border-slate-100 rounded-xl overflow-hidden shadow-sm bg-white group transition-all hover:shadow-md hover:-translate-y-0.5 animate-in fade-in slide-in-from-bottom-2 duration-300"
                          style={{ animationDelay: `${i * 80}ms` }}
                        >
                          <div className="aspect-[4/3] relative bg-slate-100">
                            {kitchen.imageUrl ? (
                              <Image
                                src={kitchen.imageUrl}
                                alt={kitchen.displayName}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                unoptimized
                              />
                            ) : (
                              <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
                                <ChefHat className="h-6 w-6 text-slate-300" />
                              </div>
                            )}
                            {i === 0 && (
                              <div className="absolute top-1.5 left-1.5">
                                <Badge className="bg-[#f97316] hover:bg-[#f97316] border-none text-[8px] px-1 py-0 h-4">
                                  Bestseller
                                </Badge>
                              </div>
                            )}
                            <div className="absolute top-1.5 right-1.5 flex gap-1">
                              <Badge className="bg-white text-[#10b981] border border-[#10b981] text-[8px] px-1 py-0 h-4 font-bold shadow-sm">
                                {kitchen.cuisineTags[0] ?? "Home"}
                              </Badge>
                            </div>
                            {kitchen.profileImage && (
                              <div className="absolute bottom-1.5 left-1.5 h-6 w-6 rounded-full border-2 border-white overflow-hidden bg-slate-200">
                                <Image
                                  src={kitchen.profileImage}
                                  alt="Chef"
                                  fill
                                  className="object-cover"
                                  unoptimized
                                />
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="text-[11px] font-bold text-slate-900 truncate">
                                {kitchen.displayName}
                              </h3>
                              <div className="flex items-center justify-center bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                                <CheckCircle2 className="h-2.5 w-2.5 text-blue-500" />
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-[9px] text-slate-600 mb-1.5 font-medium">
                              <Star className="h-2.5 w-2.5 text-yellow-400 fill-yellow-400" />
                              <span className="font-bold text-[#f97316]">
                                {kitchen.avgRating ? kitchen.avgRating.toFixed(1) : "New"}
                              </span>
                              <span className="text-slate-400">({kitchen.totalReviews})</span>
                            </div>
                            <p className="text-[8px] text-slate-400 truncate mb-1.5">
                              {kitchen.cuisineTags.join(" • ") || "Home Kitchen"}
                            </p>
                            <div className="flex items-center justify-between text-[8px] text-slate-500 pb-2 border-b border-slate-100">
                              <div className="flex items-center gap-1">
                                <Clock className="h-2.5 w-2.5" /> Home cooked
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-2.5 w-2.5" /> Near you
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-1 text-[#10b981]">
                                <ShieldCheck className="h-2.5 w-2.5" />
                                <span className="text-[8px] font-bold">100% Hygienic</span>
                              </div>
                              <span className="text-[8px] font-bold text-[#f97316]">View Menu</span>
                            </div>
                          </div>
                        </a>
                      ))
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-[10px] font-bold text-[#f97316] border-[#f97316]/30 hover:bg-[#f97316]/5 h-8"
                  >
                    Load More Kitchens
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </Tabs>
    </div>
  );
}

/* ======================================================================
   TANSTACK TABLE — real backend data with sorting + pagination
   ====================================================================== */

function CategoryPageTable({
  rows,
  onEdit,
  onToggle,
  onDelete,
  onView,
  pendingToggleId,
}: {
  rows: AdminCategoryPageRow[];
  onEdit: (id: string) => void;
  onToggle: (row: AdminCategoryPageRow, isActive: boolean) => void;
  onDelete: (row: AdminCategoryPageRow) => void;
  onView: (row: AdminCategoryPageRow) => void;
  pendingToggleId: string | null;
}) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "updatedAt", desc: true }]);
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const columns: ColumnDef<AdminCategoryPageRow>[] = [
    {
      accessorKey: "categoryName",
      header: "Category",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.isActive && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
          <div className="flex flex-col">
            <span className="font-semibold text-emerald-800 capitalize">{row.original.categoryName}</span>
            <span className="text-xs text-slate-400">/categories/{row.original.slug}</span>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "desktopBannerUrl",
      header: "Banner Preview",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="w-[170px] h-[52px] rounded-md overflow-hidden relative border border-slate-100 bg-slate-50">
          {row.original.desktopBannerUrl ? (
            <Image
              src={row.original.desktopBannerUrl}
              alt={row.original.categoryName}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-emerald-50 flex items-center justify-center">
              <span className="text-emerald-500 font-bold italic text-sm">{row.original.categoryName}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "featuresCount",
      header: "Sections",
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1.5">
          <Badge
            variant="outline"
            className="text-[10px] font-semibold text-[#10b981] border-emerald-200 bg-emerald-50/50"
          >
            <Layers className="h-3 w-3 mr-1" /> {row.original.featuresCount}
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] font-semibold text-orange-600 border-orange-200 bg-orange-50/50"
          >
            <Tag className="h-3 w-3 mr-1" /> {row.original.offersCount}
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] font-semibold text-blue-600 border-blue-200 bg-blue-50/50"
          >
            <HelpCircle className="h-3 w-3 mr-1" /> {row.original.faqsCount}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.original.isActive}
            disabled={pendingToggleId === row.original.id}
            onCheckedChange={(checked) => onToggle(row.original, checked)}
            className="data-[state=checked]:bg-[#10b981]"
          />
          <span className={`text-xs font-semibold ${row.original.isActive ? "text-emerald-600" : "text-slate-400"}`}>
            {row.original.isActive ? "Live" : "Draft"}
          </span>
        </div>
      ),
    },
    {
      accessorKey: "version",
      header: "Version",
      cell: ({ row }) => (
        <Badge className="bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-100 text-[10px] font-semibold">
          v{row.original.version}
        </Badge>
      ),
    },
    {
      accessorKey: "updatedBy",
      header: "Updated By",
      enableSorting: false,
      cell: ({ row }) => <span className="text-sm text-slate-500">{row.original.updatedBy ?? "—"}</span>,
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) => (
        <span className="text-sm text-slate-500 whitespace-nowrap">
          {new Date(row.original.updatedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end gap-1.5">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-slate-500 border-slate-200 hover:border-[#10b981]/30 hover:text-[#10b981]"
            onClick={(e) => {
              e.stopPropagation();
              onView(row.original);
            }}
            aria-label="View live page"
            title="View live page"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-[#10b981] border-slate-200 hover:bg-[#10b981]/5"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(row.original.id);
            }}
            aria-label="Edit page"
            title="Edit page"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 text-red-500 border-slate-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(row.original);
            }}
            aria-label="Delete page"
            title="Delete page"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const totalPages = Math.max(1, table.getPageCount());
  const safePage = Math.min(table.getState().pagination.pageIndex + 1, totalPages);
  const pageItems = table.getRowModel().rows;
  const showingFrom = pageItems.length === 0 ? 0 : (safePage - 1) * pagination.pageSize + 1;
  const showingTo = Math.min(safePage * pagination.pageSize, rows.length);

  return (
    <>
      <div className="overflow-x-auto bg-white">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-b-slate-100 bg-slate-50/50 hover:bg-slate-50/50">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className={`h-12 font-semibold text-slate-600 text-xs uppercase tracking-wider py-4 ${
                      header.column.id === "actions" ? "text-right" : ""
                    } ${header.column.getCanSort() ? "cursor-pointer select-none" : ""}`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() &&
                        (header.column.getIsSorted() === "asc" ? (
                          <ArrowUp className="h-3 w-3 text-[#10b981]" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ArrowDown className="h-3 w-3 text-[#10b981]" />
                        ) : (
                          <ChevronsUpDown className="h-3 w-3 text-slate-300" />
                        ))}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400">
                  No category pages found. Click &quot;Add New Category Page&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((row) => (
                <TableRow
                  key={row.id}
                  className="border-b-slate-100 hover:bg-slate-50/80 transition-colors cursor-pointer"
                  onClick={() => onEdit(row.original.id)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 align-middle">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500">
          Showing <span className="font-semibold text-slate-700">{showingFrom}</span>–
          <span className="font-semibold text-slate-700">{showingTo}</span> of{" "}
          <span className="font-semibold text-slate-700">{rows.length}</span> category pages
        </p>
        <div className="flex items-center gap-3">
          <Select
            value={String(pagination.pageSize)}
            onValueChange={(v) => table.setPageSize(Number(v))}
          >
            <SelectTrigger className="w-24 h-8 text-xs bg-white border-slate-200 text-slate-700 font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[10, 25, 50].map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={safePage === 1}
              onClick={() => table.previousPage()}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(Math.max(0, safePage - 3), Math.min(totalPages, safePage + 2))
              .map((page) => (
                <Button
                  key={page}
                  variant={page === safePage ? "default" : "outline"}
                  size="icon"
                  className={`h-8 w-8 ${
                    page === safePage
                      ? "bg-[#10b981] hover:bg-[#059669]"
                      : "text-slate-600 border-slate-200"
                  }`}
                  onClick={() => table.setPageIndex(page - 1)}
                >
                  {page}
                </Button>
              ))}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={safePage === totalPages}
              onClick={() => table.nextPage()}
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ======================================================================
   DASHBOARD / PAGE
   ====================================================================== */

export default function CategoryPagesManagement() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminCategoryPageRow | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addCategoryId, setAddCategoryId] = useState("");
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  const {
    data: contents = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin-category-page"],
    queryFn: getCategoryPageContents,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });

  const { data: categories = [] } = useQuery<AdminCategoryOption[]>({
    queryKey: ["admin-category-options"],
    queryFn: getCategoryOptions,
    staleTime: 60_000,
  });

  const createMutation = useMutation({
    mutationFn: ({ categoryId }: { categoryId: string }) =>
      createCategoryPageContent({ categoryId }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to create content");
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["admin-category-page"] });
      toast.success("Category page created");
      setAddDialogOpen(false);
      setAddCategoryId("");
      if (res.id) setEditingId(res.id);
    },
    onError: () => toast.error("Failed to create content"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteCategoryPageContent(id),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to delete");
        setDeleteTarget(null);
        return;
      }
      queryClient.invalidateQueries({ queryKey: ["admin-category-page"] });
      toast.success("Category page deleted");
      setDeleteTarget(null);
    },
    onError: () => {
      toast.error("Failed to delete");
      setDeleteTarget(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCategoryPageContent(id, isActive),
    onMutate: ({ id }) => setPendingToggleId(id),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error || "Failed to update status");
      } else {
        queryClient.invalidateQueries({ queryKey: ["admin-category-page"] });
        toast.success("Status updated");
      }
    },
    onError: () => toast.error("Failed to update status"),
    onSettled: () => setPendingToggleId(null),
  });

  const filtered = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return contents.filter((c) => {
      const matchesSearch =
        !term || c.categoryName.toLowerCase().includes(term) || c.slug.includes(term);
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
    if (sortBy === "A-Z") arr.sort((a, b) => a.categoryName.localeCompare(b.categoryName));
    return arr;
  }, [filtered, sortBy]);

  const stats = useMemo(() => {
    return {
      total: contents.length,
      live: contents.filter((c) => c.isActive).length,
      recentlyUpdated: contents.filter((c) => +new Date(c.updatedAt) >= WEEK_START).length,
      totalFeatures: contents.reduce((sum, c) => sum + c.featuresCount, 0),
    };
  }, [contents]);

  const unmanagedCategories = categories.filter(
    (c) => !contents.some((content) => content.categoryId === c.id)
  );

  const onSubmitAdd = () => {
    if (!addCategoryId) {
      toast.error("Select a category first");
      return;
    }
    createMutation.mutate({ categoryId: addCategoryId });
  };

  if (editingId) {
    return (
      <Editor
        contentId={editingId}
        onCancel={() => setEditingId(null)}
        onOpenContent={(id) => setEditingId(id)}
      />
    );
  }

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 max-w-[1400px] mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400" />
          <p className="text-red-500 font-semibold">Failed to load category page content</p>
          <Button variant="outline" onClick={() => refetch()}>
            <RotateCcw className="h-4 w-4 mr-2" /> Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2.5 rounded-lg flex items-center justify-center">
            <Layout className="h-6 w-6 text-[#10b981]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Category Slug Page Management
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">
              Manage how each category page looks on the website
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium h-10 bg-white shadow-sm"
            onClick={() => window.open("/categories", "_blank")}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview Live Page
          </Button>
          <Button
            className="bg-[#10b981] hover:bg-[#059669] text-white font-medium h-10 shadow-sm shadow-emerald-200"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Category Page
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-emerald-100 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-50 p-3 rounded-lg mt-0.5">
                <Layout className="h-6 w-6 text-[#10b981]" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Category Pages</p>
                <h3 className="text-3xl font-bold text-[#10b981] mt-1">{stats.total}</h3>
                <p className="text-xs text-slate-400 mt-1">Managed category pages</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-emerald-50 p-3 rounded-full mt-0.5 border border-emerald-100">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Live on Website</p>
                <h3 className="text-3xl font-bold text-emerald-600 mt-1">{stats.live}</h3>
                <p className="text-xs text-slate-400 mt-1">Currently visible to users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-blue-50 p-3 rounded-lg mt-0.5">
                <History className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Recently Updated</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-1">{stats.recentlyUpdated}</h3>
                <p className="text-xs text-slate-400 mt-1">In last 7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-purple-50 p-3 rounded-lg mt-0.5">
                <Layers className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Features</p>
                <h3 className="text-3xl font-bold text-purple-600 mt-1">{stats.totalFeatures}</h3>
                <p className="text-xs text-slate-400 mt-1">Across all category pages</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Section */}
      <Card className="shadow-sm border-slate-200/60 overflow-hidden bg-white">
        <div className="p-5 border-b border-slate-100 bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-md">
              <List className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-900">Category Pages</h2>
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                  <span
                    className={`h-1.5 w-1.5 rounded-full bg-emerald-500 ${
                      isFetching ? "animate-pulse" : ""
                    }`}
                  />
                  LIVE · AUTO-REFRESH 30S
                </span>
              </div>
              <p className="text-sm text-slate-500">
                View and manage all category slug page configurations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-slate-50/50 border-slate-200"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
            >
              <SelectTrigger className="w-32 h-10 bg-white border-slate-200 text-slate-700 font-medium">
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
              onValueChange={setSortBy}
            >
              <SelectTrigger className="w-36 h-10 bg-white border-slate-200 text-slate-700 font-medium">
                <SelectValue className="text-slate-700" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Latest">Sort: Latest</SelectItem>
                <SelectItem value="Oldest">Sort: Oldest</SelectItem>
                <SelectItem value="A-Z">Sort: A–Z</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              className="h-10 text-slate-500 hover:text-slate-900"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setSortBy("Latest");
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Table — TanStack React Table with live backend data */}
        <CategoryPageTable
          rows={sorted}
          onEdit={(id) => setEditingId(id)}
          onToggle={(row, isActive) => toggleMutation.mutate({ id: row.id, isActive })}
          onDelete={(row) => setDeleteTarget(row)}
          onView={(row) => window.open(`/categories/${row.slug}`, "_blank")}
          pendingToggleId={pendingToggleId}
        />
      </Card>

      {/* Add Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Add New Category Page</DialogTitle>
            <DialogDescription>
              Pick a category to create a customizable slug page for it. Existing pages are hidden.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Select value={addCategoryId} onValueChange={setAddCategoryId}>
              <SelectTrigger className="h-10 bg-white border-slate-200">
                <SelectValue placeholder="Select a category..." />
              </SelectTrigger>
              <SelectContent>
                {unmanagedCategories.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-slate-400">
                    All categories already have pages.
                  </div>
                ) : (
                  unmanagedCategories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-[#10b981] hover:bg-[#059669] text-white"
              onClick={onSubmitAdd}
              disabled={createMutation.isPending || !addCategoryId}
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Create Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete category page?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the managed page for{" "}
              <span className="font-semibold text-slate-700">{deleteTarget?.categoryName}</span>. The
              category itself will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) deleteMutation.mutate(deleteTarget.id);
              }}
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
