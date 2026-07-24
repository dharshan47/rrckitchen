import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Button } from "@/components/ui/button"

describe("Button", () => {
  it("renders with default variant and size", () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole("button", { name: "Click me" })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute("data-slot", "button")
    expect(button).toHaveAttribute("data-variant", "default")
    expect(button).toHaveAttribute("data-size", "default")
  })

  it("renders with outline variant", () => {
    render(<Button variant="outline">Outline</Button>)
    const button = screen.getByRole("button", { name: "Outline" })
    expect(button).toHaveAttribute("data-variant", "outline")
  })

  it("renders with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>)
    const button = screen.getByRole("button", { name: "Secondary" })
    expect(button).toHaveAttribute("data-variant", "secondary")
  })

  it("renders with ghost variant", () => {
    render(<Button variant="ghost">Ghost</Button>)
    const button = screen.getByRole("button", { name: "Ghost" })
    expect(button).toHaveAttribute("data-variant", "ghost")
  })

  it("renders with destructive variant", () => {
    render(<Button variant="destructive">Destructive</Button>)
    const button = screen.getByRole("button", { name: "Destructive" })
    expect(button).toHaveAttribute("data-variant", "destructive")
  })

  it("renders with link variant", () => {
    render(<Button variant="link">Link</Button>)
    const button = screen.getByRole("button", { name: "Link" })
    expect(button).toHaveAttribute("data-variant", "link")
  })

  it("renders with sm size", () => {
    render(<Button size="sm">Small</Button>)
    const button = screen.getByRole("button", { name: "Small" })
    expect(button).toHaveAttribute("data-size", "sm")
  })

  it("renders with lg size", () => {
    render(<Button size="lg">Large</Button>)
    const button = screen.getByRole("button", { name: "Large" })
    expect(button).toHaveAttribute("data-size", "lg")
  })

  it("renders with icon size", () => {
    render(<Button size="icon">Icon</Button>)
    const button = screen.getByRole("button", { name: "Icon" })
    expect(button).toHaveAttribute("data-size", "icon")
  })

  it("applies custom className", () => {
    render(<Button className="custom-class">Styled</Button>)
    const button = screen.getByRole("button", { name: "Styled" })
    expect(button.className).toContain("custom-class")
  })

  it("passes disabled prop", () => {
    render(<Button disabled>Disabled</Button>)
    const button = screen.getByRole("button", { name: "Disabled" })
    expect(button).toBeDisabled()
  })

  it("renders as child when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    const link = screen.getByRole("link", { name: "Link Button" })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("data-slot", "button")
  })
})
