import { render } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { SkeletonCard } from "@/components/patterns/skeleton-card"

describe("SkeletonCard", () => {
  it("renders a menu-item skeleton by default", () => {
    const { container } = render(<SkeletonCard />)
    const skeletons = container.querySelectorAll(".animate-pulse, .bg-muted, .bg-secondary")
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it("renders multiple menu-item skeletons based on count", () => {
    const { container } = render(<SkeletonCard count={3} />)
    const wrappers = container.querySelectorAll(".snap-start")
    expect(wrappers.length).toBe(3)
  })

  it("renders cart-item skeleton when variant is cart-item", () => {
    const { container } = render(<SkeletonCard variant="cart-item" />)
    const cartSkeleton = container.querySelector(".rounded-2xl")
    expect(cartSkeleton).toBeInTheDocument()
  })

  it("renders multiple cart-item skeletons based on count", () => {
    const { container } = render(<SkeletonCard variant="cart-item" count={2} />)
    const cartItems = container.querySelectorAll(".rounded-2xl")
    expect(cartItems.length).toBe(2)
  })

  it("renders offer badge skeleton when hasOffer is true", () => {
    const { container } = render(<SkeletonCard hasOffer={true} />)
    const offerSkeleton = container.querySelector(".clip-path")
    expect(offerSkeleton).toBeInTheDocument()
  })

  it("does not render offer badge skeleton when hasOffer is false", () => {
    const { container } = render(<SkeletonCard hasOffer={false} />)
    const offerSkeleton = container.querySelector("[style*='clip-path']")
    expect(offerSkeleton).not.toBeInTheDocument()
  })

  it("renders wishlist button skeleton in menu-item variant", () => {
    const { container } = render(<SkeletonCard />)
    const roundSkeleton = container.querySelectorAll(".rounded-full")
    expect(roundSkeleton.length).toBeGreaterThan(0)
  })

  it("renders price skeleton in menu-item variant", () => {
    const { container } = render(<SkeletonCard />)
    const roundedMd = container.querySelectorAll(".rounded-md")
    expect(roundedMd.length).toBeGreaterThan(0)
  })
})
