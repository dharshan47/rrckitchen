import { render } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DeliveryPersonLocationBroadcaster } from "@/components/delivery-partner/location-broadcaster"

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

function mockGeolocation() {
  const clearWatch = vi.fn()
  const watchPosition = vi.fn(
    (success: (pos: GeolocationPosition) => void, error?: (err: GeolocationPositionError) => void) => {
      void success
      void error
      return 1
    }
  )
  vi.stubGlobal("navigator", {
    ...window.navigator,
    geolocation: {
      watchPosition,
      clearWatch,
      getCurrentPosition: vi.fn(),
    },
  })
  return { watchPosition, clearWatch }
}

describe("DeliveryPersonLocationBroadcaster", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it("renders nothing", () => {
    const { container } = render(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={false} />,
      { wrapper: createWrapper() }
    )
    expect(container.textContent).toBe("")
  })

  it("does not call geolocation when disabled", () => {
    const { watchPosition } = mockGeolocation()
    render(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={false} />,
      { wrapper: createWrapper() }
    )
    expect(watchPosition).not.toHaveBeenCalled()
  })

  it("starts watchPosition when enabled", () => {
    const { watchPosition } = mockGeolocation()
    render(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={true} />,
      { wrapper: createWrapper() }
    )
    expect(watchPosition).toHaveBeenCalled()
  })

  it("clears the watcher when enabled changes to false", () => {
    const { clearWatch } = mockGeolocation()
    const { rerender } = render(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={true} />,
      { wrapper: createWrapper() }
    )
    rerender(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={false} />
    )
    expect(clearWatch).toHaveBeenCalledWith(1)
  })

  it("handles geolocation error gracefully", () => {
    const { watchPosition } = mockGeolocation()
    watchPosition.mockImplementation((success, error) => {
      void success
      error?.({ code: 1, message: "Permission denied" } as GeolocationPositionError)
      return 1
    })
    render(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={true} />,
      { wrapper: createWrapper() }
    )
  })})
