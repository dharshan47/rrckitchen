"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/patterns/progressive-image";
import { WishlistButton as WishlistBtn } from "@/components/menu/wishlist-button";
import { cn } from "@/lib/utils";
import { Minus, Plus } from "lucide-react";
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
        className={`flex flex-col gap-2 w-full transition-all duration-300 ${isClickable ? "cursor-pointer hover:scale-[0.97] active:scale-95 md:hover:scale-100 md:active:scale-100" : ""}`}
      >
        {children}
      </div>
    </MenuCardContext.Provider>
  );
}

function ImageSection({ children }: { children?: ReactNode }) {
  const { item } = useMenuCardContext();
  return (
    <div className="relative w-full overflow-hidden rounded-[18px] bg-muted shadow-sm" style={{ aspectRatio: "1 / 1" }}>
      {item.imageUrl ? (
        <ProgressiveImage
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-cover"
        />
      ) : (
        <div className="h-full w-full flex items-center justify-center bg-linear-to-br from-primary/10 to-muted">
          <span className="text-muted-foreground/20 text-4xl font-black">
            {item.name.charAt(0)}
          </span>
        </div>
      )}
      <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
        <WishlistBtn menuItemId={item.id} size="sm" variant="overlay" />
      </div>
      {children}
    </div>
  );
}

// Kept as empty components for backwards compatibility in case they are referenced
function BadgeRibbon() { return null; }
function AddButtonOverlay() { return null; }
function WishlistButton() {
  const { item } = useMenuCardContext();
  return (
    <div className="absolute top-2 right-2 z-10" onClick={e => e.stopPropagation()}>
      <WishlistBtn menuItemId={item.id} size="sm" variant="overlay" />
    </div>
  );
}
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
    <div className="pt-1 pb-2 flex flex-col gap-1.5">
      {/* Row 1: Veg/NonVeg and Rating */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {item.foodType === "VEG" ? (
            <VegIcon className="h-3.75 w-3.75" />
          ) : item.foodType === "NONVEG" ? (
            <NonVegIcon className="h-3.75 w-3.75" />
          ) : null}
        </div>
        {(item.avgRating ?? item.kitchenRating) ? (
          <div className="flex items-center gap-0.5 bg-[#E8F8F0] px-1.5 py-0.75 rounded text-[11px] font-extrabold text-[#118A42]">
            <svg className="h-2.5 w-2.5 fill-[#118A42] shrink-0" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span>{(item.avgRating ?? item.kitchenRating)!.toFixed(1)}</span>
            {item.totalReviews ? <span className="font-bold opacity-80">({item.totalReviews})</span> : null}
          </div>
        ) : null}
      </div>

      {/* Row 2: Item Name */}
      <h3 className="line-clamp-2 text-[15px] font-bold leading-tight text-gray-800">
        {item.name}
      </h3>

      {/* Row 3: Price & Add Button */}
      <div className="flex items-end justify-between gap-2 mt-0.5">
        <div className="flex flex-col min-w-0 pb-0.5">
          {hasDiscount ? (
            <>
              <span className="text-[12px] font-semibold text-gray-500 line-through leading-none mb-1">
                ₹{discount}
              </span>
              <div className="bg-primary border-b-2 border-r-2 border-black rounded-[3px] px-1.5 py-0.75 inline-flex items-center self-start shadow-xs">
                <span className="text-[13px] font-black leading-none text-primary-foreground tracking-tight">₹{item.price}</span>
              </div>
            </>
          ) : (
            <span className="text-[14px] font-black text-gray-800 tracking-tight">₹{item.price}</span>
          )}
        </div>

        {cartItem ? (
          <div
            className="flex items-center rounded-lg border border-[#118A42] bg-white shrink-0 shadow-xs"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={handleDecrement}
              className="h-7.5 w-7 flex items-center justify-center text-[#118A42] hover:bg-[#118A42]/10 transition-colors rounded-l-lg"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3 stroke-3" />
            </button>
            <span className="w-5 text-center text-[13px] font-black text-[#118A42] leading-none">{cartItem.qty}</span>
            <button
              onClick={handleIncrement}
              className="h-7.5 w-7 flex items-center justify-center text-[#118A42] hover:bg-[#118A42]/10 transition-colors rounded-r-lg"
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3 stroke-3" />
            </button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="outline"
            className="h-8 shrink-0 rounded-lg font-black border-gray-200 text-[#118A42] px-7 text-sm hover:bg-gray-50 transition-colors shadow-xs"
            onClick={handleAddClick}
          >
            ADD
          </Button>
        )}
      </div>
    </div>
  );
}

function Footer() {
  return null; // Merged into Header for the combined design look
}

export const CompoundMenuCard = { Root, ImageSection, BadgeRibbon, AddButtonOverlay, WishlistButton, FoodTypeOverlay, RatingOverlay, Header, Footer };
export type { MenuCardItem };

