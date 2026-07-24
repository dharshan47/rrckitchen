import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

describe("Card", () => {
  it("renders Card without crashing", () => {
    render(<Card data-testid="card">Content</Card>)
    expect(screen.getByTestId("card")).toBeInTheDocument()
    expect(screen.getByTestId("card")).toHaveAttribute("data-slot", "card")
  })

  it("renders Card with default size", () => {
    render(<Card data-testid="card">Content</Card>)
    expect(screen.getByTestId("card")).toHaveAttribute("data-size", "default")
  })

  it("renders Card with sm size", () => {
    render(<Card size="sm" data-testid="card">Content</Card>)
    expect(screen.getByTestId("card")).toHaveAttribute("data-size", "sm")
  })

  it("applies custom className to Card", () => {
    render(<Card className="custom-class" data-testid="card">Content</Card>)
    expect(screen.getByTestId("card").className).toContain("custom-class")
  })

  it("renders CardHeader", () => {
    render(<CardHeader data-testid="header">Header</CardHeader>)
    const header = screen.getByTestId("header")
    expect(header).toBeInTheDocument()
    expect(header).toHaveAttribute("data-slot", "card-header")
  })

  it("renders CardTitle", () => {
    render(<CardTitle data-testid="title">Title</CardTitle>)
    const title = screen.getByTestId("title")
    expect(title).toBeInTheDocument()
    expect(title).toHaveAttribute("data-slot", "card-title")
  })

  it("renders CardDescription", () => {
    render(<CardDescription data-testid="desc">Description</CardDescription>)
    const desc = screen.getByTestId("desc")
    expect(desc).toBeInTheDocument()
    expect(desc).toHaveAttribute("data-slot", "card-description")
  })

  it("renders CardAction", () => {
    render(<CardAction data-testid="action">Action</CardAction>)
    const action = screen.getByTestId("action")
    expect(action).toBeInTheDocument()
    expect(action).toHaveAttribute("data-slot", "card-action")
  })

  it("renders CardContent", () => {
    render(<CardContent data-testid="content">Content</CardContent>)
    const content = screen.getByTestId("content")
    expect(content).toBeInTheDocument()
    expect(content).toHaveAttribute("data-slot", "card-content")
  })

  it("renders CardFooter", () => {
    render(<CardFooter data-testid="footer">Footer</CardFooter>)
    const footer = screen.getByTestId("footer")
    expect(footer).toBeInTheDocument()
    expect(footer).toHaveAttribute("data-slot", "card-footer")
  })

  it("renders a full Card composition", () => {
    render(
      <Card data-testid="card">
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
          <CardDescription>Card Description</CardDescription>
        </CardHeader>
        <CardContent>Card Content</CardContent>
        <CardFooter>Card Footer</CardFooter>
      </Card>
    )
    expect(screen.getByTestId("card")).toBeInTheDocument()
    expect(screen.getByText("Card Title")).toBeInTheDocument()
    expect(screen.getByText("Card Description")).toBeInTheDocument()
    expect(screen.getByText("Card Content")).toBeInTheDocument()
    expect(screen.getByText("Card Footer")).toBeInTheDocument()
  })
})
