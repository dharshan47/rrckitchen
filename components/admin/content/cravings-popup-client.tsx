"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ShoppingBag,
  ConciergeBell,
  Box,
  Users,
  TrendingUp,
  Lightbulb,
  Search,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Eye,
  Save,
  CheckCircle2,
  Loader2,
  X,
  Star,
  Info,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useCravingsRules,
  useCravingsMenuOptions,
  useCravingsSelectedRuleId,
  useCravingsDraft,
  useCravingsPopupActions,
  useCravingsRulesQuery,
  useCravingsMenuItemsQuery,
  useCravingsRuleDetailQuery,
  useCreateCravingsRuleMutation,
  useUpdateCravingsRuleMutation,
  useDeleteCravingsRuleMutation,
  useToggleCravingsRuleMutation,
  cravingsPopupStore,
  type CravingsMenuOption,
} from "@/stores";

/* ------------------------- Helpers ------------------------- */

function priorityText(priority: string) {
  return priority === "HIGH" ? "High Priority" : priority === "MEDIUM" ? "Medium Priority" : "Low Priority";
}

function priorityColor(priority: string) {
  return priority === "HIGH"
    ? "text-orange-500"
    : priority === "MEDIUM"
      ? "text-yellow-600"
      : "text-slate-500";
}

function popularityLabel(item: CravingsMenuOption): "High" | "Medium" | "Low" {
  if (item.isBestseller || item.orderCount >= 50) return "High";
  if (item.orderCount >= 10) return "Medium";
  return "Low";
}

function popularityClasses(popularity: string) {
  return popularity === "High"
    ? "bg-emerald-50 text-emerald-500"
    : popularity === "Medium"
      ? "bg-yellow-50 text-yellow-600"
      : "bg-slate-100 text-slate-600";
}

function formatUpdatedAt(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  if (sameDay) return `Today, ${format(date, "hh:mm a")}`;
  return format(date, "dd MMM yyyy, hh:mm a");
}

/* ------------------------- Skeletons ------------------------- */

function RuleDetailSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in-0 duration-300">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <Skeleton className="h-6 w-56 rounded-md" />
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>
      <Skeleton className="h-11 w-full rounded-lg" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="md:col-span-2 space-y-5">
          <Skeleton className="h-14 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-16 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="pt-4 border-t border-slate-100">
        <div className="flex items-end justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-44 rounded-md" />
            <Skeleton className="h-4 w-64 rounded-md" />
          </div>
          <Skeleton className="h-9 w-28 rounded-lg" />
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    </div>
  );
}

/* ------------------------- Item Picker Dialog ------------------------- */

interface ItemPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: string[];
  onToggle: (menuItemId: string) => void;
  title?: string;
  loading?: boolean;
}

function ItemPickerDialog({ open, onOpenChange, selectedIds, onToggle, title, loading }: ItemPickerDialogProps) {
  const menuOptions = useCravingsMenuOptions();
  const [search, setSearch] = useState("");
  const [kitchenFilter, setKitchenFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const kitchens = useMemo(() => {
    const names = new Set(menuOptions.map((item) => item.kitchenName).filter(Boolean));
    return Array.from(names).sort();
  }, [menuOptions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return menuOptions.filter((item) => {
      if (q && !item.name.toLowerCase().includes(q)) return false;
      if (kitchenFilter !== "all" && item.kitchenName !== kitchenFilter) return false;
      if (typeFilter === "veg" && item.foodType !== "VEG") return false;
      if (typeFilter === "nonveg" && item.foodType !== "NONVEG") return false;
      return true;
    });
  }, [menuOptions, search, kitchenFilter, typeFilter]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title ?? "Select Recommended Items"}</DialogTitle>
          <DialogDescription>
            Pick the items shown in the cravings popup. Selected: {selectedIds.length}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white border-slate-200"
            />
          </div>
          <Select value={kitchenFilter} onValueChange={setKitchenFilter}>
            <SelectTrigger className="w-full sm:w-[190px] border-slate-200 bg-white">
              <SelectValue placeholder="All Kitchens" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Kitchens</SelectItem>
              {kitchens.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[140px] border-slate-200 bg-white">
              <SelectValue placeholder="Food Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="veg">Veg</SelectItem>
              <SelectItem value="nonveg">Non-Veg</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-white">
          {loading && menuOptions.length === 0 ? (
            <div className="p-4 space-y-4">
              {[0, 1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-5 w-5 rounded-sm shrink-0" />
                  <Skeleton className="h-10 w-10 rounded-md shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-4 w-10 shrink-0" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No menu items match your search.
            </div>
          ) : (
            filtered.map((item) => {
              const checked = selectedIds.includes(item.id);
              const popularity = popularityLabel(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onToggle(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 text-left transition-colors animate-in fade-in-0 duration-200",
                    checked ? "bg-emerald-50/60" : "hover:bg-slate-50"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => onToggle(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded bg-white data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden relative flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-slate-300" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                      {item.name}
                      {item.isBestseller && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                          <Star className="w-2.5 h-2.5 fill-current" /> Bestseller
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-slate-500 truncate">{item.kitchenName}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-2 h-2 rounded-full", item.foodType === "VEG" ? "bg-emerald-500" : "bg-red-500")} />
                      <span className="text-xs text-slate-600">{item.foodType === "VEG" ? "Veg" : "Non-Veg"}</span>
                    </div>
                    <span className={cn("text-[11px] font-semibold px-2 py-0.5 rounded-full", popularityClasses(popularity))}>
                      {popularity}
                    </span>
                    <span className="text-sm font-semibold text-slate-900">₹{item.price}</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        <DialogFooter className="mt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            Done ({selectedIds.length} selected)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------- Add / Edit Rule Dialog ------------------------- */

interface RuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
}

function RuleDialog({ open, onOpenChange, loading }: RuleDialogProps) {
  const draft = useCravingsDraft();
  const menuOptions = useCravingsMenuOptions();
  const { updateDraft, closeDraft } = useCravingsPopupActions();
  const [triggerSearch, setTriggerSearch] = useState("");
  const [triggerOpen, setTriggerOpen] = useState(false);
  const [itemPickerOpen, setItemPickerOpen] = useState(false);

  const createMutation = useCreateCravingsRuleMutation();
  const updateMutation = useUpdateCravingsRuleMutation();
  const saving = createMutation.isPending || updateMutation.isPending;

  const isEdit = Boolean(draft?.id);
  const triggerKitchenId = draft?.kitchenId;

  const triggerOptions = useMemo(() => {
    const q = triggerSearch.trim().toLowerCase();
    return menuOptions.filter(
      (item) =>
        (!q || item.name.toLowerCase().includes(q)) &&
        (!triggerKitchenId || item.kitchenId === triggerKitchenId)
    );
  }, [menuOptions, triggerSearch, triggerKitchenId]);

  useEffect(() => {
    if (draft && draft.triggerItemId) {
      const trigger = menuOptions.find((item) => item.id === draft.triggerItemId);
      if (trigger && trigger.kitchenId !== draft.kitchenId) {
        updateDraft({ kitchenId: trigger.kitchenId });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft?.triggerItemId, menuOptions]);

  if (!draft) return null;

  const triggerItem = menuOptions.find((item) => item.id === draft.triggerItemId) ?? null;
  const selectedItems = draft.itemIds
    .map((id) => menuOptions.find((item) => item.id === id))
    .filter((item): item is CravingsMenuOption => Boolean(item));

  const handleSave = async () => {
    if (!draft.name.trim()) {
      toast.error("Rule name is required");
      return;
    }
    if (!draft.triggerItemId) {
      toast.error("Please select a trigger menu item");
      return;
    }
    if (draft.itemIds.length === 0) {
      toast.error("Select at least one recommended item");
      return;
    }

    const input = {
      name: draft.name.trim(),
      triggerItemId: draft.triggerItemId,
      kitchenId: draft.kitchenId,
      title: draft.title,
      message: draft.message,
      priority: draft.priority,
      isActive: draft.isActive,
      itemIds: draft.itemIds,
    };

    if (isEdit) {
      const result = await updateMutation.mutateAsync({ id: draft.id!, input });
      if (result.success) {
        toast.success("Rule updated successfully");
        onOpenChange(false);
        closeDraft();
      } else {
        toast.error(result.error ?? "Failed to update rule");
      }
    } else {
      const result = await createMutation.mutateAsync(input);
      if (result.success) {
        toast.success("Rule created successfully");
        onOpenChange(false);
        closeDraft();
      } else {
        toast.error(result.error ?? "Failed to create rule");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 fade-in-0 duration-200">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Rule" : "Add New Rule"}</DialogTitle>
          <DialogDescription>
            Create a cross-sell rule: when a customer adds the trigger item, we show the recommended items in the popup.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Rule Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Biryani Orders"
                value={draft.name}
                onChange={(e) => updateDraft({ name: e.target.value })}
                className="border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                Priority
              </Label>
              <Select
                value={draft.priority}
                onValueChange={(value) => updateDraft({ priority: value as "HIGH" | "MEDIUM" | "LOW" })}
              >
                <SelectTrigger className="border-slate-200">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[10px] text-slate-500 mt-1">
                Higher priority rules are applied first
              </p>
            </div>
          </div>

          {/* Trigger item picker */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">
              Trigger Menu Item <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                placeholder="Search trigger item... e.g. Chicken Biryani"
                value={triggerSearch}
                onChange={(e) => {
                  setTriggerSearch(e.target.value);
                  setTriggerOpen(true);
                }}
                onFocus={() => setTriggerOpen(true)}
                className="border-slate-200 pr-9"
              />
              {triggerItem && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full max-w-[160px] truncate">
                    {triggerItem.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateDraft({ triggerItemId: "", kitchenId: "" })}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {triggerOpen && (
              <div className="mt-1 border border-slate-200 rounded-lg bg-white shadow-lg max-h-56 overflow-y-auto z-10 animate-in fade-in-0 slide-in-from-top-1 duration-200">
                {loading && menuOptions.length === 0 ? (
                  <div className="p-3 space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="h-8 w-8 rounded-md shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <Skeleton className="h-3.5 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : triggerOptions.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-500">No items found</div>
                ) : (
                  triggerOptions.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      updateDraft({ triggerItemId: item.id, kitchenId: item.kitchenId });
                      setTriggerOpen(false);
                    }}
                    className={cn(
                      "w-full flex items-center gap-3 p-2.5 text-left transition-colors",
                      draft.triggerItemId === item.id ? "bg-emerald-50" : "hover:bg-slate-50"
                    )}
                  >
                    <div className="w-8 h-8 rounded-md bg-slate-100 overflow-hidden relative flex-shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} width={32} height={32} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-3.5 h-3.5 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.kitchenName}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-700 shrink-0">₹{item.price}</span>
                  </button>
                ))
                )}
              </div>
            )}
            {triggerItem && (
              <p className="text-[11px] text-slate-500">
                Kitchen: <span className="font-medium text-slate-700">{triggerItem.kitchenName}</span>
              </p>
            )}
          </div>

          {/* Popup content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Popup Title</Label>
              <Input
                placeholder="Complete Your Meal 🍽️"
                value={draft.title}
                onChange={(e) => updateDraft({ title: e.target.value })}
                className="border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-700">Status</Label>
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={draft.isActive}
                  onCheckedChange={(checked) => updateDraft({ isActive: checked })}
                  className="data-[state=checked]:bg-emerald-500"
                />
                <div>
                  <span className="text-sm font-semibold text-slate-800 block">
                    {draft.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {draft.isActive ? "This rule is currently active" : "Rule is paused"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-700">Message</Label>
            <Textarea
              value={draft.message}
              onChange={(e) => updateDraft({ message: e.target.value })}
              placeholder="Customers usually order these together."
              className="border-slate-200 min-h-[70px] resize-none"
            />
          </div>

          {/* Recommended items */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-slate-700">
                Recommended Items <span className="text-red-500">*</span> ({draft.itemIds.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItemPickerOpen(true)}
                className="border-emerald-500 text-emerald-500 hover:bg-emerald-50"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Items
              </Button>
            </div>
            {selectedItems.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                No recommended items selected yet. Click &quot;Add Items&quot; to pick from the menu.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-lg overflow-hidden bg-white divide-y divide-slate-100">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 animate-in fade-in-0 slide-in-from-left-1 duration-200">
                    <GripVertical className="w-4 h-4 text-slate-300 cursor-grab shrink-0" />
                    <div className="w-9 h-9 rounded-md bg-slate-100 overflow-hidden relative flex-shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} width={36} height={36} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-slate-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{item.kitchenName}</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">₹{item.price}</span>
                    <button
                      type="button"
                      onClick={() => cravingsPopupStore.getState().toggleDraftItem(item.id)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              closeDraft();
            }}
            className="border-slate-200"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Rule
          </Button>
        </DialogFooter>

        <ItemPickerDialog
          open={itemPickerOpen}
          onOpenChange={setItemPickerOpen}
          selectedIds={draft.itemIds}
          onToggle={cravingsPopupStore.getState().toggleDraftItem}
          loading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------- Popup Preview ------------------------- */

interface PopupPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  message: string;
  recommendationsTitle?: string;
  triggerItemName: string;
  items: CravingsMenuOption[];
}

function PopupPreviewDialog({ open, onOpenChange, title, message, recommendationsTitle, triggerItemName, items }: PopupPreviewDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[420px] gap-0 overflow-hidden rounded-[24px] border-0 p-0 shadow-2xl animate-in zoom-in-95 fade-in-0 duration-200"
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
          className="absolute top-4 right-4 z-10 rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100"
        >
          <X className="h-5 w-5" />
        </button>
        <ScrollArea className="h-[min(85vh,640px)]">
          <div className="p-6 md:p-8">
            <div className="mb-6 text-center">
              <div className="relative mb-3 flex items-center justify-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-green-100 bg-green-50">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                    <CheckCircle2 className="h-6 w-6 fill-green-100 text-green-600" />
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900">{title}</h3>
              <p className="mt-1 text-sm text-gray-500">{message}</p>
            </div>

          <div className="mb-6 rounded-[16px] border border-gray-100 bg-gray-50 p-4">
            <p className="text-[13px] text-gray-600">
              <span className="font-extrabold text-gray-900">{triggerItemName || "Item"}</span> added to cart
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-[15px] font-extrabold text-gray-900 mb-3 flex items-center gap-1.5">
              <span className="text-red-500 text-lg leading-none">❤️</span> {recommendationsTitle || title || "Recommended for you"}
            </h4>
            <div className="flex flex-col gap-3">
              {items.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-6">
                  No recommended items yet.
                </p>
              )}
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-[12px] border border-gray-100 bg-white p-2 shadow-sm animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="relative h-[96px] w-[130px] shrink-0 overflow-hidden rounded-[8px] bg-orange-50">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-orange-200" />
                      </div>
                    )}
                    {item.isBestseller && (
                      <div className="absolute bottom-0 left-0 z-10 rounded-tr-[8px] bg-[#008000] px-2 py-0.5 text-[10px] font-bold text-white">
                        Bestseller
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1 pr-1">
                    <div>
                      <h5 className="text-[15px] font-bold leading-tight text-gray-900">{item.name}</h5>
                      <p className="mt-0.5 text-[11px] text-gray-500">{item.kitchenName}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-[15px] font-extrabold text-[#008000]">₹{item.price}</div>
                      <div className="rounded-[6px] border border-[#EE7005] bg-white px-3 py-1 text-[12px] font-extrabold text-[#EE7005]">
                        ADD
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-row gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-[12px] border-[#EE7005] py-3.5 text-[13px] font-bold uppercase tracking-wider text-[#EE7005] hover:bg-orange-50"
            >
              Not Now
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-[12px] bg-[#EE7005] py-3.5 text-[13px] font-bold uppercase tracking-wider text-white hover:bg-[#EE7005] hover:brightness-110"
            >
              Checkout
            </Button>
          </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

/* ------------------------- Main Page ------------------------- */

export default function CravingsPopupPage() {
  const rules = useCravingsRules();
  const menuOptions = useCravingsMenuOptions();
  const selectedRuleId = useCravingsSelectedRuleId();
  const draft = useCravingsDraft();
  const {
    setSelectedRuleId,
    openCreateDraft,
    openEditDraft,
    closeDraft,
    updateDraft,
    toggleDraftItem,
  } = useCravingsPopupActions();

  const rulesQuery = useCravingsRulesQuery();
  const { isFetching: menuLoading } = useCravingsMenuItemsQuery();

  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [itemsDialogOpen, setItemsDialogOpen] = useState(false);

  const deleteMutation = useDeleteCravingsRuleMutation();
  const toggleMutation = useToggleCravingsRuleMutation();

  const filteredRules = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rules.filter((rule) => {
      if (statusFilter === "active" && !rule.isActive) return false;
      if (statusFilter === "inactive" && rule.isActive) return false;
      if (q && !rule.name.toLowerCase().includes(q) && !rule.triggerItemName.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [rules, search, statusFilter]);

  const selectedRule = useMemo(
    () => rules.find((rule) => rule.id === selectedRuleId) ?? rules[0] ?? null,
    [rules, selectedRuleId]
  );

  const effectiveSelectedId = selectedRule?.id ?? null;

  const { data: ruleDetail, isFetching: detailFetching } = useCravingsRuleDetailQuery(
    effectiveSelectedId,
    Boolean(effectiveSelectedId)
  );

  // Sync the editor draft when the selected rule changes.
  useEffect(() => {
    if (ruleDetail) {
      const current = cravingsPopupStore.getState().draft;
      // Don't clobber an in-progress "create" draft (no id yet).
      if (!current) {
        openEditDraft(ruleDetail);
      } else if (current.id && current.id !== ruleDetail.id) {
        openEditDraft(ruleDetail);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleDetail?.id]);

  const loadingRules = rulesQuery.isLoading;

  // Stats
  const stats = useMemo(() => {
    const activeRules = rules.filter((r) => r.isActive).length;
    const totalMappings = rules.reduce((sum, r) => sum + r.itemsCount, 0);
    const impactedOrders = rules.reduce((sum, r) => sum + r.triggerOrderCount, 0);
    return { activeRules, totalMappings, impactedOrders };
  }, [rules]);

  const editing = draft && draft.id === effectiveSelectedId ? draft : null;

  const handleOpenCreate = () => {
    openCreateDraft();
    setRuleDialogOpen(true);
  };

  const handleOpenEdit = () => {
    if (!editing) {
      if (ruleDetail) openEditDraft(ruleDetail);
    }
    setRuleDialogOpen(true);
  };

  const handleDeleteRule = async () => {
    if (!effectiveSelectedId) return;
    const result = await deleteMutation.mutateAsync(effectiveSelectedId);
    if (result.success) {
      toast.success("Rule deleted successfully");
      setDeleteDialogOpen(false);
      setSelectedRuleId(null);
      closeDraft();
    } else {
      toast.error(result.error ?? "Failed to delete rule");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    const result = await toggleMutation.mutateAsync({ id, isActive });
    if (!result.success) {
      toast.error(result.error ?? "Failed to update status");
    } else {
      toast.success(isActive ? "Rule activated" : "Rule deactivated");
    }
  };

  const handleSaveAll = async () => {
    if (!editing) return;
    const input = {
      name: editing.name.trim(),
      triggerItemId: editing.triggerItemId,
      kitchenId: editing.kitchenId,
      title: editing.title,
      message: editing.message,
      priority: editing.priority,
      isActive: editing.isActive,
      itemIds: editing.itemIds,
    };
    if (!input.name.trim()) {
      toast.error("Rule name is required");
      return;
    }
    if (!input.triggerItemId) {
      toast.error("Trigger item is required");
      return;
    }
    const result = await updateMutation.mutateAsync({ id: editing.id!, input });
    if (result.success) {
      toast.success("Changes saved successfully");
    } else {
      toast.error(result.error ?? "Failed to save changes");
    }
  };

  const updateMutation = useUpdateCravingsRuleMutation();
  const savingAll = updateMutation.isPending;

  // Selected rule items for the recommended table (from draft if editing)
  const selectedItems = useMemo(() => {
    const ids = editing?.itemIds ?? ruleDetail?.items.map((i) => i.menuItemId) ?? [];
    return ids
      .map((id) => menuOptions.find((item) => item.id === id))
      .filter((item): item is CravingsMenuOption => Boolean(item));
  }, [editing, ruleDetail, menuOptions]);

  const previewItems = useMemo(
    () => {
      const ids = editing?.itemIds ?? ruleDetail?.items.map((i) => i.menuItemId) ?? [];
      return ids
        .map((id) => menuOptions.find((m) => m.id === id))
        .filter((m): m is CravingsMenuOption => Boolean(m));
    },
    [editing, ruleDetail, menuOptions]
  );

  return (
    <div className="flex flex-col min-h-screen pb-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-in fade-in-0 slide-in-from-top-2 duration-300">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Cravings Popup Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage smart recommendations shown to customers after placing orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            disabled={!effectiveSelectedId}
            className="border-emerald-500 text-emerald-500 hover:bg-emerald-50"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Popup
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={!editing || savingAll}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {savingAll ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="shadow-sm border-slate-100 animate-in fade-in-0 duration-300" style={{ animationDelay: "40ms" }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-lg">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Active Rules</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {loadingRules ? <Skeleton className="h-7 w-10" /> : stats.activeRules}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Smart rules</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 animate-in fade-in-0 duration-300" style={{ animationDelay: "80ms" }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-orange-50 text-orange-500 rounded-lg">
              <ConciergeBell className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total Mappings</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {loadingRules ? <Skeleton className="h-7 w-10" /> : stats.totalMappings}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Menu mappings</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 animate-in fade-in-0 duration-300" style={{ animationDelay: "120ms" }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-500 rounded-lg">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Total Menu Items
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {menuOptions.length || <Skeleton className="h-7 w-10" />}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Available items</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 animate-in fade-in-0 duration-300" style={{ animationDelay: "160ms" }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-purple-50 text-purple-500 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Impacted Orders
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {loadingRules ? <Skeleton className="h-7 w-10" /> : stats.impactedOrders}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Trigger item orders</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 animate-in fade-in-0 duration-300" style={{ animationDelay: "200ms" }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-500 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                Avg Items per Rule
              </p>
              <h3 className="text-2xl font-bold text-slate-900 mt-0.5">
                {loadingRules ? <Skeleton className="h-7 w-10" /> : rules.length > 0 ? (stats.totalMappings / rules.length).toFixed(1) : "0"}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Across all rules</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-slate-100 bg-emerald-50/50 animate-in fade-in-0 duration-300" style={{ animationDelay: "240ms" }}>
          <CardContent className="p-4 flex gap-3 h-full">
            <div className="mt-0.5 text-emerald-500">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                How it works?
              </p>
              <p className="text-xs text-slate-600 mt-1 leading-snug">
                When a customer adds an item, we show them curated items
                based on the trigger item rules.
              </p>
              <p className="text-xs font-semibold text-emerald-500 mt-2 inline-flex items-center">
                Rules are applied in priority order <ChevronRight className="w-3 h-3 ml-0.5" />
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Left Sidebar - Rules List */}
        <div className="lg:col-span-4 flex flex-col gap-4 animate-in fade-in-0 slide-in-from-left-2 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Cravings Rules
              </h2>
              <p className="text-xs text-slate-500">
                Manage rules based on trigger menu items
              </p>
            </div>
            <Button size="sm" onClick={handleOpenCreate} className="bg-emerald-500 hover:bg-emerald-600">
              <Plus className="w-4 h-4 mr-1.5" /> Add New Rule
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search rules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-white shadow-sm border-slate-200"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] bg-white shadow-sm border-slate-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2 mt-2">
            {loadingRules ? (
              <>
                <Skeleton className="h-[68px] w-full rounded-xl" />
                <Skeleton className="h-[68px] w-full rounded-xl" />
                <Skeleton className="h-[68px] w-full rounded-xl" />
              </>
            ) : filteredRules.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                <Box className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No rules found</p>
              </div>
            ) : (
              filteredRules.map((rule, index) => (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between animate-in fade-in-0 slide-in-from-bottom-1 duration-300 ${
                    effectiveSelectedId === rule.id
                      ? "border-emerald-500 bg-emerald-50/30 shadow-sm"
                      : "border-slate-200 bg-white hover:border-emerald-300"
                  }`}
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 relative">
                      {rule.triggerItemImage ? (
                        <Image
                          src={rule.triggerItemImage}
                          alt={rule.triggerItemName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-orange-50">
                          <ShoppingBag className="w-5 h-5 text-orange-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5 mt-0.5">
                      <h4 className="text-sm font-semibold text-slate-900">
                        {rule.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Show items when customer orders {rule.triggerItemName}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] font-medium text-slate-600">
                          {rule.itemsCount} Items
                        </span>
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className={`text-[11px] font-medium ${priorityColor(rule.priority)}`}>
                          {priorityText(rule.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {rule.isActive ? (
                      <span className="text-xs font-semibold text-emerald-500 flex items-center">
                        Active
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-400 flex items-center">
                        Inactive
                      </span>
                    )}
                    <ChevronRight
                      className={`w-4 h-4 ${
                        effectiveSelectedId === rule.id
                          ? "text-emerald-500"
                          : "text-slate-400"
                      }`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 flex items-start gap-2 mt-2">
            <div className="text-slate-400 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <p className="text-xs text-slate-600">
              Rules are matched in priority order. <br />
              Higher priority rules will be applied first.
            </p>
          </div>
        </div>

        {/* Right Content - Rule Details */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!selectedRule ? (
            <div className="flex flex-col items-center justify-center h-[500px] border border-dashed border-slate-200 rounded-xl bg-slate-50 animate-in fade-in-0 duration-300">
              <Box className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700">
                No Rule Selected
              </h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm text-center">
                Select a rule from the left panel to view and edit its settings,
                or create a new rule.
              </p>
              <Button onClick={handleOpenCreate} className="mt-5 bg-emerald-500 hover:bg-emerald-600">
                <Plus className="w-4 h-4 mr-1.5" /> Add New Rule
              </Button>
            </div>
          ) : detailFetching && !ruleDetail ? (
            <RuleDetailSkeleton />
          ) : ruleDetail ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 animate-in fade-in-0 duration-300">
                <div className="flex items-center gap-3">
                  <h2 className="text-lg font-bold text-slate-900">
                    Editing Rule: {editing?.name ?? ruleDetail.name}
                  </h2>
                  {ruleDetail.isActive ? (
                    <Badge className="bg-emerald-100 text-emerald-600 hover:bg-emerald-100 border-none font-semibold px-2 py-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-slate-100 text-slate-500 hover:bg-slate-100 border-none font-semibold px-2 py-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mr-1.5"></span>
                      Inactive
                    </Badge>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" /> Delete Rule
                </Button>
              </div>

              <Tabs defaultValue="settings" className="w-full animate-in fade-in-0 duration-300">
                <TabsList className="bg-transparent border-b border-slate-200 w-full justify-start h-auto rounded-none p-0">
                  <TabsTrigger
                    value="settings"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none px-4 py-3 text-sm font-semibold text-slate-500"
                  >
                    Rule Settings
                  </TabsTrigger>
                  <TabsTrigger
                    value="items"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none px-4 py-3 text-sm font-semibold text-slate-500"
                  >
                    Recommended Items ({editing?.itemIds.length ?? ruleDetail.items.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="display"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none px-4 py-3 text-sm font-semibold text-slate-500"
                  >
                    Display Settings
                  </TabsTrigger>
                  <TabsTrigger
                    value="popup"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none px-4 py-3 text-sm font-semibold text-slate-500"
                  >
                    Popup Content
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-emerald-500 data-[state=active]:text-emerald-600 rounded-none px-4 py-3 text-sm font-semibold text-slate-500"
                  >
                    Preview
                  </TabsTrigger>
                </TabsList>

                {/* Rule Settings Tab Content */}
                <TabsContent value="settings" className="pt-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 flex flex-col gap-5">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">
                          Rule Name <span className="text-red-500">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            value={editing?.name ?? ruleDetail.name}
                            onChange={(e) => updateDraft({ name: e.target.value })}
                            className="pr-16 border-slate-200"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400">
                            {(editing?.name ?? ruleDetail.name).length}/50
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">
                          Description
                        </Label>
                        <div className="relative">
                          <Textarea
                            value={editing?.message ?? ruleDetail.message}
                            onChange={(e) => updateDraft({ message: e.target.value })}
                            className="pr-16 resize-none min-h-[80px] border-slate-200"
                          />
                          <span className="absolute right-3 bottom-3 text-[10px] text-slate-400">
                            {(editing?.message ?? ruleDetail.message).length}/200
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">
                          Trigger Condition
                        </Label>
                        <div className="flex items-center gap-2 border border-slate-200 rounded-md p-1.5 bg-white">
                          <span className="text-sm text-slate-600 pl-2">
                            When customer orders
                          </span>
                          <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 rounded pl-2 pr-1 py-1">
                            <span className="text-xs font-medium text-emerald-700">
                              {ruleDetail.triggerItemName}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                updateDraft({ triggerItemId: "", kitchenId: "" });
                                handleOpenEdit();
                              }}
                              className="text-slate-400 hover:text-slate-600"
                              aria-label="Remove trigger"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="flex-1 text-right">
                            <button
                              type="button"
                              onClick={handleOpenEdit}
                              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 pr-2"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          Kitchen: <span className="font-medium text-slate-700">{ruleDetail.kitchenName}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-6 pt-2">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-700">
                            Priority
                          </Label>
                          <Select
                            value={editing?.priority ?? ruleDetail.priority}
                            onValueChange={(value) =>
                              updateDraft({ priority: value as "HIGH" | "MEDIUM" | "LOW" })
                            }
                          >
                            <SelectTrigger className="border-slate-200">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HIGH">High</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="LOW">Low</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-slate-500 mt-1">
                            Higher priority rules will be applied first
                          </p>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold text-slate-700">
                            Status
                          </Label>
                          <div className="flex items-center gap-3 pt-1">
                            <Switch
                              checked={editing?.isActive ?? ruleDetail.isActive}
                              onCheckedChange={(checked) => {
                                updateDraft({ isActive: checked });
                                handleToggleActive(ruleDetail.id, checked);
                              }}
                              className="data-[state=checked]:bg-emerald-500"
                            />
                            <div>
                              <span className="text-sm font-semibold text-slate-800 block">
                                {editing?.isActive ?? ruleDetail.isActive ? "Active" : "Inactive"}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {editing?.isActive ?? ruleDetail.isActive
                                  ? "This rule is currently active"
                                  : "This rule is paused"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right side - Rule Summary Card */}
                    <div>
                      <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-5">
                        <h4 className="text-sm font-bold text-slate-900 mb-4">
                          Rule Summary
                        </h4>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-emerald-500">
                              <Box className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-medium mb-0.5">
                                Trigger Item
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {ruleDetail.triggerItemName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-emerald-500">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-medium mb-0.5">
                                Recommended Items
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {editing?.itemIds.length ?? ruleDetail.items.length} items selected
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-emerald-500">
                              <ConciergeBell className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-medium mb-0.5">
                                Kitchen
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {ruleDetail.kitchenName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-emerald-500">
                              <TrendingUp className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-medium mb-0.5">
                                Priority
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {priorityText(ruleDetail.priority).split(" ")[0]}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-emerald-500">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-medium mb-0.5">
                                Status
                              </p>
                              <p className="text-sm font-semibold text-emerald-500">
                                {ruleDetail.isActive ? "Active" : "Inactive"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 pt-2 border-t border-slate-200">
                            <div className="mt-0.5 text-slate-400">
                              <Info className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs text-slate-500 font-medium mb-0.5">
                                Last Updated
                              </p>
                              <p className="text-sm font-semibold text-slate-900">
                                {formatUpdatedAt(ruleDetail.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Items Section (Appears below in settings) */}
                  <div className="mt-10 border-t border-slate-100 pt-8">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Recommended Items ({editing?.itemIds.length ?? ruleDetail.items.length})
                        </h3>
                        <p className="text-sm text-slate-500 mt-1">
                          Select items to show in cravings popup after{" "}
                          {ruleDetail.triggerItemName} orders
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button onClick={() => setItemsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                          <Plus className="w-4 h-4 mr-1.5" /> Add Items
                        </Button>
                      </div>
                    </div>

                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <Table className="text-left">
                        <TableHeader className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-700">
                          <TableRow className="border-slate-200 hover:bg-transparent">
                            <TableHead className="px-4 py-3 w-10 text-center text-slate-400 font-semibold">
                              <span className="text-slate-400">#</span>
                            </TableHead>
                            <TableHead className="px-4 py-3 text-slate-700 font-semibold">Menu Item</TableHead>
                            <TableHead className="px-4 py-3 text-slate-700 font-semibold">Kitchen</TableHead>
                            <TableHead className="px-4 py-3 text-slate-700 font-semibold">Price</TableHead>
                            <TableHead className="px-4 py-3 text-slate-700 font-semibold">Food Type</TableHead>
                            <TableHead className="px-4 py-3 text-slate-700 font-semibold">Popularity</TableHead>
                            <TableHead className="px-4 py-3 text-right text-slate-700 font-semibold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100">
                          {selectedItems.length === 0 && (
                            <TableRow className="hover:bg-transparent border-slate-100">
                              <TableCell colSpan={7} className="px-4 py-10 text-center text-sm text-slate-400">
                                No recommended items. Click &quot;Add Items&quot; to add some.
                              </TableCell>
                            </TableRow>
                          )}
                          {selectedItems.map((item, index) => {
                            const popularity = popularityLabel(item);
                            return (
                              <TableRow
                                key={item.id}
                                className="hover:bg-slate-50 transition-colors group animate-in fade-in-0 duration-200 border-slate-100"
                                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                              >
                                <TableCell className="px-4 py-3 text-center align-middle">
                                  <div className="flex items-center justify-center gap-2">
                                    <GripVertical className="w-4 h-4 text-slate-300 cursor-grab hover:text-slate-500" />
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-md bg-slate-100 overflow-hidden relative flex-shrink-0">
                                      {item.imageUrl ? (
                                        <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <ShoppingBag className="w-4 h-4 text-slate-300" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-semibold text-slate-900 flex items-center gap-2">
                                        {item.name}
                                        {item.isBestseller && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">
                                            <Star className="w-2.5 h-2.5 fill-current" /> Bestseller
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-slate-600">
                                  {item.kitchenName}
                                </TableCell>
                                <TableCell className="px-4 py-3 font-medium text-slate-900">
                                  ₹{item.price}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        item.foodType === "VEG"
                                          ? "bg-emerald-500"
                                          : "bg-red-500"
                                      }`}
                                    ></div>
                                    <span className="text-slate-600">
                                      {item.foodType === "VEG" ? "Veg" : "Non-Veg"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <span
                                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${popularityClasses(popularity)}`}
                                  >
                                    {popularity}
                                  </span>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => toggleDraftItem(item.id)}
                                      className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      <div className="bg-slate-50 border-t border-slate-200 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Info className="w-3.5 h-3.5" />
                          Items appear in the popup in this order
                        </div>
                        <div className="text-xs font-semibold text-slate-600">
                          {selectedItems.length} items selected
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="items" className="pt-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Recommended Items ({editing?.itemIds.length ?? ruleDetail.items.length})
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        Manage the items shown when a customer adds {ruleDetail.triggerItemName}
                      </p>
                    </div>
                    <Button onClick={() => setItemsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="w-4 h-4 mr-1.5" /> Add Items
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 border border-slate-200 rounded-xl bg-white p-3 animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
                        style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
                      >
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden relative flex-shrink-0">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-slate-300" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">{item.name}</p>
                          <p className="text-xs text-slate-500 truncate">{item.kitchenName}</p>
                        </div>
                        <span className="text-sm font-semibold text-slate-900">₹{item.price}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleDraftItem(item.id)}
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {selectedItems.length === 0 && (
                      <div className="md:col-span-2 text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-500 text-sm">No items yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="display" className="pt-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-5 max-w-lg">
                    <h4 className="text-sm font-bold text-slate-900 mb-4">Display Settings</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Popup Title</p>
                          <p className="text-[11px] text-slate-500">Shown at the top of the cravings popup</p>
                        </div>
                        <Input
                          value={editing?.title ?? ruleDetail.title}
                          onChange={(e) => updateDraft({ title: e.target.value })}
                          className="w-56 border-slate-200"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Message</p>
                          <p className="text-[11px] text-slate-500">Description under the popup title</p>
                        </div>
                        <Input
                          value={editing?.message ?? ruleDetail.message}
                          onChange={(e) => updateDraft({ message: e.target.value })}
                          className="w-56 border-slate-200"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="popup" className="pt-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-5 max-w-lg">
                    <h4 className="text-sm font-bold text-slate-900 mb-4">Popup Content</h4>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Popup Title</Label>
                        <Input
                          value={editing?.title ?? ruleDetail.title}
                          onChange={(e) => updateDraft({ title: e.target.value })}
                          className="border-slate-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs font-semibold text-slate-700">Message</Label>
                        <Textarea
                          value={editing?.message ?? ruleDetail.message}
                          onChange={(e) => updateDraft({ message: e.target.value })}
                          className="border-slate-200 min-h-[80px]"
                        />
                      </div>
                      <Button onClick={() => setPreviewOpen(true)} variant="outline" className="border-emerald-500 text-emerald-500 hover:bg-emerald-50">
                        <Eye className="w-4 h-4 mr-2" /> Live Preview
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="preview" className="pt-6 animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="flex justify-center">
                    <button type="button" onClick={() => setPreviewOpen(true)} className="w-full max-w-[420px] cursor-pointer">
                      <PopupPreviewCard
                        title={editing?.title ?? ruleDetail.title}
                        message={editing?.message ?? ruleDetail.message}
                        triggerItemName={ruleDetail.triggerItemName}
                        items={previewItems}
                      />
                    </button>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] border border-dashed border-slate-200 rounded-xl bg-slate-50">
              <Box className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-semibold text-slate-700">
                Rule not found
              </h3>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <RuleDialog open={ruleDialogOpen} onOpenChange={(open) => { setRuleDialogOpen(open); if (!open) closeDraft(); }} loading={menuLoading} />

      <PopupPreviewDialog
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title={editing?.title ?? ruleDetail?.title ?? ""}
        message={editing?.message ?? ruleDetail?.message ?? ""}
        recommendationsTitle={editing?.title ?? ruleDetail?.title ?? ""}
        triggerItemName={ruleDetail?.triggerItemName ?? ""}
        items={previewItems}
      />

      <ItemPickerDialog
        open={itemsDialogOpen}
        onOpenChange={setItemsDialogOpen}
        selectedIds={editing?.itemIds ?? []}
        onToggle={toggleDraftItem}
        title="Add Recommended Items"
        loading={menuLoading}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this rule?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the rule for &quot;{ruleDetail?.triggerItemName ?? "this item"}&quot;
              and its recommended items. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteRule();
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Delete Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ------------------------- Inline preview card ------------------------- */

function PopupPreviewCard({
  title,
  message,
  triggerItemName,
  items,
}: {
  title: string;
  message: string;
  triggerItemName: string;
  items: CravingsMenuOption[];
}) {
  return (
    <div className="max-w-[420px] rounded-[24px] border border-slate-200 bg-white shadow-2xl text-left">
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <div className="mb-6 text-center">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-green-100 bg-green-50">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-6 w-6 fill-green-100 text-green-600" />
              </div>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-500">{message}</p>
        </div>
        <div className="mb-6 rounded-[16px] border border-gray-100 bg-gray-50 p-4">
          <p className="text-[13px] text-gray-600">
            <span className="font-extrabold text-gray-900">{triggerItemName}</span> added to cart
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-[12px] border border-gray-100 bg-white p-2 shadow-sm">
              <div className="relative h-[96px] w-[130px] shrink-0 overflow-hidden rounded-[8px] bg-orange-50">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-orange-200" />
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between py-1 pr-1">
                <div>
                  <h5 className="text-[15px] font-bold leading-tight text-gray-900">{item.name}</h5>
                  <p className="mt-0.5 text-[11px] text-gray-500">{item.kitchenName}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-[15px] font-extrabold text-[#008000]">₹{item.price}</div>
                  <div className="rounded-[6px] border border-[#EE7005] bg-white px-3 py-1 text-[12px] font-extrabold text-[#EE7005]">
                    ADD
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-sm text-slate-500 text-center py-6">No recommended items yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
