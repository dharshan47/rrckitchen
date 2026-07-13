"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/patterns/progressive-image";
import { WishlistButton as WishlistBtn } from "@/components/menu/wishlist-button";


interface MenuCardItem {
  id: string;
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
}

interface MenuCardContextValue {
  item: MenuCardItem;
  onAddToCart: (id: string) => void;
  onItemClick?: ((item: MenuCardItem) => void) | null;
  discount: number;
}

const MenuCardContext = createContext<MenuCardContextValue | null>(null);

function useMenuCardContext() {
  const ctx = useContext(MenuCardContext);
  if (!ctx) throw new Error("CompoundMenuCard sub-components must be used within <CompoundMenuCard>");
  return ctx;
}

interface CompoundMenuCardProps {
  item: MenuCardContextValue["item"];
  onAddToCart: (id: string) => void;
  onItemClick?: (item: MenuCardContextValue["item"]) => void;
  children: ReactNode;
}

const DISCOUNT_MULTIPLIER = 1.35;

function Root({ item, onAddToCart, onItemClick, children }: CompoundMenuCardProps) {
  const isClickable = !!onItemClick;

  const handleRootClick = useCallback(() => {
    if (onItemClick) onItemClick(item);
  }, [onItemClick, item]);

  const discount = useMemo(
    () => item.compareAtPrice ?? Math.round(item.price * DISCOUNT_MULTIPLIER),
    [item.price, item.compareAtPrice]
  );

  const value = useMemo(
    () => ({ item, onAddToCart, onItemClick: onItemClick ?? null, discount }),
    [item, onAddToCart, onItemClick, discount]
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

function Header() {
  const ctx = useMenuCardContext();
  const { item, discount, onAddToCart } = ctx;
  
  return (
    <div className="px-3 pb-4 pt-1.5">
      <div className="flex flex-col">
        {/* Kitchen Name + Rating */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <p className="text-xs font-medium text-muted-foreground truncate">
            {item.kitchenName}
          </p>
          {item.kitchenRating != null && (
            <span className="text-[10px] font-semibold text-yellow-600 flex items-center gap-0.5 shrink-0">
              <svg className="h-3 w-3 fill-yellow-400" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {Number(item.kitchenRating).toFixed(1)}
            </span>
          )}
        </div>
        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
          {item.name}
        </h3>
        
        {/* Price & Add Button Row */}
        <div className="mt-4 flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0 shrink">
            {item.compareAtPrice != null ? (
              <>
                <div className="rounded-md bg-[#EE7005] px-1.5 py-0.5 text-xs font-black text-white shadow-sm shrink-0">
                  ₹{item.price}
                </div>
                <span className="text-xs font-medium text-muted-foreground line-through shrink-0">₹{discount}</span>
              </>
            ) : (
              <span className="text-sm font-black text-foreground">₹{item.price}</span>
            )}
          </div>
          
          <Button
            size="sm"
            variant="outline"
            className="h-7 shrink-0 rounded-lg font-bold border-[#EE7005] text-[#EE7005] px-2.5 text-xs hover:text-[#EE7005]"
            onClick={(e) => { e.stopPropagation(); onAddToCart(item.id); }}
          >
            Add
          </Button>
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
