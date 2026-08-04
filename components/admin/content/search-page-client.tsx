"use client";

import { useEffect, useMemo, useState,useRef } from "react";
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
  Edit2,
  Trash2,
  FileText,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
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
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  Tag,
  Info,
  Upload,
  ChefHat,
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
                {Array.from({ length: 7 }).map((_, i) => (
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
                    <Skeleton className="h-[60px] w-[180px] rounded-md" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-14 rounded-md" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-20 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 rounded-md" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Skeleton className="h-8 w-16 rounded-md" />
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
    removeFilter,
    addFilterOption,
    removeFilterOption,
    updateBadge,
    addBadge,
    removeBadge,
    updateInfoItem,
    markSaved,
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

  const moveFilter = (index: number, dir: -1 | 1) => {
    const next = [...draft.filters];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updateDraft({ filters: next });
  };

  const moveInfoItem = (index: number, dir: -1 | 1) => {
    const next = [...draft.infoItems];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updateDraft({ infoItems: next });
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 max-w-[1600px] mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            Search Page Editor
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Customize everything customers see when they search{" "}
            <span className="font-semibold text-[#FF5722]">&ldquo;{draft.keyword}&rdquo;</span>.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="text-gray-700 h-10 border-gray-200 bg-white shadow-sm hover:bg-gray-50"
            onClick={onCancel}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            variant="outline"
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 h-10 bg-white shadow-sm"
            onClick={() => window.open(`/search?q=${encodeURIComponent(draft.keyword)}`, "_blank")}
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview Live Page
          </Button>
          <Button
            className="bg-[#FF5722] hover:bg-[#F4511E] text-white h-10 shadow-sm shadow-orange-200"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
          >
            {saveMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {dirty ? "Save Changes" : "Saved"}
          </Button>
        </div>
      </div>

      {/* Warn if dirty */}
      {dirty && (
        <div className="mb-5 flex items-center gap-2 text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 w-fit">
          <AlertTriangle className="h-4 w-4" />
          You have unsaved changes. Click Save Changes to publish.
        </div>
      )}

      {/* Tabs header (informational) */}
      <div className="border-b border-gray-200 mb-6 flex gap-8">
        {["Search Content", "Images", "Filters", "Settings"].map((tab, i) => (
          <div
            key={tab}
            className={
              i === 0
                ? "text-[#FF5722] font-semibold border-b-2 border-[#FF5722] pb-3 cursor-pointer"
                : "text-gray-500 hover:text-gray-700 font-medium pb-3 cursor-pointer"
            }
          >
            {tab}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column 1 */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Search Banner Block */}
          <Card className="shadow-sm border-gray-200/60 bg-white">
            <div className="p-4 border-b border-gray-100 flex items-center gap-2">
              <h3 className="font-semibold text-gray-900 text-[15px]">Search Banner</h3>
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-50 text-[10px] px-1.5 py-0 h-5">
                Active
              </Badge>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-[13px] text-gray-500">
                Customize the banner that appears on top of search results.
              </p>
              <div className="rounded-md overflow-hidden border border-gray-200 bg-orange-50 relative h-[140px]">
                {banner ? (
                  <Image
                    src={banner}
                    fill
                    sizes="320px"
                    className="object-cover"
                    alt="Banner"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-orange-50/90 to-transparent p-4 flex flex-col justify-center">
                  <p className="text-[10px] font-semibold text-gray-600 mb-0.5">
                    Search Results for
                  </p>
                  <h2 className="text-2xl font-bold text-emerald-800 tracking-tight">
                    &ldquo;{draft.keyword}&rdquo;
                  </h2>
                  <p className="text-[10px] text-gray-600 mt-2 max-w-[70%] font-medium leading-snug">
                    {draft.subHeading || `We found ${draft.kitchensCount} kitchens.`}
                  </p>
                </div>
              </div>
              <ImageUrlInput
                value={draft.bannerImageUrl}
                onChange={(url) => updateDraft({ bannerImageUrl: url })}
              />

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Banner Heading
                    </label>
                    <span className="text-[10px] text-gray-400">
                      {draft.heading.length}/60
                    </span>
                  </div>
                  <Input
                    value={draft.heading}
                    maxLength={60}
                    onChange={(e) => updateDraft({ heading: e.target.value })}
                    className="h-9 text-sm text-gray-800"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-1.5">
                    <label className="text-xs font-semibold text-gray-700">
                      Banner Sub Text
                    </label>
                    <span className="text-[10px] text-gray-400">
                      {draft.subHeading.length}/120
                    </span>
                  </div>
                  <textarea
                    className="flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm text-gray-800 shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[70px] resize-none"
                    value={draft.subHeading}
                    maxLength={120}
                    onChange={(e) => updateDraft({ subHeading: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Top Info Items Block */}
          <Card className="shadow-sm border-gray-200/60 bg-white">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-[15px]">
                Top Info Items
              </h3>
            </div>
            <div className="p-4 space-y-5">
              <p className="text-[13px] text-gray-500 mb-2">
                Manage the quick info items shown below the search results.
              </p>

              <div className="space-y-4">
                {draft.infoItems.map((item, i) => {
                  const IconComp = INFO_ICON_MAP[item.icon] ?? Heart;
                  const style = INFO_TOP_STYLES(item.icon, item.color);
                  return (
                    <div key={item.id ?? i} className="flex items-center justify-between group">
                      <div className="flex gap-3 items-center">
                        <div className={`p-1.5 rounded border ${style.bg}`}>
                          <IconComp className={`h-4 w-4 ${style.color}`} />
                        </div>
                        <div>
                          <input
                            className="text-xs font-semibold text-gray-800 bg-transparent outline-none border border-transparent hover:border-gray-200 rounded px-1 -mx-1 w-40"
                            value={item.title}
                            onChange={(e) =>
                              updateInfoItem(i, { title: e.target.value })
                            }
                          />
                          <input
                            className="text-[10px] text-gray-500 mt-0.5 bg-transparent outline-none border border-transparent hover:border-gray-200 rounded px-1 -mx-1 w-40 block"
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
                        className={
                          item.isEnabled
                            ? "data-[state=checked]:bg-emerald-500 scale-90"
                            : "scale-90"
                        }
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-end gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 border-gray-200 text-gray-400"
                  disabled
                >
                  <GripVertical className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6 border-gray-200 text-gray-500 hover:text-orange-600"
                  onClick={() => moveInfoItem(0, -1)}
                  title="Reorder"
                >
                  <ChevronUp className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Results Settings Block */}
          <Card className="shadow-sm border-gray-200/60 bg-white">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-[15px]">
                Results Settings
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-[13px] text-gray-500 mb-1">
                Configure how results are displayed.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-800 block mb-1.5">
                    Kitchens Per Page
                  </label>
                  <Select
                    value={String(draft.cardsPerPage)}
                    onValueChange={(v) =>
                      updateDraft({ cardsPerPage: Number(v) })
                    }
                  >
                    <SelectTrigger className="h-9 w-full bg-white text-sm">
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
                  <label className="text-xs font-semibold text-gray-800 block mb-1.5">
                    Default Sort By
                  </label>
                  <Select
                    value={draft.defaultSort}
                    onValueChange={(v) => updateDraft({ defaultSort: v })}
                  >
                    <SelectTrigger className="h-9 w-full bg-white text-sm">
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
              <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-50">
                <label className="text-xs font-semibold text-gray-800">
                  Show Ratings on cards
                </label>
                <Switch
                  checked={draft.showRatings}
                  onCheckedChange={(checked) =>
                    updateDraft({ showRatings: checked })
                  }
                  className="data-[state=checked]:bg-emerald-500 scale-90"
                />
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                <label className="text-xs font-semibold text-gray-800">
                  Search page active
                </label>
                <Switch
                  checked={draft.isActive}
                  onCheckedChange={(checked) => updateDraft({ isActive: checked })}
                  className="data-[state=checked]:bg-emerald-500 scale-90"
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Left Column 2: Filters + Badges */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Filters Configuration */}
          <Card className="shadow-sm border-gray-200/60 bg-white">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-[15px]">
                Filters Configuration
              </h3>
            </div>
            <div className="p-4 space-y-4">
              <p className="text-[13px] text-gray-500">
                Choose, order, and configure filters shown on the search page.
              </p>

              <div className="space-y-2.5">
                {draft.filters.map((filter, i) => (
                  <div
                    key={filter.id ?? i}
                    className="bg-white border border-gray-100 p-3 rounded-lg shadow-sm hover:border-orange-200 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3 w-full">
                        <GripVertical className="h-4 w-4 text-gray-300 cursor-grab shrink-0" />
                        <div className="flex-1 min-w-0">
                          <input
                            className="text-xs font-semibold text-gray-800 bg-transparent outline-none border border-transparent hover:border-gray-200 rounded px-1 -mx-1 w-full"
                            value={filter.name}
                            onChange={(e) =>
                              updateFilter(i, { name: e.target.value })
                            }
                          />
                        </div>
                        <Switch
                          checked={filter.isEnabled}
                          onCheckedChange={(checked) =>
                            updateFilter(i, { isEnabled: checked })
                          }
                          className={
                            filter.isEnabled
                              ? "data-[state=checked]:bg-emerald-500 scale-90"
                              : "scale-90"
                          }
                        />
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-gray-700"
                          disabled={i === 0}
                          onClick={() => moveFilter(i, -1)}
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-400 hover:text-gray-700"
                          disabled={i === draft.filters.length - 1}
                          onClick={() => moveFilter(i, 1)}
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-red-400 hover:text-red-600"
                          onClick={() => removeFilter(i)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pl-6">
                      {filter.options.map((option, oi) => (
                        <span
                          key={`${option}-${oi}`}
                          className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-[10px] font-medium px-2 py-0.5"
                        >
                          {option}
                          <button
                            type="button"
                            className="text-orange-400 hover:text-red-500"
                            onClick={() => removeFilterOption(i, option)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                      <FilterOptionButton
                        onAdd={(option: string) => addFilterOption(i, option)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full text-[#FF5722] border-orange-200 hover:bg-orange-50 hover:text-orange-600 h-10 border-dashed mt-1 bg-orange-50/50"
                onClick={addFilter}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Filter
              </Button>
            </div>
          </Card>

          {/* Featured Badges */}
          <Card className="shadow-sm border-gray-200/60 bg-white">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 text-[15px]">
                Featured Badges
              </h3>
            </div>
            <div className="p-4 space-y-5">
              <p className="text-[13px] text-gray-500 mb-2">
                Manage badges shown on kitchen cards.
              </p>

              <div className="space-y-4">
                {draft.badges.map((badge, i) => (
                  <div key={badge.id ?? i} className="flex items-center justify-between gap-3 group">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Tag className="h-3.5 w-3.5 text-gray-300 shrink-0" />
                      <Input
                        value={badge.name}
                        onChange={(e) => updateBadge(i, { name: e.target.value })}
                        className="h-8 text-xs font-semibold flex-1 min-w-0"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-600 shrink-0"
                        onClick={() => removeBadge(i)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <Switch
                      checked={badge.isEnabled}
                      onCheckedChange={(checked) =>
                        updateBadge(i, { isEnabled: checked })
                      }
                      className={
                        badge.isEnabled
                          ? "data-[state=checked]:bg-emerald-500 scale-90"
                          : "scale-90"
                      }
                    />
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                className="w-full text-[#FF5722] border-orange-200 hover:bg-orange-50 hover:text-orange-600 h-10 border-dashed mt-1 bg-orange-50/50"
                onClick={addBadge}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Badge
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-6 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-[calc(100vh-140px)] sticky top-6">
          <div className="bg-gray-50/80 border-b border-gray-100 p-4 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <h3 className="font-bold text-gray-900 text-sm">Live Preview</h3>
            </div>
            <p className="text-[11px] text-gray-500">
              This is how the search page appears to customers.
            </p>
          </div>

          <div className="flex-1 overflow-y-auto bg-gray-50/50 pb-8 relative">
            <div className="bg-white min-h-full w-full mx-auto shadow-sm pb-8">
              {/* Navbar mock */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                <div className="flex flex-col">
                  <span className="text-orange-500 font-bold italic text-xl leading-tight">
                    RRC Kitchen
                  </span>
                  <span className="text-[9px] text-gray-500 tracking-wider">
                    Every Homemaker is a Chef
                  </span>
                </div>
                <div className="hidden sm:flex items-center text-xs font-semibold text-gray-600 gap-2 px-3 py-1.5">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span>Select Location</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                </div>
                <div className="hidden md:flex relative flex-1 max-w-sm mx-6">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <input
                    className="w-full border border-gray-200 rounded-md pl-9 py-2 text-xs bg-gray-50 outline-none font-medium text-gray-700"
                    value={draft.keyword}
                    readOnly
                  />
                  <X className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 cursor-pointer" />
                </div>
                <div className="flex items-center gap-6 text-xs font-semibold text-gray-700">
                  <div className="flex items-center gap-1.5">
                    <User className="h-4 w-4 text-gray-500" /> Login / Signup
                  </div>
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5 text-gray-600" />
                    <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                      3
                    </span>
                  </div>
                </div>
              </div>

              {/* Nav links mock */}
              <div className="flex items-center justify-center gap-8 py-3 border-b border-gray-100 text-[10px] font-bold text-gray-700 tracking-wider">
                {["HOME", "CATEGORIES", "KITCHENS", "TODAY'S SPECIALS", "ABOUT US", "BECOME A CHEF", "CONTACT US"].map(
                  (item, i) => (
                    <span
                      key={item}
                      className={
                        i === 2
                          ? "text-orange-500 cursor-pointer border-b-2 border-orange-500 pb-0.5 -mb-0.5"
                          : "hover:text-orange-500 cursor-pointer"
                      }
                    >
                      {item}
                    </span>
                  )
                )}
              </div>

              {/* Banner */}
              <div className="w-full h-40 md:h-48 relative overflow-hidden bg-orange-50">
                {banner ? (
                  <Image
                    src={banner}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    alt="Banner"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-r from-orange-50 via-orange-50/90 to-transparent p-6 md:p-10 flex flex-col justify-center">
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Search Results for
                  </p>
                  <h2 className="text-3xl md:text-5xl font-bold text-emerald-800 tracking-tight">
                    &ldquo;{draft.keyword}&rdquo;
                  </h2>
                  <p className="text-[13px] text-gray-700 mt-4 font-medium max-w-sm leading-relaxed">
                    {draft.subHeading ||
                      `We found ${draft.kitchensCount} kitchens near you.`}
                  </p>
                </div>
              </div>

              {/* Content Layout */}
              <div className="p-6 flex gap-8">
                {/* Left Filters */}
                <div className="hidden md:block w-48 shrink-0">
                  <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-100">
                    <h4 className="font-bold text-[13px] text-gray-900">Filters</h4>
                    <span className="text-[10px] text-orange-500 font-semibold cursor-pointer">
                      Clear All
                    </span>
                  </div>

                  <div className="space-y-5">
                    {enabledFilters.map((filter, fi) => (
                      <div
                        key={filter.id ?? fi}
                        className={fi === 0 ? "" : "pt-3 border-t border-gray-100"}
                      >
                        <div className="flex justify-between items-center text-[11px] font-bold text-gray-800 mb-2.5">
                          <span>{filter.name}</span>
                          <ChevronDown className="h-3 w-3 text-gray-400" />
                        </div>
                        <div className="space-y-2">
                          {(filter.options.length ? filter.options : ["Option 1", "Option 2"]).slice(0, 3).map(
                            (option, oi) => (
                              <div
                                key={`${option}-${oi}`}
                                className="flex items-center gap-2.5"
                              >
                                <div className="w-3.5 h-3.5 rounded-sm border flex items-center justify-center transition-colors bg-orange-500 border-orange-500">
                                  <Check className="h-2.5 w-2.5 text-white" />
                                </div>
                                <span className="text-[11px] text-gray-600 font-medium">
                                  {option}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                    {enabledFilters.length === 0 && (
                      <p className="text-[11px] text-gray-400 font-medium">
                        No active filters.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Products */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-5 pb-2 border-b border-gray-100 text-[11px] font-bold">
                    <span className="text-gray-800">
                      Showing 1 - {previewKitchens.length} of {previewKitchens.length} Kitchens
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Sort by:</span>
                      <div className="flex items-center gap-1.5 border border-gray-200 px-2.5 py-1.5 rounded-md bg-white shadow-sm cursor-pointer hover:border-gray-300 transition-colors">
                        <span className="text-gray-700">{draft.defaultSort}</span>
                        <ChevronDown className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {previewKitchens.map((kitchen, i) => (
                      <div
                        key={kitchen.id}
                        className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm flex flex-col group hover:shadow-md transition-shadow"
                      >
                        <div className="relative h-28 overflow-hidden bg-gray-100">
                          {kitchen.imageUrl ? (
                            <Image
                              src={kitchen.imageUrl}
                              fill
                              sizes="200px"
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              alt={kitchen.displayName}
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full bg-orange-50">
                              <ChefHat className="h-8 w-8 text-orange-300" />
                            </div>
                          )}
                          {enabledBadges[i % Math.max(enabledBadges.length, 1)] && (
                            <div className="absolute top-2 left-2 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                              {enabledBadges[i % enabledBadges.length].name}
                            </div>
                          )}
                          <div className="absolute top-2 right-2 bg-white text-gray-800 text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm border border-gray-100">
                            {draft.keyword}
                          </div>
                          <div className="absolute -bottom-3 left-3 w-10 h-10 rounded-full border-2 border-white overflow-hidden shadow-sm bg-white z-10 flex items-center justify-center bg-orange-100 text-orange-500 font-bold">
                            {kitchen.displayName.charAt(0).toUpperCase()}
                          </div>
                        </div>
                        <div className="p-4 pt-5 flex-1 flex flex-col">
                          <h5 className="font-bold text-gray-900 text-sm leading-tight flex items-center gap-1.5">
                            {kitchen.displayName}
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 fill-emerald-500/20" />
                          </h5>
                          <div className="flex items-center gap-2 mt-2 mb-3">
                            <div className="flex items-center gap-0.5 text-orange-500">
                              <Star className="h-3 w-3 fill-orange-500" />
                              <span className="text-[11px] font-bold ml-0.5">
                                {kitchen.avgRating > 0 ? kitchen.avgRating.toFixed(1) : "NEW"}
                              </span>
                            </div>
                            <span className="text-[10px] text-gray-400 font-medium">
                              ({kitchen.totalReviews.toLocaleString()})
                            </span>
                            {!draft.showRatings && <Badge className="text-[9px]">hidden</Badge>}
                          </div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1.5 font-medium">
                            {kitchen.cuisineTags.length > 0 ? (
                              kitchen.cuisineTags.slice(0, 2).join(" · ")
                            ) : (
                              "Homemade"
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-medium text-gray-600 mt-auto pt-3 border-t border-gray-50">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-gray-400" /> {kitchen.estimatedPrepTime ?? 25} mins
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">
                              <ShieldCheck className="h-3.5 w-3.5" /> 100% Hygienic
                            </div>
                            <Button
                              variant="outline"
                              className="h-7 text-[11px] px-3 font-bold text-orange-500 border-orange-200 hover:bg-orange-50 hover:text-orange-600 rounded-md"
                            >
                              View Menu
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="flex justify-center mt-8">
                    <div className="flex items-center gap-1.5">
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-md border-gray-200 bg-white text-gray-500 hover:text-gray-900 shadow-sm" disabled>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 rounded-md border-transparent bg-[#FF5722] text-white hover:bg-[#F4511E] shadow-sm p-0 flex items-center justify-center font-bold text-xs"
                      >
                        1
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 rounded-md border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm p-0 flex items-center justify-center font-bold text-xs"
                      >
                        2
                      </Button>
                      <Button variant="outline" size="sm" className="h-8 w-8 rounded-md border-gray-200 bg-white text-gray-500 hover:text-gray-900 shadow-sm p-0 flex items-center justify-center font-bold text-xs">
                        3
                      </Button>
                      <Button variant="outline" size="icon" className="h-8 w-8 rounded-md border-gray-200 bg-white text-gray-500 hover:text-gray-900 shadow-sm">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Info Bar mock */}
              <div className="border-t border-gray-100 bg-white py-6 mt-8">
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 max-w-5xl mx-auto px-6">
                  {enabledInfoItems.length ? (
                    enabledInfoItems.map((item, i) => {
                      const IconComp = INFO_ICON_MAP[item.icon] ?? Heart;
                      const style = INFO_TOP_STYLES(item.icon, item.color);
                      return (
                        <div key={item.id ?? i} className="flex items-center gap-3.5">
                          <div className={`p-2.5 rounded-full ${style.bg.replace(" border-orange-100", "").replace(" border-emerald-100", "").replace(" border-blue-100", "").replace(" border-green-100", "")}`}>
                            <IconComp className={`h-5 w-5 ${style.color}`} />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-bold text-gray-800">
                              {item.title}
                            </span>
                            <span className="text-[11px] text-gray-500 font-medium mt-0.5">
                              {item.subtitle}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[11px] text-gray-400 font-medium py-2">
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

function INFO_TOP_STYLES(icon: string, color: string) {
  const known = INFO_TOP_STYLES_MAP[icon];
  return { color: known?.color ?? color, bg: known?.bg ?? "bg-orange-50 border-orange-100" };
}

const INFO_TOP_STYLES_STATIC = {
  Heart: { color: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
  ShieldCheck: { color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-100" },
  Clock: { color: "text-blue-500", bg: "bg-blue-50 border-blue-100" },
  Leaf: { color: "text-green-500", bg: "bg-green-50 border-green-100" },
  Users: { color: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
};

const INFO_TOP_STYLES_MAP: Record<string, { color: string; bg: string }> = Object.fromEntries(
  Object.entries(INFO_TOP_STYLES_STATIC).map(([k, v]) => [k, v])
);

/* ======================================================================
   FILTER OPTION BUTTON (inline add)
   ====================================================================== */

function FilterOptionButton({ onAdd }: { onAdd: (option: string) => void }) {
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  return open ? (
    <form
      className="inline-flex items-center gap-1"
      onSubmit={(e) => {
        e.preventDefault();
        if (value.trim()) {
          onAdd(value.trim());
          setValue("");
          setOpen(false);
        }
      }}
    >
      <Input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Add option..."
        className="h-6 w-28 text-[10px] px-2"
      />
      <Button type="submit" variant="ghost" size="icon" className="h-6 w-6 text-emerald-600">
        <Check className="h-3.5 w-3.5" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400" onClick={() => setOpen(false)}>
        <X className="h-3.5 w-3.5" />
      </Button>
    </form>
  ) : (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 text-gray-400 hover:text-orange-600"
      onClick={() => setOpen(true)}
      title="Add option"
    >
      <Plus className="h-3.5 w-3.5" />
    </Button>
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
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminSearchPageRow | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addKeyword, setAddKeyword] = useState("");
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

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

  const totalPages = Math.max(1, Math.ceil(sorted.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pageItems = sorted.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const showingFrom = sorted.length === 0 ? 0 : (safePage - 1) * rowsPerPage + 1;
  const showingTo = Math.min(safePage * rowsPerPage, sorted.length);

  const stats = useMemo(() => {
    return {
      total: contents.length,
      live: contents.filter((c) => c.isActive).length,
      recentlyUpdated: contents.filter((c) => +new Date(c.updatedAt) >= WEEK_START).length,
      totalFilters: contents.reduce((sum, c) => sum + c.filtersCount, 0),
      totalKitchens: contents[0]?.kitchensCount ?? 0,
    };
  }, [contents]);

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
      <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 max-w-[1400px] mx-auto flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertTriangle className="h-12 w-12 text-red-400" />
          <p className="text-red-500 font-semibold">Failed to load search page content</p>
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
          <div className="bg-orange-100 p-2.5 rounded-lg flex items-center justify-center">
            <Search className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Search Page Content
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage search page content, images and filters that customers see
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium h-10 bg-white shadow-sm"
            onClick={() => window.open("/search", "_blank")}
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview Live Page
          </Button>
          <Button
            className="bg-[#FF5722] hover:bg-[#F4511E] text-white font-medium h-10 shadow-sm shadow-orange-200"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Search Content
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="border-orange-100 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-orange-50 p-3 rounded-lg mt-0.5">
                <Layers className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Search Contents</p>
                <h3 className="text-3xl font-bold text-orange-500 mt-1">{stats.total}</h3>
                <p className="text-xs text-gray-400 mt-1">Active search configurations</p>
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
                <p className="text-sm font-medium text-gray-500">Live on Website</p>
                <h3 className="text-3xl font-bold text-emerald-600 mt-1">{stats.live}</h3>
                <p className="text-xs text-gray-400 mt-1">Currently visible to users</p>
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
                <p className="text-sm font-medium text-gray-500">Recently Updated</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-1">{stats.recentlyUpdated}</h3>
                <p className="text-xs text-gray-400 mt-1">In last 7 days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-100 shadow-sm bg-white">
          <CardContent className="p-5">
            <div className="flex items-start gap-4">
              <div className="bg-purple-50 p-3 rounded-lg mt-0.5">
                <Filter className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Filters Used</p>
                <h3 className="text-3xl font-bold text-purple-600 mt-1">{stats.totalFilters}</h3>
                <p className="text-xs text-gray-400 mt-1">Across all search contents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Section */}
      <Card className="shadow-sm border-gray-200/60 overflow-hidden bg-white">
        {/* Table Header Controls */}
        <div className="p-5 border-b border-gray-100 bg-white flex flex-col xl:flex-row xl:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-50 p-2 rounded-md">
              <List className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Search Content History</h2>
              <p className="text-sm text-gray-500">
                View and manage all search page configurations.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by keyword..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 h-10 bg-gray-50/50 border-gray-200"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32 h-10 bg-white border-gray-200 text-gray-700 font-medium">
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
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-36 h-10 bg-white border-gray-200 text-gray-700 font-medium">
                <SelectValue className="text-gray-700" />
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
              className="h-10 text-gray-500 hover:text-gray-900"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("All");
                setSortBy("Latest");
                setCurrentPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b-gray-100 bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="h-12 font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">
                  Search Keyword
                </TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">
                  Banner Preview
                </TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">
                  Filters
                </TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">
                  Section
                </TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">
                  Kitchens
                </TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">
                  Status
                </TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">
                  Updated By
                </TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4">
                  Updated At
                </TableHead>
                <TableHead className="font-semibold text-gray-600 text-xs uppercase tracking-wider py-4 text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-32 text-center text-muted-foreground">
                    No search content found.
                  </TableCell>
                </TableRow>
              ) : (
                pageItems.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b-gray-100 hover:bg-gray-50/80 transition-colors cursor-pointer"
                    onClick={() => setEditingId(row.id)}
                  >
                    <TableCell className="py-4 align-middle">
                      <div className="flex items-center gap-2">
                        {row.isActive && (
                          <div className="w-2 h-2 rounded-full bg-emerald-600" />
                        )}
                        <div className="flex flex-col">
                          <span className="font-semibold text-emerald-800 capitalize">
                            {row.keyword}
                          </span>
                          {row.keyword === "default" && (
                            <span className="text-xs text-muted-foreground">
                              Fallback search page
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <div className="w-[170px] h-[52px] rounded-md overflow-hidden relative border border-gray-100 bg-gray-50">
                        {row.keyword === "default" ? (
                          <div className="absolute inset-0 bg-orange-50 flex flex-col items-center justify-center">
                            <span className="text-orange-500 font-bold italic text-sm">
                              RRC Kitchen
                            </span>
                            <span className="text-[10px] text-gray-500">
                              Every Homemaker is a Chef
                            </span>
                          </div>
                        ) : row.bannerImageUrl ? (
                          <Image
                            src={row.bannerImageUrl}
                            alt={row.keyword}
                            fill
                            sizes="170px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-orange-50 flex flex-col items-center justify-center">
                            <span className="text-orange-500 font-bold italic text-sm">
                              RRC Kitchen
                            </span>
                            <span className="text-[10px] text-gray-500">
                              Every Homemaker is a Chef
                            </span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <div className="flex flex-row items-center gap-2">
                        <span className="text-sm font-medium text-gray-600">
                          {row.filtersCount} filters
                        </span>
                        {row.filtersCount > 0 && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 px-2 py-0 h-5 text-[11px]">
                            Modified
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <div className="flex items-center gap-1.5 flex-wrap max-w-[140px]">
                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 px-2 py-0 h-5 text-[11px] gap-1">
                          <Tag className="h-3 w-3" />
                          {row.badgesCount}
                        </Badge>
                        <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 px-2 py-0 h-5 text-[11px] gap-1">
                          <Info className="h-3 w-3" />
                          {row.infoItemsCount}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <span className="text-sm font-medium text-gray-600">
                        {row.kitchensCount} kitchens
                      </span>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Switch
                          checked={row.isActive}
                          disabled={pendingToggleId === row.id}
                          onCheckedChange={(checked) =>
                            toggleMutation.mutate({ id: row.id, isActive: checked })
                          }
                          className={
                            row.isActive
                              ? "data-[state=checked]:bg-emerald-500"
                              : ""
                          }
                        />
                        <Badge
                          variant="outline"
                          className={
                            row.isActive
                              ? "bg-emerald-50 text-emerald-600 border-emerald-100 px-2 py-0 h-5 text-[11px]"
                              : "bg-gray-100 text-gray-500 border-gray-200 px-2 py-0 h-5 text-[11px]"
                          }
                        >
                          {row.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <span className="text-sm font-medium text-gray-600">
                        {row.updatedBy ?? "Admin"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 align-middle">
                      <span className="text-sm text-gray-500">
                        {formatDateStats(row.updatedAt)}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 align-middle text-right">
                      <div className="flex gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingId(row.id)}
                          className="h-8 border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 px-3 flex gap-1 font-medium"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDeleteTarget(row)}
                          className="h-8 w-8 p-0 border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination & Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <div className="bg-emerald-50 p-1.5 rounded text-emerald-600">
              <FileText className="h-4 w-4" />
            </div>
            <span className="font-medium">
              Showing {showingFrom} to {showingTo} of {sorted.length} entries
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Rows</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(v) => {
                  setRowsPerPage(Number(v));
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-8 w-16 bg-white border-gray-200">
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
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-gray-200 bg-white text-gray-500 hover:text-gray-900 shadow-sm"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(safePage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }).slice(0, 5).map((_, idx) => {
              const pageNum = totalPages > 5 ? safePage + idx - 2 : idx + 1;
              if (pageNum < 1 || pageNum > totalPages) return null;
              return (
                <Button
                  key={pageNum}
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(pageNum)}
                  className={
                    pageNum === safePage
                      ? "h-8 w-8 rounded-md border-transparent bg-[#FF5722] text-white hover:bg-[#F4511E] shadow-sm p-0 flex items-center justify-center font-medium"
                      : "h-8 w-8 rounded-md border-gray-200 bg-white text-gray-600 hover:bg-gray-50 shadow-sm p-0 flex items-center justify-center font-medium"
                  }
                >
                  {pageNum}
                </Button>
              );
            })}
            {totalPages > 5 && (
              <div className="px-1 text-gray-400">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            )}
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-md border-gray-200 bg-white text-gray-500 hover:text-gray-900 shadow-sm"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Add New Search Content Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Search Content</DialogTitle>
            <DialogDescription>
              Create an entirely new search experience for a keyword. You can
              customise the banner, filters, badges and settings next.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <label className="text-xs font-semibold text-gray-700">
              Search Keyword
            </label>
            <Input
              placeholder="e.g. pizza, dosa, idli..."
              value={addKeyword}
              onChange={(e) => setAddKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmitAdd()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={onSubmitAdd}
              disabled={createMutation.isPending}
              className="bg-[#FF5722] hover:bg-[#F4511E] text-white gap-2"
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Create & Open Editor
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Delete &ldquo;{deleteTarget?.keyword}&rdquo; search page?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the search configuration for{" "}
              <span className="font-semibold text-gray-800">
                &ldquo;{deleteTarget?.keyword}&rdquo;
              </span>
              . Customers searching this keyword will fall back to the default
              search page. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-200 bg-white text-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700 text-white"
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

/* Small helpers kept at the bottom to avoid JSX hoisting issues */
function formatDateStats(iso: string) {
  try {
    return format(new Date(iso), "dd MMM yyyy, hh:mm a");
  } catch {
    return iso;
  }
}