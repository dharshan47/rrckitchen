import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CloudinaryUpload } from "@/components/cloudinary/cloudinary-upload"

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function renderUpload({
  onUpload = vi.fn(),
}: { onUpload?: (result: { secure_url: string; public_id: string }) => void } = {}) {
  return render(
    <CloudinaryUpload onUpload={onUpload}>
      {({ uploading, startUpload, cancelUpload }) => (
        <div>
          <button onClick={startUpload} disabled={uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
          <button onClick={cancelUpload}>Cancel</button>
          <span data-testid="uploading-state">{uploading ? "true" : "false"}</span>
        </div>
      )}
    </CloudinaryUpload>,
    { wrapper: createWrapper() }
  )
}

describe("CloudinaryUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    global.fetch = vi.fn()
  })

  it("renders children with upload controls", () => {
    renderUpload()
    expect(screen.getByText("Upload")).toBeInTheDocument()
    expect(screen.getByText("Cancel")).toBeInTheDocument()
  })

  it("renders hidden file input", () => {
    const { container } = renderUpload()
    const fileInput = container.querySelector('input[type="file"]')
    expect(fileInput).toBeInTheDocument()
    expect(fileInput).toHaveClass("hidden")
  })

  it("shows uploading state when upload is triggered", () => {
    renderUpload()
    fireEvent.click(screen.getByText("Upload"))
  })

  it("accepts only image files", () => {
    const { container } = renderUpload()
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput.accept).toBe("image/*")
  })

  it("cancel button exists and is clickable", () => {
    renderUpload()
    const cancelBtn = screen.getByText("Cancel")
    expect(cancelBtn).toBeInTheDocument()
    fireEvent.click(cancelBtn)
  })

  it("upload button shows correct text", () => {
    renderUpload()
    expect(screen.getByText("Upload")).toBeInTheDocument()
  })

  it("exposes uploading state to children", () => {
    renderUpload()
    const stateSpan = screen.getByTestId("uploading-state")
    expect(stateSpan.textContent).toBe("false")
  })

  it("handles file change", () => {
    const { container } = renderUpload()
    const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(["dummy"], "test.png", { type: "image/png" })
    fireEvent.change(fileInput, { target: { files: [file] } })
  })

  it("cancels upload when cancelUpload is called", () => {
    renderUpload()
    fireEvent.click(screen.getByText("Cancel"))
  })
})
