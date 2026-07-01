"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Button,
  Input,
} from "@/components/ui";
import { MapPin, Search, Crosshair, ChevronLeft, AlertTriangle, Loader2, LocateFixed } from "lucide-react";
import { useMenuActions } from "@/stores";

type LocationStep = "main" | "add-address" | "select-location";

interface LocationDialogProps {
  open: boolean;
  onClose: () => void;
}

const THANJAVUR_LAT = 10.7867;
const THANJAVUR_LNG = 79.1378;
const SERVICEABLE_RADIUS_KM = 20;

interface ThanjavurPlace {
  name: string;
  area: string;
  lat: number;
  lng: number;
}

const thanjavurPlaces: ThanjavurPlace[] = [
  { name: "Thanjavur Palace", area: "Palace Road", lat: 10.7685, lng: 79.1329 },
  { name: "Brihadeeswarar Temple", area: "Big Temple Street", lat: 10.7828, lng: 79.1320 },
  { name: "Thanjavur Bus Stand", area: "New Bus Stand Road", lat: 10.7902, lng: 79.1385 },
  { name: "Thanjavur Junction", area: "Railway Station Road", lat: 10.7932, lng: 79.1447 },
  { name: "Medical College Hospital", area: "Medical College Road", lat: 10.7724, lng: 79.1528 },
  { name: "Srinivasam Pillai Nagar", area: "Srinivasam Pillai Nagar", lat: 10.7775, lng: 79.1240 },
  { name: "Pudukkottai Main Road", area: "Pudukkottai Main Road", lat: 10.7555, lng: 79.1378 },
  { name: "Ellaiamman Kovil Street", area: "Ellaiamman Kovil Street", lat: 10.7885, lng: 79.1480 },
  { name: "Kanjamalai Road", area: "Kanjamalai Road", lat: 10.7960, lng: 79.1180 },
  { name: "Sahadevan Nagar", area: "Sahadevan Nagar", lat: 10.7700, lng: 79.1420 },
  { name: "Thanjavur Market", area: "Market Street", lat: 10.7860, lng: 79.1360 },
  { name: "Rajappa Nagar", area: "Rajappa Nagar", lat: 10.7750, lng: 79.1300 },
  { name: "Vallam", area: "Vallam Main Road", lat: 10.7150, lng: 79.0720 },
  { name: "Kumbakonam Road", area: "Kumbakonam Road", lat: 10.8100, lng: 79.1580 },
  { name: "South Rampart", area: "South Rampart Street", lat: 10.7800, lng: 79.1340 },
];

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function isLocationServiceable(lat: number, lng: number): boolean {
  const dist = haversineKm(lat, lng, THANJAVUR_LAT, THANJAVUR_LNG);
  return dist <= SERVICEABLE_RADIUS_KM;
}

const mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=Thanjavur,Tamil+Nadu&center=${THANJAVUR_LAT},${THANJAVUR_LNG}&zoom=14`;

export function LocationDialog({ open, onClose }: LocationDialogProps) {
  const [step, setStep] = useState<LocationStep>("main");
  const [serviceabilityError, setServiceabilityError] = useState("");
  const [geocodingBusy, setGeocodingBusy] = useState(false);
  const [mainSearch, setMainSearch] = useState("");
  const setDeliveryAddress = useMenuActions().setDeliveryAddress;

  const clearError = useCallback(() => setServiceabilityError(""), []);

  const handleBack = useCallback(() => {
    clearError();
    if (step === "add-address") setStep("main");
    else if (step === "select-location") setStep("add-address");
  }, [step, clearError]);

  const handleAddNewAddress = useCallback(() => {
    clearError();
    setStep("add-address");
  }, [clearError]);

  const handleSelectLocation = useCallback(() => {
    clearError();
    setStep("select-location");
  }, [clearError]);

  const handleMainSearchSubmit = useCallback(() => {
    if (mainSearch.trim()) {
      setDeliveryAddress(mainSearch.trim());
      onClose();
    }
  }, [mainSearch, setDeliveryAddress, onClose]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setServiceabilityError("Geolocation is not supported by your browser.");
      return;
    }
    setGeocodingBusy(true);
    setServiceabilityError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeocodingBusy(false);
        const { latitude, longitude } = pos.coords;
        if (!isLocationServiceable(latitude, longitude)) {
          setServiceabilityError("We are not serviceable at this location. Please select a different location.");
          return;
        }
        setDeliveryAddress("Current Location");
        onClose();
      },
      () => {
        setGeocodingBusy(false);
        setServiceabilityError("Unable to retrieve your location. Please enable location permissions or search for an address.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [onClose, setDeliveryAddress]);

  const handlePlaceSelected = useCallback(
    (place: ThanjavurPlace) => {
      clearError();
      setDeliveryAddress(place.name);
      onClose();
    },
    [clearError, setDeliveryAddress, onClose]
  );

  const handleDialogClose = useCallback(
    (open: boolean) => {
      if (!open) {
        setStep("main");
        setServiceabilityError("");
        setGeocodingBusy(false);
        setMainSearch("");
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden max-h-[90vh] flex flex-col">
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
              searchValue={mainSearch}
              onSearchChange={setMainSearch}
              onSearchSubmit={handleMainSearchSubmit}
              onAddNewAddress={handleAddNewAddress}
              onUseCurrentLocation={handleUseCurrentLocation}
              geocodingBusy={geocodingBusy}
            />
          )}

          {step === "add-address" && (
            <AddAddressView onSelectLocation={handleSelectLocation} />
          )}

          {step === "select-location" && (
            <SelectLocationView
              onClose={onClose}
              onPlaceSelected={handlePlaceSelected}
              onUseCurrentLocation={handleUseCurrentLocation}
              geocodingBusy={geocodingBusy}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MainView({
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onAddNewAddress,
  onUseCurrentLocation,
  geocodingBusy,
}: {
  searchValue: string;
  onSearchChange: (val: string) => void;
  onSearchSubmit: () => void;
  onAddNewAddress: () => void;
  onUseCurrentLocation: () => void;
  geocodingBusy: boolean;
}) {
  return (
    <div className="p-6 space-y-5">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") onSearchSubmit(); }}
          placeholder="Search a new address"
          className="w-full h-12 pl-11 pr-4 bg-secondary border-none rounded-xl text-sm"
        />
      </div>

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
  );
}

function AddAddressView({
  onSelectLocation,
}: {
  onSelectLocation: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 space-y-5">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search a new address"
          className="w-full h-12 pl-11 pr-4 bg-secondary border-none rounded-xl text-sm"
        />
      </div>

      <div className="rounded-xl overflow-hidden border border-border relative">
        <div className="relative w-full h-48 bg-muted">
          <iframe
            title="Thanjavur Map"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            src={mapUrl}
          />
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center -translate-y-4">
              <MapPin className="h-10 w-10 text-primary drop-shadow-lg" />
              <span className="text-[10px] font-bold text-primary mt-0.5 bg-background/80 px-2 py-0.5 rounded-full">
                Your Location
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1.5">
        <MapPin className="h-3.5 w-3.5" />
        Place the pin to your exact location by dragging the map
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
  );
}

function SelectLocationView({
  onPlaceSelected,
  onUseCurrentLocation,
  geocodingBusy,
}: {
  onClose: () => void;
  onPlaceSelected: (place: ThanjavurPlace) => void;
  onUseCurrentLocation: () => void;
  geocodingBusy: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPlaces = thanjavurPlaces.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 space-y-5">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Location"
          className="w-full h-12 pl-11 pr-4 bg-secondary border-none rounded-xl text-sm"
        />
      </div>

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
        <iframe
          title="Select Location Map"
          width="100%"
          height="200"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
        />
      </div>

      <div className="space-y-1 max-h-48 overflow-y-auto">
        {searchQuery && filteredPlaces.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm font-medium text-muted-foreground">
              No locations found in Thanjavur
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1 max-w-xs">
              We currently service only Thanjavur and surrounding areas. Try searching for a Thanjavur location.
            </p>
          </div>
        ) : (
          (searchQuery ? filteredPlaces : thanjavurPlaces).map((place) => (
            <button
              key={place.name}
              onClick={() => onPlaceSelected(place)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground truncate">{place.name}</p>
                <p className="text-xs text-muted-foreground truncate">{place.area}</p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
