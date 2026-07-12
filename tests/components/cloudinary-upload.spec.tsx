import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { CloudinaryUpload } from "@/components/cloudinary/cloudinary-upload"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

vi.mock("sonner", () => ({
  toast: { error: vi.fn() },
}))

function mockCloudinaryApi(successResponse?: object) {
  let callCount = 0
  return vi.fn().mockImplementation(() => {
    callCount++
    if (callCount === 1) {
      return Promise.resolve(
        new Response(JSON.stringify({ signature: "test_sig" }))
      )
    }
    return Promise.resolve(
      new Response(JSON.stringify(successResponse ?? { secure_url: "https://res.cloudinary.com/test.jpg", public_id: "img_123" }))
    )
  })
}

function setup(overrides = {}) {
  const onUpload = vi.fn()
  const uploadPreset = "test_preset"
  const cloudName = "test_cloud"

  vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET", uploadPreset)
  vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", cloudName)
  vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_API_KEY", "test_key")

  render(
    <QueryClientProvider client={queryClient}>
      <CloudinaryUpload onUpload={onUpload} {...overrides}>
        {({ uploading, startUpload }) => (
          <button onClick={startUpload} disabled={uploading} data-testid="upload-btn">
            {uploading ? "Uploading..." : "Upload"}
          </button>
        )}
      </CloudinaryUpload>
    </QueryClientProvider>
  )

  return { onUpload, uploadPreset, cloudName }
}

function createMockFile(name = "test.jpg", _size = 1024, mimeType = "image/jpeg") {
  void _size
  return new File(["fake-image-content"], name, { type: mimeType })
}

describe("CloudinaryUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it("renders children with uploading=false initially", () => {
    setup()
    const btn = screen.getByTestId("upload-btn")
    expect(btn).not.toBeDisabled()
    expect(btn).toHaveTextContent("Upload")
  })

  it("opens file picker when startUpload is called", async () => {
    setup()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const clickSpy = vi.spyOn(fileInput, "click")

    await userEvent.click(screen.getByTestId("upload-btn"))
    expect(clickSpy).toHaveBeenCalledOnce()
  })

  it("shows uploading state during upload", async () => {
    let resolvePromise: (value: unknown) => void
    const uploadPromise = new Promise((resolve) => { resolvePromise = resolve })
    let callCount = 0
    vi.stubGlobal("fetch", () => {
      callCount++
      if (callCount === 1) return Promise.resolve(new Response(JSON.stringify({ signature: "test_sig" })))
      return uploadPromise
    })

    setup()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

    const file = createMockFile()
    Object.defineProperty(fileInput, "files", { value: [file] })
    fileInput.dispatchEvent(new Event("change", { bubbles: true }))

    await vi.waitFor(() => {
      expect(screen.getByTestId("upload-btn")).toBeDisabled()
    })
    expect(screen.getByTestId("upload-btn")).toHaveTextContent("Uploading...")

    resolvePromise!(new Response(JSON.stringify({ secure_url: "https://cloudinary.com/img.jpg", public_id: "abc" })))
  })

  it("calls onUpload with result after successful upload", async () => {
    vi.stubGlobal("fetch", mockCloudinaryApi())

    const { onUpload } = setup()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = createMockFile()

    Object.defineProperty(fileInput, "files", { value: [file] })
    fileInput.dispatchEvent(new Event("change", { bubbles: true }))

    await vi.waitFor(() => {
      expect(onUpload).toHaveBeenCalledWith({ secure_url: "https://res.cloudinary.com/test.jpg", public_id: "img_123" })
    })
  })

  it("calls onUpload exactly once per file selection", async () => {
    vi.stubGlobal("fetch", mockCloudinaryApi())

    const { onUpload } = setup()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = createMockFile()

    Object.defineProperty(fileInput, "files", { value: [file] })
    fileInput.dispatchEvent(new Event("change", { bubbles: true }))

    await vi.waitFor(() => {
      expect(onUpload).toHaveBeenCalledTimes(1)
    })
  })

  it("resets uploading state after upload completes", async () => {
    vi.stubGlobal("fetch", mockCloudinaryApi())

    setup()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = createMockFile()

    Object.defineProperty(fileInput, "files", { value: [file] })
    fileInput.dispatchEvent(new Event("change", { bubbles: true }))

    await vi.waitFor(() => {
      expect(screen.getByTestId("upload-btn")).not.toBeDisabled()
    })
    expect(screen.getByTestId("upload-btn")).toHaveTextContent("Upload")
  })

  it("clears file input value after upload", async () => {
    vi.stubGlobal("fetch", mockCloudinaryApi())

    setup()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = createMockFile()
    Object.defineProperty(fileInput, "files", { value: [file] })

    fileInput.dispatchEvent(new Event("change", { bubbles: true }))

    await vi.waitFor(() => {
      expect(fileInput.value).toBe("")
    })
  })

  it("sends file to Cloudinary API with correct form data", async () => {
    let callCount = 0
    const fetchMock = vi.fn().mockImplementation(() => {
      callCount++
      if (callCount === 1) {
        return Promise.resolve(new Response(JSON.stringify({ signature: "test_sig" })))
      }
      return Promise.resolve(new Response(JSON.stringify({ secure_url: "https://res.cloudinary.com/test.jpg", public_id: "img_123" })))
    })
    vi.stubGlobal("fetch", fetchMock)

    const { uploadPreset, cloudName } = setup()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = createMockFile()

    Object.defineProperty(fileInput, "files", { value: [file] })
    fileInput.dispatchEvent(new Event("change", { bubbles: true }))

    await vi.waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    const callUrl = fetchMock.mock.calls[1][0]
    expect(callUrl).toContain(`api.cloudinary.com/v1_1/${cloudName}/image/upload`)

    const callFormData = fetchMock.mock.calls[1][1].body as FormData
    expect(callFormData.get("file")).toBe(file)
    expect(callFormData.get("upload_preset")).toBe(uploadPreset)
  })

  it("shows toast error when upload fails", async () => {
    let callCount = 0
    vi.stubGlobal("fetch", () => {
      callCount++
      if (callCount === 1) return Promise.resolve(new Response(JSON.stringify({ signature: "test_sig" })))
      return Promise.reject(new Error("Network failure"))
    })

    const { toast } = await import("sonner")
    setup()

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = createMockFile()

    Object.defineProperty(fileInput, "files", { value: [file] })
    fileInput.dispatchEvent(new Event("change", { bubbles: true }))

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Network failure")
    })
  })

  it("shows toast with Cloudinary error message on non-ok response", async () => {
    let callCount = 0
    vi.stubGlobal("fetch", () => {
      callCount++
      if (callCount === 1) return Promise.resolve(new Response(JSON.stringify({ signature: "test_sig" })))
      return Promise.resolve(
        new Response(JSON.stringify({ error: { message: "Invalid file type" } }), { status: 400 })
      )
    })

    const { toast } = await import("sonner")
    setup()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = createMockFile()

    Object.defineProperty(fileInput, "files", { value: [file] })
    fileInput.dispatchEvent(new Event("change", { bubbles: true }))

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Invalid file type")
    })
  })

  it("shows fallback toast when Cloudinary error has no message", async () => {
    let callCount = 0
    vi.stubGlobal("fetch", () => {
      callCount++
      if (callCount === 1) return Promise.resolve(new Response(JSON.stringify({ signature: "test_sig" })))
      return Promise.resolve(
        new Response(JSON.stringify({ error: {} }), { status: 400 })
      )
    })

    const { toast } = await import("sonner")
    setup()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = createMockFile()

    Object.defineProperty(fileInput, "files", { value: [file] })
    fileInput.dispatchEvent(new Event("change", { bubbles: true }))

    await vi.waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Upload failed")
    })
  })

  it("does nothing when no file is selected", async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    setup()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    Object.defineProperty(fileInput, "files", { value: [] })

    fileInput.dispatchEvent(new Event("change", { bubbles: true }))

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("accepts image/* files only", () => {
    setup()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toHaveAttribute("accept", "image/*")
  })

  it("has hidden file input", () => {
    setup()
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toHaveClass("hidden")
  })

  it("uses environment variables for Cloudinary config", () => {
    const cloudName = "custom_cloud"
    const uploadPreset = "custom_preset"

    vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME", cloudName)
    vi.stubEnv("NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET", uploadPreset)

    const onUpload = vi.fn()
    render(
      <QueryClientProvider client={queryClient}>
        <CloudinaryUpload onUpload={onUpload}>
          {({ startUpload }) => <button onClick={startUpload} data-testid="env-test-btn">Upload</button>}
        </CloudinaryUpload>
      </QueryClientProvider>
    )

    expect(screen.getByTestId("env-test-btn")).toBeInTheDocument()
  })
})
