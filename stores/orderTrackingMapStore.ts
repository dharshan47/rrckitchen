import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery } from "@tanstack/react-query";

interface OrderTrackingMapState {
  livePosition: { lat: number; lng: number } | null;
  routeCoords: [number, number][];
  setLivePosition: (livePosition: { lat: number; lng: number } | null) => void;
  setRouteCoords: (routeCoords: [number, number][]) => void;
  resetTracking: () => void;
}

export const orderTrackingMapStore = create<OrderTrackingMapState>()((set) => ({
  livePosition: null,
  routeCoords: [],
  setLivePosition: (livePosition) => set({ livePosition }),
  setRouteCoords: (routeCoords) => set({ routeCoords }),
  resetTracking: () => set({ livePosition: null, routeCoords: [] }),
}));

const selectLivePosition = (s: OrderTrackingMapState) => s.livePosition;
const selectRouteCoords = (s: OrderTrackingMapState) => s.routeCoords;

export function useOrderTrackingLivePosition() {
  return orderTrackingMapStore(selectLivePosition);
}

export function useOrderTrackingRouteCoords() {
  return orderTrackingMapStore(selectRouteCoords);
}

export function useOrderTrackingMapActions() {
  return orderTrackingMapStore(
    useShallow((s) => ({
      setLivePosition: s.setLivePosition,
      setRouteCoords: s.setRouteCoords,
      resetTracking: s.resetTracking,
    }))
  );
}

/**
 * Fetches the rider's last known location from the server as a fallback
 * when no live delivery person position was passed in.
 */
export function useRiderLastLocationQuery(orderId: string, enabled: boolean) {
  return useQuery<{ lat: number; lng: number } | null>({
    queryKey: ["rider-last-location", orderId],
    queryFn: async () => {
      const res = await fetch(`/api/rider/location?orderId=${encodeURIComponent(orderId)}`)
      const data = await res.json()
      const loc = data?.location as { lat: number; lng: number } | null | undefined
      if (loc && typeof loc.lat === "number" && typeof loc.lng === "number") {
        return { lat: loc.lat, lng: loc.lng }
      }
      return null
    },
    enabled,
    refetchInterval: 15_000,
  })
}

/**
 * Fetches the road route + ETA for the current delivery position and
 * syncs the route polyline into the store.
 */
export function useRouteEtaQuery(
  deliveryPos: { lat: number; lng: number } | null,
  destLat: number,
  destLng: number
) {
  return useQuery<number | null>({
    queryKey: ["route-eta", deliveryPos?.lat, deliveryPos?.lng, destLat, destLng],
    queryFn: async () => {
      if (!deliveryPos) return null
      const res = await fetch("/api/route/road-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitchenPos: [deliveryPos.lat, deliveryPos.lng],
          customerPos: [destLat, destLng],
        }),
      })
      const data = await res.json()
      if (data.route) {
        orderTrackingMapStore.getState().setRouteCoords(data.route as [number, number][])
      }
      return data.etaMinutes ?? null
    },
    enabled: !!deliveryPos,
    refetchInterval: 30_000,
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  })
}
