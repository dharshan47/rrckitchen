import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { SearchAutocomplete } from "@/components/search/search-autocomplete"

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock("@/hooks/useDebouncedValue", () => ({
  useDebouncedValue: (value: string) => value,
}))

vi.mock("@/lib/recent-searches", () => ({
  getRecentKitchens: vi.fn(() => []),
  addRecentKitchen: vi.fn(),
  removeRecentKitchen: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockSearchResults = {
  dishes: [
    { id: "d1", name: "Dosa", price: 50, foodType: "VEG", kitchenName: "Test Kitchen", kitchenId: "k1", imageUrl: "/dosa.jpg", slug: "dosa-slug" },
  ],
  kitchens: [
    { id: "k1", slug: "test-kitchen", displayName: "Test Kitchen", imageUrl: "/kitchen.jpg", items: [{ id: "d1", name: "Dosa", price: 50, imageUrl: "/dosa.jpg" }] },
  ],
}

describe("SearchAutocomplete", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("renders input with default placeholder", () => {
    render(<SearchAutocomplete />, { wrapper: createWrapper() })
    expect(screen.getByPlaceholderText("Search for meals..")).toBeInTheDocument()
  })

  it("renders with custom placeholder", () => {
    render(<SearchAutocomplete placeholder="Find food" />, { wrapper: createWrapper() })
    expect(screen.getByPlaceholderText("Find food")).toBeInTheDocument()
  })

  it("renders with defaultValue", () => {
    render(<SearchAutocomplete defaultValue="pizza" />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..") as HTMLInputElement
    expect(input.value).toBe("pizza")
  })

  it("shows no dropdown initially", () => {
    const { container } = render(<SearchAutocomplete />, { wrapper: createWrapper() })
    expect(container.querySelector(".absolute.z-50")).not.toBeInTheDocument()
  })

  it("shows dropdown with results when query is typed", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchAutocomplete />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..")
    fireEvent.change(input, { target: { value: "dosa" } })
    await waitFor(() => {
      expect(screen.getByText("Dosa")).toBeInTheDocument()
    })
  })

  it("shows no results message when search returns empty", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dishes: [], kitchens: [] }),
    })
    render(<SearchAutocomplete />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..")
    fireEvent.change(input, { target: { value: "xyz" } })
    await waitFor(() => {
      expect(screen.getByText(/No results found/)).toBeInTheDocument()
    })
  })

  it("shows Dishes section header when dishes are present", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchAutocomplete />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..")
    fireEvent.change(input, { target: { value: "dosa" } })
    await waitFor(() => {
      expect(screen.getByText("Dishes")).toBeInTheDocument()
    })
  })

  it("shows Kitchens section header when kitchens are present", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchAutocomplete />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..")
    fireEvent.change(input, { target: { value: "dosa" } })
    await waitFor(() => {
      expect(screen.getByText("Kitchens")).toBeInTheDocument()
    })
  })

  it("navigates to search page on Enter with query", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ dishes: [], kitchens: [] }),
    })
    render(<SearchAutocomplete />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..")
    fireEvent.change(input, { target: { value: "dosa" } })
    fireEvent.keyDown(input, { key: "Enter" })
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/search?q=dosa")
    })
  })

  it("navigates to kitchen page when kitchen result is clicked", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchAutocomplete />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..")
    fireEvent.change(input, { target: { value: "dosa" } })
    await waitFor(() => {
      expect(screen.getByText("Test Kitchen")).toBeInTheDocument()
    })
    fireEvent.click(screen.getByText("Test Kitchen"))
    expect(mockPush).toHaveBeenCalled()
  })

  it("closes dropdown on Escape key", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchAutocomplete />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..")
    fireEvent.change(input, { target: { value: "dosa" } })
    await waitFor(() => {
      expect(screen.getByText("Dosa")).toBeInTheDocument()
    })
    fireEvent.keyDown(input, { key: "Escape" })
    await waitFor(() => {
      expect(screen.queryByText("Dosa")).not.toBeInTheDocument()
    })
  })

  it("calls onSearch callback when provided and Enter is pressed", async () => {
    const onSearch = vi.fn()
    render(<SearchAutocomplete onSearch={onSearch} />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..")
    fireEvent.change(input, { target: { value: "dosa" } })
    fireEvent.keyDown(input, { key: "Enter" })
    expect(onSearch).toHaveBeenCalledWith("dosa")
  })

  it("navigates to /search on focus when navigateOnFocus is true", () => {
    render(<SearchAutocomplete navigateOnFocus />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..")
    fireEvent.focus(input)
    expect(mockPush).toHaveBeenCalledWith("/search")
  })

  it("does not navigate on focus by default", () => {
    render(<SearchAutocomplete />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..")
    fireEvent.focus(input)
    expect(mockPush).not.toHaveBeenCalled()
  })

  it("applies custom inputClassName", () => {
    const { container } = render(<SearchAutocomplete inputClassName="custom-input" />, { wrapper: createWrapper() })
    const input = container.querySelector("input")
    expect(input!.className).toContain("custom-input")
  })

  it("shows kitchen items list in results", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchAutocomplete />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..")
    fireEvent.change(input, { target: { value: "dosa" } })
    await waitFor(() => {
      expect(screen.getByText(/Dosa/)).toBeInTheDocument()
    })
  })

  it("navigates to item search on item click", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSearchResults,
    })
    render(<SearchAutocomplete />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Search for meals..")
    fireEvent.change(input, { target: { value: "dosa" } })
    await waitFor(() => {
      const dosaButtons = screen.getAllByText("Dosa")
      expect(dosaButtons.length).toBeGreaterThan(0)
    })
    const dishButton = screen.getAllByText("Dosa")[0]
    fireEvent.click(dishButton)
    expect(mockPush).toHaveBeenCalled()
  })
})
