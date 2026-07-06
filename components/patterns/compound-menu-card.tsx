"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/patterns/progressive-image";
import { useAuthRole } from "@/stores";

interface MenuCardItem {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  foodType: string;
  timeSlot: string;
  kitchenName: string;
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
  const { item, onAddToCart } = useMenuCardContext();
  return (
    <div className="absolute bottom-2 right-2 z-10">
      
    </div>
  );
}

function Header() {
  const { item, discount, onAddToCart } = useMenuCardContext();
  const savingsAmount = discount - item.price;
  
  return (
    <div className="px-3 pb-4 pt-1.5">
      <div className="flex flex-col">
        {/* Name */}
        <h3 className="line-clamp-2 text-sm font-bold leading-snug text-foreground">
          {item.name}
        </h3>
        
        {/* Price & Add Button Row */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-md bg-[#EE7005] px-2 py-0.5 text-sm font-black text-white shadow-sm">
              ₹{item.price}
            </div>
            <span className="text-sm font-medium text-muted-foreground line-through">₹{discount}</span>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            className="h-8 rounded-lg font-bold border-[#EE7005] text-[#EE7005] px-4 hover:text-[#EE7005]"
            onClick={(e) => { e.stopPropagation(); onAddToCart(item.id); }}
          >
            Add
          </Button>
        </div>
        
        

        {/* Dashed Separator */}
        <div className="mt-4 border-t border-dashed border-border" />
      </div>
    </div>
  );
}

function Footer() {
  return null; // Merged into Header for the combined design look
}

export const CompoundMenuCard = { Root, ImageSection, BadgeRibbon, AddButtonOverlay, Header, Footer };
export type { MenuCardItem };
