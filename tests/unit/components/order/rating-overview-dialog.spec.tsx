import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { RatingOverviewDialog } from "@/components/order/rating-overview-dialog"

const mockKitchenReview = {
  id: "kr1",
  rating: 4,
  tasteRating: 5,
  packagingRating: 4,
  portionSizeRating: 3,
  comment: "Great food!",
}

const mockDeliveryReview = {
  id: "dr1",
  rating: 5,
  speedRating: 4,
  behaviorHygiene: true,
  safetyContactless: true,
  comment: "Fast delivery",
}

describe("RatingOverviewDialog", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <RatingOverviewDialog open={false} onOpenChange={vi.fn()} />
    )
    expect(container.textContent).toBe("")
  })

  it("renders no ratings message when no reviews", () => {
    render(<RatingOverviewDialog open={true} onOpenChange={vi.fn()} />)
    expect(screen.getByText("No ratings submitted yet")).toBeInTheDocument()
  })

  it("renders kitchen review data", () => {
    render(
      <RatingOverviewDialog
        open={true}
        onOpenChange={vi.fn()}
        kitchenReview={mockKitchenReview}
      />
    )
    expect(screen.getByText("Food Rating")).toBeInTheDocument()
    expect(screen.getByText("Packaging Rating")).toBeInTheDocument()
    expect(screen.getByText("Kitchen Rating")).toBeInTheDocument()
    expect(screen.getByText("Great food!")).toBeInTheDocument()
  })

  it("renders delivery review data with partner name", () => {
    render(
      <RatingOverviewDialog
        open={true}
        onOpenChange={vi.fn()}
        deliveryReview={mockDeliveryReview}
        deliveryPartnerName="Rahul"
      />
    )
    expect(screen.getByText("Delivery Partner Rating")).toBeInTheDocument()
    expect(screen.getByText("- Rahul")).toBeInTheDocument()
    expect(screen.getByText("Fast delivery")).toBeInTheDocument()
  })

  it("renders behavior and hygiene as Good when true", () => {
    render(
      <RatingOverviewDialog
        open={true}
        onOpenChange={vi.fn()}
        deliveryReview={mockDeliveryReview}
      />
    )
    expect(screen.getByText("Good")).toBeInTheDocument()
  })

  it("renders behavior and hygiene as Needs Improvement when false", () => {
    render(
      <RatingOverviewDialog
        open={true}
        onOpenChange={vi.fn()}
        deliveryReview={{ ...mockDeliveryReview, behaviorHygiene: false }}
      />
    )
    expect(screen.getByText("Needs Improvement")).toBeInTheDocument()
  })

  it("renders both kitchen and delivery reviews together", () => {
    render(
      <RatingOverviewDialog
        open={true}
        onOpenChange={vi.fn()}
        kitchenReview={mockKitchenReview}
        deliveryReview={mockDeliveryReview}
        deliveryPartnerName="Rahul"
      />
    )
    expect(screen.getByText("Food Rating")).toBeInTheDocument()
    expect(screen.getByText("Delivery Partner Rating")).toBeInTheDocument()
    expect(screen.getByText("Great food!")).toBeInTheDocument()
    expect(screen.getByText("Fast delivery")).toBeInTheDocument()
  })
})
