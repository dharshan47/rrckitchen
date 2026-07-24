import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { KitchenFilters } from "@/components/kitchen/kitchen-filters"

vi.mock("@/components/kitchen/sort-by-dialog", () => ({
  SortByDropdown: ({ value, onValueChange, ...props }: Record<string, unknown>) => (
    <select
      data-testid="sort-dropdown"
      value={(value as string) ?? ""}
      onChange={(e) => (onValueChange as (val: string | null) => void)(e.target.value || null)}
      {...props}
    >
      <option value="">Sort</option>
      <option value="rating">Rating</option>
      <option value="price">Price</option>
    </select>
  ),
}))

vi.mock("@/components/kitchen/veg-filter", () => ({
  VegFilter: ({ value, onValueChange }: Record<string, unknown>) => (
    <div data-testid="veg-filter">
      <button onClick={() => (onValueChange as (val: string | null) => void)(value === "pure-veg" ? null : "pure-veg")}>
        {value === "pure-veg" ? "Pure Veg (active)" : "Pure Veg"}
      </button>
    </div>
  ),
}))

vi.mock("@/components/kitchen/cuisine-dialog", () => ({
  CuisineDialog: ({ cuisines, onCuisinesChange }: Record<string, unknown>) => (
    <div data-testid="cuisine-dialog">
      <span>Cuisines: {(cuisines as unknown[]).length}</span>
      <button onClick={() => (onCuisinesChange as (val: string[]) => void)(["cuisine1"])}>Select Cuisine</button>
    </div>
  ),
}))

const mockCategories = [
  { id: "cat1", name: "South Indian", kitchenCount: 5 },
  { id: "cat2", name: "North Indian", kitchenCount: 3 },
]

describe("KitchenFilters", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders SortByDropdown", () => {
    render(
      <KitchenFilters
        categories={mockCategories}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
        sortOption={null}
        onSortChange={vi.fn()}
        vegFilter={null}
        onVegFilterChange={vi.fn()}
        selectedCuisines={[]}
        onCuisinesChange={vi.fn()}
      />
    )
    expect(screen.getByTestId("sort-dropdown")).toBeInTheDocument()
  })

  it("renders VegFilter", () => {
    render(
      <KitchenFilters
        categories={mockCategories}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
        sortOption={null}
        onSortChange={vi.fn()}
        vegFilter={null}
        onVegFilterChange={vi.fn()}
        selectedCuisines={[]}
        onCuisinesChange={vi.fn()}
      />
    )
    expect(screen.getByTestId("veg-filter")).toBeInTheDocument()
  })

  it("renders CuisineDialog", () => {
    render(
      <KitchenFilters
        categories={mockCategories}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
        sortOption={null}
        onSortChange={vi.fn()}
        vegFilter={null}
        onVegFilterChange={vi.fn()}
        selectedCuisines={[]}
        onCuisinesChange={vi.fn()}
      />
    )
    expect(screen.getByTestId("cuisine-dialog")).toBeInTheDocument()
  })

  it("passes categories to CuisineDialog", () => {
    render(
      <KitchenFilters
        categories={mockCategories}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
        sortOption={null}
        onSortChange={vi.fn()}
        vegFilter={null}
        onVegFilterChange={vi.fn()}
        selectedCuisines={[]}
        onCuisinesChange={vi.fn()}
      />
    )
    expect(screen.getByText("Cuisines: 2")).toBeInTheDocument()
  })

  it("passes sortOption to SortByDropdown", () => {
    render(
      <KitchenFilters
        categories={mockCategories}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
        sortOption={"rating"}
        onSortChange={vi.fn()}
        vegFilter={null}
        onVegFilterChange={vi.fn()}
        selectedCuisines={[]}
        onCuisinesChange={vi.fn()}
      />
    )
    const dropdown = screen.getByTestId("sort-dropdown") as HTMLSelectElement
    expect(dropdown.value).toBe("rating")
  })

  it("calls onSortChange when sort option changes", () => {
    const onSortChange = vi.fn()
    render(
      <KitchenFilters
        categories={mockCategories}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
        sortOption={null}
        onSortChange={onSortChange}
        vegFilter={null}
        onVegFilterChange={vi.fn()}
        selectedCuisines={[]}
        onCuisinesChange={vi.fn()}
      />
    )
    fireEvent.change(screen.getByTestId("sort-dropdown"), { target: { value: "price" } })
  })

  it("calls onVegFilterChange when veg filter changes", () => {
    const onVegFilterChange = vi.fn()
    render(
      <KitchenFilters
        categories={mockCategories}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
        sortOption={null}
        onSortChange={vi.fn()}
        vegFilter={null}
        onVegFilterChange={onVegFilterChange}
        selectedCuisines={[]}
        onCuisinesChange={vi.fn()}
      />
    )
    fireEvent.click(screen.getByText("Pure Veg"))
  })

  it("calls onCuisinesChange when cuisine is selected", () => {
    const onCuisinesChange = vi.fn()
    render(
      <KitchenFilters
        categories={mockCategories}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
        sortOption={null}
        onSortChange={vi.fn()}
        vegFilter={null}
        onVegFilterChange={vi.fn()}
        selectedCuisines={[]}
        onCuisinesChange={onCuisinesChange}
      />
    )
    fireEvent.click(screen.getByText("Select Cuisine"))
    expect(onCuisinesChange).toHaveBeenCalledWith(["cuisine1"])
  })

  it("passes selectedCuisines to CuisineDialog", () => {
    render(
      <KitchenFilters
        categories={mockCategories}
        selectedCategory={null}
        onCategorySelect={vi.fn()}
        sortOption={null}
        onSortChange={vi.fn()}
        vegFilter={null}
        onVegFilterChange={vi.fn()}
        selectedCuisines={["cat1"]}
        onCuisinesChange={vi.fn()}
      />
    )
  })
})
