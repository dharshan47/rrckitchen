import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  variant?: "menu-item" | "cart-item" | "text" | "image";
  count?: number;
  hasOffer?: boolean;
}

function MenuItemSkeleton({ hasOffer = true }: { hasOffer?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Image Section matching CompoundMenuCard.ImageSection */}
      <div className="relative aspect-square w-full bg-white p-3">
        <div className="relative h-full w-full">
          <Skeleton className="h-full w-full rounded-sm" />
        </div>
        
        {hasOffer && (
          <div className="absolute left-2 top-0 z-10 h-9 w-9">
            <Skeleton 
              className="h-full w-full bg-[#1B2F45]/20 rounded-none" 
              style={{ 
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 83% 92%, 66% 100%, 50% 92%, 33% 100%, 16% 92%, 0% 100%)" 
              }} 
            />
          </div>
        )}
      </div>

      <div className="px-3 pb-4 pt-1.5">
        <div className="flex flex-col">
          {/* Name/Title placeholder */}
          <Skeleton className="h-5 w-1/2" />
          
          {/* Price & Add Button Row */}
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Active Price Badge placeholder (e.g. ₹50) */}
              <Skeleton className="h-7 w-16 rounded-md bg-orange-100" />
              {/* Original Price placeholder (e.g. ₹55) */}
              <Skeleton className="h-4 w-10" />
            </div>
            
            {/* Add Button placeholder */}
            <Skeleton className="h-8 w-16 rounded-lg border border-orange-200" />
          </div>
          
          {/* Dashed Separator at the bottom */}
          <div className="mt-4 border-t border-dashed border-border" />
        </div>
      </div>
    </div>
  );
}

function CartItemSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-4">
      <Skeleton className="h-16 w-16 shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-6" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonCard({ variant = "menu-item", count = 1, hasOffer = true }: SkeletonCardProps) {
  const items = Array.from({ length: count });

  if (variant === "cart-item") {
    return (
      <div className="space-y-3">
        {items.map((_, i) => <CartItemSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <>
      {items.map((_, i) => (
        <div key={i} className="snap-start shrink-0 w-55 lg:w-60">
          <MenuItemSkeleton hasOffer={hasOffer} />
        </div>
      ))}
    </>
  );
}
