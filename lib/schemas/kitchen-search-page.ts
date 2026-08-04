import { z } from "zod";

export const KITCHEN_SEARCH_SORT_OPTIONS = [
  "Popularity",
  "Price Low → High",
  "Highest Rating",
  "Newest",
  "Chef Recommendation",
] as const;

const optionalUrl = z
  .string()
  .refine(
    (value) => value === "" || /^https?:\/\/.+/.test(value),
    "Enter a valid image URL"
  );

export const kitchenSearchChipSchema = z.object({
  label: z.string().trim().min(1, "Chip label is required").max(40, "Chip label is too long"),
  isEnabled: z.boolean(),
});

export const kitchenSearchFilterSchema = z.object({
  name: z.string().trim().min(1, "Filter name is required").max(60, "Filter name is too long"),
  options: z.array(z.string().trim().min(1, "Filter value cannot be empty")),
  isEnabled: z.boolean(),
});

export const kitchenSearchMenuCategorySchema = z.object({
  name: z.string().trim().min(1, "Category name is required").max(60, "Category name is too long"),
});

export const kitchenSearchRecommendedItemSchema = z.object({
  name: z.string().trim().min(1, "Recommended item name is required").max(60, "Name is too long"),
});

export const kitchenSearchPageSaveSchema = z.object({
  isActive: z.boolean(),
  desktopBannerUrl: optionalUrl,
  mobileBannerUrl: optionalUrl,
  searchTitle: z.string().trim().min(1, "Search title is required").max(80, "Search title is too long"),
  badgeText: z.string().trim().max(60, "Badge text is too long"),
  description: z.string().trim().max(500, "Description is too long"),
  showHero: z.boolean(),
  defaultSort: z.enum(KITCHEN_SEARCH_SORT_OPTIONS),
  showRatings: z.boolean(),
  showDeliveryTime: z.boolean(),
  showDistance: z.boolean(),
  showPureVegBadge: z.boolean(),
  showHygienicBadge: z.boolean(),
  showKitchenStory: z.boolean(),
  showInternalNotes: z.boolean(),
  showKitchenTiming: z.boolean(),
  showFreshIngredients: z.boolean(),
  showPackaging: z.boolean(),
  showSupportLocalWomen: z.boolean(),
  chips: z.array(kitchenSearchChipSchema).min(1, "Add at least one search chip"),
  filters: z.array(kitchenSearchFilterSchema),
  menuCategories: z
    .array(kitchenSearchMenuCategorySchema)
    .min(1, "Add at least one menu category"),
  recommendedItems: z.array(kitchenSearchRecommendedItemSchema),
});

export const kitchenSearchPageCreateSchema = z.object({
  keyword: z
    .string()
    .trim()
    .min(1, "Search keyword is required")
    .max(50, "Keyword must be under 50 characters"),
});

export type KitchenSearchPageSaveSchema = z.infer<typeof kitchenSearchPageSaveSchema>;
export type KitchenSearchPageCreateSchema = z.infer<typeof kitchenSearchPageCreateSchema>;

export function validateKitchenSearchSave(
  input: unknown
): { success: true; data: KitchenSearchPageSaveSchema } | { success: false; errors: string[] } {
  const result = kitchenSearchPageSaveSchema.safeParse(input);
  if (result.success) return result;
  const errors = result.error.issues.map((issue) => issue.message);
  return { success: false, errors: Array.from(new Set(errors)) };
}

export function validateKitchenSearchCreate(
  input: unknown
): { success: true; data: KitchenSearchPageCreateSchema } | { success: false; errors: string[] } {
  const result = kitchenSearchPageCreateSchema.safeParse(input);
  if (result.success) return result;
  return { success: false, errors: result.error.issues.map((issue) => issue.message) };
}
