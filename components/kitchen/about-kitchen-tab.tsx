"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Heart,
  ShieldCheck,
  Leaf,
  Users,
  Star,
  Award,
  Utensils,
  UtensilsCrossed,
  Box,
  CupSoda,
  Sandwich,
  Soup,
  ChefHat,
  ShoppingBag,
  CheckCircle2,
  Check,
  ChevronDown,
} from "lucide-react";
import { useKitchenDetail } from "@/stores";
import type { KitchenDetail } from "@/components/kitchen/kitchen-detail-client";

interface Props {
  kitchen: KitchenDetail;
}

// Cuisine icons mapping
function getCuisineIcon(cuisine: string) {
  const lower = cuisine.toLowerCase();
  if (lower.includes("south")) return <Soup className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />;
  if (lower.includes("north")) return <Utensils className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />;
  if (lower.includes("healthy") || lower.includes("salad")) return <ShieldCheck className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />;
  if (lower.includes("tiffin")) return <Box className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />;
  if (lower.includes("rice") || lower.includes("biryani")) return <BowlIcon className="w-5 h-5 text-[#087A36]" />;
  if (lower.includes("curry") || lower.includes("curries")) return <Soup className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />;
  if (lower.includes("snack")) return <Sandwich className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />;
  if (lower.includes("beverage") || lower.includes("drink")) return <CupSoda className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />;
  return <UtensilsCrossed className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />;
}

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
      strokeWidth="1.5"
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
  const storeKitchen = useKitchenDetail();
  const kitchen = storeKitchen ?? propKitchen;

  const [showAllBestsellers, setShowAllBestsellers] = useState(false);

  const chefName = kitchen.displayName.includes("'s Kitchen")
    ? kitchen.displayName.split("'s")[0]
    : kitchen.displayName.includes(" Kitchen")
      ? kitchen.displayName.split(" Kitchen")[0]
      : kitchen.displayName;

  const totalOrders = kitchen.totalOrdersDelivered ?? kitchen.items.reduce((sum, i) => sum + (i.orderCount ?? 0), 0);
  const platformTime = kitchen.timeOnPlatform ?? "—";
  const avgRating = kitchen.avgRating != null ? kitchen.avgRating.toFixed(1) : "—";
  const isPureVeg = kitchen.hasPureVeg ?? (kitchen.items.length > 0 && kitchen.items.every(i => i.foodType === "VEG"));

  const displayCuisines = kitchen.cuisineTags.slice(0, 8);

  const bestsellers = kitchen.items.filter((i) => i.isBestseller);
  const orderedItems = [...kitchen.items].sort((a, b) => (b.orderCount ?? 0) - (a.orderCount ?? 0));
  const topDishes = (bestsellers.length > 0 ? bestsellers : orderedItems).slice(0, 4);
  const featuredDish = topDishes[0];
  const visibleDishes = showAllBestsellers ? topDishes : topDishes.slice(0, 1);

  return (
    <div className="w-full flex flex-col gap-5 pb-8">
      {/* ABOUT SECTION (reference design shape) */}
      <section className="w-full">
        <h2 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#111827]">About {kitchen.displayName}</h2>
        <div className="mt-4 rounded-[26px] border border-[#eef1f5] bg-white px-5 py-4 shadow-[0_10px_28px_rgba(15,23,42,0.05)]">
          <h3 className="text-[16px] font-extrabold tracking-[-0.025em] text-[#111827]">
            Best-Selling Dishes at {kitchen.displayName}
          </h3>
          <p className="mt-2 text-[14px] leading-6 tracking-[-0.01em] text-[#566171]">
            {kitchen.description ||
              "A popular kitchen in Thanjavur, known for serving delicious homemade meals. Customers can order for fresh preparation, satisfying portions, and flavorful dishes."}
          </p>

          {featuredDish && (
            <div className="mt-3">
              <h4 className="text-[15px] font-extrabold tracking-[-0.02em] text-[#111827]">
                {featuredDish.name}
              </h4>
              <p className="mt-2 max-w-[720px] text-[14px] leading-6 tracking-[-0.01em] text-[#566171]">
                {featuredDish.description ||
                  `${featuredDish.name} is one of the popular dishes at ${kitchen.displayName}. It is prepared with quality ingredients and offers a rich, satisfying taste.`}
              </p>
            </div>
          )}

          {visibleDishes.length > 1 && (
            <div className="mt-3 flex flex-col gap-2">
              {visibleDishes.slice(1).map((dish) => (
                <div key={dish.id}>
                  <h4 className="text-[15px] font-extrabold tracking-[-0.02em] text-[#111827]">{dish.name}</h4>
                  <p className="mt-1 max-w-[720px] text-[14px] leading-6 tracking-[-0.01em] text-[#566171]">
                    {dish.description || `A popular dish at ${kitchen.displayName}, prepared fresh with quality ingredients.`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {topDishes.length > 1 && (
            <button
              type="button"
              onClick={() => setShowAllBestsellers((v) => !v)}
              className="mt-3 inline-flex items-center gap-1 text-[14px] font-semibold tracking-[-0.01em] text-[#ff5a00] hover:underline"
            >
              <span>{showAllBestsellers ? "See less" : "See more"}</span>
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showAllBestsellers ? "rotate-180" : ""}`} strokeWidth={2.2} />
            </button>
          )}
        </div>
      </section>

      {/* ROW 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Meet the Chef */}
        <div className="col-span-1 lg:col-span-3 bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-8 flex flex-col">
          <div className="flex flex-col md:flex-row gap-6 mb-8 flex-1">
            <div className="flex-1 relative">
              <h2 className="text-[14px] md:text-[15px] font-extrabold text-[#171717]">Meet the Chef</h2>
              <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
              
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-[28px] md:text-[32px] font-extrabold text-[#087A36]">{chefName}</h3>
                <div className="text-[#087A36] flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L15.09 5.09L19.5 5.5L20 9.91L23 13L20 16.09L19.5 20.5L15.09 20.91L12 24L8.91 20.91L4.5 20.5L4 16.09L1 13L4 9.91L4.5 5.5L8.91 5.09L12 2ZM10.5 16.5L17.5 9.5L16.09 8.09L10.5 13.67L7.91 11.09L6.5 12.5L10.5 16.5Z" />
                  </svg>
                </div>
              </div>
              <p className="text-[#FF4D00] font-semibold text-[13px] mb-6">Founder & Head Chef</p>
              
              <div className="relative">
                <div className="text-[#555555] text-[13px] leading-[1.8] font-medium pl-6 relative">
                  <span className="absolute -left-2 -top-2 text-6xl font-serif text-[#FFD0B5] opacity-50 leading-none">“</span>
                  <span className="relative z-10">{kitchen.description || "Cooking is not just about food, it's about love, care and making every meal special for the people who enjoy it."}</span>
                </div>
                <p className="text-[#087A36] font-bold text-[13px] mt-4 text-right">
                  – {chefName}
                </p>
              </div>
            </div>
            
            <div className="w-[180px] h-[180px] md:w-[200px] md:h-[200px] shrink-0 relative mx-auto md:mx-0 mt-4 md:mt-0">
              <div className="absolute inset-0 bg-[#FFF1E8] rounded-full scale-[1.15] -z-10"></div>
              <div className="absolute -left-6 top-0 text-8xl text-[#FFF1E8] font-serif leading-none z-0">“</div>
              <div className="absolute -right-4 bottom-8 text-8xl text-[#FFF1E8] font-serif leading-none z-0 rotate-180">“</div>
              <div className="absolute -left-8 top-12 z-20">
                <Leaf className="w-10 h-10 text-[#D9EBDD] -rotate-45" strokeWidth={1.5} />
              </div>
              <div className="absolute -right-6 bottom-4 z-20">
                <Leaf className="w-12 h-12 text-[#D9EBDD] rotate-45" strokeWidth={1.5} />
              </div>
              {kitchen.imageUrl ? (
                <Image src={kitchen.imageUrl} alt={chefName} fill className="object-cover rounded-full z-10" />
              ) : (
                <div className="w-full h-full bg-[#FAFAFA] rounded-full flex items-center justify-center z-10 border-4 border-[#FFFFFF] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
                  <ChefHat className="w-16 h-16 text-[#555555]" />
                </div>
              )}
            </div>
          </div>
          
          <div className="border-t border-[#EEEEEE] pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 md:divide-x divide-[#EEEEEE]">
             <div className="flex flex-col items-center text-center gap-2 px-2 pt-4 md:pt-0">
               <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center border border-[#D9EBDD]">
                 <ChefHat className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
               </div>
               <span className="text-[10px] font-bold text-[#171717] leading-[1.4]">{platformTime}<br/>on RRC Kitchen</span>
             </div>
             <div className="flex flex-col items-center text-center gap-2 px-2 pt-4 md:pt-0">
               <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center border border-[#D9EBDD]">
                 <BowlIcon className="w-5 h-5 text-[#087A36]" />
               </div>
               <span className="text-[10px] font-bold text-[#171717] leading-[1.4]">Traditional Recipes<br/>with a Modern Touch</span>
             </div>
             <div className="flex flex-col items-center text-center gap-2 px-2 pt-4 md:pt-0">
               <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center border border-[#D9EBDD]">
                 <Users className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
               </div>
               <span className="text-[10px] font-bold text-[#171717] leading-[1.4]">Passion for<br/>Homemade Cooking</span>
             </div>
             <div className="flex flex-col items-center text-center gap-2 px-2 pt-4 md:pt-0">
               <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center border border-[#D9EBDD]">
                 <Heart className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
               </div>
               <span className="text-[10px] font-bold text-[#171717] leading-[1.4]">Made with Love<br/>& Care</span>
             </div>
          </div>
        </div>

        {/* Our Story */}
        <div className="col-span-1 lg:col-span-2 bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-8 flex flex-col">
          <h2 className="text-[14px] md:text-[15px] font-extrabold text-[#171717]">Our Story</h2>
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="flex-1 flex flex-col md:flex-row items-center gap-6">
            <div className="w-[140px] h-[140px] shrink-0 relative">
              <Image src="/kitchen/bowl.webp" alt="Our Story" fill className="object-contain" />
            </div>
            <div className="flex-1">
              <p className="text-[#555555] text-[11px] md:text-[12px] leading-[1.8] font-medium">
                {chefName}&apos;s Kitchen began with a heartfelt mission – to serve homemade meals that are healthy, delicious and bring comfort like home. Every recipe reflects tradition, care and a promise of quality in every bite.
              </p>
              <p className="text-[#087A36] font-bold text-[12px] mt-4 text-right">
                – {chefName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Behind Every Meal */}
        <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-6 flex flex-col h-full">
          <h2 className="text-[14px] md:text-[15px] font-extrabold text-[#171717]">Behind Every Meal</h2>
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="grid grid-cols-2 flex-1 relative border border-[#EEEEEE] rounded-[12px] overflow-hidden">
            <div className="absolute inset-y-0 left-1/2 w-[1px] bg-[#EEEEEE]"></div>
            <div className="absolute inset-x-0 top-1/2 h-[1px] bg-[#EEEEEE]"></div>
            
            <div className="flex flex-col xl:flex-row gap-3 p-4">
              <div className="shrink-0">
                <Leaf className="w-6 h-6 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-extrabold text-[12px] text-[#171717] mb-1 leading-tight">Daily Fresh Preparation</h4>
                <p className="text-[10px] text-[#555555] leading-[1.4] font-medium">Meals are prepared fresh every day in small batches.</p>
              </div>
            </div>
            <div className="flex flex-col xl:flex-row gap-3 p-4">
              <div className="shrink-0">
                <ShieldCheck className="w-6 h-6 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-extrabold text-[12px] text-[#171717] mb-1 leading-tight">Hygienic Cooking Environment</h4>
                <p className="text-[10px] text-[#555555] leading-[1.4] font-medium">Our kitchen is cleaned and sanitized regularly for your safety.</p>
              </div>
            </div>
            <div className="flex flex-col xl:flex-row gap-3 p-4">
              <div className="shrink-0">
                <ChefHat className="w-6 h-6 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-extrabold text-[12px] text-[#171717] mb-1 leading-tight">Trained Home Chefs</h4>
                <p className="text-[10px] text-[#555555] leading-[1.4] font-medium">Experienced and verified home chefs with a passion for cooking.</p>
              </div>
            </div>
            <div className="flex flex-col xl:flex-row gap-3 p-4">
              <div className="shrink-0">
                <Award className="w-6 h-6 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-extrabold text-[12px] text-[#171717] mb-1 leading-tight">Quality You Can Trust</h4>
                <p className="text-[10px] text-[#555555] leading-[1.4] font-medium">We never compromise on taste, nutrition or hygiene.</p>
              </div>
            </div>
          </div>
        </div>

        {/* What We Cook */}
        <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-6 flex flex-col h-full">
          <h2 className="text-[14px] md:text-[15px] font-extrabold text-[#171717]">What We Cook</h2>
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          {displayCuisines.length > 0 ? (
            <div className="grid grid-cols-4 gap-y-5 gap-x-2 mb-5">
               {displayCuisines.map((c, i) => (
                 <div key={i} className="flex flex-col items-center text-center gap-1.5">
                   <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center border border-[#D9EBDD]">
                      {getCuisineIcon(c)}
                   </div>
                   <span className="text-[9px] font-bold text-[#171717] px-1">{c}</span>
                 </div>
               ))}
            </div>
          ) : (
            <p className="text-[11px] text-[#555555] font-semibold leading-[1.8] mb-5">
              A rotating menu of traditional home-style meals — head to the Menu tab to see today&apos;s dishes.
            </p>
          )}
          
          <div className="bg-[#FFF1E8] rounded-lg p-2.5 flex items-center justify-center gap-2 mt-auto text-center border border-[#FFD0B5]">
            <Leaf className="w-4 h-4 text-[#087A36] shrink-0" strokeWidth={2} />
            <span className="text-[10px] font-semibold text-[#555555]">A perfect mix of traditional recipes and modern healthy meals.</span>
          </div>
        </div>

        {/* Our Ingredients Promise */}
        <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-6 flex flex-col h-full">
          <h2 className="text-[14px] md:text-[15px] font-extrabold text-[#171717]">Our Ingredients Promise</h2>
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="flex flex-1 gap-2 items-center">
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-[#087A36] shrink-0 mt-0.5" strokeWidth={3} />
                <p className="text-[11px] font-semibold text-[#171717] leading-tight">Locally sourced vegetables<br/>and produce</p>
              </div>
              <div className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-[#087A36] shrink-0 mt-0.5" strokeWidth={3} />
                <p className="text-[11px] font-semibold text-[#171717] leading-tight">No artificial colors,<br/>flavors or preservatives</p>
              </div>
              <div className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-[#087A36] shrink-0 mt-0.5" strokeWidth={3} />
                <p className="text-[11px] font-semibold text-[#171717] leading-tight">Trusted brands for<br/>oils & spices</p>
              </div>
              <div className="flex gap-2 items-start">
                <Check className="w-4 h-4 text-[#087A36] shrink-0 mt-0.5" strokeWidth={3} />
                <p className="text-[11px] font-semibold text-[#171717] leading-tight">Only high quality<br/>natural ingredients</p>
              </div>
            </div>
            <div className="w-[140px] shrink-0 relative flex items-center justify-center h-full min-h-[140px]">
              <Image src="/kitchen/about-fresh.webp" alt="Fresh Ingredients" fill className="object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Trusted by Families */}
        <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-6 flex flex-col h-full">
          <h2 className="text-[14px] md:text-[15px] font-extrabold text-[#171717]">Trusted by Families</h2>
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="grid grid-cols-4 gap-2 flex-1 items-center">
            <div className="flex flex-col items-center text-center gap-1">
              <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center mb-1 border border-[#D9EBDD]">
                <Users className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <div className="font-extrabold text-[13px] text-[#171717]">{formatCount(kitchen.totalReviews)}</div>
              <div className="text-[8px] text-[#555555] font-bold leading-tight">Customer Reviews</div>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center mb-1 border border-[#D9EBDD]">
                <ShoppingBag className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <div className="font-extrabold text-[13px] text-[#171717]">{formatCount(totalOrders)}</div>
              <div className="text-[8px] text-[#555555] font-bold leading-tight">Meals Delivered</div>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center mb-1 border border-[#D9EBDD]">
                <Star className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <div className="font-extrabold text-[13px] text-[#171717]">{avgRating}/5</div>
              <div className="text-[8px] text-[#555555] font-bold leading-tight">Customer Rating</div>
            </div>
            <div className="flex flex-col items-center text-center gap-1">
              <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center mb-1 border border-[#D9EBDD]">
                <BowlIcon className="w-5 h-5 text-[#087A36]" />
              </div>
              <div className="font-extrabold text-[13px] text-[#171717]">{formatCount(kitchen.items.length)}</div>
              <div className="text-[8px] text-[#555555] font-bold leading-tight">Dishes on Menu</div>
            </div>
          </div>
        </div>

        {/* Recognition & Highlights */}
        <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-6 flex flex-col h-full">
          <h2 className="text-[14px] md:text-[15px] font-extrabold text-[#171717]">Recognition & Highlights</h2>
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="grid grid-cols-4 gap-2 flex-1 items-center">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center mb-2 border border-[#D9EBDD]">
                <Award className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <div className="text-[8px] text-[#171717] font-extrabold leading-tight">{kitchen.avgRating != null && kitchen.avgRating >= 4.5 ? "Top Rated Kitchen" : "Rated Kitchen"}<br/>on RRC Kitchen</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center mb-2 border border-[#D9EBDD]">
                <ShieldCheck className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <div className="text-[8px] text-[#171717] font-extrabold leading-tight">Hygiene Excellence<br/>Recognition</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center mb-2 border border-[#D9EBDD]">
                <Star className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <div className="text-[8px] text-[#171717] font-extrabold leading-tight">Rated {avgRating}/5<br/>by {formatCount(kitchen.totalReviews)} customers</div>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-[#F0F8F3] flex items-center justify-center mb-2 border border-[#D9EBDD]">
                <CheckCircle2 className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
              </div>
              <div className="text-[8px] text-[#171717] font-extrabold leading-tight">Featured in<br/>Healthy Kitchens</div>
            </div>
          </div>
        </div>

        {/* Community & Giving Back */}
        <div className="bg-[#FFFFFF] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] p-5 md:p-6 flex flex-col h-full">
          <h2 className="text-[14px] md:text-[15px] font-extrabold text-[#171717]">Community & Giving Back</h2>
          <div className="w-8 h-[2px] bg-[#FF4D00] mt-1 mb-6"></div>
          
          <div className="flex flex-1 gap-4 items-center">
            <div className="flex-1">
              <p className="text-[11px] text-[#555555] leading-[1.8] font-semibold">
                We believe in giving back to the community.<br/>A portion of our meals are donated to those<br/>in need through local initiatives.
              </p>
            </div>
            <div className="w-[80px] h-[80px] md:w-[90px] md:h-[90px] shrink-0 relative flex items-center justify-center">
              <Image src="/kitchen/hands.webp" alt="Community & Giving Back" fill className="object-contain" />
            </div>
          </div>
        </div>
      </div>

      {/* ROW 4 */}
      <div className="bg-[#FAFAFA] rounded-[26px] shadow-[0_10px_28px_rgba(15,23,42,0.05)] border border-[#eef1f5] w-full grid grid-cols-2 lg:grid-cols-5 divide-y lg:divide-y-0 divide-x divide-[#EEEEEE] overflow-hidden">
        
          <div className="flex items-center gap-3 p-4 lg:py-5 lg:px-5 flex-1 justify-center lg:justify-start">
            <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFFFFF] border border-[#EEEEEE] shadow-sm flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
            </div>
            <div>
              <div className="text-[11px] font-extrabold text-[#171717] mb-0.5">Verified Kitchen Partner</div>
              <div className="text-[9px] font-semibold text-[#555555]">Approved & active on RRC Kitchen</div>
            </div>
          </div>
        
        <div className="flex items-center gap-3 p-4 lg:py-5 lg:px-5 flex-1 justify-center lg:justify-start">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFFFFF] border border-[#EEEEEE] shadow-sm flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-[#171717] mb-0.5">WHO Guidelines Followed</div>
            <div className="text-[9px] font-semibold text-[#555555]">For your safety & well-being</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 lg:py-5 lg:px-5 flex-1 justify-center lg:justify-start">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFFFFF] border border-[#EEEEEE] shadow-sm flex items-center justify-center">
            {isPureVeg ? (
              <Leaf className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
            ) : (
              <UtensilsCrossed className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
            )}
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-[#171717] mb-0.5">{isPureVeg ? "100% Pure Veg Kitchen" : "Veg & Non-Veg Kitchen"}</div>
            <div className="text-[9px] font-semibold text-[#555555]">{isPureVeg ? "Only vegetarian meals" : "Fresh meals of every kind"}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 lg:py-5 lg:px-5 flex-1 justify-center lg:justify-start">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFFFFF] border border-[#EEEEEE] shadow-sm flex items-center justify-center">
            <Leaf className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-[#171717] mb-0.5">Eco Friendly Practices</div>
            <div className="text-[9px] font-semibold text-[#555555]">We care for nature</div>
          </div>
        </div>
        
        <div className="flex items-center gap-3 p-4 lg:py-5 lg:px-5 flex-1 justify-center lg:justify-start col-span-2 lg:col-span-1">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#FFFFFF] border border-[#EEEEEE] shadow-sm flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
          </div>
          <div>
            <div className="text-[11px] font-extrabold text-[#171717] mb-0.5">Secure & Safe Payments</div>
            <div className="text-[9px] font-semibold text-[#555555]">Your transactions are protected</div>
          </div>
        </div>
      </div>
    </div>
  );
}

