import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { toTitleCase } from "@/lib/utils";
import type {
  AdminSearchPageDetail,
  AdminSearchPageFilter,
  AdminSearchPageBadge,
  AdminSearchPageInfoItem,
} from "@/actions/admin/search-page";

export interface SearchEditorFilter {
  id?: string;
  name: string;
  options: string[];
  isEnabled: boolean;
}

export interface SearchEditorBadge {
  id?: string;
  name: string;
  position: "left" | "right";
  isEnabled: boolean;
}

export interface SearchEditorInfoItem {
  id?: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  isEnabled: boolean;
}

export interface SearchEditorKitchenCard {
  id?: string;
  kitchenPartnerId: string;
  imageUrl: string | null;
  badge: string | null;
}

export interface SearchEditorDraft {
  id: string;
  keyword: string;
  isActive: boolean;
  updatedAt: string;
  createdAt: string;
  bannerImageUrl: string;
  heading: string;
  subHeading: string;
  cardsPerPage: number;
  defaultSort: string;
  showRatings: boolean;
  kitchensCount: number;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  backgroundColor: string;
  showKitchens: boolean;
  showKitchensLimit: string;
  showDishes: boolean;
  showDishesLimit: string;
  showCategories: boolean;
  showCategoriesLimit: string;
  autoSuggest: boolean;
  recentSearches: boolean;
  showKitchenBadges: boolean;
  showDistance: boolean;
  filters: SearchEditorFilter[];
  badges: SearchEditorBadge[];
  infoItems: SearchEditorInfoItem[];
  kitchenCards: SearchEditorKitchenCard[];
}

export function toSearchEditorDraft(item: AdminSearchPageDetail): SearchEditorDraft {
  const mapFilter = (f: AdminSearchPageFilter): SearchEditorFilter => ({
    id: f.id,
    name: f.name,
    options: [...f.options],
    isEnabled: f.isEnabled,
  });
  const mapBadge = (b: AdminSearchPageBadge): SearchEditorBadge => ({
    id: b.id,
    name: b.name,
    position: b.position === "right" ? "right" : "left",
    isEnabled: b.isEnabled,
  });
  const mapInfo = (i: AdminSearchPageInfoItem): SearchEditorInfoItem => ({
    id: i.id,
    icon: i.icon,
    title: i.title,
    subtitle: i.subtitle,
    color: i.color,
    isEnabled: i.isEnabled,
  });
  const mapCard = (c: { id: string; kitchenPartnerId: string; imageUrl: string | null; badge: string | null }): SearchEditorKitchenCard => ({
    id: c.id,
    kitchenPartnerId: c.kitchenPartnerId,
    imageUrl: c.imageUrl,
    badge: c.badge,
  });

  return {
    id: item.id,
    keyword: item.keyword,
    isActive: item.isActive,
    updatedAt: item.updatedAt,
    createdAt: item.createdAt,
    bannerImageUrl: item.bannerImageUrl,
    heading: item.heading,
    subHeading: item.subHeading,
    cardsPerPage: item.cardsPerPage,
    defaultSort: item.defaultSort,
    showRatings: item.showRatings,
    kitchensCount: item.kitchensCount,
    metaTitle: item.metaTitle || "Best " + toTitleCase(item.keyword) + " Near You | RRC Kitchen",
    metaDescription: item.metaDescription || "Find the best " + item.keyword + " near you. Order from home kitchens offering delicious " + item.keyword + " with fast delivery.",
    keywords: item.keywords || item.keyword + ", south indian, breakfast, home food",
    backgroundColor: item.backgroundColor || "#F0FDF4",
    showKitchens: item.showKitchens ?? true,
    showKitchensLimit: item.showKitchensLimit || "32 kitchens",
    showDishes: item.showDishes ?? true,
    showDishesLimit: item.showDishesLimit || "16 dishes",
    showCategories: item.showCategories ?? true,
    showCategoriesLimit: item.showCategoriesLimit || "15 categories",
    autoSuggest: item.autoSuggest ?? true,
    recentSearches: item.recentSearches ?? true,
    showKitchenBadges: item.showKitchenBadges ?? true,
    showDistance: item.showDistance ?? true,
    filters: item.filters.map(mapFilter),
    badges: item.badges.map(mapBadge),
    infoItems: item.infoItems.map(mapInfo),
    kitchenCards: (item.kitchenCards ?? []).map(mapCard),
  };
}

export function toSaveInput(draft: SearchEditorDraft) {
  return {
    bannerImageUrl: draft.bannerImageUrl,
    heading: draft.heading,
    subHeading: draft.subHeading,
    isActive: draft.isActive,
    cardsPerPage: draft.cardsPerPage,
    defaultSort: draft.defaultSort,
    showRatings: draft.showRatings,
    backgroundColor: draft.backgroundColor,
    metaTitle: draft.metaTitle,
    metaDescription: draft.metaDescription,
    keywords: draft.keywords,
    showKitchens: draft.showKitchens,
    showKitchensLimit: draft.showKitchensLimit,
    showDishes: draft.showDishes,
    showDishesLimit: draft.showDishesLimit,
    showCategories: draft.showCategories,
    showCategoriesLimit: draft.showCategoriesLimit,
    autoSuggest: draft.autoSuggest,
    recentSearches: draft.recentSearches,
    showKitchenBadges: draft.showKitchenBadges,
    showDistance: draft.showDistance,
    filters: draft.filters.map(({ name, options, isEnabled }) => ({ name, options, isEnabled })),
    badges: draft.badges.map(({ name, position, isEnabled }) => ({ name, position, isEnabled })),
    infoItems: draft.infoItems.map(({ icon, title, subtitle, color, isEnabled }) => ({
      icon,
      title,
      subtitle,
      color,
      isEnabled,
    })),
    kitchenCards: draft.kitchenCards.map(({ kitchenPartnerId, imageUrl, badge }) => ({
      kitchenPartnerId,
      imageUrl,
      badge,
    })),
  };
}

interface SearchEditorState {
  draft: SearchEditorDraft | null;
  dirty: boolean;
  openEditor: (item: AdminSearchPageDetail) => void;
  closeEditor: () => void;
  updateDraft: (patch: Partial<SearchEditorDraft>) => void;
  updateFilter: (index: number, patch: Partial<SearchEditorFilter>) => void;
  addFilter: () => void;
  removeFilter: (index: number) => void;
  addFilterOption: (index: number, option: string) => void;
  removeFilterOption: (index: number, option: string) => void;
  updateBadge: (index: number, patch: Partial<SearchEditorBadge>) => void;
  addBadge: () => void;
  removeBadge: (index: number) => void;
  updateInfoItem: (index: number, patch: Partial<SearchEditorInfoItem>) => void;
  updateKitchenCard: (kitchenPartnerId: string, patch: Partial<SearchEditorKitchenCard>) => void;
  markSaved: () => void;
}

function withDraft(
  update: (draft: SearchEditorDraft) => SearchEditorDraft
): (
  set: (fn: Partial<SearchEditorState> | ((state: SearchEditorState) => Partial<SearchEditorState>)) => void,
  get: () => SearchEditorState
) => void {
  return (set, get) => {
    const draft = get().draft;
    if (!draft) return;
    set({ draft: update(draft), dirty: true });
  };
}

export const searchEditorStore = create<SearchEditorState>()((set, get) => ({
  draft: null,
  dirty: false,

  openEditor: (item) => set({ draft: toSearchEditorDraft(item), dirty: false }),

  closeEditor: () => set({ draft: null, dirty: false }),

  updateDraft: (patch) =>
    withDraft((draft) => ({ ...draft, ...patch }))(set, get),

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

  addFilterOption: (index, option) =>
    withDraft((draft) => ({
      ...draft,
      filters: draft.filters.map((f, i) =>
        i === index ? { ...f, options: [...f.options, option] } : f
      ),
    }))(set, get),

  removeFilterOption: (index, option) =>
    withDraft((draft) => ({
      ...draft,
      filters: draft.filters.map((f, i) =>
        i === index ? { ...f, options: f.options.filter((o) => o !== option) } : f
      ),
    }))(set, get),

  updateBadge: (index, patch) =>
    withDraft((draft) => ({
      ...draft,
      badges: draft.badges.map((b, i) => (i === index ? { ...b, ...patch } : b)),
    }))(set, get),

  addBadge: () =>
    withDraft((draft) => ({
      ...draft,
      badges: [...draft.badges, { name: "New Badge", position: "left", isEnabled: true }],
    }))(set, get),

  removeBadge: (index) =>
    withDraft((draft) => ({
      ...draft,
      badges: draft.badges.filter((_, i) => i !== index),
    }))(set, get),

  updateInfoItem: (index, patch) =>
    withDraft((draft) => ({
      ...draft,
      infoItems: draft.infoItems.map((item, i) => (i === index ? { ...item, ...patch } : item)),
    }))(set, get),

  updateKitchenCard: (kitchenPartnerId, patch) =>
    withDraft((draft) => {
      const existing = draft.kitchenCards.find((c) => c.kitchenPartnerId === kitchenPartnerId);
      return {
        ...draft,
        kitchenCards: existing
          ? draft.kitchenCards.map((c) =>
              c.kitchenPartnerId === kitchenPartnerId ? { ...c, ...patch } : c
            )
          : [...draft.kitchenCards, { kitchenPartnerId, imageUrl: null, badge: null, ...patch }],
      };
    })(set, get),

  markSaved: () => set({ dirty: false }),
}));

const selectDraft = (s: SearchEditorState) => s.draft;
const selectDirty = (s: SearchEditorState) => s.dirty;

export function useSearchEditorDraft() {
  return searchEditorStore(selectDraft);
}
export function useSearchEditorDirty() {
  return searchEditorStore(selectDirty);
}
export function useSearchEditorActions() {
  return searchEditorStore(
    useShallow((s) => ({
      openEditor: s.openEditor,
      closeEditor: s.closeEditor,
      updateDraft: s.updateDraft,
      updateFilter: s.updateFilter,
      addFilter: s.addFilter,
      removeFilter: s.removeFilter,
      addFilterOption: s.addFilterOption,
      removeFilterOption: s.removeFilterOption,
      updateBadge: s.updateBadge,
      addBadge: s.addBadge,
      removeBadge: s.removeBadge,
      updateInfoItem: s.updateInfoItem,
      updateKitchenCard: s.updateKitchenCard,
      markSaved: s.markSaved,
    }))
  );
}