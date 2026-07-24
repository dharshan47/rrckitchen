import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Switch } from "@/components/ui/switch"

describe("Switch", () => {
  it("renders without crashing", () => {
    render(<Switch />)
    const toggle = screen.getByRole("switch")
    expect(toggle).toBeInTheDocument()
    expect(toggle).toHaveAttribute("data-slot", "switch")
  })

  it("renders unchecked by default", () => {
    render(<Switch />)
    const toggle = screen.getByRole("switch")
    expect(toggle).not.toBeChecked()
  })

  it("renders checked when defaultChecked is true", () => {
    render(<Switch defaultChecked />)
    const toggle = screen.getByRole("switch")
    expect(toggle).toBeChecked()
  })

  it("renders with default size", () => {
    render(<Switch data-testid="switch" />)
    expect(screen.getByTestId("switch")).toHaveAttribute("data-size", "default")
  })

  it("renders with sm size", () => {
    render(<Switch size="sm" data-testid="switch" />)
    expect(screen.getByTestId("switch")).toHaveAttribute("data-size", "sm")
  })

  it("applies custom className", () => {
    render(<Switch className="custom-class" />)
    const toggle = screen.getByRole("switch")
    expect(toggle.className).toContain("custom-class")
  })

  it("passes disabled prop", () => {
    render(<Switch disabled />)
    const toggle = screen.getByRole("switch")
    expect(toggle).toBeDisabled()
  })

  it("toggles on click", async () => {
    const user = userEvent.setup()
    render(<Switch />)
    const toggle = screen.getByRole("switch")

    expect(toggle).not.toBeChecked()
    await user.click(toggle)
    expect(toggle).toBeChecked()
    await user.click(toggle)
    expect(toggle).not.toBeChecked()
  })
})
