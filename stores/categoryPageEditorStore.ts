import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import type {
  AdminCategoryPageDetail,
  AdminCategoryPageFeature,
  AdminCategoryPageOffer,
  AdminCategoryPageFaq,
} from "@/actions/admin/category-pages";

export interface CategoryPageEditorFeature {
  id?: string;
  icon: string;
  title: string;
  subtitle: string;
  color: string;
  isEnabled: boolean;
}

export interface CategoryPageEditorOffer {
  id?: string;
  title: string;
  subtitle: string;
  badge: string;
  isEnabled: boolean;
}

export interface CategoryPageEditorFaq {
  id?: string;
  question: string;
  answer: string;
}

export interface CategoryPageEditorDraft {
  id: string;
  categoryId: string;
  categoryName: string;
  slug: string;
  isActive: boolean;
  heroLayout: string;
  desktopBannerUrl: string;
  mobileBannerUrl: string;
  iconUrl: string;
  title: string;
  badgeText: string;
  description: string;
  showHero: boolean;
  defaultSort: string;
  showRatings: boolean;
  cardsPerPage: number;
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  features: CategoryPageEditorFeature[];
  offers: CategoryPageEditorOffer[];
  faqs: CategoryPageEditorFaq[];
}

export function toCategoryPageEditorDraft(item: AdminCategoryPageDetail): CategoryPageEditorDraft {
  const mapFeature = (f: AdminCategoryPageFeature): CategoryPageEditorFeature => ({
    id: f.id,
    icon: f.icon,
    title: f.title,
    subtitle: f.subtitle,
    color: f.color,
    isEnabled: f.isEnabled,
  });
  const mapOffer = (o: AdminCategoryPageOffer): CategoryPageEditorOffer => ({
    id: o.id,
    title: o.title,
    subtitle: o.subtitle,
    badge: o.badge,
    isEnabled: o.isEnabled,
  });
  const mapFaq = (q: AdminCategoryPageFaq): CategoryPageEditorFaq => ({
    id: q.id,
    question: q.question,
    answer: q.answer,
  });

  return {
    id: item.id,
    categoryId: item.categoryId,
    categoryName: item.categoryName,
    slug: item.slug,
    isActive: item.isActive,
    heroLayout: item.heroLayout,
    desktopBannerUrl: item.desktopBannerUrl,
    mobileBannerUrl: item.mobileBannerUrl,
    iconUrl: item.iconUrl,
    title: item.title,
    badgeText: item.badgeText,
    description: item.description,
    showHero: item.showHero,
    defaultSort: item.defaultSort,
    showRatings: item.showRatings,
    cardsPerPage: item.cardsPerPage,
    metaTitle: item.metaTitle,
    metaDescription: item.metaDescription,
    keywords: item.keywords.join(", "),
    canonicalUrl: item.canonicalUrl,
    features: item.features.map(mapFeature),
    offers: item.offers.map(mapOffer),
    faqs: item.faqs.map(mapFaq),
  };
}

export function toCategoryPageSaveInput(draft: CategoryPageEditorDraft) {
  return {
    isActive: draft.isActive,
    heroLayout: draft.heroLayout,
    desktopBannerUrl: draft.desktopBannerUrl,
    mobileBannerUrl: draft.mobileBannerUrl,
    iconUrl: draft.iconUrl,
    title: draft.title,
    badgeText: draft.badgeText,
    description: draft.description,
    showHero: draft.showHero,
    defaultSort: draft.defaultSort,
    showRatings: draft.showRatings,
    cardsPerPage: draft.cardsPerPage,
    metaTitle: draft.metaTitle,
    metaDescription: draft.metaDescription,
    keywords: draft.keywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean),
    canonicalUrl: draft.canonicalUrl,
    featuredKitchenIds: [],
    featuredMenuIds: [],
    features: draft.features.map(({ icon, title, subtitle, color, isEnabled }) => ({
      icon,
      title,
      subtitle,
      color,
      isEnabled,
    })),
    offers: draft.offers.map(({ title, subtitle, badge, isEnabled }) => ({
      title,
      subtitle,
      badge,
      isEnabled,
    })),
    faqs: draft.faqs.map(({ question, answer }) => ({ question, answer })),
  };
}

interface CategoryPageEditorState {
  draft: CategoryPageEditorDraft | null;
  dirty: boolean;
  openEditor: (item: AdminCategoryPageDetail) => void;
  closeEditor: () => void;
  updateDraft: (patch: Partial<CategoryPageEditorDraft>) => void;
  updateFeature: (index: number, patch: Partial<CategoryPageEditorFeature>) => void;
  addFeature: () => void;
  removeFeature: (index: number) => void;
  moveFeature: (index: number, dir: -1 | 1) => void;
  updateOffer: (index: number, patch: Partial<CategoryPageEditorOffer>) => void;
  addOffer: () => void;
  removeOffer: (index: number) => void;
  updateFaq: (index: number, patch: Partial<CategoryPageEditorFaq>) => void;
  addFaq: () => void;
  removeFaq: (index: number) => void;
  markSaved: () => void;
}

function withDraft(
  update: (draft: CategoryPageEditorDraft) => CategoryPageEditorDraft
): (
  set: (
    partial: Partial<CategoryPageEditorState> | ((state: CategoryPageEditorState) => Partial<CategoryPageEditorState>)
  ) => void,
  get: () => CategoryPageEditorState
) => void {
  return (set, get) => {
    const draft = get().draft;
    if (!draft) return;
    set({ draft: update(draft), dirty: true });
  };
}

export const categoryPageEditorStore = create<CategoryPageEditorState>()((set, get) => ({
  draft: null,
  dirty: false,

  openEditor: (item) => set({ draft: toCategoryPageEditorDraft(item), dirty: false }),

  closeEditor: () => set({ draft: null, dirty: false }),

  updateDraft: (patch) => withDraft((draft) => ({ ...draft, ...patch }))(set, get),

  updateFeature: (index, patch) =>
    withDraft((draft) => ({
      ...draft,
      features: draft.features.map((f, i) => (i === index ? { ...f, ...patch } : f)),
    }))(set, get),

  addFeature: () =>
    withDraft((draft) => ({
      ...draft,
      features: [
        ...draft.features,
        { icon: "ChefHat", title: `Feature ${draft.features.length + 1}`, subtitle: "", color: "text-orange-500", isEnabled: true },
      ],
    }))(set, get),

  removeFeature: (index) =>
    withDraft((draft) => ({
      ...draft,
      features: draft.features.filter((_, i) => i !== index),
    }))(set, get),

  moveFeature: (index, dir) =>
    withDraft((draft) => {
      const next = [...draft.features];
      const target = index + dir;
      if (target < 0 || target >= next.length) return draft;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...draft, features: next };
    })(set, get),

  updateOffer: (index, patch) =>
    withDraft((draft) => ({
      ...draft,
      offers: draft.offers.map((o, i) => (i === index ? { ...o, ...patch } : o)),
    }))(set, get),

  addOffer: () =>
    withDraft((draft) => ({
      ...draft,
      offers: [...draft.offers, { title: `Offer ${draft.offers.length + 1}`, subtitle: "", badge: "", isEnabled: true }],
    }))(set, get),

  removeOffer: (index) =>
    withDraft((draft) => ({
      ...draft,
      offers: draft.offers.filter((_, i) => i !== index),
    }))(set, get),

  updateFaq: (index, patch) =>
    withDraft((draft) => ({
      ...draft,
      faqs: draft.faqs.map((q, i) => (i === index ? { ...q, ...patch } : q)),
    }))(set, get),

  addFaq: () =>
    withDraft((draft) => ({
      ...draft,
      faqs: [...draft.faqs, { question: `Question ${draft.faqs.length + 1}?`, answer: "" }],
    }))(set, get),

  removeFaq: (index) =>
    withDraft((draft) => ({
      ...draft,
      faqs: draft.faqs.filter((_, i) => i !== index),
    }))(set, get),

  markSaved: () => set({ dirty: false }),
}));

const selectDraft = (s: CategoryPageEditorState) => s.draft;
const selectDirty = (s: CategoryPageEditorState) => s.dirty;

export function useCategoryPageEditorDraft() {
  return categoryPageEditorStore(selectDraft);
}
export function useCategoryPageEditorDirty() {
  return categoryPageEditorStore(selectDirty);
}
export function useCategoryPageEditorActions() {
  return categoryPageEditorStore(
    useShallow((s) => ({
      openEditor: s.openEditor,
      closeEditor: s.closeEditor,
      updateDraft: s.updateDraft,
      updateFeature: s.updateFeature,
      addFeature: s.addFeature,
      removeFeature: s.removeFeature,
      moveFeature: s.moveFeature,
      updateOffer: s.updateOffer,
      addOffer: s.addOffer,
      removeOffer: s.removeOffer,
      updateFaq: s.updateFaq,
      addFaq: s.addFaq,
      removeFaq: s.removeFaq,
      markSaved: s.markSaved,
    }))
  );
}
