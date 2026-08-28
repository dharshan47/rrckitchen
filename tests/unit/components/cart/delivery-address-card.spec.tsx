import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { DeliveryAddressCard } from "@/components/cart/delivery-address-card"
import { useMenuDeliveryAddress } from "@/stores"

vi.mock("@/stores", () => ({
  useMenuDeliveryAddress: vi.fn(() => ""),
  useMenuActions: vi.fn(() => ({})),
}))

vi.mock("@/actions/cart-checkout/address", () => ({
  addAddress: vi.fn(),
}))

vi.mock("next/dynamic", () => ({
  default: () => function MockMap(props: Record<string, unknown>) {
    return <div data-testid="mock-map" data-height={props.height} />
  },
}))

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="sheet">{children}</div> : null,
  SheetContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/components/ui/card", () => ({
  Card: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CardContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, disabled, ...props }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean; [key: string]: unknown }) => (
    <button onClick={onClick} disabled={disabled} {...props}>{children}</button>
  ),
}))

vi.mock("@/components/ui/input", () => ({
  Input: ({ ...props }: { [key: string]: unknown }) => <input {...props} />,
}))

describe("DeliveryAddressCard", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("renders the delivery address card with title", () => {
    render(<DeliveryAddressCard />)
    expect(screen.getByText("Add a delivery address")).toBeInTheDocument()
  })

  it("renders subtitle text", () => {
    render(<DeliveryAddressCard />)
    expect(screen.getByText("You seem to be in the new location")).toBeInTheDocument()
  })

  it("renders Add New button", () => {
    render(<DeliveryAddressCard />)
    expect(screen.getByText("Add New")).toBeInTheDocument()
  })

  it("displays delivery address when one is set", () => {
    vi.mocked(useMenuDeliveryAddress).mockReturnValue("123 Main St, Thanjavur")
    render(<DeliveryAddressCard />)
    expect(screen.getByText("123 Main St, Thanjavur")).toBeInTheDocument()
  })

  it("does not display address section when no address is set", () => {
    vi.mocked(useMenuDeliveryAddress).mockReturnValue("")
    const { container } = render(<DeliveryAddressCard />)
    const addressSection = container.querySelector(".rounded-lg.border")
    expect(addressSection).not.toBeInTheDocument()
  })

  it("opens sheet when Add New button is clicked", () => {
    render(<DeliveryAddressCard />)
    fireEvent.click(screen.getByText("Add New"))
    expect(screen.getByTestId("sheet")).toBeInTheDocument()
    expect(screen.getByText("Save Delivery Address")).toBeInTheDocument()
  })

  it("renders map component inside sheet", () => {
    render(<DeliveryAddressCard />)
    fireEvent.click(screen.getByText("Add New"))
    expect(screen.getByTestId("mock-map")).toBeInTheDocument()
  })

  it("renders form fields inside sheet", () => {
    render(<DeliveryAddressCard />)
    fireEvent.click(screen.getByText("Add New"))
    expect(screen.getByPlaceholderText("Door / Flat No.")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Area")).toBeInTheDocument()
    expect(screen.getByPlaceholderText("Landmark (optional)")).toBeInTheDocument()
  })

  it("renders label options", () => {
    render(<DeliveryAddressCard />)
    fireEvent.click(screen.getByText("Add New"))
    expect(screen.getByText("Home")).toBeInTheDocument()
    expect(screen.getByText("Work")).toBeInTheDocument()
    expect(screen.getByText("Others")).toBeInTheDocument()
  })

  it("shows custom label input when Others is selected", () => {
    render(<DeliveryAddressCard />)
    fireEvent.click(screen.getByText("Add New"))
    fireEvent.click(screen.getByText("Others"))
    expect(screen.getByPlaceholderText("Enter label name")).toBeInTheDocument()
  })

  it("does not show custom label input by default", () => {
    render(<DeliveryAddressCard />)
    fireEvent.click(screen.getByText("Add New"))
    expect(screen.queryByPlaceholderText("Enter label name")).not.toBeInTheDocument()
  })

  it("renders Save Address button", () => {
    render(<DeliveryAddressCard />)
    fireEvent.click(screen.getByText("Add New"))
    expect(screen.getByText("Save Address")).toBeInTheDocument()
  })

  it("Save Address button is disabled when no address is selected", () => {
    render(<DeliveryAddressCard />)
    fireEvent.click(screen.getByText("Add New"))
    const saveBtn = screen.getByText("Save Address")
    expect(saveBtn).toBeDisabled()
  })

  it("uses external open state when provided", () => {
    render(<DeliveryAddressCard open={true} />)
    expect(screen.getByTestId("sheet")).toBeInTheDocument()
  })

  it("does not open sheet when external open is false", () => {
    render(<DeliveryAddressCard open={false} />)
    expect(screen.queryByTestId("sheet")).not.toBeInTheDocument()
  })

  it("calls onOpenChange when sheet closes", () => {
    const onOpenChange = vi.fn()
    render(<DeliveryAddressCard open={true} onOpenChange={onOpenChange} />)
    expect(screen.getByTestId("sheet")).toBeInTheDocument()
  })
})
