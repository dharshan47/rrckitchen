"use client"

import { useCallback, useEffect } from "react"
import dynamic from "next/dynamic"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { MapPin, Crosshair, ChevronLeft, AlertTriangle, Loader2, LocateFixed } from "lucide-react"
import { useMenuActions } from "@/stores"
import {
  useLocationDialogStep,
  useLocationDialogError,
  useLocationDialogBusy,
  useLocationDialogSelectedPos,
  useLocationDialogMapPicked,
  useLocationDialogActions,
  useReverseGeocodeMutation,
  locationDialogStore,
} from "@/stores/locationDialogStore"
import { THANJAVUR_CENTER } from "@/lib/geo/thanjavur-bounds"
import { LocationAutocomplete } from "./location-autocomplete"

const ThanjavurMap = dynamic(
  () => import("@/components/map/thanjavur-map").then((m) => m.ThanjavurMap),
  { ssr: false }
)

interface LocationDialogProps {
  open: boolean
  onClose: () => void
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function isServiceable(lat: number, lng: number): boolean {
  const RADIUS_KM = 20
  return haversineKm(lat, lng, THANJAVUR_CENTER[0], THANJAVUR_CENTER[1]) <= RADIUS_KM
}

export function LocationDialog({ open, onClose }: LocationDialogProps) {
  useEffect(() => {
    if (open) {
      locationDialogStore.getState().resetDialog()
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden flex flex-col max-h-[90vh]">
        <LocationDialogInner onClose={onClose} />
      </DialogContent>
    </Dialog>
  )
}

function LocationDialogInner({ onClose }: { onClose: () => void }) {
  const step = useLocationDialogStep()
  const error = useLocationDialogError()
  const busy = useLocationDialogBusy()
  const selectedPos = useLocationDialogSelectedPos()
  const mapPicked = useLocationDialogMapPicked()
  const actions = useLocationDialogActions()
  const setDeliveryAddress = useMenuActions().setDeliveryAddress

  const clearError = useCallback(() => actions.setError(""), [actions])

  const reverseGeocode = useReverseGeocodeMutation()

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      actions.setError("Geolocation is not supported by your browser. Please search for an address above.")
      return
    }
    actions.setBusy(true)
    actions.setError("")
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        if (!isServiceable(latitude, longitude)) {
          actions.setBusy(false)
          actions.setError("We are not serviceable at this location. Please select a different location.")
          return
        }
        try {
          const displayName = await reverseGeocode.mutateAsync({ lat: latitude, lng: longitude })
          setDeliveryAddress(displayName ?? `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        } catch {
          setDeliveryAddress(`Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)
        } finally {
          actions.setBusy(false)
          onClose()
        }
      },
      (err) => {
        actions.setBusy(false)
        if (err.code === err.PERMISSION_DENIED) {
          actions.setError("Location permission denied. Please allow location access in your browser settings, or search for an address above.")
        } else {
          actions.setError("Unable to retrieve your location. Please enable location permissions or search for an address.")
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [onClose, setDeliveryAddress, reverseGeocode, actions])

  const handlePlaceFromAutocomplete = useCallback(
    (place: { name: string; address: string; lat: number; lng: number }) => {
      clearError()
      if (!isServiceable(place.lat, place.lng)) {
        actions.setError("We are not serviceable at this location. Please select a location within Thanjavur.")
        return
      }
      actions.setSelectedPos({ lat: place.lat, lng: place.lng })
      setDeliveryAddress(place.name)
      onClose()
    },
    [clearError, setDeliveryAddress, onClose, actions]
  )

  const handleMapSelect = useCallback(
    (lat: number, lng: number) => {
      actions.setSelectedPos({ lat, lng })
      actions.setMapPicked(true)
      clearError()
    },
    [actions, clearError]
  )

  const handleConfirmMapLocation = useCallback(async () => {
    if (!selectedPos) return
    if (!isServiceable(selectedPos.lat, selectedPos.lng)) {
      actions.setError("We are not serviceable at this location. Please select a location within Thanjavur.")
      return
    }
    actions.setBusy(true)
    try {
      const displayName = await reverseGeocode.mutateAsync({ lat: selectedPos.lat, lng: selectedPos.lng })
      setDeliveryAddress(displayName ?? `Location at ${selectedPos.lat.toFixed(4)}, ${selectedPos.lng.toFixed(4)}`)
    } catch {
      setDeliveryAddress(`Location at ${selectedPos.lat.toFixed(4)}, ${selectedPos.lng.toFixed(4)}`)
    } finally {
      actions.setBusy(false)
      onClose()
    }
  }, [selectedPos, setDeliveryAddress, onClose, reverseGeocode, actions])

  return (
    <>
      <div className="flex items-center gap-3 px-6 pt-6 pb-3 border-b border-border shrink-0">
        {step !== "main" && (
          <button
            onClick={() => { actions.setStep("main"); clearError() }}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors -ml-1"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
        <DialogTitle className="text-lg font-bold">
          {step === "main" ? "Your Location" : "Select a delivery location"}
        </DialogTitle>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {error && (
          <div className="mx-6 mt-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-700">
                {error.startsWith("We are not serviceable") ? "Location not serviceable" : "Location access failed"}
              </p>
              <p className="text-xs text-red-600 mt-1 leading-5">{error}</p>
            </div>
          </div>
        )}

        {step === "main" && (
          <div className="p-6 space-y-5">
            <LocationAutocomplete
              placeholder="Search a location in Thanjavur"
              onPlaceSelect={handlePlaceFromAutocomplete}
            />

            <button
              onClick={handleUseCurrentLocation}
              disabled={busy}
              className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                {busy ? (
                  <Loader2 className="h-5 w-5 text-primary animate-spin" />
                ) : (
                  <Crosshair className="h-5 w-5 text-primary" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{busy ? "Detecting location..." : "Use My Current Location"}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-5">
                  Allow location access to get accurate delivery estimates.
                </p>
              </div>
              <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-transparent bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-xs shrink-0">
                <LocateFixed className="h-4 w-4" />
                Enable
              </span>
            </button>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={() => { actions.setStep("select-location"); clearError() }}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-primary/40 hover:border-primary/80 transition-colors text-left group"
            >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-primary">Select on Map</p>
                <p className="text-xs text-muted-foreground mt-0.5">Pick a delivery location on the map</p>
              </div>
            </button>
          </div>
        )}

        {step === "select-location" && (
            <div className="p-6 pb-0 space-y-4">
            <LocationAutocomplete
              placeholder="Search Location in Thanjavur"
              onPlaceSelect={handlePlaceFromAutocomplete}
            />
            <div className="rounded-xl overflow-hidden border border-border">
              <ThanjavurMap
                markerPosition={selectedPos ? [selectedPos.lat, selectedPos.lng] : undefined}
                height="220px"
                onLocationSelect={handleMapSelect}
                interactive={true}
              />
            </div>
            {mapPicked ? (
              <p className="text-xs text-green-600 text-center flex items-center justify-center gap-1.5 pb-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>Location selected. Tap Confirm to set.</span>
              </p>
            ) : (
              <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5 pb-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                <span>Click on the map to drop a pin or search above</span>
              </p>
            )}
          </div>
        )}
      </div>

      {step === "select-location" && (
        <div className="px-4 py-4 shrink-0 border-t border-border">
          <div className="flex gap-2">
            <button
              onClick={handleUseCurrentLocation}
              disabled={busy}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-medium hover:bg-muted/50 transition-colors disabled:opacity-50"
            >
              <LocateFixed className="h-3.5 w-3.5 shrink-0" />
              <span>{busy ? "Detecting..." : "Current Location"}</span>
            </button>
            <button
              onClick={handleConfirmMapLocation}
              disabled={!selectedPos || busy}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-primary py-2.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />
              ) : (
                <MapPin className="h-3.5 w-3.5 shrink-0" />
              )}
              <span>{busy ? "Locating..." : "Confirm Location"}</span>
            </button>
          </div>
        </div>
      )}
    </>
  )
}
