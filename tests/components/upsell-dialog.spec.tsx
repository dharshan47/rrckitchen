import { describe, it, vi, beforeEach } from "vitest"
import { render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { UpsellDialog } from "@/components/order/upsell-dialog"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock("@/lib/ably/client", () => ({
  getAblyClient: vi.fn(() => ({
    channels: { get: vi.fn(() => ({ subscribe: vi.fn(), unsubscribe: vi.fn() })) },
  })),
}))

vi.mock("@tanstack/react-query", async () => {
  const actual = await vi.importActual("@tanstack/react-query")
  return { ...actual, useQuery: vi.fn() }
})

const { useQuery } = await import("@tanstack/react-query")

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe("UpsellDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useQuery).mockReturnValue({
      data: [
        { id: "u-1", name: "Extra Dip", description: "Spicy dip", price: 20, category: "addon" },
        { id: "u-2", name: "Gulab Jamun", description: "Sweet treat", price: 50, category: "dessert" },
      ],
      isFetching: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)
  })

  it("renders without crashing", () => {
    renderWithQuery(<UpsellDialog open={false} onOpenChange={vi.fn()} items={[]} onAddItem={vi.fn()} />)
  })
})
