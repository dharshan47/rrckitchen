"use client";

import { createContext, useContext, useCallback, useMemo, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createBadgeVariant, formatTimeSlot } from "@/lib/patterns";
import { ProgressiveImage } from "@/components/patterns/progressive-image";
import { useAuthRole } from "@/stores";

interface MenuCardItem {
  id: string;
  name: string;
  price: number;
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

function Root({ item, onAddToCart, onItemClick, children }: CompoundMenuCardProps) {
  const isClickable = !!onItemClick;

  const handleRootClick = useCallback(() => {
    if (onItemClick) onItemClick(item);
  }, [onItemClick, item]);

  const value = useMemo(
    () => ({ item, onAddToCart, onItemClick: onItemClick ?? null }),
    [item, onAddToCart, onItemClick]
  );

  return (
    <MenuCardContext.Provider value={value}>
      <div
        onClick={isClickable ? handleRootClick : undefined}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={isClickable ? (e) => { if (e.key === "Enter") handleRootClick(); } : undefined}
        className={`overflow-hidden rounded-3xl border border-border bg-white transition-shadow hover:shadow-sm ${isClickable ? "cursor-pointer" : ""}`}
      >
        {children}
      </div>
    </MenuCardContext.Provider>
  );
}

function ImageSection() {
  const { item } = useMenuCardContext();
  if (!item.imageUrl) return null;
  return (
    <ProgressiveImage
      src={item.imageUrl}
      alt={item.name}
      fill
      className="relative h-48 w-full"
    />
  );
}

function Header() {
  const { item } = useMenuCardContext();
  const userRole = useAuthRole();
  const isAdmin = userRole === "admin";
  return (
    <div className="px-6 pt-4 pb-2">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xl font-bold text-foreground">₹{item.price}</p>
        <Badge variant={createBadgeVariant(item.foodType)} className="shrink-0">
          {item.foodType}
        </Badge>
      </div>
      <h3 className="text-base font-semibold text-foreground">{item.name}</h3>
      {isAdmin && (
        <p className="text-xs text-muted-foreground mt-0.5">{item.kitchenName}</p>
      )}
    </div>
  );
}

function Footer() {
  const { item, onAddToCart } = useMenuCardContext();
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border px-6 py-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
        {formatTimeSlot(item.timeSlot)}
      </p>
      <Button size="sm" onClick={(e) => { e.stopPropagation(); onAddToCart(item.id); }}>
        Add
      </Button>
    </div>
  );
}

export const CompoundMenuCard = { Root, ImageSection, Header, Footer };
export type { MenuCardItem };
