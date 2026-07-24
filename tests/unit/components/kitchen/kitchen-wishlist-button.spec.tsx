import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { KitchenWishlistButton } from "@/components/kitchen/kitchen-wishlist-button"
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

describe("KitchenWishlistButton", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("renders a button with heart icon", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    render(<KitchenWishlistButton kitchenPartnerId="kitchen1" />, { wrapper: createWrapper() })
    const btn = screen.getByRole("button")
    expect(btn).toBeInTheDocument()
    expect(btn).toHaveAttribute("aria-label", "Add to favourites")
  })

  it("shows Remove from favourites when kitchen is in wishlist", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    queryClient.setQueryData(["kitchen-wishlist-ids"], ["kitchen1"])
    render(<KitchenWishlistButton kitchenPartnerId="kitchen1" />, {
      wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>,
    })
    const btn = screen.getByRole("button")
    expect(btn).toHaveAttribute("aria-label", "Remove from favourites")
  })

  it("renders with different sizes", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    const { rerender } = render(<KitchenWishlistButton kitchenPartnerId="kitchen1" size="sm" />, { wrapper: createWrapper() })
    expect(screen.getByRole("button")).toBeInTheDocument()
    rerender(<KitchenWishlistButton kitchenPartnerId="kitchen1" size="lg" />)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("redirects to login when user is not authenticated", () => {
    vi.mocked(useSession).mockReturnValue({ data: null } as never)
    render(<KitchenWishlistButton kitchenPartnerId="kitchen1" />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByRole("button"))
    expect(mockPush).toHaveBeenCalledWith("/login")
  })

  it("applies custom className", () => {
    vi.mocked(useSession).mockReturnValue({ data: { user: { id: "user1" } } } as never)
    const { container } = render(
      <KitchenWishlistButton kitchenPartnerId="kitchen1" className="custom-class" />,
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
        <KitchenWishlistButton kitchenPartnerId="kitchen1" />
      </div>,
      { wrapper: createWrapper() }
    )
    fireEvent.click(screen.getByRole("button"))
  })
})
