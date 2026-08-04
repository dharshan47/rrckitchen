import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
  AdminKitchenSearchDetail,
  AdminKitchenSearchChip,
  AdminKitchenSearchFilter,
  AdminKitchenSearchMenuCategory,
  AdminKitchenSearchRecommendedItem,
  AdminKitchenSearchSaveInput,
} from "@/actions/admin/kitchen-search-pages";
import type { KitchenSearchPageSaveSchema } from "@/lib/schemas/kitchen-search-page";

export interface KitchenSearchEditorChip {
  id?: string;
  label: string;
  isEnabled: boolean;
}

export interface KitchenSearchEditorFilter {
  id?: string;
  name: string;
  options: string[];
  isEnabled: boolean;
}

export interface KitchenSearchEditorMenuCategory {
  id?: string;
  name: string;
}

export interface KitchenSearchEditorRecommendedItem {
  id?: string;
  name: string;
}

export interface KitchenSearchEditorDraft {
  id: string;
  keyword: string;
  isActive: boolean;
  desktopBannerUrl: string;
  mobileBannerUrl: string;
  searchTitle: string;
  badgeText: string;
  description: string;
  showHero: boolean;
  defaultSort: KitchenSearchPageSaveSchema["defaultSort"];
  showRatings: boolean;
  showDeliveryTime: boolean;
  showDistance: boolean;
  showPureVegBadge: boolean;
  showHygienicBadge: boolean;
  showKitchenStory: boolean;
  showInternalNotes: boolean;
  showKitchenTiming: boolean;
  showFreshIngredients: boolean;
  showPackaging: boolean;
  showSupportLocalWomen: boolean;
  kitchensCount: number;
  menuItemsCount: number;
  version: number;
  updatedBy: string | null;
  updatedAt: string;
  chips: KitchenSearchEditorChip[];
  filters: KitchenSearchEditorFilter[];
  menuCategories: KitchenSearchEditorMenuCategory[];
  recommendedItems: KitchenSearchEditorRecommendedItem[];
}

export function toKitchenSearchEditorDraft(item: AdminKitchenSearchDetail): KitchenSearchEditorDraft {
  const mapChip = (c: AdminKitchenSearchChip): KitchenSearchEditorChip => ({
    id: c.id,
    label: c.label,
    isEnabled: c.isEnabled,
  });
  const mapFilter = (f: AdminKitchenSearchFilter): KitchenSearchEditorFilter => ({
    id: f.id,
    name: f.name,
    options: [...f.options],
    isEnabled: f.isEnabled,
  });
  const mapMenuCategory = (m: AdminKitchenSearchMenuCategory): KitchenSearchEditorMenuCategory => ({
    id: m.id,
    name: m.name,
  });
  const mapRecommended = (r: AdminKitchenSearchRecommendedItem): KitchenSearchEditorRecommendedItem => ({
    id: r.id,
    name: r.name,
  });

  return {
    id: item.id,
    keyword: item.keyword,
    isActive: item.isActive,
    desktopBannerUrl: item.desktopBannerUrl,
    mobileBannerUrl: item.mobileBannerUrl,
    searchTitle: item.searchTitle,
    badgeText: item.badgeText,
    description: item.description,
    showHero: item.showHero,
    defaultSort: item.defaultSort as KitchenSearchPageSaveSchema["defaultSort"],
    showRatings: item.showRatings,
    showDeliveryTime: item.showDeliveryTime,
    showDistance: item.showDistance,
    showPureVegBadge: item.showPureVegBadge,
    showHygienicBadge: item.showHygienicBadge,
    showKitchenStory: item.showKitchenStory,
    showInternalNotes: item.showInternalNotes,
    showKitchenTiming: item.showKitchenTiming,
    showFreshIngredients: item.showFreshIngredients,
    showPackaging: item.showPackaging,
    showSupportLocalWomen: item.showSupportLocalWomen,
    kitchensCount: item.kitchensCount,
    menuItemsCount: item.menuItemsCount,
    version: item.version,
    updatedBy: item.updatedBy,
    updatedAt: item.updatedAt,
    chips: item.chips.map(mapChip),
    filters: item.filters.map(mapFilter),
    menuCategories: item.menuCategories.map(mapMenuCategory),
    recommendedItems: item.recommendedItems.map(mapRecommended),
  };
}

export function toKitchenSearchSaveInput(draft: KitchenSearchEditorDraft): AdminKitchenSearchSaveInput {
  return {
    isActive: draft.isActive,
    desktopBannerUrl: draft.desktopBannerUrl,
    mobileBannerUrl: draft.mobileBannerUrl,
    searchTitle: draft.searchTitle,
    badgeText: draft.badgeText,
    description: draft.description,
    showHero: draft.showHero,
    defaultSort: draft.defaultSort,
    showRatings: draft.showRatings,
    showDeliveryTime: draft.showDeliveryTime,
    showDistance: draft.showDistance,
    showPureVegBadge: draft.showPureVegBadge,
    showHygienicBadge: draft.showHygienicBadge,
    showKitchenStory: draft.showKitchenStory,
    showInternalNotes: draft.showInternalNotes,
    showKitchenTiming: draft.showKitchenTiming,
    showFreshIngredients: draft.showFreshIngredients,
    showPackaging: draft.showPackaging,
    showSupportLocalWomen: draft.showSupportLocalWomen,
    chips: draft.chips.map(({ label, isEnabled }) => ({ label, isEnabled })),
    filters: draft.filters.map(({ name, options, isEnabled }) => ({ name, options, isEnabled })),
    menuCategories: draft.menuCategories.map(({ name }) => ({ name })),
    recommendedItems: draft.recommendedItems.map(({ name }) => ({ name })),
  };
}

interface KitchenSearchEditorState {
  draft: KitchenSearchEditorDraft | null;
  dirty: boolean;
  openEditor: (item: AdminKitchenSearchDetail) => void;
  closeEditor: () => void;
  updateDraft: (patch: Partial<KitchenSearchEditorDraft>) => void;
  updateChip: (index: number, patch: Partial<KitchenSearchEditorChip>) => void;
  addChip: () => void;
  removeChip: (index: number) => void;
  moveChip: (index: number, dir: -1 | 1) => void;
  updateFilter: (index: number, patch: Partial<KitchenSearchEditorFilter>) => void;
  addFilter: () => void;
  removeFilter: (index: number) => void;
  moveFilter: (index: number, dir: -1 | 1) => void;
  addFilterOption: (index: number, option: string) => void;
  removeFilterOption: (index: number, option: string) => void;
  updateMenuCategory: (index: number, name: string) => void;
  addMenuCategory: () => void;
  removeMenuCategory: (index: number) => void;
  moveMenuCategory: (index: number, dir: -1 | 1) => void;
  updateRecommendedItem: (index: number, name: string) => void;
  addRecommendedItem: () => void;
  removeRecommendedItem: (index: number) => void;
  moveRecommendedItem: (index: number, dir: -1 | 1) => void;
  markSaved: () => void;
}

function withDraft(
  update: (draft: KitchenSearchEditorDraft) => KitchenSearchEditorDraft
): (
  set: (partial: Partial<KitchenSearchEditorState> | ((state: KitchenSearchEditorState) => Partial<KitchenSearchEditorState>)) => void,
  get: () => KitchenSearchEditorState
) => void {
  return (set, get) => {
    const draft = get().draft;
    if (!draft) return;
    set({ draft: update(draft), dirty: true });
  };
}

function swap<T>(arr: T[], index: number, dir: -1 | 1): T[] {
  const next = [...arr];
  const target = index + dir;
  if (target < 0 || target >= next.length) return arr;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export const kitchenSearchEditorStore = create<KitchenSearchEditorState>()((set, get) => ({
  draft: null,
  dirty: false,

  openEditor: (item) => set({ draft: toKitchenSearchEditorDraft(item), dirty: false }),

  closeEditor: () => set({ draft: null, dirty: false }),

  updateDraft: (patch) => withDraft((draft) => ({ ...draft, ...patch }))(set, get),

  updateChip: (index, patch) =>
    withDraft((draft) => ({
      ...draft,
      chips: draft.chips.map((c, i) => (i === index ? { ...c, ...patch } : c)),
    }))(set, get),

  addChip: () =>
    withDraft((draft) => ({
      ...draft,
      chips: [...draft.chips, { label: `Chip ${draft.chips.length + 1}`, isEnabled: true }],
    }))(set, get),

  removeChip: (index) =>
    withDraft((draft) => ({
      ...draft,
      chips: draft.chips.filter((_, i) => i !== index),
    }))(set, get),

  moveChip: (index, dir) =>
    withDraft((draft) => ({ ...draft, chips: swap(draft.chips, index, dir) }))(set, get),

  updateFilter: (index, patch) =>
    withDraft((draft) => ({
      ...draft,
      filters: draft.filters.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    }))(set, get),

  addFilter: () =>
    withDraft((draft) => ({
      ...draft,
      filters: [...draft.filters, { name: `Filter ${draft.filters.length + 1}`, options: [], isEnabled: true }],
    }))(set, get),

  removeFilter: (index) =>
    withDraft((draft) => ({
      ...draft,
      filters: draft.filters.filter((_, i) => i !== index),
    }))(set, get),

  moveFilter: (index, dir) =>
    withDraft((draft) => ({ ...draft, filters: swap(draft.filters, index, dir) }))(set, get),

  addFilterOption: (index, option) =>
    withDraft((draft) => ({
      ...draft,
      filters: draft.filters.map((f, i) =>
        i === index && !f.options.includes(option) ? { ...f, options: [...f.options, option] } : f
      ),
    }))(set, get),

  removeFilterOption: (index, option) =>
    withDraft((draft) => ({
      ...draft,
      filters: draft.filters.map((f, i) =>
        i === index ? { ...f, options: f.options.filter((o) => o !== option) } : f
      ),
    }))(set, get),

  updateMenuCategory: (index, name) =>
    withDraft((draft) => ({
      ...draft,
      menuCategories: draft.menuCategories.map((m, i) => (i === index ? { ...m, name } : m)),
    }))(set, get),

  addMenuCategory: () =>
    withDraft((draft) => ({
      ...draft,
      menuCategories: [
        ...draft.menuCategories,
        { name: `Category ${draft.menuCategories.length + 1}` },
      ],
    }))(set, get),

  removeMenuCategory: (index) =>
    withDraft((draft) => ({
      ...draft,
      menuCategories: draft.menuCategories.filter((_, i) => i !== index),
    }))(set, get),

  moveMenuCategory: (index, dir) =>
    withDraft((draft) => ({ ...draft, menuCategories: swap(draft.menuCategories, index, dir) }))(set, get),

  updateRecommendedItem: (index, name) =>
    withDraft((draft) => ({
      ...draft,
      recommendedItems: draft.recommendedItems.map((r, i) => (i === index ? { ...r, name } : r)),
    }))(set, get),

  addRecommendedItem: () =>
    withDraft((draft) => ({
      ...draft,
      recommendedItems: [
        ...draft.recommendedItems,
        { name: `Item ${draft.recommendedItems.length + 1}` },
      ],
    }))(set, get),

  removeRecommendedItem: (index) =>
    withDraft((draft) => ({
      ...draft,
      recommendedItems: draft.recommendedItems.filter((_, i) => i !== index),
    }))(set, get),

  moveRecommendedItem: (index, dir) =>
    withDraft((draft) => ({ ...draft, recommendedItems: swap(draft.recommendedItems, index, dir) }))(set, get),

  markSaved: () => set({ dirty: false }),
}));

const selectDraft = (s: KitchenSearchEditorState) => s.draft;
const selectDirty = (s: KitchenSearchEditorState) => s.dirty;

export function useKitchenSearchEditorDraft() {
  return kitchenSearchEditorStore(selectDraft);
}
export function useKitchenSearchEditorDirty() {
  return kitchenSearchEditorStore(selectDirty);
}
export function useKitchenSearchEditorActions() {
  return kitchenSearchEditorStore(
    useShallow((s) => ({
      openEditor: s.openEditor,
      closeEditor: s.closeEditor,
      updateDraft: s.updateDraft,
      updateChip: s.updateChip,
      addChip: s.addChip,
      removeChip: s.removeChip,
      moveChip: s.moveChip,
      updateFilter: s.updateFilter,
      addFilter: s.addFilter,
      removeFilter: s.removeFilter,
      moveFilter: s.moveFilter,
      addFilterOption: s.addFilterOption,
      removeFilterOption: s.removeFilterOption,
      updateMenuCategory: s.updateMenuCategory,
      addMenuCategory: s.addMenuCategory,
      removeMenuCategory: s.removeMenuCategory,
      moveMenuCategory: s.moveMenuCategory,
      updateRecommendedItem: s.updateRecommendedItem,
      addRecommendedItem: s.addRecommendedItem,
      removeRecommendedItem: s.removeRecommendedItem,
      moveRecommendedItem: s.moveRecommendedItem,
      markSaved: s.markSaved,
    }))
  );
}
