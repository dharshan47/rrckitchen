import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { MenuItemDetail } from "@/components/menu/menu-item-detail"

const mockAddToCart = vi.hoisted(() => vi.fn())
const mockUpdateQuantity = vi.hoisted(() => vi.fn())
const mockRemoveFromCart = vi.hoisted(() => vi.fn())
const mockUseMenuDeliveryAddress = vi.hoisted(() => vi.fn(() => "Test Address"))

let mockCartItems: Array<Record<string, unknown>> = []

vi.mock("@/stores", () => ({
  useCartActions: vi.fn(() => ({
    addToCart: mockAddToCart,
    updateQuantity: mockUpdateQuantity,
    removeFromCart: mockRemoveFromCart,
  })),
  useCartItems: vi.fn(() => mockCartItems),
  useMenuDeliveryAddress: mockUseMenuDeliveryAddress,
}))

vi.mock("@/components/patterns/progressive-image", () => ({
  ProgressiveImage: ({ src, alt }: { src: string; alt?: string }) => <img src={src} alt={alt || "progressive"} />,
}))

vi.mock("@/components/location", () => ({
  LocationDialog: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div data-testid="location-dialog"><button onClick={onClose}>Close</button></div> : null,
}))

vi.mock("@/components/menu/wishlist-button", () => ({
  WishlistButton: ({ menuItemId, size, variant, className }: Record<string, unknown>) =>
    <button data-testid="wishlist-button" data-item-id={menuItemId as string} data-size={size as string} data-variant={variant as string} className={className as string}>Wishlist</button>,
}))

vi.mock("@/components/menu/add-to-cart-popup", () => ({
  AddToCartPopup: ({ item, qty, open }: { item: { name: string } | null; qty: number; open: boolean }) =>
    open ? <div data-testid="add-to-cart-popup" data-qty={qty}>{item?.name}</div> : null,
}))

vi.mock("@/lib/patterns", () => ({
  formatTimeSlot: (ts: string) => `Formatted: ${ts}`,
  createBadgeVariant: (ft: string) => ft === "VEG" ? "success" : "destructive",
}))

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

const baseItem = {
  id: "item1",
  name: "Butter Chicken",
  description: "Rich and creamy tomato-based curry",
  price: 250,
  compareAtPrice: 300,
  foodType: "NONVEG",
  timeSlot: "LUNCH",
  isAvailable: true,
  avgRating: 4.5,
  totalReviews: 25,
  menu: { kitchenPartner: { kitchenAlias: { displayName: "Punjabi Dhaba" } } },
  photos: [
    { id: "p1", imageUrl: "/images/butter-chicken.jpg", sortOrder: 0 },
    { id: "p2", imageUrl: "/images/butter-chicken-2.jpg", sortOrder: 1 },
  ],
}

describe("MenuItemDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCartItems = []
    mockUseMenuDeliveryAddress.mockReturnValue("Test Address")
  })

  it("renders menu item name", () => {
    render(<MenuItemDetail item={baseItem} />)
    const nameEls = screen.getAllByText("Butter Chicken")
    expect(nameEls.length).toBeGreaterThan(0)
  })

  it("renders menu item price", () => {
    render(<MenuItemDetail item={baseItem} />)
    const priceElements = screen.getAllByText((content) => content.includes("250"))
    expect(priceElements.length).toBeGreaterThan(0)
  })

  it("renders item description", () => {
    render(<MenuItemDetail item={baseItem} />)
    expect(screen.getByText("Rich and creamy tomato-based curry")).toBeInTheDocument()
  })

  it("renders food type badge", () => {
    render(<MenuItemDetail item={baseItem} />)
    expect(screen.getByText("NONVEG")).toBeInTheDocument()
  })

  it("renders kitchen display name", () => {
    render(<MenuItemDetail item={baseItem} />)
    const kitchenEls = screen.getAllByText("Punjabi Dhaba")
    expect(kitchenEls.length).toBeGreaterThan(0)
  })

  it("renders rating and review count", () => {
    render(<MenuItemDetail item={baseItem} />)
    expect(screen.getByText("4.5")).toBeInTheDocument()
    expect(screen.getByText("(25+)")).toBeInTheDocument()
  })

  it("renders time slot with formatted value", () => {
    render(<MenuItemDetail item={baseItem} />)
    expect(screen.getByText("Formatted: LUNCH")).toBeInTheDocument()
  })

  it("renders discount price when compareAtPrice exists", () => {
    render(<MenuItemDetail item={baseItem} />)
    const mrpTexts = screen.getAllByText((content) => content.includes("300"))
    expect(mrpTexts.length).toBeGreaterThan(0)
  })

  it("renders Add to Cart button when item is not in cart", () => {
    render(<MenuItemDetail item={baseItem} />)
    const addButtons = screen.getAllByText("Add to Cart")
    expect(addButtons.length).toBeGreaterThan(0)
  })

  it("calls addToCart when Add to Cart is clicked", () => {
    render(<MenuItemDetail item={baseItem} />)
    const addButtons = screen.getAllByText("Add to Cart")
    fireEvent.click(addButtons[0])
    expect(mockAddToCart).toHaveBeenCalledWith({
      id: "item1",
      name: "Butter Chicken",
      price: 250,
      qty: 1,
      foodType: "NONVEG",
      timeSlot: "LUNCH",
      kitchenName: "Punjabi Dhaba",
    })
  })

  it("shows quantity controls when item is in cart", () => {
    mockCartItems = [{ id: "item1", name: "Butter Chicken", price: 250, qty: 2, foodType: "NONVEG", timeSlot: "LUNCH", kitchenName: "Punjabi Dhaba" }]
    render(<MenuItemDetail item={baseItem} />)
    const decrementButtons = screen.getAllByLabelText("Decrease quantity")
    expect(decrementButtons.length).toBeGreaterThan(0)
    expect(screen.getAllByText("2").length).toBeGreaterThan(0)
    const incrementButtons = screen.getAllByLabelText("Increase quantity")
    expect(incrementButtons.length).toBeGreaterThan(0)
  })

  it("calls updateQuantity on increment", () => {
    mockCartItems = [{ id: "item1", name: "Butter Chicken", price: 250, qty: 1, foodType: "NONVEG", timeSlot: "LUNCH", kitchenName: "Punjabi Dhaba" }]
    render(<MenuItemDetail item={baseItem} />)
    const incrementButtons = screen.getAllByLabelText("Increase quantity")
    fireEvent.click(incrementButtons[0])
    expect(mockUpdateQuantity).toHaveBeenCalledWith("item1", 2)
  })

  it("calls removeFromCart when decrementing from 1", () => {
    mockCartItems = [{ id: "item1", name: "Butter Chicken", price: 250, qty: 1, foodType: "NONVEG", timeSlot: "LUNCH", kitchenName: "Punjabi Dhaba" }]
    render(<MenuItemDetail item={baseItem} />)
    const decrementButtons = screen.getAllByLabelText("Decrease quantity")
    fireEvent.click(decrementButtons[0])
    expect(mockRemoveFromCart).toHaveBeenCalledWith("item1")
  })

  it("calls updateQuantity on decrement when qty > 1", () => {
    mockCartItems = [{ id: "item1", name: "Butter Chicken", price: 250, qty: 3, foodType: "NONVEG", timeSlot: "LUNCH", kitchenName: "Punjabi Dhaba" }]
    render(<MenuItemDetail item={baseItem} />)
    const decrementButtons = screen.getAllByLabelText("Decrease quantity")
    fireEvent.click(decrementButtons[0])
    expect(mockUpdateQuantity).toHaveBeenCalledWith("item1", 2)
  })

  it("renders WishlistButton for each occurrence", () => {
    render(<MenuItemDetail item={baseItem} />)
    const wishlistButtons = screen.getAllByTestId("wishlist-button")
    expect(wishlistButtons.length).toBeGreaterThan(0)
  })

  it("renders How to Buy section with item name", () => {
    render(<MenuItemDetail item={baseItem} />)
    expect(screen.getByText(/How to Buy/)).toBeInTheDocument()
    const nameEls = screen.getAllByText("Butter Chicken")
    expect(nameEls.length).toBeGreaterThan(0)
  })

  it("renders step-by-step guide in How to Buy section", () => {
    render(<MenuItemDetail item={baseItem} />)
    expect(screen.getByText(/Step 1/)).toBeInTheDocument()
    expect(screen.getByText(/Step 2/)).toBeInTheDocument()
    expect(screen.getByText(/Step 3/)).toBeInTheDocument()
    expect(screen.getByText(/Step 4/)).toBeInTheDocument()
  })

  it("renders Freshly Prepared and Fast Delivery badges", () => {
    render(<MenuItemDetail item={baseItem} />)
    expect(screen.getByText("Freshly Prepared")).toBeInTheDocument()
    expect(screen.getByText("Fast Delivery")).toBeInTheDocument()
  })

  it("renders Country of Origin as India", () => {
    render(<MenuItemDetail item={baseItem} />)
    const countryElements = screen.getAllByText("India")
    expect(countryElements.length).toBeGreaterThan(0)
  })

  it("renders Menu breadcrumb link", () => {
    render(<MenuItemDetail item={baseItem} />)
    const menuLinks = screen.getAllByText("Menu")
    expect(menuLinks.length).toBeGreaterThan(0)
  })

  it("renders progressive image with item photo", () => {
    render(<MenuItemDetail item={baseItem} />)
    const images = screen.getAllByRole("img")
    const mainImage = images.find(img => img.getAttribute("src") === "/images/butter-chicken.jpg")
    expect(mainImage).toBeInTheDocument()
  })

  it("does not render description section when description is null", () => {
    const itemNoDesc = { ...baseItem, description: null }
    render(<MenuItemDetail item={itemNoDesc} />)
    expect(screen.queryByText("About")).not.toBeInTheDocument()
  })

  it("shows location prompt when no delivery address", () => {
    mockUseMenuDeliveryAddress.mockReturnValue("")
    render(<MenuItemDetail item={baseItem} />)
    expect(screen.getByText("Select your delivery location")).toBeInTheDocument()
  })

  it("hides location prompt when delivery address exists", () => {
    mockUseMenuDeliveryAddress.mockReturnValue("Test Address")
    render(<MenuItemDetail item={baseItem} />)
    expect(screen.queryByText("Select your delivery location")).not.toBeInTheDocument()
  })
})
