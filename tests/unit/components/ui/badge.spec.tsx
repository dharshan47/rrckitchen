import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Badge } from "@/components/ui/badge"

describe("Badge", () => {
  it("renders with default variant", () => {
    render(<Badge>Default</Badge>)
    const badge = screen.getByText("Default")
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveAttribute("data-slot", "badge")
    expect(badge).toHaveAttribute("data-variant", "default")
  })

  it("renders with secondary variant", () => {
    render(<Badge variant="secondary">Secondary</Badge>)
    const badge = screen.getByText("Secondary")
    expect(badge).toHaveAttribute("data-variant", "secondary")
  })

  it("renders with destructive variant", () => {
    render(<Badge variant="destructive">Destructive</Badge>)
    const badge = screen.getByText("Destructive")
    expect(badge).toHaveAttribute("data-variant", "destructive")
  })

  it("renders with outline variant", () => {
    render(<Badge variant="outline">Outline</Badge>)
    const badge = screen.getByText("Outline")
    expect(badge).toHaveAttribute("data-variant", "outline")
  })

  it("renders with ghost variant", () => {
    render(<Badge variant="ghost">Ghost</Badge>)
    const badge = screen.getByText("Ghost")
    expect(badge).toHaveAttribute("data-variant", "ghost")
  })

  it("renders with link variant", () => {
    render(<Badge variant="link">Link</Badge>)
    const badge = screen.getByText("Link")
    expect(badge).toHaveAttribute("data-variant", "link")
  })

  it("applies custom className", () => {
    render(<Badge className="custom-class">Styled</Badge>)
    const badge = screen.getByText("Styled")
    expect(badge.className).toContain("custom-class")
  })

  it("renders as child when asChild is true", () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>
    )
    const link = screen.getByRole("link", { name: "Link Badge" })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute("data-slot", "badge")
  })
})
