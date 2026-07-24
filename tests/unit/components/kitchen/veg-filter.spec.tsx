import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { VegFilter } from "@/components/kitchen/veg-filter"

describe("VegFilter", () => {
  it("renders all three filter options", () => {
    render(<VegFilter value={null} onValueChange={vi.fn()} />)
    expect(screen.getByText("Pure Veg")).toBeInTheDocument()
    expect(screen.getByText("Veg")).toBeInTheDocument()
    expect(screen.getByText("Non Veg")).toBeInTheDocument()
  })

  it("highlights the selected option", () => {
    render(<VegFilter value="pure-veg" onValueChange={vi.fn()} />)
    const pureVegBtn = screen.getByText("Pure Veg")
    expect(pureVegBtn.className).toContain("text-primary")
  })

  it("does not highlight unselected options", () => {
    render(<VegFilter value="pure-veg" onValueChange={vi.fn()} />)
    const vegBtn = screen.getByText("Veg")
    expect(vegBtn.className).not.toContain("text-primary")
  })

  it("calls onValueChange with null when clicking the same value", () => {
    const onValueChange = vi.fn()
    render(<VegFilter value="pure-veg" onValueChange={onValueChange} />)
    fireEvent.click(screen.getByText("Pure Veg"))
    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  it("calls onValueChange with the new value when clicking a different option", () => {
    const onValueChange = vi.fn()
    render(<VegFilter value={null} onValueChange={onValueChange} />)
    fireEvent.click(screen.getByText("Pure Veg"))
    expect(onValueChange).toHaveBeenCalledWith("pure-veg")
  })

  it("calls onValueChange with veg when clicking Veg", () => {
    const onValueChange = vi.fn()
    render(<VegFilter value={null} onValueChange={onValueChange} />)
    fireEvent.click(screen.getByText("Veg"))
    expect(onValueChange).toHaveBeenCalledWith("veg")
  })

  it("calls onValueChange with non-veg when clicking Non Veg", () => {
    const onValueChange = vi.fn()
    render(<VegFilter value={null} onValueChange={onValueChange} />)
    fireEvent.click(screen.getByText("Non Veg"))
    expect(onValueChange).toHaveBeenCalledWith("non-veg")
  })

  it("toggles from veg to null when clicking the same option", () => {
    const onValueChange = vi.fn()
    render(<VegFilter value="veg" onValueChange={onValueChange} />)
    fireEvent.click(screen.getByText("Veg"))
    expect(onValueChange).toHaveBeenCalledWith(null)
  })

  it("renders buttons with correct styling classes", () => {
    render(<VegFilter value={null} onValueChange={vi.fn()} />)
    const buttons = screen.getAllByRole("button")
    buttons.forEach((btn) => {
      expect(btn.className).toContain("rounded-lg")
      expect(btn.className).toContain("shadow-sm")
    })
  })
})
