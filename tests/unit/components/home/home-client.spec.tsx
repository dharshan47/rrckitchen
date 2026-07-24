import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { HomeClient } from "@/components/home/home-client"
import { useSession } from "@/lib/auth-client"

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(),
}))

vi.mock("@/components/patterns/error-boundary", () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div data-testid="error-boundary">{children}</div>,
}))

vi.mock("@/components/kitchen/infinite-kitchen-grid", () => ({
  InfiniteKitchenGrid: () => (
    <div data-testid="infinite-kitchen-grid" />
  ),
}))

vi.mock("@/components/home/fast-delivery-carousel", () => ({
  FastDeliveryCarousel: () => <div data-testid="fast-delivery-carousel" />,
}))

describe("HomeClient", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders the home page", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByText("What's on your mind?")).toBeInTheDocument()
  })

  it("renders with user name when session exists", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { name: "Ravi" } } } as never)
    render(<HomeClient />)
    expect(screen.getByText("Ravi, What's on your mind?")).toBeInTheDocument()
  })

  it("renders recipe navigation links", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByText("Dosa")).toBeInTheDocument()
    expect(screen.getByText("Biryani")).toBeInTheDocument()
    expect(screen.getByText("Idli")).toBeInTheDocument()
  })

  it("links recipes to search page", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    const dosaLink = screen.getByText("Dosa").closest("a")
    expect(dosaLink).toHaveAttribute("href", "/search?q=dosa")
  })

  it("renders all 9 recipes", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByText("Dosa")).toBeInTheDocument()
    expect(screen.getByText("Biryani")).toBeInTheDocument()
    expect(screen.getByText("Idli")).toBeInTheDocument()
    expect(screen.getByText("Vada")).toBeInTheDocument()
    expect(screen.getByText("Momos")).toBeInTheDocument()
    expect(screen.getByText("Parotta")).toBeInTheDocument()
    expect(screen.getByText("Noodles")).toBeInTheDocument()
    expect(screen.getByText("Pancake")).toBeInTheDocument()
    expect(screen.getByText("Sandwich")).toBeInTheDocument()
  })

  it("renders FastDeliveryCarousel", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByTestId("fast-delivery-carousel")).toBeInTheDocument()
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

  it("renders Become a Home Chef CTA", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByText("Become a Home Chef")).toBeInTheDocument()
  })

  it("renders CTA description text", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByText(/Turn your passion into profession/)).toBeInTheDocument()
  })

  it("renders Join the Kitchen link", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    const link = screen.getByText("Join the Kitchen").closest("a")
    expect(link).toHaveAttribute("href", "/kitchen/signup")
  })

  it("renders without session (logged out)", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<HomeClient />)
    expect(screen.getByText("What's on your mind?")).toBeInTheDocument()
  })

  it("renders mobile recipe grid (smaller items)", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    const { container } = render(<HomeClient />)
    const mobileRecipes = container.querySelectorAll(".lg\\:hidden a")
    expect(mobileRecipes.length).toBe(9)
  })

  it("renders desktop recipe grid", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    const { container } = render(<HomeClient />)
    const desktopRecipes = container.querySelectorAll(".hidden.lg\\:grid a")
    expect(desktopRecipes.length).toBe(7)
  })
})
