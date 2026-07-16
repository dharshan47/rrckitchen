"use client";

import { SortByDropdown, SortOption } from "./sort-by-dialog";
import { VegFilter, type VegFilterValue } from "./veg-filter";
import { CuisineDialog } from "./cuisine-dialog";
export type { VegFilterValue };
interface CategoryData {
  id: string;
  name: string;
  kitchenCount: number;
}

interface KitchenFiltersProps {
  categories: CategoryData[];
  selectedCategory: string | null;
  onCategorySelect: (category: string | null) => void;
  sortOption: SortOption | null;
  onSortChange: (option: SortOption | null) => void;
  vegFilter: VegFilterValue;
  onVegFilterChange: (veg: VegFilterValue) => void;
  selectedCuisines: string[];
  onCuisinesChange: (cuisines: string[]) => void;
}

export function KitchenFilters({
  categories,
  sortOption,
  onSortChange,
  vegFilter,
  onVegFilterChange,
  selectedCuisines,
  onCuisinesChange,
}: KitchenFiltersProps) {
  return (
    <div className="flex items-center gap-3 flex-nowrap md:flex-wrap overflow-x-auto scrollbar-none">
      <SortByDropdown value={sortOption} onValueChange={onSortChange} />
      <VegFilter value={vegFilter} onValueChange={onVegFilterChange} />
      <CuisineDialog
        cuisines={categories}
        selectedCuisines={selectedCuisines}
        onCuisinesChange={onCuisinesChange}
      />
    </div>
  );
}
