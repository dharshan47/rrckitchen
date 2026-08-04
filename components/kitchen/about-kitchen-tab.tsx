"use client";

import Image from "next/image";
import {
  Check,
  Heart,
  ShieldCheck,
  Leaf,
  Users,
  Star,
  Award,
  Utensils,
  UtensilsCrossed,
  Salad,
  Box,
  CupSoda,
  Sandwich,
  Soup,
  ChefHat,
  Clock,
  ShoppingBag,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useKitchenDetail } from "@/stores";
import type { KitchenDetail } from "@/components/kitchen/kitchen-detail-client";

interface Props {
  kitchen: KitchenDetail;
}

function getCuisineIcon(cuisine: string) {
  const lower = cuisine.toLowerCase();
  if (lower.includes("south")) return <BowlIcon className="w-5 h-5 text-green-600" />;
  if (lower.includes("north")) return <Utensils className="w-5 h-5 text-green-600" />;
  if (lower.includes("healthy") || lower.includes("salad")) return <Salad className="w-5 h-5 text-green-600" />;
  if (lower.includes("tiffin")) return <Box className="w-5 h-5 text-green-600" />;
  if (lower.includes("rice") || lower.includes("biryani")) return <BowlIcon className="w-5 h-5 text-green-600" />;
  if (lower.includes("curry") || lower.includes("curries")) return <Soup className="w-5 h-5 text-green-600" />;
  if (lower.includes("snack")) return <Sandwich className="w-5 h-5 text-green-600" />;
  if (lower.includes("beverage") || lower.includes("drink")) return <CupSoda className="w-5 h-5 text-green-600" />;
  return <UtensilsCrossed className="w-5 h-5 text-green-600" />;
}

// Simple custom bowl SVG icon
function BowlIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12h20" />
      <path d="M4 12c0 4.4 3.6 8 8 8s8-3.6 8-8" />
    </svg>
  );
}

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  if (count > 0) return `${count}+`;
  return "0";
}

export function AboutKitchenTab({ kitchen: propKitchen }: Props) {
  // Real-time kitchen detail from the zustand store (hydrated by the
  // kitchen detail query), falling back to the SSR prop.
  const storeKitchen = useKitchenDetail();
  const kitchen = storeKitchen ?? propKitchen;

  const chefName = kitchen.displayName.includes("'s Kitchen")
    ? kitchen.displayName.split("'s")[0]
    : kitchen.displayName.includes(" Kitchen")
      ? kitchen.displayName.split(" Kitchen")[0]
      : kitchen.displayName;

  const totalOrders = kitchen.totalOrdersDelivered ?? kitchen.items.reduce((sum, i) => sum + (i.orderCount ?? 0), 0);
  const dishCount = kitchen.items.length;
  const activeDays = kitchen.operatingHours
    ? Object.values(kitchen.operatingHours).filter((d) => d).length
    : 0;

  // Real backend-driven highlights.
  const highlights = [
    { icon: ChefHat, label: `${dishCount} Dishes`, sub: "On the current menu" },
    { icon: Clock, label: kitchen.estimatedPrepTime ? `${kitchen.estimatedPrepTime} mins` : "—", sub: "Avg. preparation time" },
    { icon: Calendar, label: kitchen.timeOnPlatform ?? "—", sub: "On RRC Kitchen" },
    { icon: ShoppingBag, label: formatCount(totalOrders), sub: "Orders delivered" },
  ];

  return (
    <div className="w-full flex flex-col gap-4 md:gap-6 pb-8">
      {/* ROW 1: Meet the Chef & Our Story */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="rounded-2xl p-6 md:p-8 border-gray-100 shadow-sm flex flex-col">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-[18px] md:text-[20px] font-extrabold text-gray-900">Meet the Chef</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-8">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[24px] md:text-[28px] font-extrabold text-green-800">{chefName}</h3>
                  <div className="bg-green-600 text-white rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
                <p className="text-[#EE7005] font-semibold text-[13px] md:text-[14px] mb-4">Founder & Head Chef</p>

                {kitchen.description ? (
                  <div className="relative">
                    <span className="absolute -left-2 -top-2 text-4xl text-gray-200 font-serif leading-none">&quot;</span>
                    <p className="text-gray-600 text-[13px] md:text-[15px] italic leading-relaxed pl-4 font-medium">
                      {kitchen.description}
                    </p>
                    <p className="text-green-800 font-bold text-[13px] md:text-[14px] mt-3 text-right">– {chefName}</p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-[13px] font-medium italic">No kitchen story added yet.</p>
                )}
              </div>

              <Avatar className="w-[140px] h-[140px] md:w-[180px] md:h-[180px] shrink-0 border-4 border-orange-50 shadow-md mx-auto md:mx-0 rounded-full">
                {kitchen.imageUrl ? (
                  <AvatarImage src={kitchen.imageUrl} alt={chefName} className="object-cover" />
                ) : null}
                <AvatarFallback className="bg-gray-100">
                  <ChefHat className="w-12 h-12 text-gray-300" />
                </AvatarFallback>
              </Avatar>
            </div>

            <Separator className="bg-gray-100" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {highlights.map((h) => (
                <div key={h.label} className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 border border-green-100">
                    <h.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[10px] md:text-[11px] font-bold text-gray-700 leading-tight">
                    {h.label}
                    <br />
                    <span className="font-medium text-gray-500">{h.sub}</span>
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Our Story — real description + real stats */}
        <Card className="rounded-2xl p-6 md:p-8 border-gray-100 shadow-sm flex flex-col">
          <CardHeader className="p-0 pb-6">
            <CardTitle className="text-[18px] md:text-[20px] font-extrabold text-gray-900">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 flex flex-col">
            {kitchen.description ? (
              <>
                <div className="flex-1 flex flex-col items-center justify-center py-4">
                  <div className="w-[140px] h-[140px] rounded-full overflow-hidden relative bg-gray-100 border-4 border-green-50 mb-6">
                    {kitchen.imageUrl ? (
                      <Image src={kitchen.imageUrl} alt={chefName} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ChefHat className="w-12 h-12 text-gray-300" />
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 text-[13px] md:text-[14px] leading-loose text-center font-medium max-w-[400px]">
                    {kitchen.description}
                  </p>
                  <p className="text-green-800 font-bold text-[13px] md:text-[14px] mt-6 w-full text-right pr-4">
                    – {chefName}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-4 text-gray-400 text-[13px] font-medium">
                <ChefHat className="w-12 h-12 mb-3 text-gray-300" />
                No kitchen story added yet.
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="flex flex-col items-center text-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                <Badge className="bg-green-600 hover:bg-green-600 text-white border-0 text-[10px] font-bold px-2">
                  {kitchen.hasPureVeg ? "Pure Veg" : "Veg & Non-Veg"}
                </Badge>
                <span className="text-[10px] text-gray-500 font-medium text-center">Menu type</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                <span className="font-extrabold text-[15px] text-green-800">{kitchen.cuisineTags.length}</span>
                <span className="text-[10px] text-gray-500 font-medium text-center">Cuisines</span>
              </div>
              <div className="flex flex-col items-center text-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                <span className="font-extrabold text-[15px] text-green-800">{activeDays}</span>
                <span className="text-[10px] text-gray-500 font-medium text-center">Days open / week</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* What We Cook — real cuisine tags */}
        <Card className="rounded-2xl p-6 border-gray-100 shadow-sm">
          <CardHeader className="p-0 pb-5">
            <CardTitle className="text-[16px] md:text-[18px] font-extrabold text-gray-900 border-b border-gray-100 pb-3">
              What We Cook
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kitchen.cuisineTags.slice(0, 8).map((cuisine, index) => (
                <div key={index} className="flex flex-col items-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                    {getCuisineIcon(cuisine)}
                  </div>
                  <p className="text-[11px] font-semibold text-gray-800">{cuisine}</p>
                </div>
              ))}
              {kitchen.cuisineTags.length === 0 && (
                <p className="text-[11px] text-gray-500 col-span-4 text-center">No cuisines listed</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Kitchen Highlights — real stats */}
        <Card className="rounded-2xl p-6 border-gray-100 shadow-sm">
          <CardHeader className="p-0 pb-5">
            <CardTitle className="text-[16px] md:text-[18px] font-extrabold text-gray-900 border-b border-gray-100 pb-3">
              Kitchen Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <div className="flex gap-3">
                <div className="mt-1">
                  <ShoppingBag className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[12px] md:text-[13px] mb-1">Orders Delivered</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed">{formatCount(totalOrders)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  <Star className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[12px] md:text-[13px] mb-1">Average Rating</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    {kitchen.avgRating ? `${kitchen.avgRating.toFixed(1)} / 5` : "—"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[12px] md:text-[13px] mb-1">Customer Reviews</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed">{kitchen.totalReviews}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[12px] md:text-[13px] mb-1">Kitchen Type</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed">
                    {kitchen.hasPureVeg ? "Pure Veg" : "Home Kitchen"}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  <ShieldCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[12px] md:text-[13px] mb-1">Verified Partner</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed">Registered home kitchen on RRC Kitchen</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="mt-1">
                  <Leaf className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 text-[12px] md:text-[13px] mb-1">Fresh Preparation</h4>
                  <p className="text-gray-500 text-[11px] leading-relaxed">Meals prepared fresh daily</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trusted by Families — real numbers */}
        <Card className="rounded-2xl p-6 border-gray-100 shadow-sm">
          <CardHeader className="p-0 pb-5">
            <CardTitle className="text-[16px] md:text-[18px] font-extrabold text-gray-900 border-b border-gray-100 pb-3">
              Trusted by Families
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2 border border-green-100">
                  <Users className="w-4 h-4 text-green-600" />
                </div>
                <div className="font-extrabold text-[13px] md:text-[14px] text-gray-900">{kitchen.totalReviews}</div>
                <div className="text-[9px] md:text-[10px] text-gray-500 font-medium mt-1">Reviews</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2 border border-green-100">
                  <Box className="w-4 h-4 text-green-600" />
                </div>
                <div className="font-extrabold text-[13px] md:text-[14px] text-gray-900">{formatCount(totalOrders)}</div>
                <div className="text-[9px] md:text-[10px] text-gray-500 font-medium mt-1">Orders Delivered</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2 border border-green-100">
                  <Star className="w-4 h-4 text-green-600 fill-green-600" />
                </div>
                <div className="font-extrabold text-[13px] md:text-[14px] text-gray-900">
                  {kitchen.avgRating ? `${kitchen.avgRating.toFixed(1)}/5` : "—"}
                </div>
                <div className="text-[9px] md:text-[10px] text-gray-500 font-medium mt-1">Customer Rating</div>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-2 border border-green-100">
                  <Heart className="w-4 h-4 text-green-600" />
                </div>
                <div className="font-extrabold text-[13px] md:text-[14px] text-gray-900">{formatCount(totalOrders)}</div>
                <div className="text-[9px] md:text-[10px] text-gray-500 font-medium mt-1">Meals Delivered</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
