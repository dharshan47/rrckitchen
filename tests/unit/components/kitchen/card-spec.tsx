import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import type { KitchenData } from "@/hooks/useExploreKitchens"

// ─── Mocks ────────────────────────────────────────────────────────────────────

// next/image – render a plain <img> so we can assert on src / alt
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...(props as React.ImgHTMLAttributes<HTMLImageElement>)} />
  },
}))

// next/link – render a plain <a> so we can assert on href
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    className,
  }: {
    href: string
    children: React.ReactNode
    onClick?: () => void
    className?: string
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}))

// kitchen-timing-display – always return "open" by default; individual tests override
vi.mock("@/components/kitchen/kitchen-timing-display", () => ({
  getKitchenStatus: vi.fn(() => ({ isOpen: true, closeTime: null, opensNextAt: null })),
}))

// zustand stores – provide static delivery lat/lng
vi.mock("@/stores", () => ({
  useMenuDeliveryLat: vi.fn(() => null),
  useMenuDeliveryLng: vi.fn(() => null),
}))

// geo lib
vi.mock("@/lib/geo", () => ({
  haversineDistance: vi.fn(() => 2.5),
  THANJAVUR_CENTER: [10.787, 79.1378],
}))

// UI primitives – minimal pass-through stubs
vi.mock("@/components/ui/card", () => ({
  Card: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    className,
    ...props
  }: {
    children: React.ReactNode
    className?: string
  } & React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button className={className} {...props}>{children}</button>
  ),
}))

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="avatar" className={className}>{children}</div>
  ),
  AvatarImage: ({ src, alt, className }: { src?: string; alt?: string; className?: string }) => (
    <img data-testid="avatar-image" src={src} alt={alt} className={className} />
  ),
  AvatarFallback: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="avatar-fallback">{children}</div>
  ),
}))

// Now import the component AFTER mocks are set up
import { KitchenCard } from "@/components/kitchen/kitchen-card"
import { getKitchenStatus } from "@/components/kitchen/kitchen-timing-display"
import { haversineDistance } from "@/lib/geo"
import { useMenuDeliveryLat, useMenuDeliveryLng } from "@/stores"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function baseKitchen(overrides: Partial<KitchenData> = {}): KitchenData {
  return {
    id: "kitchen-1",
    slug: "amma-kitchen",
    displayName: "Amma Kitchen",
    imageUrl: "https://example.com/kitchen.jpg",
    profileImage: "https://example.com/profile.jpg",
    avgRating: 4.5,
    totalReviews: 120,
    estimatedPrepTime: 25,
    operatingHours: null,
    cuisineTags: ["South Indian", "Tiffin"],
    lat: 10.79,
    lng: 79.14,
    items: [
      { id: "item-1", name: "Item 1", price: 100, timeSlot: "LUNCH", foodType: "VEG" },
      { id: "item-2", name: "Item 2", price: 150, timeSlot: "DINNER", foodType: "NONVEG" },
    ],
    customOfferText: null,
    ...overrides,
  } as KitchenData
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("KitchenCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Default: kitchen is open
    vi.mocked(getKitchenStatus).mockReturnValue({ isOpen: true, closeTime: null, opensNextAt: null })
    vi.mocked(useMenuDeliveryLat).mockReturnValue(null)
    vi.mocked(useMenuDeliveryLng).mockReturnValue(null)
    vi.mocked(haversineDistance).mockReturnValue(2.5)
  })

  // ── 1. Rendering basics ──────────────────────────────────────────────────

  it("renders the kitchen display name", () => {
    render(<KitchenCard kitchen={baseKitchen()} />)
    expect(screen.getAllByText("Amma Kitchen").length).toBeGreaterThan(0)
  })

  it("renders a link pointing to the kitchen slug URL", () => {
    render(<KitchenCard kitchen={baseKitchen()} />)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/kitchens/amma-kitchen")
  })

  it("renders the kitchen image when imageUrl is provided", () => {
    render(<KitchenCard kitchen={baseKitchen()} />)
    const img = screen.getAllByRole("img")[0]
    expect(img).toHaveAttribute("src", "https://example.com/kitchen.jpg")
    expect(img).toHaveAttribute("alt", "Amma Kitchen")
  })

  it("renders a ChefHat placeholder when imageUrl is null", () => {
    render(<KitchenCard kitchen={baseKitchen({ imageUrl: null })} />)
    const imgs = screen.queryAllByRole("img")
    const kitchenImg = imgs.find((img) => img.getAttribute("src") === "https://example.com/kitchen.jpg")
    expect(kitchenImg).toBeUndefined()
  })

  it("calls onClick prop when the link is clicked", () => {
    const onClick = vi.fn()
    render(<KitchenCard kitchen={baseKitchen()} onClick={onClick} />)
    screen.getByRole("link").click()
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  // ── 2. Rank / offer badge ────────────────────────────────────────────────

  it("shows custom offer text badge when customOfferText is set", () => {
    render(<KitchenCard kitchen={baseKitchen({ customOfferText: "30% OFF" })} />)
    expect(screen.getByText("30% OFF")).toBeInTheDocument()
  })

  it("shows 'Top Rated' badge when avgRating >= 4.5 and no customOfferText", () => {
    render(<KitchenCard kitchen={baseKitchen({ avgRating: 4.8, customOfferText: null })} />)
    expect(screen.getByText("Top Rated")).toBeInTheDocument()
  })

  it("shows 'New' badge when avgRating is null", () => {
    render(<KitchenCard kitchen={baseKitchen({ avgRating: null, customOfferText: null })} />)
    expect(screen.getByText("New")).toBeInTheDocument()
  })

  it("shows 'New' badge when avgRating is 0", () => {
    render(<KitchenCard kitchen={baseKitchen({ avgRating: 0, customOfferText: null })} />)
    expect(screen.getByText("New")).toBeInTheDocument()
  })

  it("shows 'Bestseller' badge when avgRating is between 0 and 4.5", () => {
    render(<KitchenCard kitchen={baseKitchen({ avgRating: 3.9, customOfferText: null })} />)
    expect(screen.getByText("Bestseller")).toBeInTheDocument()
  })

  // ── 3. Diet badge (visible only outside 'home' variant) ─────────────────

  it("shows 'Pure Veg' badge on page variant when kitchen is pure veg", () => {
    const kitchen = baseKitchen({
      items: [{ id: "i1", name: "Item 1", price: 100, timeSlot: "LUNCH", foodType: "VEG" }],
    })
    render(<KitchenCard kitchen={kitchen} variant="page" />)
    expect(screen.getByText("Pure Veg")).toBeInTheDocument()
  })

  it("shows 'Non Veg' badge on page variant when kitchen has non-veg items", () => {
    const kitchen = baseKitchen({
      items: [
        { id: "i1", name: "Item 1", price: 100, timeSlot: "LUNCH", foodType: "VEG" },
        { id: "i2", name: "Item 2", price: 150, timeSlot: "DINNER", foodType: "NONVEG" },
      ],
    })
    render(<KitchenCard kitchen={kitchen} variant="page" />)
    expect(screen.getByText("Non Veg")).toBeInTheDocument()
  })

  it("does NOT show diet badge in 'home' variant", () => {
    const kitchen = baseKitchen({ items: [{ id: "i1", name: "Item 1", price: 100, timeSlot: "LUNCH", foodType: "VEG" }] })
    render(<KitchenCard kitchen={kitchen} variant="home" />)
    expect(screen.queryByText("Pure Veg")).not.toBeInTheDocument()
  })

  // ── 4. Rating display ────────────────────────────────────────────────────

  it("renders rating value when avgRating > 0", () => {
    render(<KitchenCard kitchen={baseKitchen({ avgRating: 4.2, totalReviews: 80 })} />)
    expect(screen.getAllByText("4.2").length).toBeGreaterThan(0)
  })

  it("renders review count when totalReviews > 0", () => {
    render(<KitchenCard kitchen={baseKitchen({ totalReviews: 80 })} />)
    expect(screen.getAllByText("(80)").length).toBeGreaterThan(0)
  })

  it("renders 'New' text in rating area when avgRating is 0 in home variant", () => {
    render(<KitchenCard kitchen={baseKitchen({ avgRating: 0 })} variant="home" />)
    const newTexts = screen.getAllByText("New")
    expect(newTexts.length).toBeGreaterThan(0)
  })

  // ── 5. Prep time and distance ─────────────────────────────────────────────

  it("renders estimated prep time in home variant", () => {
    render(<KitchenCard kitchen={baseKitchen({ estimatedPrepTime: 30 })} variant="home" />)
    expect(screen.getByText("30 mins")).toBeInTheDocument()
  })

  it("renders prep time range in non-home variant", () => {
    render(<KitchenCard kitchen={baseKitchen({ estimatedPrepTime: 25 })} variant="page" />)
    expect(screen.getByText("25–30 mins")).toBeInTheDocument()
  })

  it("renders distance in km when >= 1 km", () => {
    vi.mocked(haversineDistance).mockReturnValue(3.7)
    render(<KitchenCard kitchen={baseKitchen()} variant="home" />)
    expect(screen.getAllByText("3.7 km").length).toBeGreaterThan(0)
  })

  it("renders distance in metres when < 1 km", () => {
    vi.mocked(haversineDistance).mockReturnValue(0.45)
    render(<KitchenCard kitchen={baseKitchen()} variant="home" />)
    expect(screen.getAllByText("450 m").length).toBeGreaterThan(0)
  })

  it("does not render distance when kitchen has no lat/lng", () => {
    render(<KitchenCard kitchen={baseKitchen({ lat: null, lng: null })} variant="home" />)
    expect(screen.queryByText(/km/)).not.toBeInTheDocument()
    expect(screen.queryByText(/ m$/)).not.toBeInTheDocument()
  })

  // ── 6. Extra badges (passed as props) ────────────────────────────────────

  it("renders extra left badges passed via badges prop", () => {
    render(<KitchenCard kitchen={baseKitchen()} badges={["Fast Delivery", "Popular"]} />)
    expect(screen.getByText("Fast Delivery")).toBeInTheDocument()
    expect(screen.getByText("Popular")).toBeInTheDocument()
  })

  it("renders rightBadges in search variant", () => {
    render(
      <KitchenCard
        kitchen={baseKitchen()}
        variant="search"
        rightBadges={["Lunch", "Dinner"]}
      />
    )
    expect(screen.getByText("Lunch")).toBeInTheDocument()
    expect(screen.getByText("Dinner")).toBeInTheDocument()
  })

  it("renders query badge in search variant", () => {
    render(<KitchenCard kitchen={baseKitchen()} variant="search" query="biryani" />)
    expect(screen.getByText("biryani")).toBeInTheDocument()
  })

  it("does NOT render query badge in home variant", () => {
    render(<KitchenCard kitchen={baseKitchen()} variant="home" query="biryani" />)
    expect(screen.queryByText("biryani")).not.toBeInTheDocument()
  })

  // ── 7. Cuisine tags ──────────────────────────────────────────────────────

  it("renders first two cuisine tags in non-home variant", () => {
    const kitchen = baseKitchen({ cuisineTags: ["South Indian", "Tiffin", "Chinese"] })
    render(<KitchenCard kitchen={kitchen} variant="page" />)
    expect(screen.getByText("South Indian • Tiffin")).toBeInTheDocument()
  })

  it("renders 'Kitchen' fallback when no cuisineTags", () => {
    render(<KitchenCard kitchen={baseKitchen({ cuisineTags: [] })} variant="page" />)
    expect(screen.getByText("Kitchen")).toBeInTheDocument()
  })

  // ── 8. Closed state ──────────────────────────────────────────────────────

  it("applies grayscale class on the image when kitchen is closed", () => {
    vi.mocked(getKitchenStatus).mockReturnValue({ isOpen: false, closeTime: null, opensNextAt: null })
    render(<KitchenCard kitchen={baseKitchen()} />)
    const mainImgs = screen.getAllByRole("img")
    const cover = mainImgs.find((img) => img.getAttribute("src") === "https://example.com/kitchen.jpg")
    expect(cover?.className).toContain("grayscale")
  })

  // ── 9. Variant – home vs page ─────────────────────────────────────────────

  it("renders 'Order Now' button in home variant", () => {
    render(<KitchenCard kitchen={baseKitchen()} variant="home" />)
    expect(screen.getByText("Order Now")).toBeInTheDocument()
  })

  it("renders 'View Menu' button in page/search variant", () => {
    render(<KitchenCard kitchen={baseKitchen()} variant="page" />)
    expect(screen.getByText("View Menu")).toBeInTheDocument()
  })

  it("renders '100% Hygienic' footer badge in page variant", () => {
    render(<KitchenCard kitchen={baseKitchen()} variant="page" />)
    expect(screen.getByText("100% Hygienic")).toBeInTheDocument()
  })

  // ── 10. Avatar / profile image ────────────────────────────────────────────

  it("renders avatar with the kitchen's profileImage", () => {
    render(<KitchenCard kitchen={baseKitchen()} />)
    const avatarImg = screen.getByTestId("avatar-image")
    expect(avatarImg).toHaveAttribute("src", "https://example.com/profile.jpg")
  })

  it("falls back to default profile image when profileImage is null", () => {
    render(<KitchenCard kitchen={baseKitchen({ profileImage: null })} />)
    const avatarImg = screen.getByTestId("avatar-image")
    expect(avatarImg).toHaveAttribute("src", "/kitchen/profile.webp")
  })
})
