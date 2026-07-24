import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

describe("Tabs", () => {
  it("renders Tabs without crashing", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
      </Tabs>
    )
    expect(screen.getByText("Tab 1")).toBeInTheDocument()
    expect(screen.getByText("Content 1")).toBeInTheDocument()
  })

  it("renders TabsList with default variant", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    const list = screen.getByTestId("tabs-list")
    expect(list).toHaveAttribute("data-slot", "tabs-list")
    expect(list).toHaveAttribute("data-variant", "default")
  })

  it("renders TabsList with line variant", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList variant="line" data-testid="tabs-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByTestId("tabs-list")).toHaveAttribute("data-variant", "line")
  })

  it("renders TabsTrigger", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    const trigger = screen.getByRole("tab", { name: "Tab 1" })
    expect(trigger).toBeInTheDocument()
    expect(trigger).toHaveAttribute("data-slot", "tabs-trigger")
  })

  it("renders TabsContent", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" data-testid="tab-content">Content 1</TabsContent>
      </Tabs>
    )
    const content = screen.getByTestId("tab-content")
    expect(content).toBeInTheDocument()
    expect(content).toHaveAttribute("data-slot", "tabs-content")
  })

  it("applies custom className to Tabs", () => {
    render(
      <Tabs defaultValue="tab1" className="custom-tabs">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    )
    expect(screen.getByRole("tablist").parentElement?.parentElement?.className).toContain("custom-tabs")
  })

  it("renders multiple tabs", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
        <TabsContent value="tab3">Content 3</TabsContent>
      </Tabs>
    )
    expect(screen.getByRole("tab", { name: "Tab 1" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Tab 2" })).toBeInTheDocument()
    expect(screen.getByRole("tab", { name: "Tab 3" })).toBeInTheDocument()
    expect(screen.getByText("Content 1")).toBeInTheDocument()
    expect(screen.getByText("Content 2")).toBeInTheDocument()
    expect(screen.getByText("Content 3")).toBeInTheDocument()
  })
})
