"use client";

import { useEffect, useRef } from "react";
import { ShoppingCart, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface AddPopupItem {
  id: string;
  name: string;
  price: number;
  compareAtPrice?: number | null;
  foodType: string;
  imageUrl?: string | null;
  kitchenName: string;
  timeSlot: string;
}

interface AddToCartPopupProps {
  item: AddPopupItem | null;
  qty?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddToCartPopup({ item, qty = 1, open, onOpenChange }: AddToCartPopupProps) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onOpenChange(false);
      }, 3500);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [open, item?.id, onOpenChange]);

  if (!item || !open) return null;

  return (
    <>
      {/* Desktop: top center */}
      <div className={cn(
        "hidden md:flex fixed top-24 left-1/2 -translate-x-1/2 z-[60",
        "animate-in fade-in slide-in-from-top-2 duration-300"
      )}>
        <CardContent item={item} qty={qty} onClose={() => onOpenChange(false)} />
      </div>

      {/* Mobile: above bottom nav */}
      <div className={cn(
        "md:hidden fixed bottom-20 left-3 right-3 z-[60",
        "animate-in fade-in slide-in-from-bottom-2 duration-300"
      )}>
        <CardContent item={item} qty={qty} onClose={() => onOpenChange(false)} />
      </div>
    </>
  );
}

function CardContent({ item, qty, onClose }: { item: AddPopupItem; qty: number; onClose: () => void }) {
  return (
    <Link
      href="/cart"
      onClick={onClose}
      className="block rounded-lg bg-secondary p-3 shadow-lg hover:bg-secondary/80 transition-colors border border-border/50"
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">
            Added {item.name}
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-black text-foreground">CART</p>
          <p className="text-[10px] font-semibold text-muted-foreground">{qty} ITEM{qty > 1 ? "S" : ""}</p>
        </div>
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="40px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ShoppingCart className="h-4 w-4 text-muted-foreground/40" />
            </div>
          )}
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      </div>
    </Link>
  );
}
