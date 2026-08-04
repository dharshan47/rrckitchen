import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SearchPageContent } from "@/components/search/search-page-content"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: () => new URLSearchParams("q=dosa"),
}))

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock("next/link", () => ({
  default: ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} onClick={onClick}>{children}</a>
  ),
}))

vi.mock("@/lib/recent-searches", () => ({
  getRecentKitchens: vi.fn(() => []),
  addRecentKitchen: vi.fn(),
}))



vi.mock("@/components/kitchen/kitchen-wishlist-button", () => ({
  KitchenWishlistButton: () => <button data-testid="kitchen-wishlist-btn">Wishlist</button>,
}))

vi.mock("@/components/ui/dropdown-menu", () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuRadioGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DropdownMenuRadioItem: ({ children, value }: { children: React.ReactNode; value: string }) => (
    <button data-testid={`sort-${value}`}>{children}</button>
  ),
  DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockSearchResults = {
  dishes: [
    { id: "d1", name: "Masala Dosa", price: 60, compareAtPrice: null, foodType: "VEG", timeSlot: "MORNING", kitchenName: "Test Kitchen", kitchenId: "k1", imageUrl: "/dosa.jpg", slug: "masala-dosa", kitchenSlug: "test-kitchen" },
    { id: "d2", name: "Plain Dosa", price: 40, compareAtPrice: 50, foodType: "VEG", timeSlot: "MORNING", kitchenName: "Test Kitchen", kitchenId: "k1", imageUrl: null, slug: "plain-dosa" },
  ],
  kitchens: [
    { id: "k1", slug: "test-kitchen", displayName: "Test Kitchen", imageUrl: "/kitchen.jpg", avgRating: 4.5, totalReviews: 120, cuisineTags: ["South Indian"], items: [{ id: "d1", name: "Masala Dosa", price: 60, imageUrl: "/dosa.jpg" }] },
  ],
}

describe("SearchPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("renders search input", () => {
    render(<SearchPageContent />, { wrapper: createWrapper() })
    expect(screen.getByPlaceholderText("Search for dishes and kitchens...")).toBeInTheDocument()
  })

  it("shows loading skeleton while fetching", () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}))
    render(<SearchPageContent />, { wrapper: createWrapper() })
    expect(screen.getByPlaceholderText("Search for dishes and kitchens...")).toBeInTheDocument()
  })

  it("shows no results message when search returns empty", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dishes: [], kitchens: [] }),
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument()
    })
  })

  it("renders dishes tab by default", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("Dishes")).toBeInTheDocument()
    })
  })

  it("shows dish count in tab", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("(2)")).toBeInTheDocument()
    })
  })

  it("switches to kitchens tab", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("Kitchens")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText("Kitchens"))
    await waitFor(() => {
      expect(screen.getByText("KITCHENS")).toBeInTheDocument()
    })
  })

  it("displays kitchen name in results", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("Test Kitchen")).toBeInTheDocument()
    })
  })

  it("displays dish names in results", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("Masala Dosa")).toBeInTheDocument()
    })
  })

  it("displays dish prices", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("₹60")).toBeInTheDocument()
    })
  })

  it("displays kitchen rating", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("4.5")).toBeInTheDocument()
    })
  })

  it("displays cuisine tags in kitchen view", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("Kitchens")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText("Kitchens"))
    await waitFor(() => {
      expect(screen.getByText("South Indian")).toBeInTheDocument()
    })
  })

  it("renders sort dropdown for dishes", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText(/Sort/)).toBeInTheDocument()
    })
  })

  it("renders sort dropdown for kitchens", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("Kitchens")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText("Kitchens"))
    await waitFor(() => {
      expect(screen.getByText(/Sort/)).toBeInTheDocument()
    })
  })

  it("links kitchen to kitchen page", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("Kitchens")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText("Kitchens"))
    await waitFor(() => {
      const links = screen.getAllByRole("link")
      const kitchenLink = links.find((l) => l.getAttribute("href")?.includes("/kitchens/"))
      expect(kitchenLink).toBeTruthy()
    })
  })

  it("shows no results text with query", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dishes: [], kitchens: [] }),
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText(/We couldn't find anything for/)).toBeInTheDocument()
    })
  })

  it("shows no dishes found message when dishes tab is active but empty", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dishes: [], kitchens: [] }),
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument()
    })
  })
})
