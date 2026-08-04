import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { HomeClient } from "@/components/home/home-client"
import { useSession } from "@/lib/auth-client"

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    <img src={src} alt={alt} />
  ),
}))

vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(),
}))

vi.mock("@/components/patterns/error-boundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="error-boundary">{children}</div>
  ),
}))

vi.mock("@/components/kitchen/infinite-kitchen-grid", () => ({
  InfiniteKitchenGrid: () => <div data-testid="infinite-kitchen-grid" />,
}))

vi.mock("@/components/search/search-autocomplete", () => ({
  SearchAutocomplete: () => <div data-testid="search-autocomplete" />,
}))

vi.mock("@/components/kitchen/kitchen-filters", () => ({
  KitchenFilters: () => <div data-testid="kitchen-filters" />,
}))

vi.mock("@/hooks/useExploreKitchens", () => ({
  useKitchenCategories: vi.fn(() => ({ data: [] })),
}))

describe("HomeClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the category section heading", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(
      screen.getByText("What Would You Like To Eat?")
    ).toBeInTheDocument()
  })

  it("renders all 12 food categories", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByText("Breakfast")).toBeInTheDocument()
    expect(screen.getByText("Lunch")).toBeInTheDocument()
    expect(screen.getByText("Dinner")).toBeInTheDocument()
    expect(screen.getByText("Veg Meals")).toBeInTheDocument()
    expect(screen.getByText("Non Veg Meals")).toBeInTheDocument()
    expect(screen.getByText("South Indian")).toBeInTheDocument()
    expect(screen.getByText("North Indian")).toBeInTheDocument()
    expect(screen.getByText("Healthy Meals")).toBeInTheDocument()
    expect(screen.getByText("Kids Meals")).toBeInTheDocument()
    expect(screen.getByText("Snacks")).toBeInTheDocument()
    expect(screen.getByText("Desserts")).toBeInTheDocument()
    expect(screen.getByText("Beverages")).toBeInTheDocument()
  })

  it("links categories to search page", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    const breakfastLink = screen.getByText("Breakfast").closest("a")
    expect(breakfastLink).toHaveAttribute("href", "/search?q=breakfast")
  })

  it("renders InfiniteKitchenGrid", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByTestId("infinite-kitchen-grid")).toBeInTheDocument()
  })

  it("renders ErrorBoundary wrapper", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByTestId("error-boundary")).toBeInTheDocument()
  })

  it("renders Why Tiffin Carrier section", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByText("Why Tiffin Carrier?")).toBeInTheDocument()
    expect(
      screen.getByText("Not Plastic, Not Aluminium. Authentic Stainless Steel.")
    ).toBeInTheDocument()
  })

  it("renders Become a Home Chef CTA", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByText("Become a")).toBeInTheDocument()
    expect(screen.getByText("Home Chef")).toBeInTheDocument()
  })

  it("renders Join Now link to kitchen signup", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    const link = screen.getByText("Join Now").closest("a")
    expect(link).toHaveAttribute("href", "/kitchen/signup")
  })

  it("renders testimonials section", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(
      screen.getByText("Loved by Thousands of Families")
    ).toBeInTheDocument()
    expect(screen.getByText("Priya S.")).toBeInTheDocument()
  })

  it("renders How It Works section", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByText("How It Works")).toBeInTheDocument()
    expect(screen.getByText("Choose Location")).toBeInTheDocument()
  })

  it("renders Today's Specials section", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByText("Today's Specials")).toBeInTheDocument()
  })

  it("renders Meet Our Home Chefs section", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByText("Meet Our Home Chefs")).toBeInTheDocument()
    expect(screen.getByText("Lakshmi Devi")).toBeInTheDocument()
  })
})
