import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { CompoundMenuCard } from "@/components/patterns/compound-menu-card"
import type { MenuCardItem } from "@/components/patterns/compound-menu-card"

vi.mock("@/stores", () => ({
  useCartItems: vi.fn(() => []),
  useCartActions: vi.fn(() => ({ updateQuantity: vi.fn(), removeFromCart: vi.fn() })),
}))

const mockItem: MenuCardItem = {
  id: "item1",
  slug: "test-item",
  name: "Test Item",
  price: 100,
  compareAtPrice: 150,
  foodType: "VEG",
  timeSlot: "LUNCH",
  kitchenName: "Test Kitchen",
  kitchenRating: 4.5,
  totalReviews: 10,
  description: "A test menu item",
  imageUrl: "/test.jpg",
  isBestseller: true,
}

describe("CompoundMenuCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders children", () => {
    render(
      <CompoundMenuCard.Root item={mockItem}>
        <div>Child Content</div>
      </CompoundMenuCard.Root>
    )
    expect(screen.getByText("Child Content")).toBeInTheDocument()
  })

  it("renders Header with item name", () => {
    render(
      <CompoundMenuCard.Root item={mockItem}>
        <CompoundMenuCard.Header />
      </CompoundMenuCard.Root>
    )
    expect(screen.getByText("Test Item")).toBeInTheDocument()
    expect(screen.getByText("Test Kitchen")).toBeInTheDocument()
  })

  it("renders price correctly", () => {
    render(
      <CompoundMenuCard.Root item={mockItem}>
        <CompoundMenuCard.Header />
      </CompoundMenuCard.Root>
    )
    expect(screen.getByText("₹100")).toBeInTheDocument()
  })

  it("renders Bestseller badge when item is bestseller", () => {
    render(
      <CompoundMenuCard.Root item={mockItem}>
        <CompoundMenuCard.Header />
      </CompoundMenuCard.Root>
    )
    expect(screen.getByText("Bestseller")).toBeInTheDocument()
  })

  it("renders ImageSection when imageUrl is present", () => {
    render(
      <CompoundMenuCard.Root item={mockItem}>
        <CompoundMenuCard.ImageSection />
      </CompoundMenuCard.Root>
    )
    const img = screen.getByRole("img")
    expect(img).toBeInTheDocument()
  })

  it("does not render ImageSection when imageUrl is null", () => {
    const itemNoImg = { ...mockItem, imageUrl: null }
    const { container } = render(
      <CompoundMenuCard.Root item={itemNoImg}>
        <CompoundMenuCard.ImageSection />
      </CompoundMenuCard.Root>
    )
    expect(container.querySelector(".aspect-square")).not.toBeInTheDocument()
  })

  it("renders BadgeRibbon when compareAtPrice is present", () => {
    render(
      <CompoundMenuCard.Root item={mockItem}>
        <CompoundMenuCard.BadgeRibbon />
      </CompoundMenuCard.Root>
    )
    expect(screen.getByText("%")).toBeInTheDocument()
  })

  it("does not render BadgeRibbon when compareAtPrice is null", () => {
    const itemNoDiscount = { ...mockItem, compareAtPrice: null }
    const { container } = render(
      <CompoundMenuCard.Root item={itemNoDiscount}>
        <CompoundMenuCard.BadgeRibbon />
      </CompoundMenuCard.Root>
    )
    expect(container.querySelector(".clip-path")).toBeNull()
  })

  it("calls onItemClick when root is clicked and onItemClick is provided", () => {
    const onItemClick = vi.fn()
    render(
      <CompoundMenuCard.Root item={mockItem} onItemClick={onItemClick}>
        <CompoundMenuCard.Header />
      </CompoundMenuCard.Root>
    )
    const root = screen.getByText("Test Item").closest("[role='button']")!
    fireEvent.click(root)
    expect(onItemClick).toHaveBeenCalledWith(mockItem)
  })

  it("shows Add button when item is not in cart", () => {
    render(
      <CompoundMenuCard.Root item={mockItem}>
        <CompoundMenuCard.Header />
      </CompoundMenuCard.Root>
    )
    expect(screen.getByText("Add")).toBeInTheDocument()
  })

  it("calls onAddToCart when Add is clicked", () => {
    const onAddToCart = vi.fn()
    render(
      <CompoundMenuCard.Root item={mockItem} onAddToCart={onAddToCart}>
        <CompoundMenuCard.Header />
      </CompoundMenuCard.Root>
    )
    fireEvent.click(screen.getByText("Add"))
    expect(onAddToCart).toHaveBeenCalledWith("item1")
  })

  it("renders food type icon for VEG", () => {
    render(
      <CompoundMenuCard.Root item={mockItem}>
        <CompoundMenuCard.Header />
      </CompoundMenuCard.Root>
    )
    const svg = document.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("renders rating badge when kitchenRating and totalReviews are present", () => {
    render(
      <CompoundMenuCard.Root item={mockItem}>
        <CompoundMenuCard.Header />
      </CompoundMenuCard.Root>
    )
    expect(screen.getByText("4.5")).toBeInTheDocument()
    expect(screen.getByText("(10)")).toBeInTheDocument()
  })

  it("does not show kitchen meta when showKitchenMeta is false", () => {
    render(
      <CompoundMenuCard.Root item={mockItem} showKitchenMeta={false}>
        <CompoundMenuCard.Header />
      </CompoundMenuCard.Root>
    )
    expect(screen.queryByText("Test Kitchen")).not.toBeInTheDocument()
  })
})
