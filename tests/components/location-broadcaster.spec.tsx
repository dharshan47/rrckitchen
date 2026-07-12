import { act, render } from "@testing-library/react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { DeliveryPersonLocationBroadcaster } from "@/components/delivery-partner/location-broadcaster"

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
})

function setup({ deliveryPersonId = "dp_1", orderId = "ord_1", enabled = false } = {}) {
  return render(
    <QueryClientProvider client={queryClient}>
      <DeliveryPersonLocationBroadcaster deliveryPersonId={deliveryPersonId} orderId={orderId} enabled={enabled} />
    </QueryClientProvider>
  )
}

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true })
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }))
  Object.assign(navigator, {
    geolocation: {
      getCurrentPosition: vi.fn((success: PositionCallback) => {
        success({
          coords: { latitude: 12.34, longitude: 56.78, accuracy: 10, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
          timestamp: Date.now(),
        } as GeolocationPosition)
      }),
    },
  })
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe("DeliveryPersonLocationBroadcaster", () => {
  it("renders nothing", () => {
    const { container } = setup()
    expect(container.innerHTML).toBe("")
  })

  it("does not start polling when disabled", () => {
    setup()
    expect(navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled()
  })

  it("starts polling when enabled", () => {
    setup({ enabled: true })
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)
  })

  it("calls fetch with location payload on each interval tick", async () => {
    setup({ enabled: true })
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)

    await act(async () => { await vi.advanceTimersByTimeAsync(8000) })
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(2)

    await act(async () => { await vi.advanceTimersByTimeAsync(8000) })
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(3)
  })

  it("clears interval when enabled changes to false", () => {
    const { rerender } = setup({ enabled: true })
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(1)

    rerender(
      <QueryClientProvider client={queryClient}>
        <DeliveryPersonLocationBroadcaster deliveryPersonId="dp_1" orderId="ord_1" enabled={false} />
      </QueryClientProvider>
    )

    const callCount = (navigator.geolocation.getCurrentPosition as ReturnType<typeof vi.fn>).mock.calls.length
    act(() => { vi.advanceTimersByTime(16000) })
    expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledTimes(callCount)
  })
})
