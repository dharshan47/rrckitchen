import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { CodConfirmationDialog } from "@/components/delivery-partner/cod-confirmation-dialog"
import { toast } from "sonner"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() } }))

describe("CodConfirmationDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("renders nothing when closed", () => {
    const { container } = render(
      <CodConfirmationDialog open={false} onOpenChange={vi.fn()} orderId="order1" onSuccess={vi.fn()} />
    )
    expect(container.textContent).toBe("")
  })

  it("renders title and description when open", () => {
    render(
      <CodConfirmationDialog open={true} onOpenChange={vi.fn()} orderId="order1" onSuccess={vi.fn()} />
    )
    expect(screen.getByText("Confirm COD Delivery")).toBeInTheDocument()
    expect(screen.getByText(/Enter the delivery code/)).toBeInTheDocument()
  })

  it("renders OTP input field", () => {
    render(
      <CodConfirmationDialog open={true} onOpenChange={vi.fn()} orderId="order1" onSuccess={vi.fn()} />
    )
    expect(screen.getByPlaceholderText("4-digit code from customer")).toBeInTheDocument()
  })

  it("renders cash amount input field", () => {
    render(
      <CodConfirmationDialog open={true} onOpenChange={vi.fn()} orderId="order1" onSuccess={vi.fn()} />
    )
    expect(screen.getByPlaceholderText("e.g. 250")).toBeInTheDocument()
  })

  it("renders Cancel and Confirm buttons", () => {
    render(
      <CodConfirmationDialog open={true} onOpenChange={vi.fn()} orderId="order1" onSuccess={vi.fn()} />
    )
    expect(screen.getByText("Cancel")).toBeInTheDocument()
    expect(screen.getByText("Confirm Delivery & Cash")).toBeInTheDocument()
  })

  it("shows validation error for invalid OTP", async () => {
    render(
      <CodConfirmationDialog open={true} onOpenChange={vi.fn()} orderId="order1" onSuccess={vi.fn()} />
    )
    const otpInput = screen.getByPlaceholderText("4-digit code from customer")
    fireEvent.change(otpInput, { target: { value: "12" } })
    const cashInput = screen.getByPlaceholderText("e.g. 250")
    fireEvent.change(cashInput, { target: { value: "" } })
    fireEvent.click(screen.getByText("Confirm Delivery & Cash"))
    await waitFor(() => {
      expect(screen.getByText("Delivery code must be 4 digits")).toBeInTheDocument()
    })
  })

  it("shows validation error for invalid cash amount", async () => {
    render(
      <CodConfirmationDialog open={true} onOpenChange={vi.fn()} orderId="order1" onSuccess={vi.fn()} />
    )
    const otpInput = screen.getByPlaceholderText("4-digit code from customer")
    fireEvent.change(otpInput, { target: { value: "1234" } })
    const cashInput = screen.getByPlaceholderText("e.g. 250")
    fireEvent.change(cashInput, { target: { value: "" } })
    fireEvent.click(screen.getByText("Confirm Delivery & Cash"))
    await waitFor(() => {
      expect(screen.getByText("Enter a valid cash amount")).toBeInTheDocument()
    })
  })

  it("calls onOpenChange(false) when Cancel is clicked", () => {
    const onOpenChange = vi.fn()
    render(
      <CodConfirmationDialog open={true} onOpenChange={onOpenChange} orderId="order1" onSuccess={vi.fn()} />
    )
    fireEvent.click(screen.getByText("Cancel"))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("calls onSuccess and onOpenChange on successful submission", async () => {
    const onSuccess = vi.fn()
    const onOpenChange = vi.fn()
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    })
    render(
      <CodConfirmationDialog open={true} onOpenChange={onOpenChange} orderId="order1" onSuccess={onSuccess} />
    )
    const otpInput = screen.getByPlaceholderText("4-digit code from customer")
    fireEvent.change(otpInput, { target: { value: "1234" } })
    const cashInput = screen.getByPlaceholderText("e.g. 250")
    fireEvent.change(cashInput, { target: { value: "500" } })
    fireEvent.click(screen.getByText("Confirm Delivery & Cash"))
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled()
      expect(onOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it("shows warning when variance is detected", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, variance: 50 }),
    })
    render(
      <CodConfirmationDialog open={true} onOpenChange={vi.fn()} orderId="order1" onSuccess={vi.fn()} />
    )
    const otpInput = screen.getByPlaceholderText("4-digit code from customer")
    fireEvent.change(otpInput, { target: { value: "1234" } })
    const cashInput = screen.getByPlaceholderText("e.g. 250")
    fireEvent.change(cashInput, { target: { value: "300" } })
    fireEvent.click(screen.getByText("Confirm Delivery & Cash"))
    await waitFor(() => {
      expect(toast.warning).toHaveBeenCalled()
    })
  })

  it("shows error toast on API failure", async () => {
    ;(global.fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Invalid OTP" }),
    })
    render(
      <CodConfirmationDialog open={true} onOpenChange={vi.fn()} orderId="order1" onSuccess={vi.fn()} />
    )
    const otpInput = screen.getByPlaceholderText("4-digit code from customer")
    fireEvent.change(otpInput, { target: { value: "1234" } })
    const cashInput = screen.getByPlaceholderText("e.g. 250")
    fireEvent.change(cashInput, { target: { value: "500" } })
    fireEvent.click(screen.getByText("Confirm Delivery & Cash"))
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled()
    })
  })

  it("limits OTP input to 4 digits", () => {
    render(
      <CodConfirmationDialog open={true} onOpenChange={vi.fn()} orderId="order1" onSuccess={vi.fn()} />
    )
    const otpInput = screen.getByPlaceholderText("4-digit code from customer") as HTMLInputElement
    fireEvent.change(otpInput, { target: { value: "12345" } })
    expect(otpInput.value).toBe("1234")
  })
})
