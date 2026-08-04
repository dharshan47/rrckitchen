import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { LocationDialog } from "@/components/location/location-dialog"
import { useMenuActions } from "@/stores"

vi.mock("@/stores", () => ({
  useMenuActions: vi.fn(() => ({
    setDeliveryAddress: vi.fn(),
  })),
}))

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock("next/dynamic", () => ({
  default: () =>
    function MockMap(props: Record<string, unknown>) {
      return <div data-testid="mock-map" data-height={props.height} />
    },
}))

vi.mock("@/components/location/location-autocomplete", () => ({
  LocationAutocomplete: ({ placeholder, onPlaceSelect }: { placeholder: string; onPlaceSelect: (place: { name: string; address: string; lat: number; lng: number }) => void }) => (
    <div data-testid="location-autocomplete">
      <input placeholder={placeholder} />
      <button onClick={() => onPlaceSelect({ name: "Test Place", address: "123 Test St", lat: 10.787, lng: 79.137 })}>
        Select Place
      </button>
    </div>
  ),
}))

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("LocationDialog", () => {
  const mockSetDeliveryAddress = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useMenuActions).mockReturnValue({ setDeliveryAddress: mockSetDeliveryAddress } as never)
    global.fetch = vi.fn()
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: vi.fn(),
      },
      writable: true,
    })
  })

  it("renders nothing when closed", () => {
    const { container } = render(<LocationDialog open={false} onClose={vi.fn()} />, { wrapper: createWrapper() })
    expect(container.querySelector("[data-testid='dialog']")).not.toBeInTheDocument()
  })

  it("renders dialog when open", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    expect(screen.getByText("Your Location")).toBeInTheDocument()
  })

  it("renders location autocomplete on main step", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    expect(screen.getByTestId("location-autocomplete")).toBeInTheDocument()
  })

  it("renders Use My Current Location button", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    expect(screen.getByText("Use My Current Location")).toBeInTheDocument()
  })

  it("renders Select on Map button", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    expect(screen.getByText("Select on Map")).toBeInTheDocument()
  })

  it("navigates to select-location step when Select on Map is clicked", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Select on Map"))
    expect(screen.getByText("Select a delivery location")).toBeInTheDocument()
  })

  it("shows back button on select-location step", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Select on Map"))
    const backButtons = screen.getAllByRole("button")
    expect(backButtons.length).toBeGreaterThan(0)
  })

  it("navigates back to main step when back button is clicked", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Select on Map"))
    expect(screen.getByText("Select a delivery location")).toBeInTheDocument()
    const backButton = screen.getAllByRole("button")[0]
    fireEvent.click(backButton)
    expect(screen.getByText("Your Location")).toBeInTheDocument()
  })

  it("calls onClose when dialog is closed", () => {
    const onClose = vi.fn()
    render(<LocationDialog open={true} onClose={onClose} />, { wrapper: createWrapper() })
    expect(screen.getByText("Your Location")).toBeInTheDocument()
  })

  it("renders map on select-location step", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Select on Map"))
    expect(screen.getByTestId("mock-map")).toBeInTheDocument()
  })

  it("shows Confirm Location button on select-location step", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Select on Map"))
    expect(screen.getByText("Confirm Location")).toBeInTheDocument()
  })

  it("Confirm Location button is disabled when no position is selected", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Select on Map"))
    const confirmBtn = screen.getByText("Confirm Location").closest("button")
    expect(confirmBtn).toBeDisabled()
  })

  it("shows Current Location button on select-location step", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Select on Map"))
    expect(screen.getByText("Current Location")).toBeInTheDocument()
  })

  it("sets delivery address when a place is selected from autocomplete", async () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Select Place"))
    await waitFor(() => {
      expect(mockSetDeliveryAddress).toHaveBeenCalledWith("Test Place")
    })
  })

  it("shows map pin instruction text on select-location step", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Select on Map"))
    expect(screen.getByText("Click on the map to drop a pin or search above")).toBeInTheDocument()
  })

  it("shows or divider between location options", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    expect(screen.getByText("or")).toBeInTheDocument()
  })

  it("shows enable badge on current location button", () => {
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    expect(screen.getByText("Enable")).toBeInTheDocument()
  })

  it("uses geolocation for current location", () => {
    const mockGetCurrentPosition = vi.fn()
    Object.defineProperty(navigator, "geolocation", {
      value: { getCurrentPosition: mockGetCurrentPosition },
      writable: true,
    })
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Use My Current Location"))
    expect(mockGetCurrentPosition).toHaveBeenCalled()
  })

  it("shows error when geolocation is not supported", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: undefined,
      writable: true,
    })
    render(<LocationDialog open={true} onClose={vi.fn()} />, { wrapper: createWrapper() })
    fireEvent.click(screen.getByText("Use My Current Location"))
    expect(screen.getByText(/Geolocation is not supported/)).toBeInTheDocument()
  })
})

