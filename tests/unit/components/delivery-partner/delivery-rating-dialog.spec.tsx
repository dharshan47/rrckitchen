import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DeliveryRatingDialog } from "@/components/delivery-partner/delivery-rating-dialog"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("DeliveryRatingDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders nothing when closed", () => {
    const { container } = render(
      <DeliveryRatingDialog open={false} onOpenChange={vi.fn()} orderId="order1" deliveryPartnerId="dp1" deliveryPartnerName="Rahul" />,
      { wrapper: createWrapper() }
    )
    expect(container.textContent).toBe("")
  })

  it("renders title and partner name when open", () => {
    render(
      <DeliveryRatingDialog open={true} onOpenChange={vi.fn()} orderId="order1" deliveryPartnerId="dp1" deliveryPartnerName="Rahul" />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByText("Rate Delivery Partner")).toBeInTheDocument()
    expect(screen.getByText(/Rahul/)).toBeInTheDocument()
  })

  it("renders all rating sections", () => {
    render(
      <DeliveryRatingDialog open={true} onOpenChange={vi.fn()} orderId="order1" deliveryPartnerId="dp1" deliveryPartnerName="Rahul" />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByText("Overall Delivery")).toBeInTheDocument()
    expect(screen.getByText("Delivery Speed")).toBeInTheDocument()
    expect(screen.getByText("Behavior & Hygiene")).toBeInTheDocument()
  })

  it("renders Good and Needs Improvement buttons", () => {
    render(
      <DeliveryRatingDialog open={true} onOpenChange={vi.fn()} orderId="order1" deliveryPartnerId="dp1" deliveryPartnerName="Rahul" />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByText("Good")).toBeInTheDocument()
    expect(screen.getByText("Needs Improvement")).toBeInTheDocument()
  })

  it("renders comment textarea", () => {
    render(
      <DeliveryRatingDialog open={true} onOpenChange={vi.fn()} orderId="order1" deliveryPartnerId="dp1" deliveryPartnerName="Rahul" />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByPlaceholderText("Share your experience...")).toBeInTheDocument()
  })

  it("renders Cancel and Submit buttons", () => {
    render(
      <DeliveryRatingDialog open={true} onOpenChange={vi.fn()} orderId="order1" deliveryPartnerId="dp1" deliveryPartnerName="Rahul" />,
      { wrapper: createWrapper() }
    )
    expect(screen.getByText("Cancel")).toBeInTheDocument()
    expect(screen.getByText("Submit Rating")).toBeInTheDocument()
  })

  it("submit button is disabled when no rating selected", () => {
    render(
      <DeliveryRatingDialog open={true} onOpenChange={vi.fn()} orderId="order1" deliveryPartnerId="dp1" deliveryPartnerName="Rahul" />,
      { wrapper: createWrapper() }
    )
    const submitBtn = screen.getByText("Submit Rating").closest("button")
    expect(submitBtn).toBeDisabled()
  })

  it("calls onOpenChange(false) when Cancel is clicked", () => {
    const onOpenChange = vi.fn()
    render(
      <DeliveryRatingDialog open={true} onOpenChange={onOpenChange} orderId="order1" deliveryPartnerId="dp1" deliveryPartnerName="Rahul" />,
      { wrapper: createWrapper() }
    )
    fireEvent.click(screen.getByText("Cancel"))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("renders star picker buttons", () => {
    render(
      <DeliveryRatingDialog open={true} onOpenChange={vi.fn()} orderId="order1" deliveryPartnerId="dp1" deliveryPartnerName="Rahul" />,
      { wrapper: createWrapper() }
    )
    const starButtons = document.querySelectorAll("button svg")
    expect(starButtons.length).toBeGreaterThanOrEqual(5)
  })
})
