import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

describe("Dialog", () => {
  it("renders Dialog without crashing", () => {
    render(<Dialog />)
  })

  it("renders DialogTrigger", () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
      </Dialog>
    )
    expect(screen.getByText("Open")).toBeInTheDocument()
  })

  it("renders DialogContent with title and description", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogTitle>My Dialog</DialogTitle>
          <DialogDescription>This is a description</DialogDescription>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByText("My Dialog")).toBeInTheDocument()
    expect(screen.getByText("This is a description")).toBeInTheDocument()
    expect(screen.getByTestId("dialog-content")).toBeInTheDocument()
  })

  it("renders DialogHeader", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogHeader data-testid="dialog-header">
            <DialogTitle>Header Title</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByTestId("dialog-header")).toBeInTheDocument()
  })

  it("renders DialogFooter", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogFooter data-testid="dialog-footer">
            <button>OK</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByTestId("dialog-footer")).toBeInTheDocument()
  })

  it("renders DialogContent with custom className", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent className="custom-dialog">
          <DialogTitle>Styled</DialogTitle>
        </DialogContent>
      </Dialog>
    )
    const content = screen.getByTestId("dialog-content")
    expect(content.className).toContain("custom-dialog")
  })

  it("renders DialogOverlay", () => {
    render(<DialogOverlay data-testid="overlay" />)
    expect(screen.getByTestId("overlay")).toBeInTheDocument()
  })

  it("renders DialogPortal", () => {
    render(
      <DialogPortal>
        <div>Portal content</div>
      </DialogPortal>
    )
    expect(screen.getByText("Portal content")).toBeInTheDocument()
  })

  it("renders DialogClose", () => {
    render(
      <Dialog defaultOpen>
        <DialogContent>
          <DialogClose data-testid="close">Close</DialogClose>
        </DialogContent>
      </Dialog>
    )
    expect(screen.getByTestId("close")).toBeInTheDocument()
  })
})
