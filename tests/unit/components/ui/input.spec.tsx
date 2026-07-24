import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Input } from "@/components/ui/input"

describe("Input", () => {
  it("renders without crashing", () => {
    render(<Input />)
    const input = screen.getByRole("textbox")
    expect(input).toBeInTheDocument()
    expect(input).toHaveAttribute("data-slot", "input")
  })

  it("renders with placeholder", () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText("Enter text")
    expect(input).toBeInTheDocument()
  })

  it("applies custom className", () => {
    render(<Input className="custom-class" />)
    const input = screen.getByRole("textbox")
    expect(input.className).toContain("custom-class")
  })

  it("passes disabled prop", () => {
    render(<Input disabled />)
    const input = screen.getByRole("textbox")
    expect(input).toBeDisabled()
  })

  it("passes type prop", () => {
    render(<Input type="password" />)
    const input = screen.getByRole("textbox")
    expect(input).toHaveAttribute("type", "password")
  })

  it("passes value prop", () => {
    render(<Input defaultValue="test value" />)
    const input = screen.getByRole("textbox")
    expect(input).toHaveValue("test value")
  })
})
