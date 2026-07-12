import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RatingPrompt } from "@/components/order/rating-prompt"

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

vi.mock("@/actions/review.actions", () => ({
  submitKitchenReview: vi.fn(),
  submitDeliveryReview: vi.fn(),
}))

function renderWithQuery(ui: React.ReactElement) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={qc}>{ui}</QueryClientProvider>)
}

describe("RatingPrompt", () => {
  const defaultProps = {
    orderId: "order-1",
    kitchenId: "kitchen-1",
    onComplete: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders kitchen rating stars", () => {
    renderWithQuery(<RatingPrompt {...defaultProps} />)
    expect(screen.getByText("Rate the food")).toBeInTheDocument()
  })

  it("shows delivery rating step after kitchen", () => {
    renderWithQuery(<RatingPrompt {...defaultProps} deliveryPersonId="dp-1" />)
    expect(screen.getByText("Rate the food")).toBeInTheDocument()
  })

  it("renders kitchen and delivery tags", () => {
    renderWithQuery(<RatingPrompt {...defaultProps} deliveryPersonId="dp-1" />)
    expect(screen.getByText("Delicious")).toBeInTheDocument()
    expect(screen.getByText("Fresh")).toBeInTheDocument()
  })
})
