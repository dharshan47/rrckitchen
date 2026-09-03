import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getAllCategories,
  toggleCategory,
  addCategory,
  updateCategory,
  deleteCategory,
} from "@/actions/admin/admin-cms";

/** Shape of a category row as returned by getAllCategories. */
export type AdminCategory = NonNullable<
  Awaited<ReturnType<typeof getAllCategories>>[number]
>;

/** State shape for the admin categories store. */
interface AdminCategoriesState {
  categories: AdminCategory[];
  setCategories: (categories: AdminCategory[]) => void;
  resetAdminCategoriesState: () => void;
}

/** Selector returning the categories list. */
export const selectAdminCategories = (s: AdminCategoriesState) => s.categories;
/** Selector returning all categories actions in a single object (stable via shallow). */
export const selectAdminCategoriesActions = (s: AdminCategoriesState) => ({
  setCategories: s.setCategories,
  resetAdminCategoriesState: s.resetAdminCategoriesState,
});

/**
 * Zustand store for the admin categories page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data.
 */
export const adminCategoriesStore = create<AdminCategoriesState>()((set) => ({
  categories: [],
  setCategories: (categories: AdminCategory[]) => set({ categories }),
  resetAdminCategoriesState: () => set({ categories: [] }),
}));

/** Hook returning the categories list. */
export function useAdminCategories() {
  return adminCategoriesStore(selectAdminCategories);
}
/** Hook returning all categories actions (stable reference). */
export function useAdminCategoriesActions() {
  return adminCategoriesStore(useShallow(selectAdminCategoriesActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the categories list via TanStack Query and syncs the result into
 * the zustand store. Polls every 30s.
 */
export function useAdminCategoriesQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-categories-list"],
    queryFn: getAllCategories,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    adminCategoriesStore.getState().setCategories(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/* ------------------------- Mutation hooks ------------------------- */

/**
 * Toggles a category's active state and invalidates the categories query.
 * Returns the action result object ({ success, error? }).
 */
export function useToggleCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCategory(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] });
    },
  });
}

/**
 * Creates a new category and invalidates the categories query.
 * Returns the action result object ({ success, error? }).
 */
export function useAddCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof addCategory>[0]) => addCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] });
    },
  });
}

/**
 * Updates an existing category and invalidates the categories query.
 * Returns the action result object ({ success, error? }).
 */
export function useUpdateCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateCategory>[1];
    }) => updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] });
    },
  });
}

/**
 * Deletes a category and invalidates the categories query.
 * Returns the action result object ({ success, error? }).
 */
export function useDeleteCategoryMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories-list"] });
    },
  });
}
