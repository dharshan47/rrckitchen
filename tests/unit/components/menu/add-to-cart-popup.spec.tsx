import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { AddToCartPopup, type AddPopupItem } from "@/components/menu/add-to-cart-popup"

const mockItem: AddPopupItem = {
  id: "item1",
  name: "Butter Chicken",
  price: 250,
  compareAtPrice: 300,
  foodType: "NONVEG",
  imageUrl: "/images/butter-chicken.jpg",
  kitchenName: "Punjabi Dhaba",
  timeSlot: "LUNCH",
}

const mockItemNoImage: AddPopupItem = {
  id: "item2",
  name: "Dal Makhani",
  price: 180,
  compareAtPrice: null,
  foodType: "VEG",
  imageUrl: null,
  kitchenName: "Test Kitchen",
  timeSlot: "DINNER",
}

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}))

describe("AddToCartPopup", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders nothing when item is null", () => {
    const { container } = render(
      <AddToCartPopup item={null} open={true} onOpenChange={vi.fn()} />
    )
    expect(container.textContent).toBe("")
  })

  it("renders nothing when open is false", () => {
    const { container } = render(
      <AddToCartPopup item={mockItem} open={false} onOpenChange={vi.fn()} />
    )
    expect(container.textContent).toBe("")
  })

  it("renders Added to Cart text when open with item", () => {
    render(<AddToCartPopup item={mockItem} open={true} onOpenChange={vi.fn()} />)
    const texts = screen.getAllByText("Added to Cart")
    expect(texts.length).toBe(2)
  })

  it("renders item name", () => {
    render(<AddToCartPopup item={mockItem} open={true} onOpenChange={vi.fn()} />)
    const names = screen.getAllByText("Butter Chicken")
    expect(names.length).toBe(2)
  })

  it("renders item price", () => {
    render(<AddToCartPopup item={mockItem} open={true} onOpenChange={vi.fn()} />)
    const prices = screen.getAllByText((content) => content.includes("250"))
    expect(prices.length).toBe(2)
  })

  it("renders quantity text", () => {
    render(<AddToCartPopup item={mockItem} qty={2} open={true} onOpenChange={vi.fn()} />)
    const qtys = screen.getAllByText(/2 ITEMS/)
    expect(qtys.length).toBe(2)
  })

  it("renders ITEM (singular) when qty is 1", () => {
    render(<AddToCartPopup item={mockItem} qty={1} open={true} onOpenChange={vi.fn()} />)
    const qtys = screen.getAllByText(/1 ITEM/)
    expect(qtys.length).toBe(2)
  })

  it("renders NONVEG badge indicator for non-veg items", () => {
    const { container } = render(
      <AddToCartPopup item={mockItem} open={true} onOpenChange={vi.fn()} />
    )
    const badges = container.querySelectorAll(".border-red-600")
    expect(badges.length).toBe(2)
  })

  it("renders VEG badge indicator for veg items", () => {
    const { container } = render(
      <AddToCartPopup item={mockItemNoImage} open={true} onOpenChange={vi.fn()} />
    )
    const badges = container.querySelectorAll(".border-green-600")
    expect(badges.length).toBe(2)
  })

  it("renders images when item has imageUrl", () => {
    render(<AddToCartPopup item={mockItem} open={true} onOpenChange={vi.fn()} />)
    const imgs = screen.getAllByRole("img")
    expect(imgs.length).toBe(2)
    expect(imgs[0]).toHaveAttribute("src", "/images/butter-chicken.jpg")
  })

  it("renders cart icon placeholder when item has no imageUrl", () => {
    const { container } = render(
      <AddToCartPopup item={mockItemNoImage} open={true} onOpenChange={vi.fn()} />
    )
    const icons = container.querySelectorAll(".lucide-shopping-cart")
    expect(icons.length).toBe(2)
  })

  it("links to /cart page", () => {
    render(<AddToCartPopup item={mockItem} open={true} onOpenChange={vi.fn()} />)
    const links = screen.getAllByRole("link")
    expect(links[0]).toHaveAttribute("href", "/cart")
    expect(links[1]).toHaveAttribute("href", "/cart")
  })

  it("calls onOpenChange(false) when popup link is clicked", () => {
    const onOpenChange = vi.fn()
    render(<AddToCartPopup item={mockItem} open={true} onOpenChange={onOpenChange} />)
    const links = screen.getAllByRole("link")
    fireEvent.click(links[0])
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("renders ChevronRight icon in each popup instance", () => {
    render(<AddToCartPopup item={mockItem} open={true} onOpenChange={vi.fn()} />)
    const links = screen.getAllByRole("link")
    expect(links.length).toBe(2)
    expect(links[0].querySelector("svg")).toBeInTheDocument()
  })

  it("defaults qty to 1 when not provided", () => {
    render(<AddToCartPopup item={mockItem} open={true} onOpenChange={vi.fn()} />)
    const qtyTexts = screen.getAllByText(/1 ITEM/)
    expect(qtyTexts.length).toBe(2)
  })
})
