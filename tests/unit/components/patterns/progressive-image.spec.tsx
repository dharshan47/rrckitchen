import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { ProgressiveImage } from "@/components/patterns/progressive-image"

vi.mock("@/hooks/useIntersectionObserver", () => ({
  useIntersectionObserver: vi.fn(() => ({ ref: { current: null }, isIntersecting: true })),
}))

vi.mock("@/hooks", () => ({
  useProgressiveImage: vi.fn(({ highResUrl }: { highResUrl: string }) => ({
    src: highResUrl,
    isLoaded: true,
    isError: false,
  })),
}))

describe("ProgressiveImage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders a placeholder div", () => {
    const { container } = render(
      <ProgressiveImage highResUrl="/test.jpg" alt="Test Image" width={200} height={200} />
    )
    expect(container.querySelector(".overflow-hidden")).toBeInTheDocument()
  })

  it("renders an image element when intersecting", () => {
    render(<ProgressiveImage highResUrl="/test.jpg" alt="Test Image" width={200} height={200} />)
    const img = screen.getByRole("img")
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute("src", "/test.jpg")
    expect(img).toHaveAttribute("alt", "Test Image")
  })

  it("renders without IntersectionObserver when priority is true", () => {
    render(<ProgressiveImage highResUrl="/test.jpg" alt="Priority" width={200} height={200} priority={true} />)
    expect(screen.getByRole("img")).toBeInTheDocument()
  })

  it("shows error state when image fails to load", () => {
    render(<ProgressiveImage highResUrl="/bad.jpg" alt="Error Image" width={200} height={200} />)
    const img = screen.getByRole("img")
    fireEvent.error(img)
    expect(screen.getByText("E")).toBeInTheDocument()
  })

  it("applies custom className", () => {
    const { container } = render(
      <ProgressiveImage highResUrl="/test.jpg" alt="Styled" width={200} height={200} className="custom-class" />
    )
    expect(container.querySelector(".custom-class")).toBeInTheDocument()
  })

  it("applies fill prop when specified", () => {
    const { container } = render(
      <ProgressiveImage highResUrl="/test.jpg" alt="Fill Image" fill={true} />
    )
    const wrapper = container.querySelector(".overflow-hidden") as HTMLElement
    expect(wrapper.style.position).toBe("relative")
    expect(wrapper.style.width).toBe("100%")
    expect(wrapper.style.height).toBe("100%")
  })

  it("calls onLoad when image loads", () => {
    const onLoad = vi.fn()
    render(<ProgressiveImage highResUrl="/test.jpg" alt="Test" width={200} height={200} onLoad={onLoad} />)
    const img = screen.getByRole("img")
    fireEvent.load(img)
    expect(onLoad).toHaveBeenCalled()
  })

  it("renders first character fallback on error", () => {
    render(<ProgressiveImage highResUrl="/bad.jpg" alt="Hello" width={200} height={200} />)
    const img = screen.getByRole("img")
    fireEvent.error(img)
    expect(screen.getByText("H")).toBeInTheDocument()
  })

  it("sets background color from placeholderColor prop", () => {
    const { container } = render(
      <ProgressiveImage highResUrl="/test.jpg" alt="Test" width={200} height={200} placeholderColor="#ff0000" />
    )
    const wrapper = container.querySelector(".overflow-hidden") as HTMLElement
    expect(wrapper.style.backgroundColor).toBe("rgb(255, 0, 0)")
  })
})
