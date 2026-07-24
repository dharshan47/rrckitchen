import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { CravingsPopup } from "@/components/order/cravings-popup"
import { useAblyOrderChannel } from "@/hooks/useAblySubscribe"

vi.mock("@/hooks/useAblySubscribe", () => ({
  useAblyOrderChannel: vi.fn(),
}))

const mockItems = [
  { id: "item1", slug: "gulab-jamun", name: "Gulab Jamun", description: "Sweet syrup dessert", price: 60, foodType: "VEG" },
  { id: "item2", name: "Chicken Roll", description: "Spicy chicken wrap", price: 120, foodType: "NONVEG" },
]

describe("CravingsPopup", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders nothing when dialog is not open", () => {
    vi.mocked(useAblyOrderChannel).mockImplementation(() => {})
    const { container } = render(<CravingsPopup orderId="order1" />)
    expect(container.textContent).toBe("")
  })

  it("renders title and message when open", () => {
    vi.mocked(useAblyOrderChannel).mockImplementation((_orderId, cb) => {
      cb({ name: "order:cravings", data: { items: mockItems, message: "Try these too!" } })
    })
    render(<CravingsPopup orderId="order1" />)
    expect(screen.getByText("Still hungry?")).toBeInTheDocument()
    expect(screen.getByText("Try these too!")).toBeInTheDocument()
  })

  it("renders craving items when open", () => {
    vi.mocked(useAblyOrderChannel).mockImplementation((_orderId, cb) => {
      cb({ name: "order:cravings", data: { items: mockItems, message: "" } })
    })
    render(<CravingsPopup orderId="order1" />)
    expect(screen.getByText("Gulab Jamun")).toBeInTheDocument()
    expect(screen.getByText("Chicken Roll")).toBeInTheDocument()
    expect(screen.getByText("₹60")).toBeInTheDocument()
    expect(screen.getByText("₹120")).toBeInTheDocument()
  })

  it("shows VEG and NONVEG indicators", () => {
    vi.mocked(useAblyOrderChannel).mockImplementation((_orderId, cb) => {
      cb({ name: "order:cravings", data: { items: mockItems, message: "" } })
    })
    render(<CravingsPopup orderId="order1" />)
    expect(screen.getByText("VEG")).toBeInTheDocument()
    expect(screen.getByText("NONVEG")).toBeInTheDocument()
  })

  it("renders Not now and Browse Menu buttons", () => {
    vi.mocked(useAblyOrderChannel).mockImplementation((_orderId, cb) => {
      cb({ name: "order:cravings", data: { items: mockItems, message: "" } })
    })
    render(<CravingsPopup orderId="order1" />)
    expect(screen.getByText("Not now")).toBeInTheDocument()
    expect(screen.getByText("Browse Menu")).toBeInTheDocument()
  })

  it("closes dialog when Not now is clicked", () => {
    vi.mocked(useAblyOrderChannel).mockImplementation((_orderId, cb) => {
      cb({ name: "order:cravings", data: { items: mockItems, message: "" } })
    })
    render(<CravingsPopup orderId="order1" />)
    fireEvent.click(screen.getByText("Not now"))
    expect(screen.queryByText("Still hungry?")).not.toBeInTheDocument()
  })

  it("renders item links with correct href for items with slug", () => {
    vi.mocked(useAblyOrderChannel).mockImplementation((_orderId, cb) => {
      cb({ name: "order:cravings", data: { items: mockItems, message: "" } })
    })
    render(<CravingsPopup orderId="order1" />)
    const link = screen.getByText("Gulab Jamun").closest("a")
    expect(link).toHaveAttribute("href", "/menu/gulab-jamun")
  })
})
