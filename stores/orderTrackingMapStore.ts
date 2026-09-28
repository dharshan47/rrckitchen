import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useQuery } from "@tanstack/react-query";

interface OrderTrackingMapState {
  livePosition: { lat: number; lng: number } | null;
  routeCoords: [number, number][];
  etaMinutes: number | null;
  distanceKm: number | null;
  setLivePosition: (livePosition: { lat: number; lng: number } | null) => void;
  setRouteCoords: (routeCoords: [number, number][]) => void;
  setEtaMinutes: (etaMinutes: number | null) => void;
  setDistanceKm: (distanceKm: number | null) => void;
  resetTracking: () => void;
}

export const orderTrackingMapStore = create<OrderTrackingMapState>()((set) => ({
  livePosition: null,
  routeCoords: [],
  etaMinutes: null,
  distanceKm: null,
  setLivePosition: (livePosition) => set({ livePosition }),
  setRouteCoords: (routeCoords) => set({ routeCoords }),
  setEtaMinutes: (etaMinutes) => set({ etaMinutes }),
  setDistanceKm: (distanceKm) => set({ distanceKm }),
  resetTracking: () => set({ livePosition: null, routeCoords: [], etaMinutes: null, distanceKm: null }),
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
      setEtaMinutes: s.setEtaMinutes,
      setDistanceKm: s.setDistanceKm,
      resetTracking: s.resetTracking,
    }))
  );
}

export function useOrderTrackingEtaMinutes() {
  return orderTrackingMapStore((s) => s.etaMinutes);
}

export function useOrderTrackingDistanceKm() {
  return orderTrackingMapStore((s) => s.distanceKm);
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
  originPos: { lat: number; lng: number } | null,
  destLat: number,
  destLng: number
) {
  return useQuery<number | null>({
    queryKey: ["route-eta", originPos?.lat, originPos?.lng, destLat, destLng],
    queryFn: async () => {
      if (!originPos) return null
      const res = await fetch("/api/route/road-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kitchenPos: [originPos.lat, originPos.lng],
          customerPos: [destLat, destLng],
        }),
      })
      const data = await res.json()
      if (data.route) {
        orderTrackingMapStore.getState().setRouteCoords(data.route as [number, number][])
      }
      orderTrackingMapStore.getState().setEtaMinutes(data.etaMinutes ?? null)
      orderTrackingMapStore.getState().setDistanceKm(data.distanceKm ?? null)
      return data.etaMinutes ?? null
    },
    enabled: !!originPos,
    refetchInterval: 30_000,
    staleTime: 10_000,
    placeholderData: (prev) => prev,
  })
}
