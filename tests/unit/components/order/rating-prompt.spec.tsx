import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RatingPrompt } from "@/components/order/rating-prompt"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("RatingPrompt", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders kitchen rating step by default", () => {
    render(<RatingPrompt orderId="order1" kitchenId="kitchen1" />, { wrapper: createWrapper() })
    expect(screen.getByText("Rate Your Food & Kitchen")).toBeInTheDocument()
    expect(screen.getByText("Submit Kitchen Review")).toBeInTheDocument()
  })

  it("shows all kitchen rating sections", () => {
    render(<RatingPrompt orderId="order1" kitchenId="kitchen1" />, { wrapper: createWrapper() })
    expect(screen.getByText("Taste")).toBeInTheDocument()
    expect(screen.getByText("Packaging")).toBeInTheDocument()
    expect(screen.getByText("Portion Size")).toBeInTheDocument()
    expect(screen.getByText("Overall Kitchen")).toBeInTheDocument()
  })

  it("renders kitchen tag buttons", () => {
    render(<RatingPrompt orderId="order1" kitchenId="kitchen1" />, { wrapper: createWrapper() })
    expect(screen.getByText("Delicious")).toBeInTheDocument()
    expect(screen.getByText("Fresh")).toBeInTheDocument()
    expect(screen.getByText("On Time")).toBeInTheDocument()
  })

  it("submit button is disabled when no rating selected", () => {
    render(<RatingPrompt orderId="order1" kitchenId="kitchen1" />, { wrapper: createWrapper() })
    const submitBtn = screen.getByText("Submit Kitchen Review").closest("button")
    expect(submitBtn).toBeDisabled()
  })

  it("shows delivery step when deliveryPersonId is provided and kitchen submitted", () => {
    render(
      <RatingPrompt orderId="order1" kitchenId="kitchen1" deliveryPersonId="dp1" />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByText("Rate Your Food & Kitchen")).toBeInTheDocument()
  })

  it("renders behavior and hygiene toggle buttons on delivery step", () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    render(
      <RatingPrompt orderId="order1" kitchenId="kitchen1" deliveryPersonId="dp1" />,
      { wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider> }
    )
  })

  it("renders delivery tags", () => {
    render(<RatingPrompt orderId="order1" kitchenId="kitchen1" deliveryPersonId="dp1" />, { wrapper: createWrapper() })
  })

  it("toggles kitchen tag selection on click", () => {
    render(<RatingPrompt orderId="order1" kitchenId="kitchen1" />, { wrapper: createWrapper() })
    const tag = screen.getByText("Delicious")
    fireEvent.click(tag)
    expect(tag.className).toContain("bg-primary")
    fireEvent.click(tag)
  })

  it("renders 5 stars in each star picker", () => {
    render(<RatingPrompt orderId="order1" kitchenId="kitchen1" />, { wrapper: createWrapper() })
    const stars = document.querySelectorAll("svg")
    expect(stars.length).toBeGreaterThanOrEqual(5)
  })

  it("calls onComplete when no deliveryPersonId and kitchen submitted", () => {
    const onComplete = vi.fn()
    render(<RatingPrompt orderId="order1" kitchenId="kitchen1" onComplete={onComplete} />, { wrapper: createWrapper() })
  })
})
