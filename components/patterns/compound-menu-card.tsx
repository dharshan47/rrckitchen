"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createBadgeVariant } from "@/lib/patterns";
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
    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
      <ProgressiveImage
        src={item.imageUrl}
        alt={item.name}
        fill
        className="object-cover"
      />
      {children}
    </div>
  );
}

function BadgeRibbon() {
  const { item, discount } = useMenuCardContext();
  const savingsPercent = Math.round(((discount - item.price) / discount) * 100);
  return (
    <div className="absolute left-0 top-0 z-10">
      <div className="relative bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground shadow-md after:absolute after:bottom-[-6px] after:left-0 after:border-l-[14px] after:border-r-[14px] after:border-t-[6px] after:border-l-primary after:border-r-primary after:border-t-transparent after:content-['']">
        {savingsPercent}% OFF
      </div>
    </div>
  );
}

function AddButtonOverlay() {
  const { item, onAddToCart } = useMenuCardContext();
  return (
    <div className="absolute bottom-2 right-2 z-10">
      <Button
        size="sm"
        variant="secondary"
        className="h-8 w-16 rounded-lg bg-background/90 text-xs font-semibold shadow-sm backdrop-blur-sm hover:bg-background"
        onClick={(e) => { e.stopPropagation(); onAddToCart(item.id); }}
      >
        Add
      </Button>
    </div>
  );
}

function Header() {
  const { item, discount } = useMenuCardContext();
  const userRole = useAuthRole();
  const isAdmin = userRole === "admin";
  const hasDiscount = discount > item.price;
  return (
    <div className="px-3 pb-3 pt-2">
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="text-lg font-bold text-foreground">₹{item.price}</span>
        {hasDiscount && (
          <span className="text-sm text-muted-foreground line-through">₹{discount}</span>
        )}
        <Badge variant={createBadgeVariant(item.foodType)} className="ml-auto shrink-0 text-[10px] leading-none">
          {item.foodType}
        </Badge>
      </div>
      <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground">
        {item.name}
      </h3>
      {isAdmin && (
        <p className="mt-0.5 text-[11px] text-muted-foreground">{item.kitchenName}</p>
      )}
    </div>
  );
}

function Footer() {
  const { item } = useMenuCardContext();
  return (
    <p className="px-3 pb-3 text-[10px] uppercase tracking-wider text-muted-foreground">
      {item.timeSlot === "MORNING" ? "Breakfast" :
       item.timeSlot === "LUNCH" ? "Lunch" :
       item.timeSlot === "EVENINGSNACKS" ? "Snacks" :
       item.timeSlot === "DINNER" ? "Dinner" : item.timeSlot}
    </p>
  );
}

export const CompoundMenuCard = { Root, ImageSection, BadgeRibbon, AddButtonOverlay, Header, Footer };
export type { MenuCardItem };
