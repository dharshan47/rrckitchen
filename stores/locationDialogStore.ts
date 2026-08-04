import { create } from "zustand";
import { useShallow } from "zustand/react/shallow";
import { useMutation } from "@tanstack/react-query";

export type LocationStep = "main" | "select-location";

/**
 * Reverse geocodes lat/lng to a display name via TanStack Query.
 */
export function useReverseGeocodeMutation() {
  return useMutation({
    mutationFn: async ({ lat, lng }: { lat: number; lng: number }) => {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}`)
      if (res.ok) {
        const data = await res.json()
        return (data?.display_name as string) ?? null
      }
      return null
    },
  })
}

interface LocationDialogState {
  step: LocationStep;
  error: string;
  busy: boolean;
  selectedPos: { lat: number; lng: number } | null;
  mapPicked: boolean;
  setStep: (step: LocationStep) => void;
  setError: (error: string) => void;
  setBusy: (busy: boolean) => void;
  setSelectedPos: (selectedPos: { lat: number; lng: number } | null) => void;
  setMapPicked: (mapPicked: boolean) => void;
  resetDialog: () => void;
}

export const locationDialogStore = create<LocationDialogState>()((set) => ({
  step: "main",
  error: "",
  busy: false,
  selectedPos: null,
  mapPicked: false,
  setStep: (step) => set({ step }),
  setError: (error) => set({ error }),
  setBusy: (busy) => set({ busy }),
  setSelectedPos: (selectedPos) => set({ selectedPos }),
  setMapPicked: (mapPicked) => set({ mapPicked }),
  resetDialog: () =>
    set({ step: "main", error: "", busy: false, selectedPos: null, mapPicked: false }),
}));

const selectStep = (s: LocationDialogState) => s.step;
const selectError = (s: LocationDialogState) => s.error;
const selectBusy = (s: LocationDialogState) => s.busy;
const selectSelectedPos = (s: LocationDialogState) => s.selectedPos;
const selectMapPicked = (s: LocationDialogState) => s.mapPicked;

export function useLocationDialogStep() {
  return locationDialogStore(selectStep);
}

export function useLocationDialogError() {
  return locationDialogStore(selectError);
}

export function useLocationDialogBusy() {
  return locationDialogStore(selectBusy);
}

export function useLocationDialogSelectedPos() {
  return locationDialogStore(selectSelectedPos);
}

export function useLocationDialogMapPicked() {
  return locationDialogStore(selectMapPicked);
}

export function useLocationDialogActions() {
  return locationDialogStore(
    useShallow((s) => ({
      setStep: s.setStep,
      setError: s.setError,
      setBusy: s.setBusy,
      setSelectedPos: s.setSelectedPos,
      setMapPicked: s.setMapPicked,
      resetDialog: s.resetDialog,
    }))
  );
}
