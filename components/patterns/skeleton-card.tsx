import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  variant?: "menu-item" | "cart-item" | "text" | "image";
  count?: number;
  hasOffer?: boolean;
}

function MenuItemSkeleton({ hasOffer = true }: { hasOffer?: boolean }) {
  return (
    <div className="bg-white rounded-xl p-2.5 md:p-3 flex gap-3 md:gap-3.5 shadow-sm border border-gray-100">
      {/* Image Section matching CompoundMenuCard.ImageSection */}
      <div className="relative w-[100px] md:w-[120px] h-[100px] md:h-[120px] rounded-xl bg-muted shrink-0">
        <Skeleton className="h-full w-full rounded-xl" />
        
        {/* Wishlist placeholder (top-right) */}
        <div className="absolute top-1.5 md:top-2 right-1.5 md:right-2 z-10">
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>

        {/* Badge placeholder (bottom-left) */}
        {hasOffer && (
          <div className="absolute bottom-1.5 md:bottom-2 left-1.5 md:left-2 z-10">
            <Skeleton className="h-4 w-12 rounded-sm" />
          </div>
        )}
      </div>

      {/* Header matching CompoundMenuCard.Header */}
      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
        <div>
          {/* Title & Icon row */}
          <div className="flex items-start gap-1 md:gap-1.5 mb-1.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3.5 w-3.5 rounded-sm shrink-0" />
          </div>
          {/* Description */}
          <Skeleton className="h-3 w-full mb-1" />
          <Skeleton className="h-3 w-2/3" />
        </div>

        {/* Price & Add Button Row */}
        <div className="flex items-center justify-between mt-2 md:mt-2.5">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-[28px] md:h-[30px] w-16 rounded-lg" />
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
