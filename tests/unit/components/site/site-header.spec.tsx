import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"

const mockUsePathname = vi.hoisted(() => vi.fn(() => "/"))
const mockUseSession = vi.hoisted(() => vi.fn(() => ({ data: null as Record<string, unknown> | null, isPending: false })))
const mockUseMenuDeliveryAddress = vi.hoisted(() => vi.fn(() => "Test Address"))
const mockUseCartStore = vi.hoisted(() => vi.fn((selector?: (state: { cart: unknown[] }) => unknown) => {
  const state = { cart: [] as unknown[] }
  return selector ? selector(state) : state
}))

vi.mock("next/navigation", () => ({
  usePathname: mockUsePathname,
}))

vi.mock("@/lib/auth-client", () => ({
  useSession: mockUseSession,
  signOut: vi.fn(),
}))

vi.mock("@/stores", () => ({
  useCartStore: mockUseCartStore,
  useMenuDeliveryAddress: mockUseMenuDeliveryAddress,
}))

vi.mock("@/components/location", () => ({
  LocationDialog: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? <div data-testid="location-dialog"><button onClick={onClose}>Close</button></div> : null,
}))

vi.mock("@/components/search/search-autocomplete", () => ({
  SearchAutocomplete: ({ mobileModal, placeholder }: { mobileModal?: boolean; placeholder?: string }) =>
    <div data-testid="search-autocomplete" data-mobile={mobileModal ? "true" : "false"}>{placeholder || "Search..."}</div>,
}))

vi.mock("@/components/ui/carousel", () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => <div data-testid="carousel">{children}</div>,
  CarouselContent: ({ children }: { children: React.ReactNode }) => <div data-testid="carousel-content">{children}</div>,
  CarouselItem: ({ children }: { children: React.ReactNode }) => <div data-testid="carousel-item">{children}</div>,
}))

vi.mock("embla-carousel-autoplay", () => ({
  default: () => ({}),
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-menu">{children}</div>,
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-trigger">{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dropdown-content">{children}</div>,
  DropdownMenuItem: ({ children, onClick, asChild, variant }: { children: React.ReactNode; onClick?: () => void; asChild?: boolean; variant?: string }) =>
    asChild ? <>{children}</> : <button onClick={onClick} data-variant={variant}>{children}</button>,
  DropdownMenuSeparator: () => <hr data-testid="dropdown-separator" />,
}))

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

import { SiteHeader } from "@/components/site/site-header"

describe("SiteHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUsePathname.mockReturnValue("/")
    mockUseSession.mockReturnValue({ data: null, isPending: false })
    mockUseMenuDeliveryAddress.mockReturnValue("Test Address")
  })

  it("renders brand name RRC Kitchen", () => {
    render(<SiteHeader />)
    const brandLinks = screen.getAllByText("RRC Kitchen")
    expect(brandLinks.length).toBeGreaterThan(0)
  })

  it("renders desktop navigation links", () => {
    render(<SiteHeader />)
    expect(screen.getAllByText("Login").length).toBeGreaterThan(0)
    expect(screen.getAllByText("Cart").length).toBeGreaterThan(0)
  })

  it("renders mobile bottom navigation items", () => {
    render(<SiteHeader />)
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Categories")).toBeInTheDocument()
    expect(screen.getByText("Help")).toBeInTheDocument()
  })

  it("shows Login link when user is not logged in", () => {
    render(<SiteHeader />)
    const loginLinks = screen.getAllByText("Login")
    expect(loginLinks.length).toBeGreaterThan(0)
  })

  it("shows Profile link when user is logged in", () => {
    mockUseSession.mockReturnValue({ data: { user: { id: "1", name: "Test", role: "customer" } }, isPending: false })
    render(<SiteHeader />)
    const profileLinks = screen.getAllByText("Profile")
    expect(profileLinks.length).toBeGreaterThan(0)
  })

  it("renders cart with item count badge", () => {
    const mockCart = [{ id: "item1", name: "Item", price: 100, qty: 3, foodType: "VEG", timeSlot: "LUNCH", kitchenName: "K" }]
    mockUseCartStore.mockImplementation((selector?: (state: { cart: unknown[] }) => unknown) => {
      const state = { cart: mockCart }
      return selector ? selector(state) : state
    })
    render(<SiteHeader />)
    const countEls = screen.getAllByText("3")
    expect(countEls.length).toBeGreaterThan(0)
  })

  it("renders delivery address selector", () => {
    render(<SiteHeader />)
    const addrs = screen.getAllByText("Test Address")
    expect(addrs.length).toBeGreaterThan(0)
  })

  it("renders search autocomplete on homepage", () => {
    render(<SiteHeader />)
    const searchElements = screen.getAllByTestId("search-autocomplete")
    expect(searchElements.length).toBeGreaterThan(0)
  })

  it("shows location dialog when location selector is clicked", () => {
    render(<SiteHeader />)
    const locationButtons = screen.getAllByText("Test Address")
    fireEvent.click(locationButtons[0])
    const dialogs = screen.getAllByTestId("location-dialog")
    expect(dialogs.length).toBeGreaterThan(0)
  })

  it("renders hero carousel on homepage", () => {
    render(<SiteHeader />)
    expect(screen.getByTestId("carousel")).toBeInTheDocument()
  })

  it("shows dropdown menu for logged-in user on help page", () => {
    mockUsePathname.mockReturnValue("/help")
    mockUseSession.mockReturnValue({ data: { user: { id: "1", name: "Test", role: "customer" } }, isPending: false })
    render(<SiteHeader />)
    expect(screen.getByTestId("dropdown-menu")).toBeInTheDocument()
  })

  it("renders sign out option in dropdown", () => {
    mockUseSession.mockReturnValue({ data: { user: { id: "1", name: "Test", role: "customer" } }, isPending: false })
    render(<SiteHeader />)
    expect(screen.getByText("Sign Out")).toBeInTheDocument()
  })

  it("shows loading skeleton when session is pending", () => {
    mockUseSession.mockReturnValue({ data: null, isPending: true })
    const { container } = render(<SiteHeader />)
    const skeletons = container.querySelectorAll(".animate-pulse")
    expect(skeletons.length).toBeGreaterThan(0)
  })
})
