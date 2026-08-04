import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
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
  ProgressiveImage: ({ highResUrl, alt }: { highResUrl: string; alt?: string }) => <img src={highResUrl} alt={alt || "progressive"} />,
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
}))

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

const baseItem = {
  id: "item1",
  slug: "butter-chicken-item1",
  name: "Butter Chicken",
  description: "Rich and creamy tomato-based curry",
  price: 250,
  compareAtPrice: 300,
  foodType: "NONVEG",
  timeSlot: "LUNCH",
  isAvailable: true,
  avgRating: 4.5,
  totalReviews: 25,
  orderCount: 100,
  bestseller: true,
  cuisine: "Punjabi",
  highlights: [
    { title: "100% Homemade", description: "Made with love", enabled: true },
  ],
  aboutTitle: "About this dish",
  aboutDescription: "Slow-cooked in a rich tomato and butter gravy.",
  serves: 1,
  portionSize: "400 - 450 gms",
  shelfLife: "Best consumed hot",
  allergens: "May contain nuts",
  deliveryTimeMin: 25,
  deliveryTimeMax: 35,
  deliveryFee: 49,
  freeDelivery: true,
  packagingType: "Secure Packaging",
  relatedItems: [
    { id: "r1", name: "Paneer Tikka", price: 180, avgRating: 4.3, imageUrl: "/images/paneer.jpg" },
  ],
  menu: { kitchenPartner: { kitchenAlias: { displayName: "Punjabi Dhaba" } } },
  photos: [
    { id: "p1", imageUrl: "/images/butter-chicken.jpg", sortOrder: 0 },
    { id: "p2", imageUrl: "/images/butter-chicken-2.jpg", sortOrder: 1 },
  ],
}

function renderWithProviders(item: Record<string, unknown>, kitchenSlug?: string, itemIdentifier?: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <MenuItemDetail item={item as never} kitchenSlug={kitchenSlug} itemIdentifier={itemIdentifier} />
    </QueryClientProvider>
  )
}

describe("MenuItemDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCartItems = []
    mockUseMenuDeliveryAddress.mockReturnValue("Test Address")
  })

  it("renders menu item name", () => {
    renderWithProviders(baseItem)
    const nameEls = screen.getAllByText("Butter Chicken")
    expect(nameEls.length).toBeGreaterThan(0)
  })

  it("renders menu item price", () => {
    renderWithProviders(baseItem)
    expect(screen.getAllByText((content) => content.includes("250")).length).toBeGreaterThan(0)
  })

  it("renders item description", () => {
    renderWithProviders(baseItem)
    expect(screen.getByText("Rich and creamy tomato-based curry")).toBeInTheDocument()
  })

  it("renders food type badge", () => {
    renderWithProviders(baseItem)
    expect(screen.getAllByText("Non-Veg").length).toBeGreaterThan(0)
  })

  it("renders veg badge for veg items", () => {
    renderWithProviders({ ...baseItem, foodType: "VEG" })
    expect(screen.getAllByText("Veg").length).toBeGreaterThan(0)
  })

  it("renders kitchen display name", () => {
    renderWithProviders(baseItem)
    const kitchenEls = screen.getAllByText("Punjabi Dhaba")
    expect(kitchenEls.length).toBeGreaterThan(0)
  })

  it("renders rating and real review count", () => {
    renderWithProviders(baseItem)
    expect(screen.getAllByText("4.5").length).toBeGreaterThan(0)
    expect(screen.getAllByText("(25 reviews)").length).toBeGreaterThan(0)
  })

  it("renders real order count", () => {
    renderWithProviders(baseItem)
    expect(screen.getAllByText((content) => content.includes("100") && content.includes("orders")).length).toBeGreaterThan(0)
  })

  it("renders time slot with formatted value", () => {
    renderWithProviders(baseItem)
    expect(screen.getAllByText("Formatted: LUNCH").length).toBeGreaterThan(0)
  })

  it("renders bestseller badge only when bestseller is true", () => {
    renderWithProviders(baseItem)
    expect(screen.getByText("Bestseller")).toBeInTheDocument()
  })

  it("hides bestseller badge when not a bestseller", () => {
    renderWithProviders({ ...baseItem, bestseller: false })
    expect(screen.queryByText("Bestseller")).not.toBeInTheDocument()
  })

  it("renders cuisine tag", () => {
    renderWithProviders(baseItem)
    expect(screen.getAllByText("Punjabi").length).toBeGreaterThan(0)
  })

  it("renders discount price when compareAtPrice exists", () => {
    renderWithProviders(baseItem)
    const mrpTexts = screen.getAllByText((content) => content.includes("300"))
    expect(mrpTexts.length).toBeGreaterThan(0)
  })

  it("renders Add to Cart button when item is not in cart", () => {
    renderWithProviders(baseItem)
    const addButtons = screen.getAllByText("Add to Cart")
    expect(addButtons.length).toBeGreaterThan(0)
  })

  it("calls addToCart when Add to Cart is clicked", () => {
    renderWithProviders(baseItem)
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
      imageUrl: "/images/butter-chicken.jpg",
    })
  })

  it("shows quantity controls when item is in cart", () => {
    mockCartItems = [{ id: "item1", name: "Butter Chicken", price: 250, qty: 2, foodType: "NONVEG", timeSlot: "LUNCH", kitchenName: "Punjabi Dhaba" }]
    renderWithProviders(baseItem)
    const decrementButtons = screen.getAllByLabelText("Decrease quantity")
    expect(decrementButtons.length).toBeGreaterThan(0)
    expect(screen.getAllByText("2").length).toBeGreaterThan(0)
    expect(screen.getAllByLabelText("Increase quantity").length).toBeGreaterThan(0)
  })

  it("calls updateQuantity on increment", () => {
    mockCartItems = [{ id: "item1", name: "Butter Chicken", price: 250, qty: 1, foodType: "NONVEG", timeSlot: "LUNCH", kitchenName: "Punjabi Dhaba" }]
    renderWithProviders(baseItem)
    fireEvent.click(screen.getAllByLabelText("Increase quantity")[0])
    expect(mockUpdateQuantity).toHaveBeenCalledWith("item1", 2)
  })

  it("calls removeFromCart when decrementing from 1", () => {
    mockCartItems = [{ id: "item1", name: "Butter Chicken", price: 250, qty: 1, foodType: "NONVEG", timeSlot: "LUNCH", kitchenName: "Punjabi Dhaba" }]
    renderWithProviders(baseItem)
    fireEvent.click(screen.getAllByLabelText("Decrease quantity")[0])
    expect(mockRemoveFromCart).toHaveBeenCalledWith("item1")
  })

  it("calls updateQuantity on decrement when qty > 1", () => {
    mockCartItems = [{ id: "item1", name: "Butter Chicken", price: 250, qty: 3, foodType: "NONVEG", timeSlot: "LUNCH", kitchenName: "Punjabi Dhaba" }]
    renderWithProviders(baseItem)
    fireEvent.click(screen.getAllByLabelText("Decrease quantity")[0])
    expect(mockUpdateQuantity).toHaveBeenCalledWith("item1", 2)
  })

  it("renders WishlistButton", () => {
    renderWithProviders(baseItem)
    expect(screen.getAllByTestId("wishlist-button").length).toBeGreaterThan(0)
  })

  it("renders kitchen breadcrumb link when kitchenSlug is provided", () => {
    renderWithProviders(baseItem, "punjabi-dhaba")
    expect(screen.getByRole("link", { name: "Punjabi Dhaba" })).toHaveAttribute("href", "/kitchens/punjabi-dhaba")
  })

  it("renders progressive image with item photo", () => {
    renderWithProviders(baseItem)
    const images = screen.getAllByRole("img")
    const mainImage = images.find(img => img.getAttribute("src") === "/images/butter-chicken.jpg")
    expect(mainImage).toBeInTheDocument()
  })

  it("renders delivery time from real data", () => {
    renderWithProviders(baseItem)
    expect(screen.getByText("25 - 35 mins")).toBeInTheDocument()
  })

  it("renders free delivery badge when freeDelivery is true", () => {
    renderWithProviders(baseItem)
    expect(screen.getAllByText("Free delivery").length).toBeGreaterThan(0)
  })

  it("renders about section from real data", () => {
    renderWithProviders(baseItem)
    expect(screen.getByText("About this dish")).toBeInTheDocument()
    expect(screen.getByText("Slow-cooked in a rich tomato and butter gravy.")).toBeInTheDocument()
  })

  it("renders serves, portion, shelf life and allergens from real data", () => {
    renderWithProviders(baseItem)
    expect(screen.getAllByText("1 Person").length).toBeGreaterThan(0)
    expect(screen.getAllByText("400 - 450 gms").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Best consumed hot").length).toBeGreaterThan(0)
    expect(screen.getAllByText("May contain nuts").length).toBeGreaterThan(0)
  })

  it("renders related items from real data", () => {
    renderWithProviders(baseItem)
    expect(screen.getAllByText("Paneer Tikka").length).toBeGreaterThan(0)
  })

  it("renders admin-set highlights", () => {
    renderWithProviders(baseItem)
    expect(screen.getByText("100% Homemade")).toBeInTheDocument()
    expect(screen.getByText("Made with love")).toBeInTheDocument()
  })

  it("renders View Kitchen Menu link when kitchenSlug is provided", () => {
    renderWithProviders(baseItem, "punjabi-dhaba", "item1")
    const link = screen.getByText("View Kitchen Menu")
    expect(link.closest("a")).toHaveAttribute("href", "/kitchens/punjabi-dhaba")
  })
})
