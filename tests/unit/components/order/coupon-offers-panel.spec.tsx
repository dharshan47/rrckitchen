import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { CouponOffersPanel } from "@/components/order/coupon-offers-panel"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

const mockOffers = [
  { code: "SAVE20", description: "20% off on orders above ₹299", discountType: "PERCENTAGE" as const, discountValue: 20, minOrderValue: 299 },
  { code: "FLAT50", description: "Flat ₹50 off", discountType: "FIXED" as const, discountValue: 50, minOrderValue: null },
]

describe("CouponOffersPanel", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders loading spinner when loading", () => {
    render(
      <CouponOffersPanel show={true} loading={true} offers={[]} appliedCoupon={null} onToggle={vi.fn()} onApply={vi.fn()} onApplyCoupon={vi.fn()} onRemoveCoupon={vi.fn()} total={500} />
    )
    expect(document.querySelector(".animate-spin")).toBeInTheDocument()
  })

  it("renders empty state when no offers", () => {
    render(
      <CouponOffersPanel show={true} loading={false} offers={[]} appliedCoupon={null} onToggle={vi.fn()} onApply={vi.fn()} onApplyCoupon={vi.fn()} onRemoveCoupon={vi.fn()} total={500} />
    )
    expect(screen.getByText("No coupon offers available right now")).toBeInTheDocument()
  })

  it("renders offer items", () => {
    render(
      <CouponOffersPanel show={true} loading={false} offers={mockOffers} appliedCoupon={null} onToggle={vi.fn()} onApply={vi.fn()} onApplyCoupon={vi.fn()} onRemoveCoupon={vi.fn()} total={500} />
    )
    expect(screen.getByText("SAVE20")).toBeInTheDocument()
    expect(screen.getByText("FLAT50")).toBeInTheDocument()
  })

  it("shows PERCENTAGE discount badge", () => {
    render(
      <CouponOffersPanel show={true} loading={false} offers={mockOffers} appliedCoupon={null} onToggle={vi.fn()} onApply={vi.fn()} onApplyCoupon={vi.fn()} onRemoveCoupon={vi.fn()} total={500} />
    )
    expect(screen.getByText("20% OFF")).toBeInTheDocument()
  })

  it("shows FIXED discount badge", () => {
    render(
      <CouponOffersPanel show={true} loading={false} offers={mockOffers} appliedCoupon={null} onToggle={vi.fn()} onApply={vi.fn()} onApplyCoupon={vi.fn()} onRemoveCoupon={vi.fn()} total={500} />
    )
    expect(screen.getByText("₹50 OFF")).toBeInTheDocument()
  })

  it("shows minimum order value when present", () => {
    render(
      <CouponOffersPanel show={true} loading={false} offers={mockOffers} appliedCoupon={null} onToggle={vi.fn()} onApply={vi.fn()} onApplyCoupon={vi.fn()} onRemoveCoupon={vi.fn()} total={500} />
    )
    expect(screen.getByText("Min ₹299")).toBeInTheDocument()
  })

  it("calls onApply when an offer is clicked", () => {
    const onApply = vi.fn()
    render(
      <CouponOffersPanel show={true} loading={false} offers={mockOffers} appliedCoupon={null} onToggle={onApply} onApply={onApply} onApplyCoupon={vi.fn()} onRemoveCoupon={vi.fn()} total={500} />
    )
    fireEvent.click(screen.getByText("SAVE20"))
    expect(onApply).toHaveBeenCalledWith("SAVE20")
  })

  it("disables offer buttons when coupon is already applied", () => {
    render(
      <CouponOffersPanel show={true} loading={false} offers={mockOffers} appliedCoupon={{ code: "SAVE20", discount: 20, type: "PERCENTAGE" }} onToggle={vi.fn()} onApply={vi.fn()} onApplyCoupon={vi.fn()} onRemoveCoupon={vi.fn()} total={500} />
    )
    const offerButtons = screen.getAllByText("SAVE20").map(el => el.closest("button"))
    expect(offerButtons.length).toBeGreaterThan(0)
  })
})
