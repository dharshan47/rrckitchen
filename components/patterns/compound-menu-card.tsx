"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
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
          "bg-[#FFFFFF] rounded-[16px] p-2.5 md:p-3 flex gap-3 md:gap-4 border border-[#F0F0F0] shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-shadow group w-full relative overflow-hidden",
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
    badge = { label: "Bestseller", color: "bg-[#0B6B22]" };
  } else if (item.orderCount && item.orderCount > 10) {
    badge = { label: "Popular", color: "bg-[#0B6B22]" };
  } else if (item.orderCount && item.orderCount > 5) {
    badge = { label: "Bestseller", color: "bg-[#0B6B22]" };
  }

  // Adding "Homemade" badge logic if name matches sambar as a design tweak
  if (item.name.toLowerCase().includes("sambar")) {
    badge = { label: "Homemade", color: "bg-[#0B6B22]" };
  }

  return (
    <div className="relative w-[120px] md:w-[140px] h-[120px] md:h-[140px] rounded-[12px] overflow-hidden shrink-0 bg-[#F4EFE9]">
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
          "absolute bottom-1.5 left-1.5 text-[#FFFFFF] text-[10px] md:text-[11px] font-bold px-[8px] py-[3px] rounded-[6px] shadow-sm tracking-wide z-10",
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
  const { item, onAddToCart, onShowAddPopup, discount } = ctx;
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
    <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
      <div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <h3 className="font-bold text-[#111111] text-[15px] md:text-[17px] leading-tight truncate max-w-[85%]">
            {item.name}
          </h3>
          <svg viewBox="0 0 24 24" className="w-[18px] h-[18px] shrink-0 text-[#087A36] fill-[#087A36]">
            <path d="M10.52 1.34L11.4 1.95a2 2 0 0 0 2.2 0l.88-.61a2 2 0 0 1 3.03 1.14l.32 1.03a2 2 0 0 0 1.63 1.36l1.05.15a2 2 0 0 1 1.67 2.6l-.42.99a2 2 0 0 0 .19 2.1l.73.82a2 2 0 0 1-.22 2.94l-.86.7a2 2 0 0 0-.67 1.98l.26 1.04a2 2 0 0 1-2.2 2.5l-1.06-.21a2 2 0 0 0-2.01.62l-.7.83a2 2 0 0 1-3.07.13l-.78-.76a2 2 0 0 0-2.14-.32l-1.01.37a2 2 0 0 1-2.73-1.63l-.15-1.07a2 2 0 0 0-1.25-1.68l-1-.44a2 2 0 0 1-1.02-2.92l.62-.89a2 2 0 0 0 0-2.1l-.62-.89a2 2 0 0 1 1.02-2.92l1-.44a2 2 0 0 0 1.25-1.68l.15-1.07a2 2 0 0 1 2.73-1.63l1.01.37a2 2 0 0 0 2.14-.32l.78-.76a2 2 0 0 1 1.39-.18Z" />
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>

        <p className="text-[12px] md:text-[13px] text-[#666666] leading-[1.4] mt-1.5 line-clamp-2 pr-2 font-normal">
          {item.description || "Soft and fluffy idlis served with sambar and chutney."}
        </p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 relative w-full">
        <div className="flex items-center gap-1.5 shrink min-w-0">
          <span className="font-extrabold text-[16px] md:text-[18px] text-[#0B6B22] tracking-tight truncate">₹{item.price}</span>
          {discount && discount > item.price && (
            <span className="text-[12px] md:text-[13px] text-[#999999] line-through font-medium truncate shrink-0">₹{discount}</span>
          )}
        </div>

        <div onClick={e => e.stopPropagation()} className="shrink-0 ml-auto">
          {cartItem ? (
            <div className="flex items-center rounded-[6px] border border-[#FF6B00] bg-[#FFF5ED] h-[32px] md:h-[34px] w-[75px] md:w-[90px]">
              <button
                onClick={handleDecrement}
                className="h-full w-7 md:w-8 flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors rounded-l-[6px]"
              >
                <Minus className="h-3.5 w-3.5 stroke-[3]" />
              </button>
              <span className="flex-1 text-center text-[13px] font-bold text-[#FF6B00] leading-none">{cartItem.qty}</span>
              <button
                onClick={handleIncrement}
                className="h-full w-7 md:w-8 flex items-center justify-center text-[#FF6B00] hover:bg-[#FF6B00]/10 transition-colors rounded-r-[6px]"
              >
                <Plus className="h-3.5 w-3.5 stroke-[3]" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleAddClick}
              className="h-[32px] md:h-[34px] w-[75px] md:w-[90px] rounded-[6px] border border-[#FF6B00] text-[#FF6B00] bg-[#FFFFFF] hover:bg-[#FFF5ED] font-bold text-[13px] uppercase flex items-center justify-between px-2.5 md:px-3 transition-colors shadow-sm"
            >
              <span>ADD</span> <span className="text-[16px] font-medium leading-none mb-0.5">+</span>
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
