import { Badge } from "@/components/ui/badge";
import type { FoodTypeFilter, TimeSlotFilter } from "@/stores/menuStore";

export function createBadgeVariant(foodType: string): "secondary" | "destructive" | "outline" | "default" {
  switch (foodType) {
    case "VEG": return "secondary";
    case "NONVEG": return "destructive";
    default: return "outline";
  }
}

export function formatTimeSlot(slot: string): string {
  if (slot === slot.toUpperCase()) {
    return slot.charAt(0).toUpperCase() + slot.slice(1).toLowerCase();
  }
  return slot
    .replace(/([A-Z])/g, " $1")
    .trim()
    .replace(/^./, (s) => s.toUpperCase());
}

export type ComponentType = "card" | "list-item" | "dialog" | "grid-item";

export interface ComponentConfig {
  type: ComponentType;
  variant?: string;
  size?: "sm" | "md" | "lg";
}

export function createComponentConfig(type: ComponentType, overrides?: Partial<ComponentConfig>): ComponentConfig {
  return { type, variant: "default", size: "md", ...overrides };
}

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

export interface MenuItemData {
  id: string;
  name: string;
  price: number;
  foodType: string;
  timeSlot: string;
  kitchenName: string;
  description?: string | null;
  photos?: Array<{ url: string; order: number }>;
}

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
