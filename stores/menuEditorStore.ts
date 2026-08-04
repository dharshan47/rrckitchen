import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type { AdminMenuItemEditorRow } from "@/actions/admin/admin-menu-cms";

export interface EditorPhoto {
  id?: string;
  imageUrl: string;
  cloudinaryPublicId?: string | null;
  sortOrder: number;
}

export interface EditorHighlight {
  title: string;
  description: string;
  enabled: boolean;
}

/** Editable subset of a menu item — nothing persists until "Save All Changes". */
export interface MenuItemDraft {
  name: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  foodType: "VEG" | "NONVEG";
  timeSlot: "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER";
  availableFor: "TODAY" | "TOMORROW" | "BOTH";
  isAvailable: boolean;
  categoryId: string | null;
  cuisine: string;
  bestseller: boolean;
  highlights: EditorHighlight[];
  aboutTitle: string;
  aboutDescription: string;
  serves: number | null;
  portionSize: string;
  shelfLife: string;
  allergens: string;
  metaTitle: string;
  metaDescription: string;
  deliveryTimeMin: number | null;
  deliveryTimeMax: number | null;
  deliveryFee: number | null;
  freeDelivery: boolean;
  packagingType: string;
  relatedItemIds: string[];
  photos: EditorPhoto[];
  removedPhotoIds: string[];
}

export function toMenuItemDraft(item: AdminMenuItemEditorRow): MenuItemDraft {
  return {
    name: item.name,
    description: item.description ?? "",
    price: Number(item.price),
    compareAtPrice: item.compareAtPrice,
    foodType: item.foodType,
    timeSlot: item.timeSlot,
    availableFor: item.availableFor,
    isAvailable: item.isAvailable,
    categoryId: item.categoryId,
    cuisine: item.cuisine ?? "",
    bestseller: item.bestseller,
    highlights: item.highlights.map((h) => ({ ...h })),
    aboutTitle: item.aboutTitle ?? "",
    aboutDescription: item.aboutDescription ?? "",
    serves: item.serves,
    portionSize: item.portionSize ?? "",
    shelfLife: item.shelfLife ?? "",
    allergens: item.allergens ?? "",
    metaTitle: item.metaTitle ?? "",
    metaDescription: item.metaDescription ?? "",
    deliveryTimeMin: item.deliveryTimeMin,
    deliveryTimeMax: item.deliveryTimeMax,
    deliveryFee: item.deliveryFee,
    freeDelivery: item.freeDelivery,
    packagingType: item.packagingType ?? "",
    relatedItemIds: [...item.relatedItemIds],
    photos: item.photos.map((p) => ({ ...p })),
    removedPhotoIds: [],
  };
}

interface MenuEditorState {
  kitchenId: string | null;
  kitchenName: string;
  selectedItemId: string | null;
  drafts: Record<string, MenuItemDraft>;
  dirtyIds: string[];
  openEditor: (kitchenId: string, kitchenName: string) => void;
  closeEditor: () => void;
  selectItem: (itemId: string | null) => void;
  ensureDrafts: (items: AdminMenuItemEditorRow[]) => void;
  updateDraft: (itemId: string, patch: Partial<MenuItemDraft>) => void;
  removePhotoFromDraft: (itemId: string, photoId: string) => void;
  markSaved: (itemId: string) => void;
  clearDrafts: () => void;
}

export const menuEditorStore = create<MenuEditorState>()((set, get) => ({
  kitchenId: null,
  kitchenName: "",
  selectedItemId: null,
  drafts: {},
  dirtyIds: [],

  openEditor: (kitchenId, kitchenName) =>
    set({ kitchenId, kitchenName, selectedItemId: null, drafts: {}, dirtyIds: [] }),

  closeEditor: () =>
    set({ kitchenId: null, kitchenName: "", selectedItemId: null, drafts: {}, dirtyIds: [] }),

  selectItem: (itemId) => set({ selectedItemId: itemId }),

  ensureDrafts: (items) => {
    const existing = get().drafts;
    const next = { ...existing };
    for (const item of items) {
      if (!next[item.id]) next[item.id] = toMenuItemDraft(item);
    }
    set({ drafts: next });
  },

  updateDraft: (itemId, patch) => {
    const { drafts, dirtyIds } = get();
    const current = drafts[itemId];
    if (!current) return;
    set({
      drafts: { ...drafts, [itemId]: { ...current, ...patch } },
      dirtyIds: dirtyIds.includes(itemId) ? dirtyIds : [...dirtyIds, itemId],
    });
  },

  removePhotoFromDraft: (itemId, photoId) => {
    const { drafts, dirtyIds } = get();
    const current = drafts[itemId];
    if (!current) return;
    const photo = current.photos.find((p) => p.id === photoId);
    const removedPhotoIds =
      photo?.id && !photo.imageUrl.startsWith("blob:")
        ? [...current.removedPhotoIds, photo.id]
        : current.removedPhotoIds;
    set({
      drafts: {
        ...drafts,
        [itemId]: {
          ...current,
          photos: current.photos.filter((p) => p.id !== photoId),
          removedPhotoIds,
        },
      },
      dirtyIds: dirtyIds.includes(itemId) ? dirtyIds : [...dirtyIds, itemId],
    });
  },

  markSaved: (itemId) =>
    set((state) => ({ dirtyIds: state.dirtyIds.filter((id) => id !== itemId) })),

  clearDrafts: () => set({ drafts: {}, dirtyIds: [] }),
}));

const selectKitchenId = (s: MenuEditorState) => s.kitchenId;
const selectKitchenName = (s: MenuEditorState) => s.kitchenName;
const selectSelectedItemId = (s: MenuEditorState) => s.selectedItemId;
const selectDirtyIds = (s: MenuEditorState) => s.dirtyIds;

export function useEditorKitchenId() {
  return menuEditorStore(selectKitchenId);
}
export function useEditorKitchenName() {
  return menuEditorStore(selectKitchenName);
}
export function useEditorSelectedItemId() {
  return menuEditorStore(selectSelectedItemId);
}
export function useEditorDirtyIds() {
  return menuEditorStore(selectDirtyIds);
}
export function useEditorDraft(itemId: string | null | undefined) {
  return menuEditorStore(useShallow((s) => (itemId ? s.drafts[itemId] : undefined)));
}
export function useEditorActions() {
  return menuEditorStore(
    useShallow((s) => ({
      openEditor: s.openEditor,
      closeEditor: s.closeEditor,
      selectItem: s.selectItem,
      ensureDrafts: s.ensureDrafts,
      updateDraft: s.updateDraft,
      removePhotoFromDraft: s.removePhotoFromDraft,
      markSaved: s.markSaved,
      clearDrafts: s.clearDrafts,
    }))
  );
}
