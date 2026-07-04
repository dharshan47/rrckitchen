"use client"

import { useState, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
} from "@/components/ui"
import { MapPin, Search, Crosshair, ChevronLeft, AlertTriangle, Loader2, LocateFixed } from "lucide-react"
import { useMenuActions } from "@/stores"
import { GoogleMapsProvider, THANJAVUR_LAT, THANJAVUR_LNG } from "./google-maps-provider"
import { LocationAutocomplete } from "./location-autocomplete"
import { Map, Marker, useMap, useApiIsLoaded } from "@vis.gl/react-google-maps"

type LocationStep = "main" | "add-address" | "select-location"

interface LocationDialogProps {
  open: boolean
  onClose: () => void
}

const THANJAVUR_CENTER = { lat: THANJAVUR_LAT, lng: THANJAVUR_LNG }

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function isLocationServiceable(lat: number, lng: number): boolean {
  const SERVICEABLE_RADIUS_KM = 20
  const dist = haversineKm(lat, lng, THANJAVUR_LAT, THANJAVUR_LNG)
  return dist <= SERVICEABLE_RADIUS_KM
}

export function LocationDialog({ open, onClose }: LocationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose() }}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
        <GoogleMapsProvider>
          <LocationDialogInner onClose={onClose} />
        </GoogleMapsProvider>
      </DialogContent>
    </Dialog>
  )
}

function LocationDialogInner({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState<LocationStep>("main")
  const [serviceabilityError, setServiceabilityError] = useState("")
  const [geocodingBusy, setGeocodingBusy] = useState(false)
  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedPlaceName, setSelectedPlaceName] = useState("")
  const setDeliveryAddress = useMenuActions().setDeliveryAddress

  const clearError = useCallback(() => setServiceabilityError(""), [])

  const handleBack = useCallback(() => {
    clearError()
    if (step === "add-address") setStep("main")
    else if (step === "select-location") setStep("add-address")
  }, [step, clearError])

  const handleAddNewAddress = useCallback(() => {
    clearError()
    setStep("add-address")
  }, [clearError])

  const handleSelectLocation = useCallback(() => {
    clearError()
    setStep("select-location")
  }, [clearError])

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setServiceabilityError("Geolocation is not supported by your browser.")
      return
    }
    setGeocodingBusy(true)
    setServiceabilityError("")
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeocodingBusy(false)
        const { latitude, longitude } = pos.coords
        if (!isLocationServiceable(latitude, longitude)) {
          setServiceabilityError("We are not serviceable at this location. Please select a different location.")
          return
        }
        setDeliveryAddress("Current Location")
        onClose()
      },
      () => {
        setGeocodingBusy(false)
        setServiceabilityError("Unable to retrieve your location. Please enable location permissions or search for an address.")
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [onClose, setDeliveryAddress])

  const handlePlaceFromAutocomplete = useCallback(
    (place: { name: string; address: string; lat: number; lng: number }) => {
      clearError()
      if (!isLocationServiceable(place.lat, place.lng)) {
        setServiceabilityError("We are not serviceable at this location. Please select a location within Thanjavur.")
        return
      }
      setSelectedPos({ lat: place.lat, lng: place.lng })
      setSelectedPlaceName(place.name)
      setDeliveryAddress(place.name)
      onClose()
    },
    [clearError, setDeliveryAddress, onClose]
  )

  const handleDialogClose = useCallback(
    (open: boolean) => {
      if (!open) {
        setStep("main")
        setServiceabilityError("")
        setGeocodingBusy(false)
        setSelectedPos(null)
        setSelectedPlaceName("")
        onClose()
      }
    },
    [onClose]
  )

  return (
    <>
      <div className="flex items-center gap-3 px-6 pt-6 pb-3 border-b border-border shrink-0">
        {step !== "main" && (
          <button
            onClick={handleBack}
            className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors -ml-1"
          >
            <ChevronLeft className="h-5 w-5 text-foreground" />
          </button>
        )}
        <DialogTitle className="text-lg font-bold">
          {step === "main" && "Your Location"}
          {step === "add-address" && "Add New Address"}
          {step === "select-location" && "Select a delivery location"}
        </DialogTitle>
      </div>

      <div className="overflow-y-auto flex-1">
        {serviceabilityError && (
          <div className="mx-6 mt-4 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4">
            <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-700">Location not serviceable</p>
              <p className="text-xs text-red-600 mt-1 leading-5">{serviceabilityError}</p>
            </div>
          </div>
        )}

        {step === "main" && (
          <MainView
            onAddNewAddress={handleAddNewAddress}
            onUseCurrentLocation={handleUseCurrentLocation}
            geocodingBusy={geocodingBusy}
            onPlaceSelected={handlePlaceFromAutocomplete}
          />
        )}

        {step === "add-address" && (
          <AddAddressView
            onSelectLocation={handleSelectLocation}
            onPlaceSelected={handlePlaceFromAutocomplete}
            selectedPos={selectedPos}
          />
        )}

        {step === "select-location" && (
          <SelectLocationView
            onPlaceSelected={handlePlaceFromAutocomplete}
            onUseCurrentLocation={handleUseCurrentLocation}
            geocodingBusy={geocodingBusy}
          />
        )}
      </div>
    </>
  )
}

function MainView({
  onAddNewAddress,
  onUseCurrentLocation,
  geocodingBusy,
  onPlaceSelected,
}: {
  onAddNewAddress: () => void
  onUseCurrentLocation: () => void
  geocodingBusy: boolean
  onPlaceSelected: (place: { name: string; address: string; lat: number; lng: number }) => void
}) {
  return (
    <div className="p-6 space-y-5">
      <LocationAutocomplete
        placeholder="Search a location in Thanjavur"
        onPlaceSelect={onPlaceSelected}
      />

      <button
        onClick={onUseCurrentLocation}
        disabled={geocodingBusy}
        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {geocodingBusy ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <Crosshair className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">
            {geocodingBusy ? "Detecting location..." : "Use My Current Location"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5 leading-5">
            Allow location access to get accurate delivery estimates and nearby kitchen suggestions.
          </p>
        </div>
        <span
          className={`inline-flex items-center justify-center gap-1.5 rounded-full border border-transparent bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-xs shrink-0 ${
            geocodingBusy ? "opacity-50" : ""
          }`}
        >
          {geocodingBusy ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="h-4 w-4" />
          )}
          {geocodingBusy ? "Detecting..." : "Enable"}
        </span>
      </button>

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <button
        onClick={onAddNewAddress}
        className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-primary/40 hover:border-primary/80 transition-colors text-left group"
      >
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
          <MapPin className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-primary">Add New Address</p>
          <p className="text-xs text-muted-foreground mt-0.5">Enter a new delivery location</p>
        </div>
      </button>
    </div>
  )
}

function AddAddressView({
  onSelectLocation,
  onPlaceSelected,
  selectedPos,
}: {
  onSelectLocation: () => void
  onPlaceSelected: (place: { name: string; address: string; lat: number; lng: number }) => void
  selectedPos: { lat: number; lng: number } | null
}) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="p-6 space-y-5">
      <LocationAutocomplete
        placeholder="Search a location in Thanjavur"
        onPlaceSelect={onPlaceSelected}
      />

      <div className="rounded-xl overflow-hidden border border-border relative">
        <div className="relative w-full h-48 bg-muted">
          <Map
            defaultZoom={14}
            defaultCenter={THANJAVUR_CENTER}
            mapId="thanjavur_map"
            gestureHandling="greedy"
            disableDefaultUI={false}
            style={{ width: "100%", height: "100%" }}
          >
            {selectedPos && <Marker position={selectedPos} />}
            <MapPinDrop />
          </Map>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <MapPin className="h-3.5 w-3.5" />
        Search for a location above or drag the map
      </p>

      <div className="rounded-xl bg-muted/50 p-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <MapPin className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Order will be delivered here</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {searchQuery || "Thanjavur, Tamil Nadu"}
          </p>
        </div>
      </div>

      <Button
        onClick={onSelectLocation}
        className="w-full rounded-full h-12"
        size="default"
      >
        <MapPin className="h-4 w-4 mr-2" />
        Select a delivery location
      </Button>
    </div>
  )
}

function MapPinDrop() {
  const map = useMap()
  const isLoaded = useApiIsLoaded()

  if (!map || !isLoaded) return null

  const center = map.getCenter()
  if (!center) return null

  return <Marker position={{ lat: center.lat(), lng: center.lng() }} />
}

function SelectLocationView({
  onPlaceSelected,
  onUseCurrentLocation,
  geocodingBusy,
}: {
  onPlaceSelected: (place: { name: string; address: string; lat: number; lng: number }) => void
  onUseCurrentLocation: () => void
  geocodingBusy: boolean
}) {
  return (
    <div className="p-6 space-y-5">
      <LocationAutocomplete
        placeholder="Search Location in Thanjavur"
        onPlaceSelect={onPlaceSelected}
      />

      <button
        onClick={onUseCurrentLocation}
        disabled={geocodingBusy}
        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-muted/50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {geocodingBusy ? (
            <Loader2 className="h-5 w-5 text-primary animate-spin" />
          ) : (
            <Crosshair className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-foreground">
            {geocodingBusy ? "Detecting location..." : "Current Location"}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {geocodingBusy ? "Please wait..." : "Use your current location"}
          </p>
        </div>
        {!geocodingBusy && (
          <span className="inline-flex items-center justify-center gap-1.5 rounded-full border border-transparent bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground shadow-xs shrink-0">
            <LocateFixed className="h-4 w-4" />
            Enable
          </span>
        )}
      </button>

      <div className="rounded-xl overflow-hidden border border-border">
        <Map
          defaultZoom={14}
          defaultCenter={THANJAVUR_CENTER}
          mapId="thanjavur_map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          style={{ width: "100%", height: "200px" }}
        />
      </div>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <MapPin className="h-3.5 w-3.5" />
        Search for a Thanjavur location above
      </p>
    </div>
  )
}
