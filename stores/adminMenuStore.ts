import { useEffect } from "react";
import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllMenuItems,
  getAdminKitchensWithMenus,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  addMenuItemPhoto,
  deleteMenuItemPhoto,
} from "@/actions/admin/admin-menu";

/** Shape of a menu item row as returned by getAllMenuItems. */
export type AdminMenuItem = NonNullable<
  Awaited<ReturnType<typeof getAllMenuItems>>[number]
>;

/** Flat row shape used by the admin menu table / edit sheet. */
export type AdminMenuItemRow = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  foodType: string;
  timeSlot: string;
  isAvailable: boolean;
  availableFor: string;
  avgRating: number;
  totalReviews: number;
  orderCount: number;
  imageUrl: string | null;
  kitchenName: string | null;
  menuId: string;
  menuName: string;
  cuisine: string | null;
  photos: { id: string; imageUrl: string }[];
  createdAt: Date;
  updatedAt: Date;
};

/** State shape for the admin menu store. */
interface AdminMenuState {
  menuItems: AdminMenuItem[];
  selectedItem: AdminMenuItemRow | null;
  setMenuItems: (items: AdminMenuItem[]) => void;
  setSelectedItem: (item: AdminMenuItemRow | null) => void;
  resetAdminMenuState: () => void;
}

/** Selector returning the menu items list. */
export const selectAdminMenuItems = (s: AdminMenuState) => s.menuItems;
/** Selector returning the item currently open in the edit sheet. */
export const selectAdminSelectedMenuItem = (s: AdminMenuState) => s.selectedItem;
/** Selector returning all menu actions in a single object (stable via shallow). */
export const selectAdminMenuActions = (s: AdminMenuState) => ({
  setMenuItems: s.setMenuItems,
  setSelectedItem: s.setSelectedItem,
  resetAdminMenuState: s.resetAdminMenuState,
});

/**
 * Zustand store for the admin menu page.
 * Server data is fetched via TanStack Query and synced into this store
 * through a useEffect on the query data; the sheet selection lives here too.
 */
export const adminMenuStore = create<AdminMenuState>()((set) => ({
  menuItems: [],
  selectedItem: null,
  setMenuItems: (menuItems: AdminMenuItem[]) => set({ menuItems }),
  setSelectedItem: (selectedItem: AdminMenuItemRow | null) => set({ selectedItem }),
  resetAdminMenuState: () => set({ menuItems: [], selectedItem: null }),
}));

/** Hook returning the menu items list. */
export function useAdminMenuItems() {
  return adminMenuStore(selectAdminMenuItems);
}
/** Hook returning the item open in the edit sheet. */
export function useAdminSelectedMenuItem() {
  return adminMenuStore(selectAdminSelectedMenuItem);
}
/** Hook returning all menu actions (stable reference). */
export function useAdminMenuActions() {
  return adminMenuStore(useShallow(selectAdminMenuActions));
}

/* ------------------------- TanStack Query hooks ------------------------- */

/**
 * Fetches the admin menu items list via TanStack Query and syncs the result
 * into the zustand store. Polls every 30s.
 */
export function useAdminMenuItemsQuery() {
  const { data, ...rest } = useQuery({
    queryKey: ["admin-menu-items"],
    queryFn: getAllMenuItems,
    refetchInterval: 30_000,
  });

  useEffect(() => {
    adminMenuStore.getState().setMenuItems(Array.isArray(data) ? data : []);
  }, [data]);

  return { data, ...rest };
}

/**
 * Fetches active kitchens with their menus (for create / move flows).
 */
export function useAdminKitchensWithMenusQuery() {
  return useQuery({
    queryKey: ["admin-kitchens-menus"],
    queryFn: getAdminKitchensWithMenus,
    staleTime: 60_000,
  });
}

/**
 * Creates a menu item. Invalidates the menu items query on success.
 */
export function useCreateMenuItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof createMenuItem>[0]) => createMenuItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
    },
  });
}

/**
 * Updates a menu item's fields. Invalidates the menu items query on success.
 */
export function useUpdateMenuItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateMenuItem>[1] }) =>
      updateMenuItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
    },
  });
}

/**
 * Soft-deletes a menu item. Invalidates the menu items query on success.
 */
export function useDeleteMenuItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMenuItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
    },
  });
}

/**
 * Adds a photo to a menu item. Invalidates the menu items query on success.
 */
export function useAddMenuItemPhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ menuItemId, imageUrl }: { menuItemId: string; imageUrl: string }) =>
      addMenuItemPhoto(menuItemId, imageUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
    },
  });
}

/**
 * Removes a photo from a menu item. Invalidates the menu items query on success.
 */
export function useDeleteMenuItemPhotoMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) => deleteMenuItemPhoto(photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-menu-items"] });
    },
  });
}
