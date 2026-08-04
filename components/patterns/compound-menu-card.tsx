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
          "bg-white rounded-xl p-2.5 md:p-3 flex gap-3 md:gap-3.5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group w-full",
          isClickable && "cursor-pointer"
        )}
      >
        {children}
      </div>
    </MenuCardContext.Provider>
  );
}

function ImageSection({ children }: { children?: ReactNode }) {
  const { item } = useMenuCardContext();
  
  let badge = null;
  if (item.isBestseller || (item.orderCount && item.orderCount > 10)) {
    badge = { label: "Bestseller", color: "bg-[#267E3E]" };
  } else if (item.orderCount && item.orderCount > 5) {
    badge = { label: "Popular", color: "bg-[#EE7005]" };
  }

  return (
    <div className="relative w-[100px] md:w-[120px] h-[100px] md:h-[120px] rounded-xl overflow-hidden shrink-0 bg-gray-50">
      {item.imageUrl ? (
        <ProgressiveImage
          highResUrl={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-100">
          <UtensilsCrossed className="w-7 md:w-8 h-7 md:h-8" />
        </div>
      )}
      
      <div className="absolute top-1.5 md:top-2 right-1.5 md:right-2 z-10" onClick={e => e.stopPropagation()}>
        <WishlistBtn menuItemId={item.id} size="sm" variant="overlay" />
      </div>

      {badge && (
        <div className={cn(
          "absolute bottom-1.5 md:bottom-2 left-1.5 md:left-2 text-white text-[8px] md:text-[9px] font-bold px-1.5 md:px-2 py-0.5 rounded-sm uppercase tracking-wide shadow-sm",
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
function BadgeRibbon() { return null; }
function AddButtonOverlay() { return null; }
function WishlistButton() { return null; }
function FoodTypeOverlay() { return null; }
function RatingOverlay() { return null; }

export function VegIcon({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className={cn(className)}>
      <rect x="0.5" y="0.5" width="15" height="15" rx="3" fill="white" stroke="#22C55E" strokeWidth="1.5" />
      <circle cx="8" cy="8" r="3.5" fill="#22C55E" />
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
  const { item, discount, onAddToCart, onShowAddPopup } = ctx;
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

  const hasDiscount = item.compareAtPrice != null;

  return (
    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
      <div>
        <div className="flex items-start gap-1 md:gap-1.5">
          <h3 className="font-bold text-gray-900 text-[13px] md:text-[14px] leading-tight truncate">
            {item.name}
          </h3>
          {item.foodType === "VEG" ? (
            <VegIcon className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0 mt-0.5" />
          ) : item.foodType === "NONVEG" ? (
            <NonVegIcon className="w-3 md:w-3.5 h-3 md:h-3.5 shrink-0 mt-0.5" />
          ) : null}
        </div>
        <p className="text-[10px] md:text-[11px] text-gray-500 leading-[1.5] mt-1 md:mt-1.5 line-clamp-2">
          {item.description || "Freshly prepared dish with premium ingredients."}
        </p>
      </div>
      <div className="flex items-center justify-between mt-2 md:mt-2.5">
        <div className="flex flex-col">
          {hasDiscount ? (
            <>
              <span className="text-[10px] font-semibold text-gray-500 line-through leading-none mb-0.5">₹{discount}</span>
              <span className="font-extrabold text-[14px] md:text-[15px] text-gray-900 leading-none">₹{item.price}</span>
            </>
          ) : (
            <span className="font-extrabold text-[14px] md:text-[15px] text-gray-900 leading-none">₹{item.price}</span>
          )}
        </div>
        
        {cartItem ? (
          <div
            className="flex items-center rounded-lg border border-[#EE7005] bg-white shrink-0 shadow-sm h-[28px] md:h-[30px]"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleDecrement}
              className="h-full w-7 flex items-center justify-center text-[#EE7005] hover:bg-[#EE7005]/10 transition-colors rounded-l-lg"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3 stroke-[3]" />
            </button>
            <span className="w-5 text-center text-[12px] font-bold text-[#EE7005] leading-none">{cartItem.qty}</span>
            <button
              onClick={handleIncrement}
              className="h-full w-7 flex items-center justify-center text-[#EE7005] hover:bg-[#EE7005]/10 transition-colors rounded-r-lg"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3 stroke-[3]" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAddClick}
            className="h-[28px] md:h-[30px] px-3 md:px-4 rounded-lg border border-[#EE7005] text-[#EE7005] bg-[#FFF7F0] hover:bg-[#FFF0E0] font-bold text-[11px] md:text-[12px] uppercase tracking-wide flex items-center gap-0.5 md:gap-1 transition-colors cursor-pointer shrink-0"
          >
            ADD <span className="text-[14px] md:text-[15px] leading-none font-normal">+</span>
          </button>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return null;
}

export const CompoundMenuCard = { Root, ImageSection, BadgeRibbon, AddButtonOverlay, WishlistButton, FoodTypeOverlay, RatingOverlay, Header, Footer };
export type { MenuCardItem };
