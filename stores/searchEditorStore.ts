import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
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

export interface SearchEditorDraft {
  id: string;
  keyword: string;
  isActive: boolean;
  bannerImageUrl: string;
  heading: string;
  subHeading: string;
  cardsPerPage: number;
  defaultSort: string;
  showRatings: boolean;
  kitchensCount: number;
  filters: SearchEditorFilter[];
  badges: SearchEditorBadge[];
  infoItems: SearchEditorInfoItem[];
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

  return {
    id: item.id,
    keyword: item.keyword,
    isActive: item.isActive,
    bannerImageUrl: item.bannerImageUrl,
    heading: item.heading,
    subHeading: item.subHeading,
    cardsPerPage: item.cardsPerPage,
    defaultSort: item.defaultSort,
    showRatings: item.showRatings,
    kitchensCount: item.kitchensCount,
    filters: item.filters.map(mapFilter),
    badges: item.badges.map(mapBadge),
    infoItems: item.infoItems.map(mapInfo),
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
    filters: draft.filters.map(({ name, options, isEnabled }) => ({ name, options, isEnabled })),
    badges: draft.badges.map(({ name, isEnabled }) => ({ name, isEnabled })),
    infoItems: draft.infoItems.map(({ icon, title, subtitle, color, isEnabled }) => ({
      icon,
      title,
      subtitle,
      color,
      isEnabled,
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
      badges: [...draft.badges, { name: "New Badge", isEnabled: true }],
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
      markSaved: s.markSaved,
    }))
  );
}