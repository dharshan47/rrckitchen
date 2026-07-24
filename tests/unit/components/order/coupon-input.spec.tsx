import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CouponInput } from "@/components/order/coupon-input"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

const mockAppliedCoupon = { code: "SAVE20", discount: 20, type: "PERCENTAGE" as const, description: "20% off" }

describe("CouponInput", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders input and apply button when no coupon applied", () => {
    render(<CouponInput onApply={vi.fn()} onRemove={vi.fn()} appliedCoupon={null} cartTotal={500} />, { wrapper: createWrapper() })
    expect(screen.getByPlaceholderText("Enter coupon code")).toBeInTheDocument()
    expect(screen.getByText("Apply")).toBeInTheDocument()
  })

  it("renders applied coupon info when coupon is applied", () => {
    render(<CouponInput onApply={vi.fn()} onRemove={vi.fn()} appliedCoupon={mockAppliedCoupon} cartTotal={500} />, { wrapper: createWrapper() })
    expect(screen.getByText("SAVE20")).toBeInTheDocument()
    expect(screen.getByText("20% off")).toBeInTheDocument()
    expect(screen.getByLabelText("Remove coupon")).toBeInTheDocument()
  })

  it("shows fixed discount text for FIXED type", () => {
    render(<CouponInput onApply={vi.fn()} onRemove={vi.fn()} appliedCoupon={{ code: "FLAT50", discount: 50, type: "FIXED" }} cartTotal={500} />, { wrapper: createWrapper() })
    expect(screen.getByText("₹50 off")).toBeInTheDocument()
  })

  it("shows free delivery text for FREE_DELIVERY type", () => {
    render(<CouponInput onApply={vi.fn()} onRemove={vi.fn()} appliedCoupon={{ code: "FREEDEL", discount: 0, type: "FREE_DELIVERY" }} cartTotal={500} />, { wrapper: createWrapper() })
    expect(screen.getByText("Free delivery")).toBeInTheDocument()
  })

  it("shows coupon description when present", () => {
    render(<CouponInput onApply={vi.fn()} onRemove={vi.fn()} appliedCoupon={mockAppliedCoupon} cartTotal={500} />, { wrapper: createWrapper() })
    expect(screen.getByText(/20% off/)).toBeInTheDocument()
  })

  it("calls onRemove when remove button clicked", () => {
    const onRemove = vi.fn()
    render(<CouponInput onApply={vi.fn()} onRemove={onRemove} appliedCoupon={mockAppliedCoupon} cartTotal={500} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByLabelText("Remove coupon"))
    expect(onRemove).toHaveBeenCalled()
  })

  it("apply button is disabled when input is empty", () => {
    render(<CouponInput onApply={vi.fn()} onRemove={vi.fn()} appliedCoupon={null} cartTotal={500} />, { wrapper: createWrapper() })
    expect(screen.getByText("Apply").closest("button")).toBeDisabled()
  })

  it("enables apply button when input has text", () => {
    render(<CouponInput onApply={vi.fn()} onRemove={vi.fn()} appliedCoupon={null} cartTotal={500} />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Enter coupon code")
    fireEvent.change(input, { target: { value: "SAVE20" } })
    expect(screen.getByText("Apply").closest("button")).not.toBeDisabled()
  })

  it("triggers apply on Enter key", () => {
    const onApply = vi.fn()
    render(<CouponInput onApply={onApply} onRemove={vi.fn()} appliedCoupon={null} cartTotal={500} />, { wrapper: createWrapper() })
    const input = screen.getByPlaceholderText("Enter coupon code")
    fireEvent.change(input, { target: { value: "SAVE20" } })
    fireEvent.keyDown(input, { key: "Enter" })
  })
})
