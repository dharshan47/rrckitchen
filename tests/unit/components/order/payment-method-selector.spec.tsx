import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PaymentMethodSelector } from "@/components/order/payment-method-selector"

describe("PaymentMethodSelector", () => {
  it("renders both payment options", () => {
    render(<PaymentMethodSelector selected="RAZORPAY" onSelect={vi.fn()} />)
    expect(screen.getByText("Pay Online")).toBeInTheDocument()
    expect(screen.getByText("Cash on Delivery")).toBeInTheDocument()
  })

  it("highlights the selected method", () => {
    render(<PaymentMethodSelector selected="CASH_ON_DELIVERY" onSelect={vi.fn()} />)
    const codButton = screen.getByText("Cash on Delivery").closest("button")
    expect(codButton!.className).toContain("ring-primary")
  })

  it("calls onSelect when clicking an enabled method", () => {
    const onSelect = vi.fn()
    render(<PaymentMethodSelector selected="RAZORPAY" onSelect={onSelect} />)
    fireEvent.click(screen.getByText("Cash on Delivery"))
    expect(onSelect).toHaveBeenCalledWith("CASH_ON_DELIVERY")
  })

  it("does not call onSelect when clicking a disabled method", () => {
    const onSelect = vi.fn()
    render(<PaymentMethodSelector selected="RAZORPAY" onSelect={onSelect} codAvailable={false} />)
    fireEvent.click(screen.getByText("Cash on Delivery"))
    expect(onSelect).not.toHaveBeenCalled()
  })

  it("shows disabled reason for COD when codAvailable is false", () => {
    render(<PaymentMethodSelector selected="RAZORPAY" onSelect={vi.fn()} codAvailable={false} codReason="COD not available" />)
    expect(screen.getByText("COD not available")).toBeInTheDocument()
  })

  it("disables Razorpay when razorpayAvailable is false", () => {
    render(<PaymentMethodSelector selected="CASH_ON_DELIVERY" onSelect={vi.fn()} razorpayAvailable={false} />)
    expect(screen.getByText("Online payment coming soon")).toBeInTheDocument()
  })

  it("applies disabled styles to COD option", () => {
    render(<PaymentMethodSelector selected="RAZORPAY" onSelect={vi.fn()} codAvailable={false} />)
    const codLabel = screen.getByText("Cash on Delivery")
    const button = codLabel.closest("button")
    expect(button!.className).toContain("opacity-50")
    expect(button!.className).toContain("cursor-not-allowed")
  })
})
