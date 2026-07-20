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
  name: string;
  price: number;
  compareAtPrice?: number | null;
  foodType: string;
  timeSlot: string;
  kitchenName: string;
  kitchenRating?: number | null;
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
        className={`overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-sm ${isClickable ? "cursor-pointer" : ""}`}
      >
        {children}
      </div>
    </MenuCardContext.Provider>
  );
}

function ImageSection({ children }: { children?: ReactNode }) {
  const { item } = useMenuCardContext();
  if (!item.imageUrl) return null;
  return (
    <div className="relative aspect-square w-full overflow-hidden bg-white p-3">
      <div className="relative h-full w-full">
        <ProgressiveImage
          src={item.imageUrl}
          alt={item.name}
          fill
          className="object-contain"
        />
      </div>
      {children}
    </div>
  );
}

function BadgeRibbon() {
  const { item, discount } = useMenuCardContext();
  if (item.compareAtPrice == null) return null;

  const savingsPercent = Math.round(((discount - item.price) / discount) * 100);

  if (savingsPercent <= 0) return null;

  return (
    <div className="absolute left-2 top-0 z-10">
      <div
        className="flex h-9 w-9 flex-col items-center justify-center bg-[#1B2F45] text-center text-white shadow-sm"
        style={{
          clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 83% 92%, 66% 100%, 50% 92%, 33% 100%, 16% 92%, 0% 100%)",
        }}
      >
        <span className="text-[11px] font-black leading-none">{savingsPercent}%</span>
        <span className="text-[8px] font-black leading-none uppercase tracking-tighter">Off</span>
      </div>
    </div>
  );
}

function AddButtonOverlay() {
  return null;
}

function WishlistButton() {
  const { item } = useMenuCardContext();
  return (
    <div className="absolute right-2 top-2 z-10">
      <WishlistBtn menuItemId={item.id} size="sm" />
    </div>
  );
}

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

function FoodTypeIcon({ foodType }: { foodType: string }) {
  if (foodType === "VEG") return <VegIcon className="h-3.5 w-3.5 shrink-0" />;
  if (foodType === "NONVEG") return <NonVegIcon className="h-3.5 w-3.5 shrink-0" />;
  return null;
}

function BestsellerBadge() {
  return (
    <span className="inline-flex items-center rounded-sm bg-orange-500/10 px-1 py-0.5 text-[9px] font-bold uppercase tracking-wider text-orange-600 shrink-0">
      Bestseller
    </span>
  );
}

function RatingBadge({ rating, count }: { rating: number; count: number }) {
  if (count <= 0) return null;
  return (
    <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-yellow-600 shrink-0">
      <svg className="h-3 w-3 fill-yellow-400" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
      {rating.toFixed(1)}
      <span className="text-muted-foreground">({count})</span>
    </span>
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
  };
  
  return (
    <div className="px-3 pb-4 pt-1.5">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <FoodTypeIcon foodType={item.foodType} />
            {item.isBestseller && <BestsellerBadge />}
          </div>
          {item.kitchenRating != null && item.totalReviews != null && item.totalReviews > 0 && (
            <RatingBadge rating={item.kitchenRating} count={item.totalReviews} />
          )}
        </div>

        {ctx.showKitchenMeta && (
          <p className="text-xs font-medium text-muted-foreground truncate mb-0.5">
            {item.kitchenName}
          </p>
        )}

        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
          {item.name}
        </h3>

        {/* Price & Add Button Row */}
        <div className="mt-2 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 shrink-0 min-w-0 max-w-[60%]">
            {item.compareAtPrice != null ? (
              <>
                <div className="rounded-md bg-[#EE7005] px-1 py-0.5 text-[11px] font-black text-white shadow-sm whitespace-nowrap">
                  ₹{item.price}
                </div>
                <span className="text-[11px] font-medium text-muted-foreground line-through whitespace-nowrap">₹{discount}</span>
              </>
            ) : (
              <span className="text-sm font-black text-foreground truncate">₹{item.price}</span>
            )}
          </div>

          {cartItem ? (
            <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
              <button
                onClick={handleDecrement}
                className="h-8 w-8 md:h-7 md:w-7 flex items-center justify-center rounded border border-[#EE7005] text-[#EE7005] hover:bg-[#EE7005] hover:text-white transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4 md:h-3 md:w-3" />
              </button>
              <span className="w-7 md:w-6 text-center text-sm md:text-xs font-bold text-[#EE7005]">{cartItem.qty}</span>
              <button
                onClick={handleIncrement}
                className="h-8 w-8 md:h-7 md:w-7 flex items-center justify-center rounded border border-[#EE7005] text-[#EE7005] hover:bg-[#EE7005] hover:text-white transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4 md:h-3 md:w-3" />
              </button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              className="h-8 md:h-7 shrink-0 rounded-lg font-bold border-[#EE7005] text-[#EE7005] px-3 md:px-2.5 text-xs hover:text-[#EE7005]"
              onClick={handleAddClick}
            >
              Add
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return null; // Merged into Header for the combined design look
}

export const CompoundMenuCard = { Root, ImageSection, BadgeRibbon, AddButtonOverlay, WishlistButton, Header, Footer };
export type { MenuCardItem };
