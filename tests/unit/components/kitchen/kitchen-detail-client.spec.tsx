import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import type { ReactElement, ReactNode } from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { KitchenDetailClient } from "@/components/kitchen/kitchen-detail-client"

const mockPush = vi.fn()
const mockBack = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, back: mockBack }),
}))

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock("@/stores", () => ({
  useCartActions: () => ({ addToCart: vi.fn() }),
  useCartItems: () => [],
  useKitchenDetail: () => null,
  useKitchenDetailActions: () => ({ hydrate: vi.fn(), patchKitchen: vi.fn(), reset: vi.fn() }),
}))

vi.mock("@/hooks/useAblySubscribe", () => ({
  useAblyKitchenChannel: () => {},
}))

vi.mock("@/actions/catalog/kitchen-detail", () => ({
  getKitchenDetailLive: () => Promise.resolve(null),
}))

vi.mock("@/components/patterns/compound-menu-card", () => ({
  CompoundMenuCard: {
    Root: ({ children, onItemClick, item }: { children: React.ReactNode; onItemClick?: (item: unknown) => void; item?: unknown }) => (
      <div data-testid="menu-card" onClick={() => onItemClick?.(item)}>{children}</div>
    ),
    ImageSection: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    BadgeRibbon: () => <div data-testid="badge-ribbon" />,
    WishlistButton: () => <button data-testid="wishlist-btn">Wishlist</button>,
    Header: () => <div data-testid="card-header" />,
    Footer: () => <div data-testid="card-footer" />,
  },
  VegIcon: ({ className }: { className?: string }) => <span className={className}>V</span>,
  NonVegIcon: ({ className }: { className?: string }) => <span className={className}>NV</span>,
}))

vi.mock("@/components/menu/add-to-cart-popup", () => ({
  AddToCartPopup: ({ open }: { open: boolean; item: unknown }) =>
    open ? <div data-testid="add-to-cart-popup">Popup</div> : null,
}))

vi.mock("@/components/kitchen/about-kitchen-tab", () => ({
  AboutKitchenTab: () => <div data-testid="kitchen-about" />,
}))

vi.mock("@/components/kitchen/reviews-kitchen-tab", () => ({
  ReviewsKitchenTab: () => <div data-testid="kitchen-reviews" />,
}))

vi.mock("@/components/kitchen/info-kitchen-tab", () => ({
  InfoKitchenTab: () => <div data-testid="kitchen-info" />,
}))

vi.mock("@/components/kitchen/kitchen-timing-display", () => ({
  KitchenTimingDisplay: () => <div data-testid="kitchen-timing" />,
  getKitchenStatus: () => ({ isOpen: true, closeTime: "10:00 PM", opensNextAt: null }),
  OperatingHours: {},
}))

function renderWithClient(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(ui, {
    wrapper: ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    ),
  })
}

const mockKitchen = {
  id: "k1",
  slug: "test-kitchen",
  displayName: "Test Kitchen",
  avgRating: 4.5,
  totalReviews: 120,
  imageUrl: "/kitchen.jpg",
  cuisineTags: ["South Indian", "Tamil"],
  items: [
    { id: "item-001-abc", name: "Masala Dosa", description: "Crispy dosa", price: 60, compareAtPrice: null, foodType: "VEG", timeSlot: "MORNING", imageUrl: "/dosa.jpg", photos: [], kitchenName: "Test Kitchen", orderCount: 50, isBestseller: true, slug: "masala-dosa", shortId: "item-001", kitchenSlug: "test-kitchen" },
    { id: "item-002-xyz", name: "Idli", description: "Soft idli", price: 30, compareAtPrice: null, foodType: "VEG", timeSlot: "MORNING", imageUrl: "/idli.jpg", photos: [], kitchenName: "Test Kitchen", orderCount: 30, isBestseller: false, slug: "idli", shortId: "item-002", kitchenSlug: "test-kitchen" },
    { id: "item-003-def", name: "Butter Chicken", description: "Rich curry", price: 250, compareAtPrice: 300, foodType: "NONVEG", timeSlot: "LUNCH", imageUrl: "/chicken.jpg", photos: [], kitchenName: "Test Kitchen", orderCount: 40, isBestseller: true, slug: "butter-chicken", shortId: "item-003", kitchenSlug: "test-kitchen" },
    { id: "item-004-ghi", name: "Fried Rice", description: "Veg fried rice", price: 80, compareAtPrice: null, foodType: "VEG", timeSlot: "LUNCH", imageUrl: "/rice.jpg", photos: [], kitchenName: "Test Kitchen", orderCount: 20, isBestseller: false, slug: "fried-rice", shortId: "item-004", kitchenSlug: "test-kitchen" },
    { id: "item-005-jkl", name: "Parotta", description: "Flaky parotta", price: 25, compareAtPrice: null, foodType: "VEG", timeSlot: "EVENINGSNACKS", imageUrl: "/parotta.jpg", photos: [], kitchenName: "Test Kitchen", orderCount: 10, isBestseller: false, slug: "parotta", shortId: "item-005", kitchenSlug: "test-kitchen" },
    { id: "item-006-mno", name: "Biryani", description: "Hyderabadi biryani", price: 180, compareAtPrice: null, foodType: "NONVEG", timeSlot: "DINNER", imageUrl: "/biryani.jpg", photos: [], kitchenName: "Test Kitchen", orderCount: 60, isBestseller: true, slug: "biryani", shortId: "item-006", kitchenSlug: "test-kitchen" },
  ],
  operatingHours: null,
  estimatedPrepTime: 25,
}

describe("KitchenDetailClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders kitchen name in heading", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    expect(screen.getByRole("heading", { name: "Test Kitchen" })).toBeInTheDocument()
  })

  it("renders kitchen image when imageUrl is provided", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    expect(screen.getByAltText("Test Kitchen")).toBeInTheDocument()
  })

  it("renders rating when avgRating is provided", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    expect(screen.getByText("4.5 (120+ ratings)")).toBeInTheDocument()
  })

  it("renders singular review text for 1 review", () => {
    const kitchen = { ...mockKitchen, totalReviews: 1 }
    renderWithClient(<KitchenDetailClient kitchen={kitchen} initialTimeSlot={null} />)
    expect(screen.getByText("4.5 (1+ ratings)")).toBeInTheDocument()
  })

  it("renders default 4.3 when avgRating is null", () => {
    const kitchen = { ...mockKitchen, avgRating: null }
    renderWithClient(<KitchenDetailClient kitchen={kitchen} initialTimeSlot={null} />)
    expect(screen.getByText("4.3 (120+ ratings)")).toBeInTheDocument()
  })

  it("renders cuisine tags", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    expect(screen.getByText("South Indian, Tamil")).toBeInTheDocument()
  })

  it("renders search input with correct placeholder", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    expect(screen.getAllByPlaceholderText("Search for dishes").length).toBeGreaterThan(0)
  })

  it("renders menu category sidebar buttons", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    expect(screen.getByText("Breakfast")).toBeInTheDocument()
    expect(screen.getByText("Lunch")).toBeInTheDocument()
    expect(screen.getByText("Snacks")).toBeInTheDocument()
    expect(screen.getByText("Dinner")).toBeInTheDocument()
  })

  it("renders Veg and Non Veg filter buttons", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    const vegButtons = screen.getAllByText("Veg")
    expect(vegButtons.length).toBe(1)
    const nonVegButtons = screen.getAllByText("Non Veg")
    expect(nonVegButtons.length).toBe(1)
  })

  it("renders Bestseller filter button", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    const bestsellerButtons = screen.getAllByText("Bestseller")
    expect(bestsellerButtons.length).toBe(2)
  })

  it("shows no dishes message when search has no matches", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} initialSearchQuery="xyz" />)
    expect(screen.getByText("No dishes found")).toBeInTheDocument()
  })

  it("renders kitchen about section when About tab is selected", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    fireEvent.click(screen.getByText("About Kitchen"))
    expect(screen.getByTestId("kitchen-about")).toBeInTheDocument()
  })

  it("renders kitchen timing card", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    expect(screen.getAllByText("Kitchen Timings").length).toBeGreaterThan(0)
  })

  it("renders menu cards for items", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    const cards = screen.getAllByTestId("menu-card")
    expect(cards.length).toBe(6)
  })

  it("renders with empty items list showing no dishes found", () => {
    const kitchen = { ...mockKitchen, items: [] }
    renderWithClient(<KitchenDetailClient kitchen={kitchen} initialTimeSlot={null} />)
    expect(screen.getByText("No dishes found")).toBeInTheDocument()
  })

  it("renders with no cuisine tags", () => {
    const kitchen = { ...mockKitchen, cuisineTags: [] }
    renderWithClient(<KitchenDetailClient kitchen={kitchen} initialTimeSlot={null} />)
    expect(screen.getByRole("heading", { name: "Test Kitchen" })).toBeInTheDocument()
  })

  it("renders with null imageUrl showing fallback icon", () => {
    const kitchen = { ...mockKitchen, imageUrl: null }
    renderWithClient(<KitchenDetailClient kitchen={kitchen} initialTimeSlot={null} />)
    expect(screen.queryByAltText("Test Kitchen")).not.toBeInTheDocument()
  })

  it("navigates to correct menu slug URL when first menu card is clicked", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    const cards = screen.getAllByTestId("menu-card")
    fireEvent.click(cards[0])
    expect(mockPush).toHaveBeenCalledWith("/menu/test-kitchen/biryani-item-006")
  })

  it("navigates to correct menu slug URL for non-veg item", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    const cards = screen.getAllByTestId("menu-card")
    const butterChickenIndex = mockKitchen.items.findIndex((i) => i.slug === "butter-chicken")
    fireEvent.click(cards[butterChickenIndex])
    expect(mockPush).toHaveBeenCalledWith("/menu/test-kitchen/butter-chicken-item-003")
  })

  it("navigates to correct menu slug for items with slug containing hyphens", () => {
    const kitchen = {
      ...mockKitchen,
      items: [
        { ...mockKitchen.items[0], slug: "spicy-masala-dosa", shortId: "item-001", kitchenSlug: "test-kitchen" },
      ],
    }
    renderWithClient(<KitchenDetailClient kitchen={kitchen} initialTimeSlot={null} />)
    const cards = screen.getAllByTestId("menu-card")
    fireEvent.click(cards[0])
    expect(mockPush).toHaveBeenCalledWith("/menu/test-kitchen/spicy-masala-dosa-item-001")
  })

  it("passes item with shortId and kitchenSlug to menu card", () => {
    renderWithClient(<KitchenDetailClient kitchen={mockKitchen} initialTimeSlot={null} />)
    const cards = screen.getAllByTestId("menu-card")
    fireEvent.click(cards[0])
    expect(mockPush).toHaveBeenCalled()
    const callArg = mockPush.mock.calls[0][0] as string
    expect(callArg).toMatch(/^\/menu\/test-kitchen\/.+$/)
    expect(callArg).toContain("item-006")
  })
})
