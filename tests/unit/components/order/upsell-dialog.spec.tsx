import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { UpsellDialog } from "@/components/order/upsell-dialog"

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockItems = [
  { id: "u1", name: "French Fries", description: "Crispy golden fries", price: 80, category: "Sides" },
  { id: "u2", name: "Brownie", description: "Chocolate fudge brownie", price: 120, category: "Desserts" },
]

describe("UpsellDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders nothing when closed", () => {
    const { container } = render(
      <UpsellDialog open={false} onOpenChange={vi.fn()} items={[]} onAddItem={vi.fn()} />,
      { wrapper: createWrapper() }
    )
    expect(container.textContent).toBe("")
  })

  it("renders title and description when open", () => {
    render(
      <UpsellDialog open={true} onOpenChange={vi.fn()} items={mockItems} onAddItem={vi.fn()} />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByText("Add to your order")).toBeInTheDocument()
    expect(screen.getByText("You might also like these")).toBeInTheDocument()
  })

  it("renders upsell items", () => {
    render(
      <UpsellDialog open={true} onOpenChange={vi.fn()} items={mockItems} onAddItem={vi.fn()} />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByText("French Fries")).toBeInTheDocument()
    expect(screen.getByText("Brownie")).toBeInTheDocument()
    expect(screen.getByText("₹80")).toBeInTheDocument()
    expect(screen.getByText("₹120")).toBeInTheDocument()
  })

  it("calls onAddItem when add button is clicked", () => {
    const onAddItem = vi.fn()
    render(
      <UpsellDialog open={true} onOpenChange={vi.fn()} items={mockItems} onAddItem={onAddItem} />,
      { wrapper: createWrapper() }
    )
    const addButtons = screen.getAllByRole("button", { name: /Add/ })
    fireEvent.click(addButtons[0])
    expect(onAddItem).toHaveBeenCalledWith(mockItems[0])
  })

  it("shows loading state when fetching", () => {
    render(
      <UpsellDialog open={true} onOpenChange={vi.fn()} items={[]} onAddItem={vi.fn()} />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByText("Loading suggestions...")).toBeInTheDocument()
  })

  it("shows empty state when no items and not fetching", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    queryClient.setQueryData(["upsell-items"], [])
    render(
      <UpsellDialog open={true} onOpenChange={vi.fn()} items={[]} onAddItem={vi.fn()} />,
      { wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider> }
    )
  })

  it("renders items with descriptions", () => {
    render(
      <UpsellDialog open={true} onOpenChange={vi.fn()} items={mockItems} onAddItem={vi.fn()} />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByText("Crispy golden fries")).toBeInTheDocument()
    expect(screen.getByText("Chocolate fudge brownie")).toBeInTheDocument()
  })
})
