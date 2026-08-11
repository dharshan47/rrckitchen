"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import Image from "next/image";
import { ProgressiveImage } from "@/components/patterns/progressive-image";
import { WishlistButton as WishlistBtn } from "@/components/menu/wishlist-button";
import { cn } from "@/lib/utils";
import { Minus, Plus, UtensilsCrossed } from "lucide-react";
import { useCartItems, useCartActions } from "@/stores";

interface MenuCardItem {
  id: string;
  slug?: string;
  shortId?: string;
  kitchenSlug?: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  foodType: string;
  timeSlot: string;
  kitchenName: string;
  kitchenRating?: number | null;
  avgRating?: number | null;
  totalReviews?: number;
  description?: string | null;
  imageUrl?: string | null;
  isBestseller?: boolean;
  orderCount?: number;
}

interface MenuCardContextValue {
  item: MenuCardItem;
  onAddToCart: (id: string) => void;
  onShowAddPopup: ((item: MenuCardItem) => void) | null;
  onItemClick?: ((item: MenuCardItem) => void) | null;
  discount: number;
  showKitchenMeta: boolean;
}

const MenuCardContext = createContext<MenuCardContextValue | null>(null);

function useMenuCardContext() {
  const ctx = useContext(MenuCardContext);
  if (!ctx) throw new Error("CompoundMenuCard sub-components must be used within <CompoundMenuCard>");
  return ctx;
}

interface CompoundMenuCardProps {
  item: MenuCardContextValue["item"];
  onAddToCart?: (id: string) => void;
  onShowAddPopup?: (item: MenuCardContextValue["item"]) => void;
  onItemClick?: (item: MenuCardContextValue["item"]) => void;
  showKitchenMeta?: boolean;
  children: ReactNode;
}

const DISCOUNT_MULTIPLIER = 1.35;

function Root({ item, onAddToCart, onShowAddPopup, onItemClick, showKitchenMeta = true, children }: CompoundMenuCardProps) {
  const isClickable = !!onItemClick;

  const handleRootClick = useCallback(() => {
    if (onItemClick) onItemClick(item);
  }, [onItemClick, item]);

  const discount = useMemo(
    () => item.compareAtPrice ?? Math.round(item.price * DISCOUNT_MULTIPLIER),
    [item.price, item.compareAtPrice]
  );

  const addToCartFallback = useCallback((id: string) => {
    if (onShowAddPopup) onShowAddPopup(item);
    else if (onAddToCart) onAddToCart(id);
  }, [item, onShowAddPopup, onAddToCart]);

  const value = useMemo(
    () => ({ item, onAddToCart: onAddToCart ?? addToCartFallback, onShowAddPopup: onShowAddPopup ?? null, onItemClick: onItemClick ?? null, discount, showKitchenMeta }),
    [item, onAddToCart, addToCartFallback, onShowAddPopup, onItemClick, discount, showKitchenMeta]
  );

  return (
    <MenuCardContext.Provider value={value}>
      <div
        onClick={isClickable ? handleRootClick : undefined}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={isClickable ? (e) => { if (e.key === "Enter") handleRootClick(); } : undefined}
        className={cn(
          "bg-[#FFFFFF] rounded-[12px] p-3 md:p-4 flex gap-4 border border-[#E9E9E9] shadow-[0_2px_8px_rgba(20,40,30,0.06)] hover:shadow-[0_6px_18px_rgba(20,40,30,0.10)] transition-shadow group w-full relative overflow-hidden",
          isClickable && "cursor-pointer"
        )}
      >
        {children}
      </div>
    </MenuCardContext.Provider>
  );
}

function ImageSection({ children, hideWishlistButton = false }: { children?: ReactNode; hideWishlistButton?: boolean }) {
  const { item } = useMenuCardContext();
  
  let badge = null;
  if (item.isBestseller) {
    badge = { label: "Bestseller", color: "bg-[#087A36]" };
  } else if (item.orderCount && item.orderCount > 10) {
    badge = { label: "Popular", color: "bg-[#087A36]" };
  } else if (item.orderCount && item.orderCount > 5) {
    badge = { label: "Bestseller", color: "bg-[#087A36]" };
  }

  // Adding "Homemade" badge logic if name matches sambar as a design tweak
  if (item.name.toLowerCase().includes("sambar")) {
    badge = { label: "Homemade", color: "bg-[#087A36]" };
  }

  return (
    <div className="relative w-[130px] md:w-[150px] h-[130px] md:h-[150px] rounded-[10px] overflow-hidden shrink-0 bg-[#F4EFE9]">
      {item.imageUrl ? (
        <ProgressiveImage
          highResUrl={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-[#A5A5A5]">
          <UtensilsCrossed className="w-7 md:w-8 h-7 md:h-8" />
        </div>
      )}
      
      {!hideWishlistButton && (
        <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
          <WishlistBtn menuItemId={item.id} size="sm" variant="overlay" />
        </div>
      )}

      {badge && (
        <div className={cn(
          "absolute bottom-2 left-2 text-[#FFFFFF] text-[11px] font-bold px-[10px] py-[4px] rounded-[7px] shadow-sm tracking-wide z-10",
          badge.color
        )}>
          {badge.label}
        </div>
      )}
      {children}
    </div>
  );
}

// Empty components for backward compatibility
function BadgeRibbon() {
  const { item } = useMenuCardContext();
  if (!item.compareAtPrice) return null;
  return (
    <div className="clip-path absolute top-0 left-0 bg-primary-dark text-white text-[10px] font-bold px-2.5 py-1 rounded-br-lg z-10 shadow-sm">
      %
    </div>
  );
}
function AddButtonOverlay() { return null; }
function WishlistButton() { return null; }
function FoodTypeOverlay() { return null; }
function RatingOverlay() { return null; }

export function VegIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={cn(className)}>
      <rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="white" stroke="#087A36" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="3.5" fill="#087A36" />
    </svg>
  );
}

export function NonVegIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={cn(className)}>
      <rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="white" stroke="#EF4444" strokeWidth="1.5" />
      <path d="M8 3.5L11.5 12.5H4.5L8 3.5Z" fill="#EF4444" />
    </svg>
  );
}

function Header() {
  const ctx = useMenuCardContext();
  const { item, onAddToCart, onShowAddPopup, showKitchenMeta } = ctx;
  const cartItems = useCartItems();
  const { updateQuantity, removeFromCart } = useCartActions();

  const cartItem = cartItems.find(ci => ci.id === item.id);

  const handleAddClick = onShowAddPopup
    ? (e: React.MouseEvent) => { e.stopPropagation(); onShowAddPopup(item); }
    : (e: React.MouseEvent) => { e.stopPropagation(); onAddToCart(item.id); };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cartItem!.qty <= 1) {
      removeFromCart(item.id);
    } else {
      updateQuantity(item.id, cartItem!.qty - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(item.id, cartItem!.qty + 1);
    if (onShowAddPopup) onShowAddPopup(item);
  };

  return (
    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
      <div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <h3 className="font-semibold text-[#171717] text-[15px] md:text-[16px] leading-tight truncate max-w-[85%]">
            {item.name}
          </h3>
          <Image src="/kitchen/shield-tick.webp" alt="Verified" width={16} height={16} className="w-4 h-4 object-contain shrink-0" />
        </div>

        {showKitchenMeta && item.kitchenName && (
          <p className="text-[11px] md:text-[12px] text-gray-500 font-medium mt-0.5 truncate">{item.kitchenName}</p>
        )}

        <p className="text-[12px] md:text-[13px] text-[#5F6361] leading-snug mt-1.5 line-clamp-2 md:line-clamp-3 font-normal pr-2">
          {item.description || "Soft and fluffy idlis served with sambar and chutney."}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between relative">
        <span className="font-bold text-[15px] md:text-[16px] text-[#087A36] leading-none">₹{item.price}</span>

        <div onClick={e => e.stopPropagation()}>
          {cartItem ? (
            <div className="flex items-center rounded-[7px] border border-[#FF4D00] bg-[#FFF1E8] shadow-sm h-[32px] md:h-[34px] w-[80px] md:w-[85px]">
              <button
                onClick={handleDecrement}
                className="h-full w-7 flex items-center justify-center text-[#FF4D00] hover:bg-[#FF4D00]/10 transition-colors rounded-l-[7px]"
              >
                <Minus className="h-3.5 w-3.5 stroke-[3]" />
              </button>
              <span className="flex-1 text-center text-[13px] font-bold text-[#FF4D00] leading-none">{cartItem.qty}</span>
              <button
                onClick={handleIncrement}
                className="h-full w-7 flex items-center justify-center text-[#FF4D00] hover:bg-[#FF4D00]/10 transition-colors rounded-r-[7px]"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddClick}
              className="h-[32px] md:h-[34px] w-[80px] md:w-[85px] rounded-[7px] border border-[#FF4D00] text-[#FF4D00] bg-[#FFFFFF] hover:bg-[#FFF1E8] hover:border-[#E94300] hover:text-[#E94300] font-bold text-[13px] uppercase tracking-wide flex items-center justify-center gap-1 transition-colors shadow-sm"
            >
              <span>ADD</span> <span className="text-[15px] md:text-[16px] leading-none font-medium mb-0.5">+</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return null;
}

export const CompoundMenuCard = { Root, ImageSection, BadgeRibbon, AddButtonOverlay, WishlistButton, FoodTypeOverlay, RatingOverlay, Header, Footer };
export type { MenuCardItem };
