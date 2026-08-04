"use client";

import {
  Home,
  MapPin,
  Clock,
  Truck,
  ShieldCheck,
  CreditCard,
  Check,
  Mail,
  MessageCircle,
  Calendar,
  Wallet,
  Building2,
  PackageCheck,
  Heart,
  Users,
  Leaf,
  UtensilsCrossed,
  Hourglass,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ThanjavurMap } from "@/components/map/thanjavur-map";
import { useKitchenDetail, useCartConfig, useCartConfigQuery } from "@/stores";
import type { KitchenDetail } from "@/components/kitchen/kitchen-detail-client";
import type { OperatingHours } from "@/components/kitchen/kitchen-timing-display";

interface Props {
  kitchen: KitchenDetail;
}

const DAY_LABELS: Record<string, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const DAY_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

function getHoursRows(hours: OperatingHours | null) {
  if (!hours) return [];
  return DAY_ORDER.filter((day) => hours[day]).map((day) => ({
    day,
    label: DAY_LABELS[day] ?? day,
    open: hours[day]!.open,
    close: hours[day]!.close,
  }));
}

export function InfoKitchenTab({ kitchen: propKitchen }: Props) {
  // Real-time kitchen detail from the zustand store (hydrated by the
  // kitchen detail query), falling back to the SSR prop.
  const storeKitchen = useKitchenDetail();
  const kitchen = storeKitchen ?? propKitchen;

  // Real delivery charges from the backend config query.
  const { isLoading: configLoading } = useCartConfigQuery();
  const cartConfig = useCartConfig();

  const establishedDate = kitchen.kitchenCreatedAt
    ? new Date(kitchen.kitchenCreatedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  const address = kitchen.address;
  const addressString = address
    ? `${address.doorNo ? address.doorNo + ", " : ""}${address.lineOne}${address.area ? ", " + address.area : ""}${
        address.pincode ? ", " + address.pincode : ""
      }`
    : "Address not available";

  const hoursRows = getHoursRows(kitchen.operatingHours);

  return (
    <div className="w-full flex flex-col gap-4 md:gap-6 pb-8">
      {/* ROW 1: DETAILS & LOCATION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="rounded-2xl p-6 border-gray-100 shadow-sm flex flex-col">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-[15px] font-bold text-gray-900">Kitchen Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-4 text-[13px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-600 font-semibold">
                  <Home className="w-4 h-4 text-green-700" /> Kitchen Name
                </div>
                <span className="font-bold text-gray-900">{kitchen.displayName}</span>
              </div>

              <Separator className="bg-gray-100" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-600 font-semibold">
                  <UtensilsCrossed className="w-4 h-4 text-green-700" /> Kitchen Type
                </div>
                <span className="font-bold text-gray-900">
                  {kitchen.hasPureVeg ? "Pure Veg Home Kitchen" : "Home Kitchen"}
                </span>
              </div>

              <Separator className="bg-gray-100" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-600 font-semibold">
                  <Calendar className="w-4 h-4 text-green-700" /> Established On
                </div>
                <span className="font-bold text-gray-900">{establishedDate}</span>
              </div>

              <Separator className="bg-gray-100" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-600 font-semibold">
                  <Hourglass className="w-4 h-4 text-green-700" /> Avg. Preparation Time
                </div>
                <span className="font-bold text-gray-900">
                  {kitchen.estimatedPrepTime ? `${kitchen.estimatedPrepTime} mins` : "—"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Our Kitchen Location */}
        <Card className="rounded-2xl p-6 border-gray-100 shadow-sm flex flex-col">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-[15px] font-bold text-gray-900">Our Kitchen Location</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row gap-6 h-full">
              <div className="flex-1 flex flex-col justify-between">
                <p className="text-[13px] font-semibold text-gray-700 leading-relaxed max-w-[220px]">
                  {addressString}
                </p>
                {address ? (
                  <div className="mt-4 bg-[#F0FDF4] border border-green-100 rounded-lg p-2.5 flex items-center gap-2 text-green-800 text-[11px] font-bold w-fit">
                    <MapPin className="w-3.5 h-3.5" /> Verified kitchen address
                  </div>
                ) : null}
              </div>

              <div className="w-full h-[140px] rounded-xl overflow-hidden bg-gray-100 relative border border-gray-200 shrink-0">
                <ThanjavurMap
                  kitchenPosition={address ? [address.latitude, address.longitude] : undefined}
                  interactive={false}
                  height="140px"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: TIMINGS & DELIVERY */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Kitchen Timings — real operating hours from backend */}
        <Card className="rounded-2xl p-6 border-gray-100 shadow-sm flex flex-col">
          <CardHeader className="p-0 pb-5">
            <CardTitle className="text-[15px] font-bold text-gray-900">Kitchen Timings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {hoursRows.length > 0 ? (
              <div className="space-y-4 px-1 text-[13px]">
                {hoursRows.map((row) => (
                  <div key={row.day} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-gray-600 font-semibold">
                      <Clock className="w-4 h-4 text-green-700" /> {row.label}
                    </div>
                    <span className="font-bold text-gray-900">
                      {row.open} – {row.close}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[13px] text-gray-400 font-medium px-1">No timings listed.</p>
            )}
          </CardContent>
        </Card>

        {/* Delivery Information — real charges from backend config */}
        <Card className="rounded-2xl p-6 border-gray-100 shadow-sm flex flex-col">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-[15px] font-bold text-gray-900">Delivery Information</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-5 text-[13px] mb-6 px-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-600 font-semibold">
                  <Clock className="w-4 h-4 text-green-700" /> Delivery Time
                </div>
                {configLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span className="font-bold text-gray-900">
                    {kitchen.estimatedPrepTime ? `${kitchen.estimatedPrepTime} mins` : "—"}
                  </span>
                )}
              </div>

              <Separator className="bg-gray-100" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-600 font-semibold">
                  <Truck className="w-4 h-4 text-green-700" /> Delivery Charge
                </div>
                {configLoading ? (
                  <Skeleton className="h-4 w-24" />
                ) : (
                  <span className="font-bold text-gray-900">
                    ₹{cartConfig?.deliveryCharge ?? 0}{" "}
                    <span className="text-gray-400 font-medium">
                      (Free above ₹{cartConfig?.freeDeliveryMin ?? 0})
                    </span>
                  </span>
                )}
              </div>

              <Separator className="bg-gray-100" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-gray-600 font-semibold">
                  <PackageCheck className="w-4 h-4 text-green-700" /> Packaging Charge
                </div>
                {configLoading ? (
                  <Skeleton className="h-4 w-16" />
                ) : (
                  <span className="font-bold text-gray-900">₹{cartConfig?.packagingCharge ?? 0}</span>
                )}
              </div>
            </div>

            <div className="mt-auto bg-[#F9FAFB] border border-gray-100 rounded-xl p-4 flex items-center gap-3 text-[11px] font-semibold text-gray-700">
              <div className="p-2 bg-white rounded-lg border border-gray-200 shrink-0">
                <Truck className="w-4 h-4 text-[#EE7005]" />
              </div>
              Track your order in real-time once it&apos;s confirmed.
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 3: SAFETY & INGREDIENTS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="rounded-2xl p-6 border-gray-100 shadow-sm flex flex-col justify-between">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-[15px] font-bold text-gray-900">Food Safety & Hygiene</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex justify-between items-end h-full">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Registered Home Kitchen
                </div>
                <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Regular Kitchen Sanitization
                </div>
                <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Daily Fresh Ingredient Check
                </div>
                <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Hygienic Cooking Environment
                </div>
                <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Trained & Verified Home Chefs
                </div>
              </div>

              <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 relative mr-2">
                <ShieldCheck className="w-full h-full text-green-100" strokeWidth={1} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-600 stroke-[3]" />
                </div>
                <div className="absolute -bottom-2 -left-2">
                  <Leaf className="w-8 h-8 text-green-500" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients We Use */}
        <Card className="rounded-2xl p-6 border-gray-100 shadow-sm flex flex-col justify-between">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-[15px] font-bold text-gray-900">Ingredients We Use</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex justify-between items-end h-full">
              <div className="space-y-4">
                <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Locally sourced vegetables & produce
                </div>
                <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> Fresh & natural ingredients
                </div>
                <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> No artificial colors or preservatives
                </div>
                <div className="flex items-center gap-2.5 text-[12px] font-semibold text-gray-700">
                  <Check className="w-4 h-4 text-green-600 shrink-0" /> High quality oils & spices
                </div>
              </div>

              <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 relative">
                <div className="w-full h-full rounded-full bg-green-50 border border-green-100 flex items-center justify-center">
                  <Leaf className="w-10 h-10 text-green-600" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 4: PAYMENTS & SUPPORT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {/* Payment Methods */}
        <Card className="rounded-2xl p-6 border-gray-100 shadow-sm flex flex-col">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-[15px] font-bold text-gray-900">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex items-center justify-between gap-4 h-full pb-2">
              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-12 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center">
                  <div className="font-extrabold text-gray-800 text-[16px] italic">UPI</div>
                </div>
                <span className="text-[10px] font-bold text-gray-600">UPI</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-12 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-blue-800" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">Cards</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-12 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-gray-700" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">Net Banking</span>
              </div>

              <div className="flex flex-col items-center gap-2">
                <div className="w-14 h-12 rounded-xl border border-gray-200 bg-white shadow-sm flex items-center justify-center">
                  <Wallet className="w-6 h-6 text-green-700" />
                </div>
                <span className="text-[10px] font-bold text-gray-600">Wallets</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Support */}
        <Card className="rounded-2xl p-6 border-gray-100 shadow-sm flex flex-col">
          <CardHeader className="p-0 pb-2">
            <CardTitle className="text-[15px] font-bold text-gray-900">Customer Support</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            <p className="text-[11px] font-medium text-gray-500 mb-5">We&apos;re here to help you!</p>

            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[12px] font-semibold text-gray-800 mb-5">
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-green-700" /> support@rrckitchen.com
              </div>
              <div className="flex items-start gap-2.5 col-span-2">
                <Clock className="w-4 h-4 text-green-700 mt-0.5" />
                <div>
                  Support available during
                  <div className="text-[10px] text-gray-500 font-medium">kitchen operating hours</div>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full mt-auto rounded-xl bg-[#FDF1E8] text-[#EE7005] border-[#FCE5D3] font-bold text-[13px] hover:bg-[#FCE5D3]"
            >
              <MessageCircle className="w-4 h-4" /> Chat with us
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ROW 5: OUR PROMISE */}
      <div className="bg-[#F8FAF9] rounded-2xl p-6 shadow-sm border border-[#E8F5E9]">
        <h3 className="font-bold text-gray-900 text-[15px] mb-6">Our Promise</h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-full bg-white border border-green-200 flex items-center justify-center mb-1">
              <Heart className="w-5 h-5 text-green-700" />
            </div>
            <h4 className="font-bold text-[12px] text-gray-900 leading-tight">Homemade Food</h4>
            <p className="text-[10px] text-gray-600 font-medium">Made with love & traditional recipes</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-full bg-white border border-green-200 flex items-center justify-center mb-1">
              <Leaf className="w-5 h-5 text-green-700" />
            </div>
            <h4 className="font-bold text-[12px] text-gray-900 leading-tight">Fresh & Healthy</h4>
            <p className="text-[10px] text-gray-600 font-medium">Only fresh ingredients for a healthy you</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-full bg-white border border-green-200 flex items-center justify-center mb-1">
              <ShieldCheck className="w-5 h-5 text-green-700" />
            </div>
            <h4 className="font-bold text-[12px] text-gray-900 leading-tight">Hygienic & Safe</h4>
            <p className="text-[10px] text-gray-600 font-medium">Clean kitchen, safe cooking and secure packaging</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-full bg-white border border-green-200 flex items-center justify-center mb-1">
              <Truck className="w-5 h-5 text-green-700" />
            </div>
            <h4 className="font-bold text-[12px] text-gray-900 leading-tight">Timely Delivery</h4>
            <p className="text-[10px] text-gray-600 font-medium">On-time delivery, every time</p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="w-10 h-10 rounded-full bg-white border border-green-200 flex items-center justify-center mb-1">
              <Users className="w-5 h-5 text-green-700" />
            </div>
            <h4 className="font-bold text-[12px] text-gray-900 leading-tight">Customer First</h4>
            <p className="text-[10px] text-gray-600 font-medium">Your satisfaction is our top priority</p>
          </div>
        </div>
      </div>
    </div>
  );
}
