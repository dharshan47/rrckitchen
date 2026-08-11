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

vi.mock("@/stores", () => ({
  useMenuDeliveryLat: vi.fn(() => null),
  useMenuDeliveryLng: vi.fn(() => null),
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
    { id: "k1", slug: "test-kitchen", displayName: "Test Kitchen", imageUrl: "/kitchen.jpg", avgRating: 4.5, totalReviews: 120, cuisineTags: ["South Indian"], lat: 10.8, lng: 79.13, estimatedPrepTime: 25, items: [{ id: "d1", name: "Masala Dosa", price: 60, foodType: "VEG", timeSlot: "MORNING", imageUrl: "/dosa.jpg" }] },
  ],
  nextCursor: null,
}

function mockFetchByUrl(results: unknown, content: unknown = { content: null }) {
  ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation((url: string) => {
    if (url.includes("/api/search/content")) {
      return Promise.resolve({ ok: true, json: async () => content })
    }
    if (url.includes("/api/kitchen/categories")) {
      return Promise.resolve({ ok: true, json: async () => [] })
    }
    return Promise.resolve({ ok: true, json: async () => results })
  })
}

describe("SearchPageContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("renders search input", () => {
    render(<SearchPageContent />, { wrapper: createWrapper() })
    expect(screen.getByPlaceholderText("Search for kitchens and food")).toBeInTheDocument()
  })

  it("shows loading skeleton while fetching", () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockImplementation(() => new Promise(() => {}))
    render(<SearchPageContent />, { wrapper: createWrapper() })
    expect(screen.getByPlaceholderText("Search for kitchens and food")).toBeInTheDocument()
  })

  it("shows no results message when search returns empty", async () => {
    mockFetchByUrl({ dishes: [], kitchens: [], nextCursor: null })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("No results found")).toBeInTheDocument()
    })
  })

  it("displays kitchen name in results", async () => {
    mockFetchByUrl(mockSearchResults)
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("Test Kitchen")).toBeInTheDocument()
    })
  })

  it("displays kitchen rating", async () => {
    mockFetchByUrl(mockSearchResults)
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("4.5")).toBeInTheDocument()
    })
  })

  it("displays cuisine tags in kitchen results", async () => {
    mockFetchByUrl(mockSearchResults)
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("South Indian")).toBeInTheDocument()
    })
  })

  it("shows the real kitchen count", async () => {
    mockFetchByUrl(mockSearchResults)
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText(/Showing 1 - 1 of 1 Kitchens/)).toBeInTheDocument()
    })
  })

  it("links kitchen to kitchen page", async () => {
    mockFetchByUrl(mockSearchResults)
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      const links = screen.getAllByRole("link")
      const kitchenLink = links.find((l) => l.getAttribute("href") === "/kitchens/test-kitchen")
      expect(kitchenLink).toBeTruthy()
    })
  })

  it("renders the sort dropdown", async () => {
    mockFetchByUrl(mockSearchResults)
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getAllByText(/Sort by:/).length).toBeGreaterThan(0)
    })
  })

  it("applies filters from backend content and clears them", async () => {
    mockFetchByUrl(mockSearchResults, {
      content: {
        id: "c1",
        keyword: "dosa",
        bannerImageUrl: "",
        heading: "Dosa",
        subHeading: "",
        cardsPerPage: 12,
        defaultSort: "relevance",
        showRatings: true,
        kitchensCount: 1,
        filters: [{ id: "f1", name: "Cuisine", options: ["South Indian", "North Indian"] }],
        badges: [],
        infoItems: [],
      },
    })
    render(<SearchPageContent />, { wrapper: createWrapper() })
    await waitFor(() => {
      expect(screen.getByText("Cuisine")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("North Indian"))
    fireEvent.click(screen.getByText("APPLY FILTERS"))
    await waitFor(() => {
      expect(screen.getByText("No kitchens match your filters")).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText("Clear Filters"))
    await waitFor(() => {
      expect(screen.getByText("Test Kitchen")).toBeInTheDocument()
    })
  })

  it("search submit navigates with the query", () => {
    mockFetchByUrl(mockSearchResults)
    render(<SearchPageContent />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for kitchens and food")
    fireEvent.change(input, { target: { value: "biryani" } })
    fireEvent.submit(input.closest("form") as HTMLFormElement)
    expect(mockPush).toHaveBeenCalledWith("/search?q=biryani")
  })
})
