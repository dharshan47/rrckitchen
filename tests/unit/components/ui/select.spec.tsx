import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

describe("Select", () => {
  it("renders Select without crashing", () => {
    render(
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
        </SelectContent>
      </Select>
    )
    expect(screen.getByText("Apple")).toBeInTheDocument()
  })

  it("renders SelectTrigger with default size", () => {
    render(
      <Select>
        <SelectTrigger data-testid="trigger">
          <SelectValue placeholder="Pick one" />
        </SelectTrigger>
      </Select>
    )
    const trigger = screen.getByTestId("trigger")
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute("data-slot", "select-trigger")
    expect(trigger).toHaveAttribute("data-size", "default")
  })

  it("renders SelectTrigger with sm size", () => {
    render(
      <Select>
        <SelectTrigger size="sm" data-testid="trigger">
          <SelectValue />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByTestId("trigger")).toHaveAttribute("data-size", "sm")
  })

  it("renders SelectItem", () => {
    render(
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    )
    const item = screen.getByRole("option", { name: "Apple" })
    expect(item).toBeInTheDocument()
    expect(item).toHaveAttribute("data-slot", "select-item")
  })

  it("renders SelectGroup", () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup data-testid="group">
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple">Apple</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    )
    expect(screen.getByTestId("group")).toBeInTheDocument()
    expect(screen.getByText("Fruits")).toBeInTheDocument()
  })

  it("renders SelectLabel", () => {
    render(<SelectLabel data-testid="label">Label</SelectLabel>)
    const label = screen.getByTestId("label")
    expect(label).toBeInTheDocument()
    expect(label).toHaveAttribute("data-slot", "select-label")
  })

  it("renders SelectSeparator", () => {
    render(<SelectSeparator data-testid="separator" />)
    expect(screen.getByTestId("separator")).toBeInTheDocument()
    expect(screen.getByTestId("separator")).toHaveAttribute("data-slot", "select-separator")
  })

  it("applies custom className to SelectTrigger", () => {
    render(
      <Select>
        <SelectTrigger className="custom-trigger" data-testid="trigger">
          <SelectValue />
        </SelectTrigger>
      </Select>
    )
    expect(screen.getByTestId("trigger").className).toContain("custom-trigger")
  })
})
