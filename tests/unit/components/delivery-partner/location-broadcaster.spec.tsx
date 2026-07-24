import { render } from "@testing-library/react"
import { describe, expect, it, vi, beforeEach } from "vitest"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { DeliveryPersonLocationBroadcaster } from "@/components/delivery-partner/location-broadcaster"

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
}

describe("DeliveryPersonLocationBroadcaster", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  it("renders nothing", () => {
    const { container } = render(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={false} />,
      { wrapper: createWrapper() }
    )
    expect(container.textContent).toBe("")
  })

  it("does not call geolocation when disabled", () => {
    const geoSpy = vi.spyOn(navigator.geolocation, "getCurrentPosition")
    render(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={false} />,
      { wrapper: createWrapper() }
    )
    expect(geoSpy).not.toHaveBeenCalled()
  })

  it("calls geolocation when enabled", () => {
    const geoSpy = vi.spyOn(navigator.geolocation, "getCurrentPosition").mockImplementation((success) => {
      success({ coords: { latitude: 10.78, longitude: 79.13 } } as GeolocationPosition)
    })
    render(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={true} />,
      { wrapper: createWrapper() }
    )
    expect(geoSpy).toHaveBeenCalled()
  })

  it("sets up interval for periodic location sending", () => {
    const setIntervalSpy = vi.spyOn(global, "setInterval")
    vi.spyOn(navigator.geolocation, "getCurrentPosition").mockImplementation((success) => {
      success({ coords: { latitude: 10.78, longitude: 79.13 } } as GeolocationPosition)
    })
    render(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={true} />,
      { wrapper: createWrapper() }
    )
    expect(setIntervalSpy).toHaveBeenCalled()
  })

  it("clears interval when enabled changes to false", () => {
    const clearIntervalSpy = vi.spyOn(global, "clearInterval")
    vi.spyOn(navigator.geolocation, "getCurrentPosition").mockImplementation((success) => {
      success({ coords: { latitude: 10.78, longitude: 79.13 } } as GeolocationPosition)
    })
    const { rerender } = render(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={true} />,
      { wrapper: createWrapper() }
    )
    rerender(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={false} />
    )
    expect(clearIntervalSpy).toHaveBeenCalled()
  })

  it("handles geolocation error gracefully", () => {
    vi.spyOn(navigator.geolocation, "getCurrentPosition").mockImplementation((_success, error) => {
      error?.({ code: 1, message: "Permission denied" } as GeolocationPositionError)
    })
    render(
      <DeliveryPersonLocationBroadcaster deliveryPersonId="dp1" orderId="order1" enabled={true} />,
      { wrapper: createWrapper() }
    )
  })
})
