import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WishlistButton } from "@/components/menu/wishlist-button"
import { useSession } from "@/lib/auth-client"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockPush = vi.fn()
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock("@/lib/auth-client", () => ({
  useSession: vi.fn(),
}))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("WishlistButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("renders overlay variant by default", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    render(<WishlistButton menuItemId="item1" />, { wrapper: createWrapper() })
    const btn = screen.getByRole("button")
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute("aria-label", "Add to favourites")
  })

  it("renders inline variant", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    render(<WishlistButton menuItemId="item1" variant="inline" />, { wrapper: createWrapper() })
    const btn = screen.getByRole("button")
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute("aria-label", "Add to favourites")
  })

  it("shows Remove from favourites when item is in wishlist", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    queryClient.setQueryData(["wishlist-ids"], ["item1"])
    render(<WishlistButton menuItemId="item1" />, {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    })
    const btn = screen.getByRole("button")
    expect(btn).toHaveAttribute("aria-label", "Remove from favourites")
  })

  it("redirects to login when user is not authenticated", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<WishlistButton menuItemId="item1" />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByRole("button"))
    expect(mockPush).toHaveBeenCalledWith("/login")
  })

  it("renders with sm size by default", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    const { container } = render(<WishlistButton menuItemId="item1" />, { wrapper: createWrapper() })
    const svg = container.querySelector("svg")
    expect(svg).toBeInTheDocument()
  })

  it("renders with md size", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    render(<WishlistButton menuItemId="item1" size="md" />, { wrapper: createWrapper() })
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("renders with lg size", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    render(<WishlistButton menuItemId="item1" size="lg" />, { wrapper: createWrapper() })
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    const { container } = render(
      <WishlistButton menuItemId="item1" className="custom-class" />,
      { wrapper: createWrapper() }
    )
    const btn = container.querySelector("button")
    expect(btn!.className).toContain("custom-class")
  })

  it("stops event propagation on click", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    const parentOnClick = vi.fn()
    render(
      <div onClick={parentOnClick}>
        <WishlistButton menuItemId="item1" />
      </div>,
      { wrapper: createWrapper() }
    )
    fireEvent.click(screen.getByRole("button"))
    expect(parentOnClick).not.toHaveBeenCalled()
  })

  it("does not show heart filled when item is not in wishlist", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    const { container } = render(<WishlistButton menuItemId="item1" />, { wrapper: createWrapper() })
    const svg = container.querySelector("svg")
    expect(svg).not.toHaveClass("fill-red-500")
  })
})
