import type { TimeSlotFilter } from "@/stores/menuStore";

/** Maps a food type string to a Badge variant for UI display. */
export function createBadgeVariant(foodType: string): "secondary" | "destructive" | "outline" | "default" {
  switch (foodType) {
    case "VEG": return "secondary";
    case "NONVEG": return "destructive";
    default: return "outline";
  }
}

/** Formats a time slot enum value into a human-readable label. */
export function formatTimeSlot(slot: string): string {
  if (slot === slot.toUpperCase()) {
    return slot.charAt(0).toUpperCase() + slot.slice(1).toLowerCase();
  }
  return slot
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (s) => s.toUpperCase());
}

/** Component type identifiers for polymorphic UI patterns. */
export type ComponentType = "card" | "list-item" | "dialog" | "grid-item";

/** Configuration for a polymorphic component instance. */
export interface ComponentConfig {
  type: ComponentType;
  variant?: string;
  size?: "sm" | "md" | "lg";
}

/** Creates a component config with sensible defaults and optional overrides. */
export function createComponentConfig(type: ComponentType, overrides?: Partial<ComponentConfig>): ComponentConfig {
  return { type, variant: "default", size: "md", ...overrides };
}

/** Returns a human-readable label for a given time slot filter value. */
export function getTimeSlotLabel(value: TimeSlotFilter): string {
  const labels: Record<TimeSlotFilter, string> = {
    ALL: "All slots",
    MORNING: "Morning Breakfast",
    LUNCH: "Afternoon Lunch",
    EVENINGSNACKS: "Evening Snacks",
    DINNER: "Night Dinner",
  };
  return labels[value];
}

/** Normalized menu item data used across the menu card and list components. */
export interface MenuItemData {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  foodType: string;
  timeSlot: string;
  kitchenName: string;
  description?: string | null;
  photos?: Array<{ url: string; order: number }>;
}

/** Normalizes a raw API response item into a typed MenuItemData object. */
export function normalizeMenuItem(item: Record<string, unknown>): MenuItemData {
  return {
    id: item.id as string,
    name: item.name as string,
    price: Number(item.price),
    foodType: item.foodType as string,
    timeSlot: item.timeSlot as string,
    kitchenName: (item.kitchenName as string) ?? "Local kitchen",
    description: item.description as string | null,
    photos: (item.photos as Array<Record<string, unknown>>)?.map((p) => ({
      url: p.imageUrl as string,
      order: p.sortOrder as number,
    })),
  };
}
