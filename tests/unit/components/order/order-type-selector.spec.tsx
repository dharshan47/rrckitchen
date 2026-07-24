import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { OrderTypeSelector } from "@/components/order/order-type-selector"

describe("OrderTypeSelector", () => {
  it("renders both order type options", () => {
    render(<OrderTypeSelector selected="INSTANT" onSelect={vi.fn()} />)
    expect(screen.getByText("Pre-book")).toBeInTheDocument()
    expect(screen.getByText("Order Now")).toBeInTheDocument()
  })

  it("renders badges for each option", () => {
    render(<OrderTypeSelector selected="INSTANT" onSelect={vi.fn()} />)
    expect(screen.getByText("Tomorrow")).toBeInTheDocument()
    expect(screen.getByText("Today")).toBeInTheDocument()
  })

  it("renders descriptions for each option", () => {
    render(<OrderTypeSelector selected="INSTANT" onSelect={vi.fn()} />)
    expect(screen.getByText("Order now for tomorrow's meal")).toBeInTheDocument()
    expect(screen.getByText("Get it delivered as soon as possible")).toBeInTheDocument()
  })

  it("calls onSelect with PREBOOK when pre-book is clicked", () => {
    const onSelect = vi.fn()
    render(<OrderTypeSelector selected="INSTANT" onSelect={onSelect} />)
    fireEvent.click(screen.getByText("Pre-book"))
    expect(onSelect).toHaveBeenCalledWith("PREBOOK")
  })

  it("calls onSelect with INSTANT when order now is clicked", () => {
    const onSelect = vi.fn()
    render(<OrderTypeSelector selected="PREBOOK" onSelect={onSelect} />)
    fireEvent.click(screen.getByText("Order Now"))
    expect(onSelect).toHaveBeenCalledWith("INSTANT")
  })

  it("highlights the selected option", () => {
    render(<OrderTypeSelector selected="PREBOOK" onSelect={vi.fn()} />)
    const prebookButton = screen.getByText("Pre-book").closest("button")
    expect(prebookButton!.className).toContain("ring-primary")
  })

  it("does not highlight the unselected option", () => {
    render(<OrderTypeSelector selected="PREBOOK" onSelect={vi.fn()} />)
    const instantButton = screen.getByText("Order Now").closest("button")
    expect(instantButton!.className).not.toContain("ring-primary")
  })
})
