"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  MapPin, Plus, Home, Briefcase, MoreHorizontal, Loader2, ChevronRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useMenuDeliveryAddress, useMenuActions } from "@/stores";
import { addAddress } from "@/actions/cart-checkout/address";

const Map = dynamic(
  () => import("@/components/map/thanjavur-map").then((m) => m.ThanjavurMap),
  { ssr: false },
);

const LABEL_OPTIONS = [
  { value: "HOME", icon: Home },
  { value: "WORK", icon: Briefcase },
  { value: "OTHERS", icon: MoreHorizontal },
] as const;

export function DeliveryAddressCard() {
  const deliveryAddress = useMenuDeliveryAddress();
  const { setDeliveryAddress } = useMenuActions();
  const [open, setOpen] = useState(false);

  const [selectedLat, setSelectedLat] = useState<number | null>(null);
  const [selectedLng, setSelectedLng] = useState<number | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [geocoding, setGeocoding] = useState(false);

  const [doorNo, setDoorNo] = useState("");
  const [area, setArea] = useState("");
  const [landmark, setLandmark] = useState("");
  const [label, setLabel] = useState("HOME");
  const [customLabel, setCustomLabel] = useState("");
  const [saving, setSaving] = useState(false);

  const handleMapSelect = useCallback(async (lat: number, lng: number) => {
    setSelectedLat(lat);
    setSelectedLng(lng);
    setGeocoding(true);
    try {
      const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lng}`);
      if (res.ok) {
        const data = await res.json();
        setSelectedAddress(
          data.display_name || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        );
      } else {
        setSelectedAddress(`Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      }
    } catch {
      setSelectedAddress(`Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
    } finally {
      setGeocoding(false);
    }
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedAddress) return;
    setSaving(true);
    try {
      const parts = [doorNo, area, landmark].filter(Boolean);
      const fullAddress = [...parts, selectedAddress].join(", ");
      setDeliveryAddress(fullAddress);

      try {
        const pincode = selectedAddress.match(/\b\d{6}\b/)?.[0] ?? "612001";
        await addAddress({
          label: label === "OTHERS" ? customLabel || "Other" : label,
          lineOne: [doorNo, area].filter(Boolean).join(", "),
          lineTwo: landmark || undefined,
          pincode,
        });
      } catch {
        // server save is best-effort
      }

      setOpen(false);
      resetForm();
    } finally {
      setSaving(false);
    }
  }, [doorNo, area, landmark, selectedAddress, label, customLabel, setDeliveryAddress]);

  const resetForm = () => {
    setSelectedLat(null);
    setSelectedLng(null);
    setSelectedAddress("");
    setDoorNo("");
    setArea("");
    setLandmark("");
    setLabel("HOME");
    setCustomLabel("");
  };

  return (
    <>
      <Card>
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm">Add a delivery address</h3>
              <p className="text-xs text-muted-foreground">
                You seem to be in the new location
              </p>
            </div>
          </div>

          {deliveryAddress && (
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                {deliveryAddress}
              </p>
            </div>
          )}

          <Button
            variant="outline"
            className="w-full"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New
            <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
          </Button>
        </CardContent>
      </Card>

      <Sheet open={open} onOpenChange={(o) => { if (!o) { resetForm(); setOpen(false); } }}>
        <SheetContent side="left" className="w-full sm:max-w-md p-0 flex flex-col">
          <SheetHeader className="border-b border-border px-4 py-3 shrink-0">
            <SheetTitle className="text-base">Save Delivery Address</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="rounded-xl overflow-hidden border border-border">
              <Map
                height="200px"
                onLocationSelect={handleMapSelect}
                interactive
                markerPosition={selectedLat && selectedLng ? [selectedLat, selectedLng] : undefined}
              />
            </div>

            {geocoding && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Getting address...
              </div>
            )}

            {selectedAddress && !geocoding && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {selectedAddress}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <Input
                placeholder="Door / Flat No."
                value={doorNo}
                onChange={(e) => setDoorNo(e.target.value)}
              />
              <Input
                placeholder="Area"
                value={area}
                onChange={(e) => setArea(e.target.value)}
              />
              <Input
                placeholder="Landmark (optional)"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
              />
            </div>

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">
                Label as
              </p>
              <div className="flex gap-2">
                {LABEL_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const isActive = label === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setLabel(option.value)}
                      className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors border ${
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {option.value === "OTHERS" ? "Others" : option.value.charAt(0) + option.value.slice(1).toLowerCase()}
                    </button>
                  );
                })}
              </div>
              {label === "OTHERS" && (
                <Input
                  placeholder="Enter label name"
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="border-t border-border p-4 shrink-0">
            <Button
              className="w-full"
              onClick={handleSave}
              disabled={!selectedAddress || geocoding || saving}
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
