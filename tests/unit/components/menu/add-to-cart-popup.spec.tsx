import { render, screen, fireEvent } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { AddToCartPopup, type AddPopupItem } from "@/components/menu/add-to-cart-popup"
import { cartStore } from "@/stores"

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

const mockPush = vi.fn()

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} />,
}))

vi.mock("next/link", () => ({
  default: ({ children, href, onClick }: { children: React.ReactNode; href: string; onClick?: () => void }) => (
    <a href={href} onClick={onClick}>{children}</a>
  ),
}))

vi.mock("@/actions/cart-checkout/config", () => ({
  getCartConfig: vi.fn(async () => ({
    packagingCharge: 10,
    deliveryCharge: 20,
    freeDeliveryMin: 299,
  })),
}))

type CartConfig = { packagingCharge: number; deliveryCharge: number; freeDeliveryMin: number }

function renderPopup(
  item: AddPopupItem | null,
  opts: {
    open?: boolean
    qty?: number
    onOpenChange?: (open: boolean) => void
    cartConfig?: CartConfig
  } = {}
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  queryClient.setQueryData(
    ["cart-config"],
    opts.cartConfig ?? { packagingCharge: 10, deliveryCharge: 20, freeDeliveryMin: 299 }
  )
  const onOpenChange = opts.onOpenChange ?? vi.fn()
  const result = render(
    <QueryClientProvider client={queryClient}>
      <AddToCartPopup item={item} qty={opts.qty} open={opts.open ?? true} onOpenChange={onOpenChange} />
    </QueryClientProvider>
  )
  return { onOpenChange, ...result }
}

function seedCart(price = 250, qty = 1, id = "item1") {
  cartStore.setState({
    cart: [
      {
        id,
        name: "Butter Chicken",
        price,
        qty,
        foodType: "NONVEG",
        timeSlot: "LUNCH",
        kitchenName: "Punjabi Dhaba",
        imageUrl: "/images/butter-chicken.jpg",
      },
    ],
    appliedCoupon: null,
    orderType: "PREBOOK",
  })
}

describe("AddToCartPopup", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cartStore.setState({ cart: [], appliedCoupon: null, orderType: "PREBOOK" })
  })

  it("renders nothing when item is null", () => {
    const { container } = renderPopup(null, { open: true })
    expect(container.textContent).toBe("")
  })

  it("renders nothing when open is false", () => {
    seedCart()
    const { container } = renderPopup(mockItem, { open: false })
    expect(container.textContent).toBe("")
  })

  it("renders Added to Cart! title and success note", () => {
    renderPopup(mockItem)
    expect(screen.getAllByText("Added to Cart!").length).toBeGreaterThan(0)
    expect(screen.getByText("Butter Chicken has been added to your cart.")).toBeInTheDocument()
  })

  it("renders item name in the item card", () => {
    renderPopup(mockItem)
    expect(screen.getAllByText("Butter Chicken").length).toBeGreaterThan(0)
    expect(screen.getByRole("heading", { name: "Butter Chicken" })).toBeInTheDocument()
  })

  it("renders item price", () => {
    renderPopup(mockItem)
    const prices = screen.getAllByText((content) => content.includes("250"))
    expect(prices.length).toBeGreaterThan(0)
  })

  it("renders NONVEG indicator for non-veg items", () => {
    renderPopup(mockItem)
    expect(screen.getByLabelText("Non-Veg")).toBeInTheDocument()
  })

  it("renders VEG indicator for veg items", () => {
    renderPopup(mockItemNoImage)
    expect(screen.getByLabelText("Veg")).toBeInTheDocument()
  })

  it("renders image when item has imageUrl", () => {
    renderPopup(mockItem)
    const img = screen.getByRole("img", { name: "Butter Chicken" })
    expect(img).toHaveAttribute("src", "/images/butter-chicken.jpg")
  })

  it("renders cart icon placeholder when item has no imageUrl", () => {
    renderPopup(mockItemNoImage)
    expect(document.querySelector(".lucide-shopping-bag")).toBeInTheDocument()
  })

  it("links to /cart page", () => {
    seedCart()
    renderPopup(mockItem)
    const link = screen.getByRole("link")
    expect(link).toHaveAttribute("href", "/cart")
  })

  it("calls onOpenChange(false) when cart summary link is clicked", () => {
    seedCart()
    const { onOpenChange } = renderPopup(mockItem)
    fireEvent.click(screen.getByRole("link"))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("pushes to /cart when View Cart button is clicked", () => {
    const { onOpenChange } = renderPopup(mockItem)
    fireEvent.click(screen.getByRole("button", { name: /view cart/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(mockPush).toHaveBeenCalledWith("/cart")
  })

  it("closes when Continue Shopping is clicked", () => {
    const { onOpenChange } = renderPopup(mockItem)
    fireEvent.click(screen.getByRole("button", { name: /continue shopping/i }))
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("shows quantity from cart data and increments it", () => {
    seedCart(250, 1)
    renderPopup(mockItem)
    fireEvent.click(screen.getByRole("button", { name: /increase quantity/i }))
    expect(cartStore.getState().cart[0].qty).toBe(2)
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("removes the item when quantity would drop below one", () => {
    seedCart(250, 1)
    const { onOpenChange } = renderPopup(mockItem)
    fireEvent.click(screen.getByRole("button", { name: /decrease quantity/i }))
    expect(cartStore.getState().cart).toHaveLength(0)
    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it("shows real free-delivery progress using config data", () => {
    seedCart(100, 1)
    renderPopup(mockItem, { cartConfig: { packagingCharge: 10, deliveryCharge: 20, freeDeliveryMin: 299 } })
    expect(screen.getByText(/199/)).toBeInTheDocument()
    expect(screen.getByText(/away from FREE delivery/i)).toBeInTheDocument()
    expect(screen.getByRole("progressbar")).toBeInTheDocument()
  })

  it("shows unlocked free delivery when cart total crosses threshold", () => {
    seedCart(250, 2)
    renderPopup(mockItem, { cartConfig: { packagingCharge: 10, deliveryCharge: 20, freeDeliveryMin: 299 } })
    expect(screen.getByText(/unlocked FREE delivery/i)).toBeInTheDocument()
  })
})