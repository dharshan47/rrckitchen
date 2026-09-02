"use client";

import Image from "next/image";
import {
  Home,
  MapPin,
  Clock,
  Truck,
  ShieldCheck,
  Mail,
  MessageCircle,
  Calendar,
  Wallet,
  Building2,
  PackageCheck,
  Users,
  Leaf,
  Phone,
  Box,
  ShoppingBag,
  IdCard,
  ClipboardCheck,
  CalendarCheck,
  Headset,
  Receipt,
  CheckCircle2,
} from "lucide-react";
import { ThanjavurMap } from "@/components/map/thanjavur-map";
import { UpiIcon } from "@/components/icons/upi";
import { VisaIcon } from "@/components/icons/visa";
import { useKitchenDetail, useCartConfig, useCartConfigQuery } from "@/stores";
import type { KitchenDetail } from "@/components/kitchen/kitchen-detail-client";
import {
  getKitchenStatus,
  getTodayKey,
  type OperatingHours,
} from "@/components/kitchen/kitchen-timing-display";

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

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-[#FFFFFF] rounded-[26px] p-5 md:p-6 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] flex flex-col h-full ${className}`}>{children}</div>;
}

function CardTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#111827] mb-5">{children}</h3>;
}

export function InfoKitchenTab({ kitchen: propKitchen }: Props) {
  const storeKitchen = useKitchenDetail();
  const kitchen = storeKitchen ?? propKitchen;

  useCartConfigQuery();
  const cartConfig = useCartConfig();

  const establishedDate = kitchen.kitchenCreatedAt
    ? new Date(kitchen.kitchenCreatedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "15 Aug 2021"; // fallback to match image

  const address = kitchen.address;
  const addressString = address
    ? `${address.doorNo ? address.doorNo + ", " : ""}${address.lineOne}${address.area ? ", " + address.area : ""}${
        address.pincode ? " - " + address.pincode : ""
      }`
    : "12, New Street, Kumbakonam, Thanjavur, Tamil Nadu - 612001"; // fallback to match image

  const hoursRows = getHoursRows(kitchen.operatingHours);

  const status = getKitchenStatus(kitchen.operatingHours);
  const todayKey = getTodayKey();
  const todayHours = kitchen.operatingHours?.[todayKey];
  const summaryTime = todayHours
    ? `${todayHours.open} - ${todayHours.close}`
    : hoursRows[0]
      ? `${hoursRows[0].open} - ${hoursRows[0].close}`
      : "—";
  const summaryDays =
    hoursRows.length >= 7
      ? "Mon - Sun (All Days)"
      : hoursRows.length > 0
        ? hoursRows.map((h) => h.label.slice(0, 3)).join(", ")
        : "Timings not listed";

  const prepTime = kitchen.estimatedPrepTime;
  const deliveryTimeRange = prepTime != null ? `${Math.max(1, prepTime - 5)}–${prepTime} mins` : "—";
  const deliveryCharge = cartConfig?.deliveryCharge ?? null;
  const freeDeliveryMin = cartConfig?.freeDeliveryMin ?? null;
  const packagingCharge = cartConfig?.packagingCharge ?? null;

  return (
    <div className="w-full flex flex-col gap-4 md:gap-5 pb-8">
      {/* ROW 1: 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Kitchen Details */}
        <Card>
          <CardTitle>Kitchen Details</CardTitle>
          <div className="space-y-4 text-[12px] flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#555555] font-medium">
                <Home className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> Kitchen Name
              </div>
              <span className="font-semibold text-[#171717]">{kitchen.displayName || "Lakshmi's Kitchen"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#555555] font-medium">
                <Home className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> Kitchen Type
              </div>
              <span className="font-semibold text-[#171717]">{kitchen.hasPureVeg ? "Pure Veg Kitchen" : "Home Kitchen"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#555555] font-medium">
                <ClipboardCheck className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> FSSAI License No.
              </div>
              <span className="font-semibold text-[#171717]">{kitchen.fssaiNumber ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#555555] font-medium">
                <CalendarCheck className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> FSSAI Valid Till
              </div>
              <span className="font-semibold text-[#171717]">
                {kitchen.fssaiValidTill
                  ? new Date(kitchen.fssaiValidTill).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                  : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#555555] font-medium">
                <Receipt className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> GST Number
              </div>
              <span className="font-semibold text-[#171717]">{kitchen.gstNumber ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#555555] font-medium">
                <IdCard className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> Kitchen ID
              </div>
              <span className="font-semibold text-[#171717]">{kitchen.kitchenId ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#555555] font-medium">
                <Calendar className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> Established On
              </div>
              <span className="font-semibold text-[#171717]">{establishedDate}</span>
            </div>
          </div>
        </Card>

        {/* Our Kitchen Location */}
        <Card className="flex flex-col">
          <CardTitle>Our Kitchen Location</CardTitle>
          <div className="flex flex-col h-full">
            <p className="text-[13px] font-medium text-[#555555] leading-relaxed mb-4 pr-4">
              {addressString}
            </p>
            <div className="bg-[#F0F8F3] rounded-lg px-3 py-2 flex items-center gap-2 text-[#087A36] text-[11px] font-semibold w-fit mb-4 border border-[#D9EBDD]">
              <MapPin className="w-3.5 h-3.5" /> Delivering within {kitchen.deliveryRadiusKm ?? 2.1} km
            </div>
            <div className="w-full flex-1 rounded-xl overflow-hidden bg-[#F9F9F9] relative border border-[#EEEEEE] mt-auto min-h-[140px]">
              <ThanjavurMap
                kitchenPosition={address ? [address.latitude, address.longitude] : undefined}
                interactive={false}
                height="100%"
              />
            </div>
          </div>
        </Card>

        {/* Kitchen Timings */}
        <Card>
          <CardTitle>Kitchen Timings</CardTitle>
          <div className="space-y-4 text-[12px] flex-1">
            <div className="bg-[#FFF1E8] border border-[#FFD0B5] rounded-[12px] p-4 flex justify-between mb-4">
              <div className="flex items-center gap-2 text-[12px] font-bold text-[#087A36]">
                <div className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? "bg-[#087A36]" : "bg-[#FF4D00]"}`}></div> {status.isOpen ? "Open Today" : "Closed Today"}
              </div>
              <div className="text-right">
                <div className="font-bold text-[#171717] text-[13px] mb-0.5">{summaryTime}</div>
                <div className="text-[10px] font-medium text-[#555555]">{summaryDays}</div>
              </div>
            </div>

            {hoursRows.length > 0 ? (
              DAY_ORDER.map((day) => {
                const h = kitchen.operatingHours?.[day];
                const isToday = day === todayKey;
                return (
                  <div key={day} className="flex items-center justify-between">
                    <div className={`flex items-center gap-2.5 font-medium ${isToday ? "text-[#087A36]" : "text-[#555555]"}`}>
                      <Clock className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> {DAY_LABELS[day]}
                    </div>
                    <span className={`font-semibold ${isToday ? "text-[#087A36]" : "text-[#171717]"}`}>
                      {h ? `${h.open} - ${h.close}` : "Closed"}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-[11px] text-[#555555] font-semibold leading-[1.8]">Timings not listed yet.</p>
            )}
          </div>
        </Card>

        {/* Delivery Information */}
        <Card>
          <CardTitle>Delivery Information</CardTitle>
          <div className="space-y-4 text-[12px] flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#555555] font-medium">
                <Clock className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> Delivery Time
              </div>
              <span className="font-semibold text-[#171717]">{deliveryTimeRange}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#555555] font-medium">
                <Truck className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> Delivery Charge
              </div>
              <span className="font-semibold text-[#171717]">
                {deliveryCharge != null ? (
                  <>
                    ₹{deliveryCharge}{freeDeliveryMin != null && <span className="text-[#999999] font-medium"> (Free above ₹{freeDeliveryMin})</span>}
                  </>
                ) : (
                  "—"
                )}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#555555] font-medium">
                <ShoppingBag className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> Minimum Order
              </div>
              <span className="font-semibold text-[#171717]">{kitchen.minOrder != null ? `₹${kitchen.minOrder}` : "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-[#555555] font-medium">
                <PackageCheck className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> Packaging Charge
              </div>
              <span className="font-semibold text-[#171717]">{packagingCharge != null ? `₹${packagingCharge}` : "—"}</span>
            </div>

            <div className="mt-auto pt-6">
              <div className="bg-[#FFF1E8] rounded-[12px] p-4 flex items-center justify-center gap-3 text-[11px] font-bold text-[#FF4D00] border border-[#FFD0B5]">
                <div className="w-8 h-8 flex items-center justify-center bg-[#FFFFFF] rounded-lg border border-[#FFD0B5] shrink-0 shadow-sm">
                  <Truck className="w-4 h-4 text-[#FF4D00]" />
                </div>
                <span className="leading-snug text-left">Track your order in real-time once it&apos;s confirmed.</span>
              </div>
            </div>
          </div>
        </Card>

      </div>

      {/* ROW 2: 4 Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Food Safety & Hygiene */}
        <Card className="relative overflow-hidden">
          <CardTitle>Food Safety & Hygiene</CardTitle>
          <div className="space-y-3.5 text-[12px] flex-1 z-10 relative pr-[80px] sm:pr-0">
            <div className="flex items-center gap-2.5 text-[#555555] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#087A36] shrink-0" strokeWidth={2} />
              FSSAI Certified Kitchen
            </div>
            <div className="flex items-center gap-2.5 text-[#555555] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#087A36] shrink-0" strokeWidth={2} />
              Regular Kitchen Sanitization
            </div>
            <div className="flex items-center gap-2.5 text-[#555555] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#087A36] shrink-0" strokeWidth={2} />
              Daily Fresh Ingredient Check
            </div>
            <div className="flex items-center gap-2.5 text-[#555555] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#087A36] shrink-0" strokeWidth={2} />
              Hygienic Cooking Environment
            </div>
            <div className="flex items-center gap-2.5 text-[#555555] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#087A36] shrink-0" strokeWidth={2} />
              Trained & Verified Home Chefs
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] lg:w-[160px] lg:h-[160px] z-0 pointer-events-none">
            <Image src="/kitchen/safe.webp" alt="Food Safety" fill sizes="(max-width: 768px) 110px, (max-width: 1024px) 130px, 160px" className="object-contain object-bottom right-0" />
          </div>
        </Card>

        {/* Ingredients We Use */}
        <Card className="relative overflow-hidden">
          <CardTitle>Ingredients We Use</CardTitle>
          <div className="space-y-3.5 text-[12px] flex-1 z-10 relative pr-[80px] sm:pr-0">
            <div className="flex items-start gap-2.5 text-[#555555] font-medium leading-tight">
              <CheckCircle2 className="w-4 h-4 text-[#087A36] shrink-0 mt-0.5" strokeWidth={2} />
              Locally sourced vegetables & produce
            </div>
            <div className="flex items-start gap-2.5 text-[#555555] font-medium leading-tight">
              <CheckCircle2 className="w-4 h-4 text-[#087A36] shrink-0 mt-0.5" strokeWidth={2} />
              Fresh & natural ingredients
            </div>
            <div className="flex items-start gap-2.5 text-[#555555] font-medium leading-tight">
              <CheckCircle2 className="w-4 h-4 text-[#087A36] shrink-0 mt-0.5" strokeWidth={2} />
              No artificial colors or preservatives
            </div>
            <div className="flex items-start gap-2.5 text-[#555555] font-medium leading-tight">
              <CheckCircle2 className="w-4 h-4 text-[#087A36] shrink-0 mt-0.5" strokeWidth={2} />
              High quality oils & spices
            </div>
          </div>
          <div className="absolute bottom-0 right-0 w-[110px] h-[110px] sm:w-[130px] sm:h-[130px] lg:w-[150px] lg:h-[150px] z-0 pointer-events-none">
            <Image src="/kitchen/info-fresh.webp" alt="Fresh Ingredients" fill sizes="(max-width: 768px) 110px, (max-width: 1024px) 130px, 150px" className="object-contain object-bottom right-0" />
          </div>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardTitle>Payment Methods</CardTitle>
          <div className="flex items-center gap-3 sm:gap-4 flex-1 mt-4 flex-wrap justify-center sm:justify-start">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl border border-[#EEEEEE] bg-[#FFFFFF] flex items-center justify-center shadow-sm">
                <UpiIcon className="w-8 h-8" />
              </div>
              <span className="text-[10px] font-medium text-[#555555]">UPI</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl border border-[#EEEEEE] bg-[#FFFFFF] flex items-center justify-center shadow-sm">
                <VisaIcon className="w-10 h-10" />
              </div>
              <span className="text-[10px] font-medium text-[#555555]">Cards</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl border border-[#EEEEEE] bg-[#FFFFFF] flex items-center justify-center shadow-sm">
                <Building2 className="w-7 h-7 text-[#171717]" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium text-[#555555]">Net Banking</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-2xl border border-[#EEEEEE] bg-[#FFFFFF] flex items-center justify-center shadow-sm">
                <Wallet className="w-7 h-7 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-medium text-[#555555]">Wallets</span>
            </div>
          </div>
        </Card>

        {/* Customer Support */}
        <Card>
          <CardTitle>Customer Support</CardTitle>
          <div className="flex-1 flex flex-col">
            <p className="text-[12px] font-medium text-[#555555] mb-4">We&apos;re here to help you!</p>
            
            <div className="space-y-4 text-[12px] font-semibold text-[#171717] mb-6">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> +91 98765 43210
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#087A36]" strokeWidth={2} /> support@rrckitchen.com
              </div>
              <div className="flex items-start gap-3">
                <Headset className="w-4 h-4 text-[#087A36] mt-0.5" strokeWidth={2} /> 
                <div className="leading-snug">
                  6:00 AM - 10:00 PM<br/>
                  <span className="text-[#555555] text-[10px] font-medium">(Mon - Sun)</span>
                </div>
              </div>
            </div>

            <button className="w-full mt-auto py-2.5 rounded-lg bg-[#FFF1E8] text-[#087A36] font-bold text-[13px] flex items-center justify-center gap-2 transition-colors hover:bg-[#FFD0B5]/30">
              <MessageCircle className="w-4 h-4" /> Chat with us
            </button>
          </div>
        </Card>

      </div>

      {/* ROW 3: Our Promise & Follow Us */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-5">
        
        {/* Our Promise */}
        <div className="col-span-1 lg:col-span-3 bg-[#FEF9F5] rounded-[26px] p-5 md:p-6 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] flex flex-col">
          <CardTitle>Our Promise</CardTitle>
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-2">
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#EEEEEE] flex items-center justify-center mb-2 shadow-sm">
                <Box className="w-6 h-6 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <h4 className="font-bold text-[12px] text-[#171717] leading-tight">Homemade Food</h4>
              <p className="text-[10px] text-[#555555] font-medium leading-relaxed pr-2">Made with love & traditional recipes</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#EEEEEE] flex items-center justify-center mb-2 shadow-sm">
                <Leaf className="w-6 h-6 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <h4 className="font-bold text-[12px] text-[#171717] leading-tight">Fresh & Healthy</h4>
              <p className="text-[10px] text-[#555555] font-medium leading-relaxed pr-2">Only fresh ingredients for a healthy you</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#EEEEEE] flex items-center justify-center mb-2 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <h4 className="font-bold text-[12px] text-[#171717] leading-tight">Hygienic & Safe</h4>
              <p className="text-[10px] text-[#555555] font-medium leading-relaxed pr-2">Clean kitchen, safe cooking and secure packaging</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#EEEEEE] flex items-center justify-center mb-2 shadow-sm">
                <Truck className="w-6 h-6 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <h4 className="font-bold text-[12px] text-[#171717] leading-tight">Timely Delivery</h4>
              <p className="text-[10px] text-[#555555] font-medium leading-relaxed pr-2">On-time delivery, every time</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] border border-[#EEEEEE] flex items-center justify-center mb-2 shadow-sm">
                <Users className="w-6 h-6 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <h4 className="font-bold text-[12px] text-[#171717] leading-tight">Customer First</h4>
              <p className="text-[10px] text-[#555555] font-medium leading-relaxed pr-2">Your satisfaction is our top priority</p>
            </div>
          </div>
        </div>

        {/* Follow Us */}
        <Card className="col-span-1">
          <CardTitle>Follow Us</CardTitle>
          <div className="flex-1 flex flex-col">
            <p className="text-[12px] font-medium text-[#555555] leading-relaxed mb-6 pr-4">
              Stay connected for updates, new menus & offers!
            </p>
            <div className="flex items-center gap-3 mt-auto pb-2">
              {/* Facebook */}
              <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-[#FFFFFF] cursor-pointer hover:opacity-90 transition-opacity">
                <svg width="10" height="18" viewBox="0 0 10 18" fill="currentColor">
                  <path d="M8.7 6.1H6V4.3C6 3.6 6.5 3.4 6.9 3.4H8.7V0.1C8.7 0.1 7.1 0 5.6 0C2.4 0 1.2 2.1 1.2 4.9V6.1H0V9.6H1.2V18H6V9.6H8.3L8.7 6.1Z" />
                </svg>
              </div>
              {/* Instagram */}
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-[#FFFFFF] cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
              {/* YouTube */}
              <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-[#FFFFFF] cursor-pointer hover:opacity-90 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.501 5.814a3.016 3.016 0 0 0 2.122 2.136c1.872.55 9.377.55 9.377.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              {/* WhatsApp */}
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-[#FFFFFF] cursor-pointer hover:opacity-90 transition-opacity">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                </svg>
              </div>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}

