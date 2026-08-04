import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllCravingsRules,
  getCravingsRule,
  getCravingsMenuItems,
  createCravingsRule,
  updateCravingsRule,
  deleteCravingsRule,
  toggleCravingsRule,
  getCravingsRecommendations,
} from "@/actions/admin/cravings-popup";
import type {
  CravingsRuleDetail,
  CravingsRecommendation,
} from "@/actions/admin/cravings-popup";

/** Shape of a rule row as returned by getAllCravingsRules. */
export type AdminCravingsRule = NonNullable<
  Awaited<ReturnType<typeof getAllCravingsRules>>[number]
>;

/** Shape of a pickable menu item (for building rules). */
export type CravingsMenuOption = NonNullable<
  Awaited<ReturnType<typeof getCravingsMenuItems>>[number]
>;

/** Draft used by the admin editor, shared between create and edit flows. */
export interface CravingsRuleDraft {
  id?: string;
  name: string;
  triggerItemId: string;
  kitchenId: string;
  title: string;
  message: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  isActive: boolean;
  itemIds: string[];
}

export function toCravingsRuleDraft(rule: CravingsRuleDetail): CravingsRuleDraft {
  return {
    id: rule.id,
    name: rule.name,
    triggerItemId: rule.triggerItemId,
    kitchenId: rule.kitchenId,
    title: rule.title,
    message: rule.message,
    priority: rule.priority,
    isActive: rule.isActive,
    itemIds: rule.items.map((i) => i.menuItemId),
  };
}

export function toCravingsRuleSaveInput(draft: CravingsRuleDraft) {
  return {
    name: draft.name,
    triggerItemId: draft.triggerItemId,
    kitchenId: draft.kitchenId,
    title: draft.title,
    message: draft.message,
    priority: draft.priority,
    isActive: draft.isActive,
    itemIds: draft.itemIds,
  };
}

interface CravingsPopupState {
  rules: AdminCravingsRule[];
  setRules: (rules: AdminCravingsRule[]) => void;
  menuOptions: CravingsMenuOption[];
  setMenuOptions: (options: CravingsMenuOption[]) => void;
  selectedRuleId: string | null;
  setSelectedRuleId: (id: string | null) => void;
  draft: CravingsRuleDraft | null;
  openCreateDraft: () => void;
  openEditDraft: (rule: CravingsRuleDetail) => void;
  closeDraft: () => void;
  updateDraft: (patch: Partial<CravingsRuleDraft>) => void;
  toggleDraftItem: (menuItemId: string) => void;
  setDraftItemIds: (itemIds: string[]) => void;
  resetCravingsPopupState: () => void;
}

export const cravingsPopupStore = create<CravingsPopupState>()((set) => ({
  rules: [],
  setRules: (rules) => set({ rules }),
  menuOptions: [],
  setMenuOptions: (menuOptions) => set({ menuOptions }),
  selectedRuleId: null,
  setSelectedRuleId: (selectedRuleId) => set({ selectedRuleId }),
  draft: null,
  openCreateDraft: () =>
    set({
      draft: {
        name: "",
        triggerItemId: "",
        kitchenId: "",
        title: "Complete Your Meal 🍽️",
        message: "Customers usually order these together.",
        priority: "MEDIUM",
        isActive: true,
        itemIds: [],
      },
    }),
  openEditDraft: (rule) => set({ draft: toCravingsRuleDraft(rule) }),
  closeDraft: () => set({ draft: null }),
  updateDraft: (patch) =>
    set((state) => (state.draft ? { draft: { ...state.draft, ...patch } } : {})),
  toggleDraftItem: (menuItemId) =>
    set((state) => {
      if (!state.draft) return {};
      const exists = state.draft.itemIds.includes(menuItemId);
      return {
        draft: {
          ...state.draft,
          itemIds: exists
            ? state.draft.itemIds.filter((id) => id !== menuItemId)
            : [...state.draft.itemIds, menuItemId],
        },
      };
    }),
  setDraftItemIds: (itemIds) =>
    set((state) => (state.draft ? { draft: { ...state.draft, itemIds } } : {})),
  resetCravingsPopupState: () =>
    set({ rules: [], menuOptions: [], selectedRuleId: null, draft: null }),
}));

export function useCravingsRules() {
  return cravingsPopupStore((s) => s.rules);
}
export function useCravingsMenuOptions() {
  return cravingsPopupStore((s) => s.menuOptions);
}
export function useCravingsSelectedRuleId() {
  return cravingsPopupStore((s) => s.selectedRuleId);
}
export function useCravingsDraft() {
  return cravingsPopupStore((s) => s.draft);
}
export function useCravingsPopupActions() {
  return cravingsPopupStore(
    useShallow((s) => ({
      setRules: s.setRules,
      setMenuOptions: s.setMenuOptions,
      setSelectedRuleId: s.setSelectedRuleId,
      openCreateDraft: s.openCreateDraft,
      openEditDraft: s.openEditDraft,
      closeDraft: s.closeDraft,
      updateDraft: s.updateDraft,
      toggleDraftItem: s.toggleDraftItem,
      setDraftItemIds: s.setDraftItemIds,
      resetCravingsPopupState: s.resetCravingsPopupState,
    }))
  );
}

/* ------------------------- TanStack Query hooks ------------------------- */

/** Fetches all cravings rules and syncs them into the zustand store. */
export function useCravingsRulesQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-cravings-rules"],
    queryFn: getAllCravingsRules,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    cravingsPopupStore.getState().setRules(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/** Fetches the menu item picker options and syncs them into the zustand store. */
export function useCravingsMenuItemsQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-cravings-menu-items"],
    queryFn: () => getCravingsMenuItems(300),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    cravingsPopupStore.getState().setMenuOptions(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/** Fetches a single rule's detail. */
export function useCravingsRuleDetailQuery(ruleId: string | null, enabled: boolean) {
  return useQuery({
    queryKey: ["admin-cravings-rule", ruleId],
    queryFn: () => getCravingsRule(ruleId as string),
    enabled: enabled && Boolean(ruleId),
  });
}

/** Customer popup: recommendations for the given trigger (cart) item ids. */
export function useCravingsRecommendationsQuery(triggerItemIds: string[]) {
  return useQuery({
    queryKey: ["cravings-recommendations", triggerItemIds],
    queryFn: () => getCravingsRecommendations(triggerItemIds),
    enabled: triggerItemIds.length > 0,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  });
}

/* ------------------------- Mutation hooks ------------------------- */

function useInvalidateCravings() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["admin-cravings-rules"] });
    queryClient.invalidateQueries({ queryKey: ["admin-cravings-rule"] });
  };
}

export function useCreateCravingsRuleMutation() {
  const invalidate = useInvalidateCravings();
  return useMutation({
    mutationFn: (input: Parameters<typeof createCravingsRule>[0]) => createCravingsRule(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCravingsRuleMutation() {
  const invalidate = useInvalidateCravings();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Parameters<typeof updateCravingsRule>[1];
    }) => updateCravingsRule(id, input),
    onSuccess: invalidate,
  });
}

export function useDeleteCravingsRuleMutation() {
  const invalidate = useInvalidateCravings();
  return useMutation({
    mutationFn: (id: string) => deleteCravingsRule(id),
    onSuccess: invalidate,
  });
}

export function useToggleCravingsRuleMutation() {
  const invalidate = useInvalidateCravings();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCravingsRule(id, isActive),
    onSuccess: invalidate,
  });
}

export type { CravingsRecommendation };
