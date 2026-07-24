import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { ErrorBoundary, withErrorBoundary } from "@/components/patterns/error-boundary"

const ErrorThrower = ({ message }: { message?: string }) => {
  throw new Error(message ?? "Test error")
}

const StableComponent = () => <div>Stable Content</div>

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <StableComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText("Stable Content")).toBeInTheDocument()
  })

  it("renders default error UI when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <ErrorThrower />
      </ErrorBoundary>
    )
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    expect(screen.getByText("Test error")).toBeInTheDocument()
    expect(screen.getByText("Try Again")).toBeInTheDocument()
  })

  it("renders custom fallback when provided", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    render(
      <ErrorBoundary fallback={<div>Custom Fallback</div>}>
        <ErrorThrower />
      </ErrorBoundary>
    )
    expect(screen.getByText("Custom Fallback")).toBeInTheDocument()
  })

  it("resets error state when Try Again is clicked", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorThrower />
      </ErrorBoundary>
    )
    expect(screen.getByText("Something went wrong")).toBeInTheDocument()
    fireEvent.click(screen.getByText("Try Again"))
    rerender(
      <ErrorBoundary>
        <StableComponent />
      </ErrorBoundary>
    )
    expect(screen.getByText("Stable Content")).toBeInTheDocument()
  })

  it("calls onError when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const onError = vi.fn()
    render(
      <ErrorBoundary onError={onError}>
        <ErrorThrower message="Custom error" />
      </ErrorBoundary>
    )
    expect(onError).toHaveBeenCalled()
    expect(onError.mock.calls[0][0].message).toBe("Custom error")
  })
})

describe("withErrorBoundary", () => {
  it("wraps a component with ErrorBoundary", () => {
    const Wrapped = withErrorBoundary(StableComponent)
    render(<Wrapped />)
    expect(screen.getByText("Stable Content")).toBeInTheDocument()
  })

  it("catches errors in wrapped component", () => {
    vi.spyOn(console, "error").mockImplementation(() => {})
    const Wrapped = withErrorBoundary(ErrorThrower)
    render(<Wrapped message="Boundary error" />)
    expect(screen.getByText("Boundary error")).toBeInTheDocument()
  })
})
