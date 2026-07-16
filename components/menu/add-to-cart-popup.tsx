"use client";

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
      className="block rounded-lg bg-primary p-3 shadow-lg hover:brightness-110 transition-all border border-primary/50"
    >
      <div className="flex items-center gap-2">
        <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-primary-foreground/20">
          {item.imageUrl ? (
            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="36px" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ShoppingCart className="h-4 w-4 text-primary-foreground/60" />
            </div>
          )}
        </div>
        <div className="text-left">
          <p className="text-xs font-black text-primary-foreground leading-tight">CART</p>
          <p className="text-[10px] font-semibold text-primary-foreground/70">{qty} ITEM{qty > 1 ? "S" : ""}</p>
        </div>
        <ChevronRight className="h-5 w-5 text-primary-foreground/60 shrink-0 ml-1" />
      </div>
    </Link>
  );
}
