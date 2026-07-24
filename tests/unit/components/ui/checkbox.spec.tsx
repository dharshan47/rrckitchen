import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"
import { Checkbox } from "@/components/ui/checkbox"

describe("Checkbox", () => {
  it("renders without crashing", () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).toBeInTheDocument()
    expect(checkbox).toHaveAttribute("data-slot", "checkbox")
  })

  it("renders unchecked by default", () => {
    render(<Checkbox />)
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).not.toBeChecked()
  })

  it("renders checked when defaultChecked is true", () => {
    render(<Checkbox defaultChecked />)
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).toBeChecked()
  })

  it("applies custom className", () => {
    render(<Checkbox className="custom-class" />)
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox.className).toContain("custom-class")
  })

  it("passes disabled prop", () => {
    render(<Checkbox disabled />)
    const checkbox = screen.getByRole("checkbox")
    expect(checkbox).toBeDisabled()
  })

  it("toggles on click", async () => {
    const user = userEvent.setup()
    render(<Checkbox />)
    const checkbox = screen.getByRole("checkbox")

    expect(checkbox).not.toBeChecked()
    await user.click(checkbox)
    expect(checkbox).toBeChecked()
    await user.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })
})
