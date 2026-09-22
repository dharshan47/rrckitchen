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
  List,
  Flag,
  Calendar,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
    ? "text-[#EF4444]"
    : priority === "MEDIUM"
      ? "text-[#D97706]"
      : "text-[#06701E]";
}

function popularityLabel(item: CravingsMenuOption): "High" | "Medium" | "Low" {
  if (item.isBestseller || item.orderCount >= 50) return "High";
  if (item.orderCount >= 10) return "Medium";
  return "Low";
}

function popularityClasses(popularity: string) {
  return popularity === "High"
    ? "bg-[#EAF6ED] text-[#06701E]"
    : popularity === "Medium"
      ? "bg-[#FFF7E8] text-[#D97706]"
      : "bg-[#F1F5F9] text-[#475569]";
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
      <div className="flex items-center justify-between pb-4 border-b border-[#EEF1F3]">
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
      <div className="pt-4 border-t border-[#EEF1F3]">
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
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <Input
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] h-10 text-[#111827] focus-visible:ring-1 focus-visible:ring-[#06701E]"
            />
          </div>
          <Select value={kitchenFilter} onValueChange={setKitchenFilter}>
            <SelectTrigger className="w-full sm:w-[190px] bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] h-10 text-[#111827]">
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
            <SelectTrigger className="w-full sm:w-[140px] bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] h-10 text-[#111827]">
              <SelectValue placeholder="Food Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="veg">Veg</SelectItem>
              <SelectItem value="nonveg">Non-Veg</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto border border-[#EEF1F3] rounded-[10px] divide-y divide-[#EEF1F3] bg-white">
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
            <div className="py-12 text-center text-[14px] font-medium text-[#94A3B8]">
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
                    checked ? "bg-[#F8FCF9]" : "hover:bg-[#F8FAFC]"
                  )}
                >
                  <Checkbox
                    checked={checked}
                    onCheckedChange={() => onToggle(item.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="rounded bg-white data-[state=checked]:bg-[#06701E] data-[state=checked]:border-[#06701E]"
                  />
                  <div className="w-10 h-10 rounded-[8px] bg-[#FFF2EB] overflow-hidden relative flex-shrink-0">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="w-4 h-4 text-[#FF4B04]/40" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-[#111827] text-[14px] flex items-center gap-2">
                      {item.name}
                      {item.isBestseller && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF4B04] bg-[#FFF2EB] px-1.5 py-0.5 rounded-[4px]">
                          <Star className="w-[10px] h-[10px] fill-current" /> Bestseller
                        </span>
                      )}
                    </p>
                    <p className="text-[12px] font-medium text-[#475569] truncate">{item.kitchenName}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5">
                      <div className={cn("w-2 h-2 rounded-full", item.foodType === "VEG" ? "bg-[#06701E]" : "bg-[#EF4444]")} />
                      <span className="text-[13px] font-medium text-[#475569]">{item.foodType === "VEG" ? "Veg" : "Non-Veg"}</span>
                    </div>
                    <span className={cn("text-[11px] font-bold px-2.5 py-1 rounded-full", popularityClasses(popularity))}>
                      {popularity}
                    </span>
                    <span className="text-[14px] font-bold text-[#111827]">₹{item.price}</span>
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
            className="border-[#DDE3E8] text-[#334155] rounded-[8px]"
          >
            Cancel
          </Button>
          <Button
            onClick={() => onOpenChange(false)}
            className="bg-[#06701E] hover:bg-[#045A18] text-white rounded-[8px]"
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
              <Label className="text-[14px] font-semibold text-[#334155]">
                Rule Name <span className="text-[#FF4B04]">*</span>
              </Label>
              <Input
                placeholder="e.g. Biryani Orders"
                value={draft.name}
                onChange={(e) => updateDraft({ name: e.target.value })}
                className="bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] h-10 text-[#111827] focus-visible:ring-1 focus-visible:ring-[#06701E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold text-[#334155]">
                Priority
              </Label>
              <Select
                value={draft.priority}
                onValueChange={(value) => updateDraft({ priority: value as "HIGH" | "MEDIUM" | "LOW" })}
              >
                <SelectTrigger className="bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] h-10 text-[#111827]">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="LOW">Low</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-[12px] text-[#64748B] mt-1">
                Higher priority rules are applied first
              </p>
            </div>
          </div>

          {/* Trigger item picker */}
          <div className="space-y-1.5">
            <Label className="text-[14px] font-semibold text-[#334155]">
              Trigger Menu Item <span className="text-[#FF4B04]">*</span>
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
                className="bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] h-10 pr-9 text-[#111827] focus-visible:ring-1 focus-visible:ring-[#06701E]"
              />
              {triggerItem && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#06701E] bg-[#EAF6ED] px-2 py-0.5 rounded-full max-w-[160px] truncate">
                    {triggerItem.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateDraft({ triggerItemId: "", kitchenId: "" })}
                    className="text-[#94A3B8] hover:text-[#475569]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            {triggerOpen && (
              <div className="mt-1 border border-[#EEF1F3] rounded-[10px] bg-white shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)] max-h-56 overflow-y-auto z-10 animate-in fade-in-0 slide-in-from-top-1 duration-200">
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
                  <div className="py-8 text-center text-[13px] font-medium text-[#94A3B8]">No items found</div>
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
                      draft.triggerItemId === item.id ? "bg-[#F8FCF9]" : "hover:bg-[#F8FAFC]"
                    )}
                  >
                    <div className="w-8 h-8 rounded-[6px] bg-[#FFF2EB] overflow-hidden relative flex-shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} width={32} height={32} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-3.5 h-3.5 text-[#FF4B04]/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-[#111827] truncate">{item.name}</p>
                      <p className="text-[12px] font-medium text-[#475569] truncate">{item.kitchenName}</p>
                    </div>
                    <span className="text-[13px] font-bold text-[#111827] shrink-0">₹{item.price}</span>
                  </button>
                ))
                )}
              </div>
            )}
            {triggerItem && (
              <p className="text-[12px] text-[#64748B]">
                Kitchen: <span className="font-bold text-[#111827]">{triggerItem.kitchenName}</span>
              </p>
            )}
          </div>

          {/* Popup content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold text-[#334155]">Popup Title</Label>
              <Input
                placeholder="Complete Your Meal 🍽️"
                value={draft.title}
                onChange={(e) => updateDraft({ title: e.target.value })}
                className="bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] h-10 text-[#111827] focus-visible:ring-1 focus-visible:ring-[#06701E]"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[14px] font-semibold text-[#334155]">Status</Label>
              <div className="flex items-center gap-3 pt-1">
                <Switch
                  checked={draft.isActive}
                  onCheckedChange={(checked) => updateDraft({ isActive: checked })}
                  className="data-[state=checked]:bg-[#06701E]"
                />
                <div>
                  <span className="text-[14px] font-bold text-[#111827] block">
                    {draft.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="text-[12px] font-medium text-[#64748B]">
                    {draft.isActive ? "This rule is currently active" : "Rule is paused"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[14px] font-semibold text-[#334155]">Message</Label>
            <Textarea
              value={draft.message}
              onChange={(e) => updateDraft({ message: e.target.value })}
              placeholder="Customers usually order these together."
              className="bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] min-h-[70px] text-[#111827] focus-visible:ring-1 focus-visible:ring-[#06701E] pt-3 resize-none"
            />
          </div>

          {/* Recommended items */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-[14px] font-semibold text-[#334155]">
                Recommended Items <span className="text-[#FF4B04]">*</span> ({draft.itemIds.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setItemPickerOpen(true)}
                className="border-[#06701E] text-[#06701E] hover:bg-[#EAF6ED] rounded-[8px] px-3 h-8"
              >
                <Plus className="w-4 h-4 mr-1" strokeWidth={2.5} /> Add Items
              </Button>
            </div>
            {selectedItems.length === 0 ? (
              <div className="text-center py-8 bg-[#FAFCFA] rounded-[10px] border border-dashed border-[#DDE3E8] text-[13px] font-medium text-[#94A3B8]">
                No recommended items selected yet. Click &quot;Add Items&quot; to pick from the menu.
              </div>
            ) : (
              <div className="border border-[#EEF1F3] rounded-[10px] overflow-hidden bg-white divide-y divide-[#EEF1F3]">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2.5 animate-in fade-in-0 slide-in-from-left-1 duration-200 hover:bg-[#F8FAFC]">
                    <GripVertical className="w-4 h-4 text-[#CBD5E1] cursor-grab shrink-0 hover:text-[#94A3B8]" />
                    <div className="w-9 h-9 rounded-[8px] bg-[#FFF2EB] overflow-hidden relative flex-shrink-0">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={item.name} width={36} height={36} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-4 h-4 text-[#FF4B04]/40" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[14px] font-bold text-[#111827] truncate">{item.name}</p>
                      <p className="text-[12px] font-medium text-[#475569] truncate">{item.kitchenName}</p>
                    </div>
                    <span className="text-[14px] font-bold text-[#111827]">₹{item.price}</span>
                    <button
                      type="button"
                      onClick={() => cravingsPopupStore.getState().toggleDraftItem(item.id)}
                      className="text-[#FF4B04] hover:text-[#E63F00] p-1 rounded-[6px] hover:bg-[#FFF2EB]"
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
            className="border-[#DDE3E8] text-[#334155] rounded-[8px] h-10 px-4"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#06701E] hover:bg-[#045A18] text-white rounded-[8px] h-10 px-4"
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
          className="absolute top-4 right-4 z-10 rounded-full p-2 text-[#94A3B8] transition-colors hover:bg-[#F8FAFC]"
        >
          <X className="h-5 w-5" />
        </button>
        <ScrollArea className="h-[min(85vh,640px)]">
          <div className="p-6 md:p-8">
            <div className="mb-6 text-center">
              <div className="relative mb-3 flex items-center justify-center">
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full border border-[#EAF6ED] bg-[#F4FAF5]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF6ED]">
                    <CheckCircle2 className="h-6 w-6 fill-[#EAF6ED] text-[#06701E]" />
                  </div>
                </div>
              </div>
              <h3 className="text-[20px] font-bold text-[#111827]">{title}</h3>
              <p className="mt-1 text-[14px] text-[#64748B]">{message}</p>
            </div>

          <div className="mb-6 rounded-[16px] border border-[#EEF1F3] bg-[#F7F9F7] p-4">
            <p className="text-[13px] text-[#475569]">
              <span className="font-extrabold text-[#111827]">{triggerItemName || "Item"}</span> added to cart
            </p>
          </div>

          <div className="mb-6">
            <h4 className="text-[15px] font-extrabold text-[#111827] mb-3 flex items-center gap-1.5">
              <span className="text-[#EF4444] text-lg leading-none">❤️</span> {recommendationsTitle || title || "Recommended for you"}
            </h4>
            <div className="flex flex-col gap-3">
              {items.length === 0 && (
                <p className="text-[14px] text-[#94A3B8] text-center py-6">
                  No recommended items yet.
                </p>
              )}
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-[12px] border border-[#EEF1F3] bg-white p-2 shadow-[0_1px_3px_rgba(15,23,42,0.025)] animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
                  style={{ animationDelay: `${index * 60}ms` }}
                >
                  <div className="relative h-[96px] w-[130px] shrink-0 overflow-hidden rounded-[8px] bg-[#FFF2EB]">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} fill sizes="130px" className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-[#FF4B04]/40" />
                      </div>
                    )}
                    {item.isBestseller && (
                      <div className="absolute bottom-0 left-0 z-10 rounded-tr-[8px] bg-[#FF4B04] px-2 py-0.5 text-[10px] font-bold text-white">
                        Bestseller
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between py-1 pr-1">
                    <div>
                      <h5 className="text-[15px] font-bold leading-tight text-[#111827]">{item.name}</h5>
                      <p className="mt-0.5 text-[11px] text-[#64748B]">{item.kitchenName}</p>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="text-[15px] font-extrabold text-[#06701E]">₹{item.price}</div>
                      <div className="rounded-[6px] border border-[#FF4B04] bg-white px-3 py-1 text-[12px] font-extrabold text-[#FF4B04]">
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
              className="flex-1 rounded-[12px] border-[#FF4B04] py-3.5 text-[13px] font-bold uppercase tracking-wider text-[#FF4B04] hover:bg-[#FFF2EB]"
            >
              Not Now
            </Button>
            <Button
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-[12px] bg-[#FF4B04] py-3.5 text-[13px] font-bold uppercase tracking-wider text-white hover:bg-[#E63F00] hover:brightness-110"
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
    <div className="flex flex-col min-h-screen pb-10 bg-[#FEFEFE]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-[#EEF1F3] animate-in fade-in-0 slide-in-from-top-2 duration-300">
        <div>
          <h1 className="text-2xl font-bold text-[#111827]">
            Cravings Popup Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage smart recommendations shown to customers after placing orders
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={() => setPreviewOpen(true)}
            disabled={!effectiveSelectedId}
            className="w-full sm:w-auto border-[#06701E] text-[#06701E] hover:bg-[#EAF6ED] hover:text-[#06701E] rounded-[8px] h-10 px-4"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview Popup
          </Button>
          <Button
            onClick={handleSaveAll}
            disabled={!editing || savingAll}
            className="w-full sm:w-auto bg-[#FF4B04] hover:bg-[#E63F00] text-white rounded-[8px] h-10 px-4"
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
      <div className="grid grid-cols-2 md:grid-cols-3 2xl:grid-cols-6 gap-4 mb-8">
        <Card className="shadow-[0_1px_3px_rgba(15,23,42,0.025)] border-[#E8ECEF] rounded-[10px] animate-in fade-in-0 duration-300 bg-white" style={{ animationDelay: "40ms" }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[#EEF8F0] text-[#06701E] rounded-lg shrink-0">
              <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Active Rules</p>
              <h3 className="text-2xl font-bold text-[#111827] mt-0.5">
                {loadingRules ? <Skeleton className="h-7 w-10" /> : stats.activeRules}
              </h3>
              <p className="text-[11px] font-medium text-[#64748B] mt-0.5">Smart rules</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[0_1px_3px_rgba(15,23,42,0.025)] border-[#E8ECEF] rounded-[10px] animate-in fade-in-0 duration-300 bg-white" style={{ animationDelay: "80ms" }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[#FFF5E8] text-[#FF4B04] rounded-lg shrink-0">
              <ConciergeBell className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Total Mappings</p>
              <h3 className="text-2xl font-bold text-[#111827] mt-0.5">
                {loadingRules ? <Skeleton className="h-7 w-10" /> : stats.totalMappings}
              </h3>
              <p className="text-[11px] font-medium text-[#64748B] mt-0.5">Menu mappings</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[0_1px_3px_rgba(15,23,42,0.025)] border-[#E8ECEF] rounded-[10px] animate-in fade-in-0 duration-300 bg-white" style={{ animationDelay: "120ms" }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[#EFF6FF] text-[#2563EB] rounded-lg shrink-0">
              <Box className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Total Menu Items</p>
              <h3 className="text-2xl font-bold text-[#111827] mt-0.5">
                {menuOptions.length || <Skeleton className="h-7 w-10" />}
              </h3>
              <p className="text-[11px] font-medium text-[#64748B] mt-0.5">Available items</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[0_1px_3px_rgba(15,23,42,0.025)] border-[#E8ECEF] rounded-[10px] animate-in fade-in-0 duration-300 bg-white" style={{ animationDelay: "160ms" }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[#F5F3FF] text-[#7C3AED] rounded-lg shrink-0">
              <Users className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Impacted Orders</p>
              <h3 className="text-2xl font-bold text-[#111827] mt-0.5">
                {loadingRules ? <Skeleton className="h-7 w-10" /> : "15.2K"}
              </h3>
              <p className="text-[11px] font-medium text-[#64748B] mt-0.5">Last 30 days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-[0_1px_3px_rgba(15,23,42,0.025)] border-[#E8ECEF] rounded-[10px] animate-in fade-in-0 duration-300 bg-white" style={{ animationDelay: "200ms" }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-[#EEF8F0] text-[#06701E] rounded-lg shrink-0">
              <TrendingUp className="w-6 h-6" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[#64748B]">Click Through Rate</p>
              <h3 className="text-2xl font-bold text-[#111827] mt-0.5">
                18.7%
              </h3>
              <p className="text-[11px] font-medium text-[#64748B] mt-0.5">Last 30 days</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-none bg-[#F5FAF5] rounded-[10px] animate-in fade-in-0 duration-300" style={{ animationDelay: "240ms" }}>
          <CardContent className="p-4 flex gap-3 h-full items-start">
            <div className="text-[#06701E] shrink-0 mt-0.5">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#111827] leading-tight">
                How it works?
              </p>
              <p className="text-[12px] text-[#475569] mt-1.5 leading-snug font-medium">
                When a customer places an order, we show them curated items based on the main item category.
              </p>
              <p className="text-[12px] font-semibold text-[#06701E] mt-3 inline-flex items-center hover:underline cursor-pointer">
                Learn more &rarr;
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 flex-1">
        {/* Left Sidebar - Rules List */}
        <div className="2xl:col-span-4 flex flex-col gap-4 animate-in fade-in-0 slide-in-from-left-2 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-[#111827]">
                Cravings Rules
              </h2>
              <p className="text-[13px] font-medium text-[#334155] mt-0.5">
                Manage rules based on main item categories
              </p>
            </div>
            <Button size="sm" onClick={handleOpenCreate} className="bg-[#06701E] hover:bg-[#045A18] text-white rounded-[8px] h-9 px-3">
              <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} /> Add New Rule
            </Button>
          </div>

          <div className="flex items-center gap-2 mt-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-[17px] w-[17px] text-[#475569]" />
              <Input
                placeholder="Search rules..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-[#FFFFFF] shadow-none border-[#DDE3E8] rounded-[8px] h-10 text-[#111827] placeholder:text-[#94A3B8]"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] bg-[#FFFFFF] shadow-none border-[#DDE3E8] rounded-[8px] h-10 text-[#334155] font-medium">
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
              <div className="text-center py-10 bg-[#FAFCFA] border border-dashed border-[#DDE3E8] rounded-[10px]">
                <Box className="w-8 h-8 text-[#94A3B8] mx-auto mb-2" />
                <p className="text-[13px] font-medium text-[#94A3B8]">No rules found</p>
              </div>
            ) : (
              filteredRules.map((rule, index) => (
                <div
                  key={rule.id}
                  onClick={() => setSelectedRuleId(rule.id)}
                  className={`p-3 rounded-[9px] border transition-all cursor-pointer flex items-center justify-between animate-in fade-in-0 slide-in-from-bottom-1 duration-300 shadow-[0_1px_3px_rgba(15,23,42,0.025)] ${
                    effectiveSelectedId === rule.id
                      ? "border-[#06701E] bg-[#F8FCF9]"
                      : "border-[#EEF1F3] bg-white hover:border-[#DDE3E8]"
                  }`}
                  style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-[8px] bg-[#FFF2EB] overflow-hidden flex-shrink-0 relative">
                      {rule.triggerItemImage ? (
                        <Image
                          src={rule.triggerItemImage}
                          alt={rule.triggerItemName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-[#FF4B04]/40" />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <h4 className="text-[14px] font-bold text-[#111827]">
                        {rule.name}
                      </h4>
                      <p className="text-[12px] font-medium text-[#334155] leading-tight line-clamp-1">
                        Show items when customer orders {rule.triggerItemName}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[12px] font-semibold text-[#475569]">
                          {rule.itemsCount} Items
                        </span>
                        <span className="text-[10px] text-[#94A3B8]">•</span>
                        <span className={`text-[12px] font-medium flex items-center gap-1.5 ${priorityColor(rule.priority)}`}>
                           {rule.priority === "HIGH" && <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />}
                           {rule.priority === "MEDIUM" && <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />}
                           {rule.priority === "LOW" && <span className="w-1.5 h-1.5 rounded-full bg-[#06701E]" />}
                          {priorityText(rule.priority)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-2">
                    {rule.isActive ? (
                      <span className="text-[11px] font-bold text-[#06701E] bg-[#EAF6ED] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#06701E]" />
                        Active
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
                        Inactive
                      </span>
                    )}
                    <ChevronRight
                      className={`w-[16px] h-[16px] ${
                        effectiveSelectedId === rule.id
                          ? "text-[#111827]"
                          : "text-[#64748B]"
                      }`}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-[#F8FAFC] border border-[#EEF1F3] rounded-[8px] p-3.5 flex items-start gap-3 mt-2 shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
            <div className="text-[#475569] mt-0.5 shrink-0">
              <Info className="w-[18px] h-[18px]" strokeWidth={1.5} />
            </div>
            <p className="text-[13px] text-[#475569] leading-relaxed font-medium">
              Rules are matched in priority order. <br />
              Higher priority rules will be applied first.
            </p>
          </div>
        </div>

        {/* Right Content - Rule Details */}
        <div className="2xl:col-span-8 flex flex-col gap-6">
          {!selectedRule ? (
            <div className="flex flex-col items-center justify-center h-[500px] border border-dashed border-[#DDE3E8] rounded-[12px] bg-[#FAFCFA] animate-in fade-in-0 duration-300">
              <Box className="w-12 h-12 text-[#94A3B8] mb-4" />
              <h3 className="text-[18px] font-bold text-[#111827]">
                No Rule Selected
              </h3>
              <p className="text-[14px] font-medium text-[#475569] mt-1 max-w-sm text-center">
                Select a rule from the left panel to view and edit its settings,
                or create a new rule.
              </p>
              <Button onClick={handleOpenCreate} className="mt-5 bg-[#06701E] hover:bg-[#045A18] text-white rounded-[8px] h-10 px-4">
                <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} /> Add New Rule
              </Button>
            </div>
          ) : detailFetching && !ruleDetail ? (
            <RuleDetailSkeleton />
          ) : ruleDetail ? (
            <>
              <div className="flex items-center justify-between pb-4 border-b border-[#EEF1F3] animate-in fade-in-0 duration-300">
                <div className="flex items-center gap-3">
                  <h2 className="text-[18px] font-bold text-[#111827]">
                    Editing Rule: {editing?.name ?? ruleDetail.name}
                  </h2>
                  {ruleDetail.isActive ? (
                    <span className="text-[11px] font-bold text-[#06701E] bg-[#EAF6ED] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#06701E]" />
                      Active
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-[#64748B] bg-[#F1F5F9] px-2.5 py-1 rounded-full flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#94A3B8]" />
                      Inactive
                    </span>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="text-[#FF4B04] border-[#FF4B04] hover:bg-[#FFF2EB] hover:text-[#E63F00] h-9 rounded-[8px]"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" strokeWidth={2} /> Delete Rule
                </Button>
              </div>

              <Tabs defaultValue="settings" className="w-full animate-in fade-in-0 duration-300">
                <TabsList className="bg-transparent border-b border-[#EEF1F3] w-full justify-start h-auto rounded-none p-0 flex-nowrap overflow-x-auto hide-scrollbar gap-2">
                  <TabsTrigger
                    value="settings"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[2px] data-[state=active]:border-[#06701E] data-[state=active]:text-[#06701E] rounded-none px-2 sm:px-4 py-3 text-[14px] font-semibold text-[#334155] whitespace-nowrap"
                  >
                    Rule Settings
                  </TabsTrigger>
                  <TabsTrigger
                    value="items"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[2px] data-[state=active]:border-[#06701E] data-[state=active]:text-[#06701E] rounded-none px-2 sm:px-4 py-3 text-[14px] font-semibold text-[#334155] whitespace-nowrap"
                  >
                    Recommended Items ({editing?.itemIds.length ?? ruleDetail.items.length})
                  </TabsTrigger>
                  <TabsTrigger
                    value="display"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[2px] data-[state=active]:border-[#06701E] data-[state=active]:text-[#06701E] rounded-none px-2 sm:px-4 py-3 text-[14px] font-semibold text-[#334155] whitespace-nowrap"
                  >
                    Display Settings
                  </TabsTrigger>
                  <TabsTrigger
                    value="popup"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[2px] data-[state=active]:border-[#06701E] data-[state=active]:text-[#06701E] rounded-none px-2 sm:px-4 py-3 text-[14px] font-semibold text-[#334155] whitespace-nowrap"
                  >
                    Popup Content
                  </TabsTrigger>
                  <TabsTrigger
                    value="preview"
                    className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-[2px] data-[state=active]:border-[#06701E] data-[state=active]:text-[#06701E] rounded-none px-2 sm:px-4 py-3 text-[14px] font-semibold text-[#334155] whitespace-nowrap"
                  >
                    Preview
                  </TabsTrigger>
                </TabsList>

                {/* Rule Settings Tab Content */}
                <TabsContent value="settings" className="pt-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 flex flex-col gap-6">
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#334155]">
                          Rule Name <span className="text-[#FF4B04]">*</span>
                        </Label>
                        <div className="relative">
                          <Input
                            value={editing?.name ?? ruleDetail.name}
                            onChange={(e) => updateDraft({ name: e.target.value })}
                            className="pr-16 bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] h-11 text-[#111827] focus-visible:ring-1 focus-visible:ring-[#06701E]"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[#94A3B8]">
                            {(editing?.name ?? ruleDetail.name).length}/50
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#334155]">
                          Description
                        </Label>
                        <div className="relative">
                          <Textarea
                            value={editing?.message ?? ruleDetail.message}
                            onChange={(e) => updateDraft({ message: e.target.value })}
                            className="pr-16 resize-none min-h-[90px] bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] text-[#111827] focus-visible:ring-1 focus-visible:ring-[#06701E] pt-3"
                          />
                          <span className="absolute right-3 bottom-3 text-[12px] font-medium text-[#94A3B8]">
                            {(editing?.message ?? ruleDetail.message).length}/200
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#334155]">
                          Trigger Condition
                        </Label>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-white border border-[#DDE3E8] rounded-[8px] h-auto min-h-[44px] px-3 py-2">
                          <span className="text-[14px] text-[#334155] whitespace-nowrap">
                            When customer orders items from
                          </span>
                          <div className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] pl-2.5 pr-1.5 py-1">
                            <span className="text-[13px] font-medium text-[#334155]">
                              {ruleDetail.triggerItemName}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                updateDraft({ triggerItemId: "", kitchenId: "" });
                                handleOpenEdit();
                              }}
                              className="text-[#64748B] hover:text-[#334155]"
                              aria-label="Remove trigger"
                            >
                              <X className="w-3.5 h-3.5" strokeWidth={2} />
                            </button>
                          </div>
                          <div className="flex-1 text-right">
                            <button
                              type="button"
                              onClick={handleOpenEdit}
                              className="text-[13px] font-bold text-[#06701E] hover:text-[#045A18] hidden sm:block"
                            >
                              Change
                            </button>
                          </div>
                        </div>
                        <p className="text-[12px] font-medium text-[#64748B] mt-1">
                          Kitchen: <span className="font-semibold text-[#334155]">{ruleDetail.kitchenName}</span>
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                        <div className="space-y-2">
                          <Label className="text-[14px] font-semibold text-[#334155]">
                            Priority
                          </Label>
                          <Select
                            value={editing?.priority ?? ruleDetail.priority}
                            onValueChange={(value) =>
                              updateDraft({ priority: value as "HIGH" | "MEDIUM" | "LOW" })
                            }
                          >
                            <SelectTrigger className="bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] h-11 text-[#111827]">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="HIGH">High</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="LOW">Low</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[12px] font-medium text-[#64748B] mt-1.5">
                            Higher priority rules will be applied first
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-[14px] font-semibold text-[#334155]">
                            Status
                          </Label>
                          <div className="flex items-center gap-3 pt-1.5">
                            <Switch
                              checked={editing?.isActive ?? ruleDetail.isActive}
                              onCheckedChange={(checked) => {
                                updateDraft({ isActive: checked });
                                handleToggleActive(ruleDetail.id, checked);
                              }}
                              className="data-[state=checked]:bg-[#06701E]"
                            />
                            <div>
                              <span className="text-[14px] font-bold text-[#111827] block">
                                {editing?.isActive ?? ruleDetail.isActive ? "Active" : "Inactive"}
                              </span>
                              <span className="text-[12px] font-medium text-[#64748B]">
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
                      <div className="bg-[#F7FAF7] rounded-[12px] p-6 shadow-none">
                        <h4 className="text-[15px] font-bold text-[#111827] mb-5">
                          Rule Summary
                        </h4>
                        <div className="space-y-5">
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-[#06701E]">
                              <Box className="w-[18px] h-[18px]" strokeWidth={2} />
                            </div>
                            <div>
                              <p className="text-[13px] text-[#334155] font-semibold mb-0.5">
                                Trigger Category
                              </p>
                              <p className="text-[13px] font-medium text-[#475569]">
                                {ruleDetail.triggerItemName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-[#06701E]">
                              <List className="w-[18px] h-[18px]" strokeWidth={2} />
                            </div>
                            <div>
                              <p className="text-[13px] text-[#334155] font-semibold mb-0.5">
                                Recommended Items
                              </p>
                              <p className="text-[13px] font-medium text-[#475569]">
                                {editing?.itemIds.length ?? ruleDetail.items.length} items selected
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-[#06701E]">
                              <Flag className="w-[18px] h-[18px]" strokeWidth={2} />
                            </div>
                            <div>
                              <p className="text-[13px] text-[#334155] font-semibold mb-0.5">
                                Priority
                              </p>
                              <p className="text-[13px] font-medium text-[#475569]">
                                {priorityText(ruleDetail.priority).split(" ")[0]}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3">
                            <div className="mt-0.5 text-[#06701E]">
                              <CheckCircle2 className="w-[18px] h-[18px]" strokeWidth={2} />
                            </div>
                            <div>
                              <p className="text-[13px] text-[#334155] font-semibold mb-0.5">
                                Status
                              </p>
                              <p className="text-[13px] font-medium text-[#475569]">
                                {ruleDetail.isActive ? "Active" : "Inactive"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 pt-4 border-t border-[#D9E0E7]">
                            <div className="mt-0.5 text-[#06701E]">
                              <Calendar className="w-[18px] h-[18px]" strokeWidth={2} />
                            </div>
                            <div>
                              <p className="text-[13px] text-[#334155] font-semibold mb-0.5">
                                Last Updated
                              </p>
                              <p className="text-[13px] font-medium text-[#475569]">
                                {formatUpdatedAt(ruleDetail.updatedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommended Items Section (Appears below in settings) */}
                  <div className="mt-10 border-t border-[#EEF1F3] pt-8">
                    <div className="flex items-end justify-between mb-4">
                      <div>
                        <h3 className="text-[16px] font-bold text-[#111827]">
                          Recommended Items ({editing?.itemIds.length ?? ruleDetail.items.length})
                        </h3>
                        <p className="text-[13px] font-medium text-[#475569] mt-1">
                          Select items to show in cravings popup after{" "}
                          {ruleDetail.triggerItemName} orders
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button onClick={() => setItemsDialogOpen(true)} className="bg-[#06701E] hover:bg-[#045A18] text-white rounded-[8px] h-9 px-3">
                          <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} /> Add Items
                        </Button>
                      </div>
                    </div>

                    <div className="border border-[#EEF1F3] rounded-[10px] overflow-hidden bg-white">
                      <Table className="text-left">
                        <TableHeader className="bg-[#FAFCFA] border-b border-[#EEF1F3] text-[13px] font-bold text-[#334155]">
                          <TableRow className="border-[#EEF1F3] hover:bg-transparent">
                            <TableHead className="px-4 py-3 w-10 text-center text-[#94A3B8] font-bold">
                              <span className="text-[#94A3B8]">#</span>
                            </TableHead>
                            <TableHead className="px-4 py-3 text-[#334155] font-bold">Menu Item</TableHead>
                            <TableHead className="px-4 py-3 text-[#334155] font-bold">Kitchen</TableHead>
                            <TableHead className="px-4 py-3 text-[#334155] font-bold">Price</TableHead>
                            <TableHead className="px-4 py-3 text-[#334155] font-bold">Food Type</TableHead>
                            <TableHead className="px-4 py-3 text-[#334155] font-bold">Popularity</TableHead>
                            <TableHead className="px-4 py-3 text-right text-[#334155] font-bold">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-[#EEF1F3]">
                          {selectedItems.length === 0 && (
                            <TableRow className="hover:bg-transparent border-[#EEF1F3]">
                              <TableCell colSpan={7} className="px-4 py-10 text-center text-[14px] font-medium text-[#94A3B8]">
                                No recommended items. Click &quot;Add Items&quot; to add some.
                              </TableCell>
                            </TableRow>
                          )}
                          {selectedItems.map((item, index) => {
                            const popularity = popularityLabel(item);
                            return (
                              <TableRow
                                key={item.id}
                                className="hover:bg-[#F8FAFC] transition-colors group animate-in fade-in-0 duration-200 border-[#EEF1F3]"
                                style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
                              >
                                <TableCell className="px-4 py-3 text-center align-middle">
                                  <div className="flex items-center justify-center gap-2">
                                    <GripVertical className="w-[18px] h-[18px] text-[#CBD5E1] cursor-grab hover:text-[#94A3B8]" />
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-[8px] bg-[#FFF2EB] overflow-hidden relative flex-shrink-0">
                                      {item.imageUrl ? (
                                        <Image src={item.imageUrl} alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                                      ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                          <ShoppingBag className="w-4 h-4 text-[#FF4B04]/40" />
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <p className="font-bold text-[#111827] flex items-center gap-2 text-[14px]">
                                        {item.name}
                                        {item.isBestseller && (
                                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#FF4B04] bg-[#FFF2EB] px-1.5 py-0.5 rounded-[4px]">
                                            <Star className="w-[10px] h-[10px] fill-current" /> Bestseller
                                          </span>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3 text-[13px] font-medium text-[#475569]">
                                  {item.kitchenName}
                                </TableCell>
                                <TableCell className="px-4 py-3 text-[14px] font-bold text-[#111827]">
                                  ₹{item.price}
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className={`w-2 h-2 rounded-full ${
                                        item.foodType === "VEG"
                                          ? "bg-[#06701E]"
                                          : "bg-[#EF4444]"
                                      }`}
                                    ></div>
                                    <span className="text-[13px] font-medium text-[#475569]">
                                      {item.foodType === "VEG" ? "Veg" : "Non-Veg"}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="px-4 py-3">
                                  <span
                                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${popularityClasses(popularity)}`}
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
                                      className="h-8 w-8 text-[#FF4B04] hover:text-[#E63F00] hover:bg-[#FFF2EB] rounded-[6px]"
                                    >
                                      <Trash2 className="w-4 h-4" strokeWidth={2} />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      <div className="bg-[#F8FAFC] border-t border-[#EEF1F3] p-3.5 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[13px] font-medium text-[#475569]">
                          <Info className="w-[18px] h-[18px]" strokeWidth={1.5} />
                          Items appear in the popup in this order
                        </div>
                        <div className="text-[13px] font-bold text-[#334155]">
                          {selectedItems.length} items selected
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="items" className="pt-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <h3 className="text-[16px] font-bold text-[#111827]">
                        Recommended Items ({editing?.itemIds.length ?? ruleDetail.items.length})
                      </h3>
                      <p className="text-[13px] font-medium text-[#475569] mt-1">
                        Manage the items shown when a customer adds {ruleDetail.triggerItemName}
                      </p>
                    </div>
                    <Button onClick={() => setItemsDialogOpen(true)} className="bg-[#06701E] hover:bg-[#045A18] text-white rounded-[8px] h-9 px-3">
                      <Plus className="w-4 h-4 mr-1.5" strokeWidth={2.5} /> Add Items
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 border border-[#EEF1F3] rounded-[10px] bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.025)] animate-in fade-in-0 slide-in-from-bottom-1 duration-300"
                        style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
                      >
                        <div className="w-12 h-12 rounded-[8px] bg-[#FFF2EB] overflow-hidden relative flex-shrink-0">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-[#FF4B04]/40" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[14px] font-bold text-[#111827] truncate">{item.name}</p>
                          <p className="text-[12px] font-medium text-[#475569] truncate">{item.kitchenName}</p>
                        </div>
                        <span className="text-[14px] font-bold text-[#111827]">₹{item.price}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleDraftItem(item.id)}
                          className="h-8 w-8 text-[#FF4B04] hover:text-[#E63F00] hover:bg-[#FFF2EB] rounded-[6px]"
                        >
                          <Trash2 className="w-4 h-4" strokeWidth={2} />
                        </Button>
                      </div>
                    ))}
                    {selectedItems.length === 0 && (
                      <div className="md:col-span-2 text-center py-10 bg-[#FAFCFA] rounded-[10px] border border-dashed border-[#DDE3E8]">
                        <p className="text-[#94A3B8] text-[14px] font-medium">No items yet</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="display" className="pt-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  <div className="bg-[#F8FAFC] border border-[#EEF1F3] rounded-[10px] p-6 max-w-lg">
                    <h4 className="text-[15px] font-bold text-[#111827] mb-5">Display Settings</h4>
                    <div className="space-y-5">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-[14px] font-bold text-[#111827]">Popup Title</p>
                          <p className="text-[12px] font-medium text-[#64748B] mt-0.5">Shown at the top of the cravings popup</p>
                        </div>
                        <Input
                          value={editing?.title ?? ruleDetail.title}
                          onChange={(e) => updateDraft({ title: e.target.value })}
                          className="w-56 bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] h-10 text-[#111827] focus-visible:ring-1 focus-visible:ring-[#06701E]"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-[14px] font-bold text-[#111827]">Message</p>
                          <p className="text-[12px] font-medium text-[#64748B] mt-0.5">Description under the popup title</p>
                        </div>
                        <Input
                          value={editing?.message ?? ruleDetail.message}
                          onChange={(e) => updateDraft({ message: e.target.value })}
                          className="w-56 bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] h-10 text-[#111827] focus-visible:ring-1 focus-visible:ring-[#06701E]"
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="popup" className="pt-6 animate-in fade-in-0 slide-in-from-top-2 duration-300">
                  <div className="bg-[#F8FAFC] border border-[#EEF1F3] rounded-[10px] p-6 max-w-lg">
                    <h4 className="text-[15px] font-bold text-[#111827] mb-5">Popup Content</h4>
                    <div className="space-y-5">
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#334155]">Popup Title</Label>
                        <Input
                          value={editing?.title ?? ruleDetail.title}
                          onChange={(e) => updateDraft({ title: e.target.value })}
                          className="bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] h-10 text-[#111827] focus-visible:ring-1 focus-visible:ring-[#06701E]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[14px] font-semibold text-[#334155]">Message</Label>
                        <Textarea
                          value={editing?.message ?? ruleDetail.message}
                          onChange={(e) => updateDraft({ message: e.target.value })}
                          className="bg-[#FFFFFF] border-[#DDE3E8] rounded-[8px] min-h-[90px] text-[#111827] focus-visible:ring-1 focus-visible:ring-[#06701E] pt-3"
                        />
                      </div>
                      <Button onClick={() => setPreviewOpen(true)} variant="outline" className="border-[#06701E] text-[#06701E] hover:bg-[#EAF6ED] hover:text-[#06701E] h-10 rounded-[8px] w-full">
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
            <div className="flex flex-col items-center justify-center h-[500px] border border-dashed border-[#DDE3E8] rounded-[12px] bg-[#FAFCFA]">
              <Box className="w-12 h-12 text-[#94A3B8] mb-4" />
              <h3 className="text-[18px] font-bold text-[#111827]">
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
    <div className="max-w-[420px] rounded-[24px] border border-[#DDE3E8] bg-white shadow-2xl text-left">
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <div className="mb-6 text-center">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#EAF6ED] bg-[#F4FAF5]">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EAF6ED]">
                <CheckCircle2 className="h-6 w-6 fill-[#EAF6ED] text-[#06701E]" />
              </div>
            </div>
          </div>
          <h3 className="text-[20px] font-bold text-[#111827]">{title}</h3>
          <p className="mt-1 text-[14px] text-[#64748B]">{message}</p>
        </div>
        <div className="mb-6 rounded-[16px] border border-[#EEF1F3] bg-[#F7F9F7] p-4">
          <p className="text-[13px] text-[#475569]">
            <span className="font-extrabold text-[#111827]">{triggerItemName}</span> added to cart
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-[12px] border border-[#EEF1F3] bg-white p-2 shadow-[0_1px_3px_rgba(15,23,42,0.025)]">
              <div className="relative h-[96px] w-[130px] shrink-0 overflow-hidden rounded-[8px] bg-[#FFF2EB]">
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.name} fill sizes="130px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-[#FF4B04]/40" />
                  </div>
                )}
                {item.isBestseller && (
                  <div className="absolute bottom-0 left-0 z-10 rounded-tr-[8px] bg-[#FF4B04] px-2 py-0.5 text-[10px] font-bold text-white">
                    Bestseller
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between py-1 pr-1">
                <div>
                  <h5 className="text-[15px] font-bold leading-tight text-[#111827]">{item.name}</h5>
                  <p className="mt-0.5 text-[11px] text-[#64748B]">{item.kitchenName}</p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-[15px] font-extrabold text-[#06701E]">₹{item.price}</div>
                  <div className="rounded-[6px] border border-[#FF4B04] bg-white px-3 py-1 text-[12px] font-extrabold text-[#FF4B04]">
                    ADD
                  </div>
                </div>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-[14px] text-[#94A3B8] text-center py-6">No recommended items yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
