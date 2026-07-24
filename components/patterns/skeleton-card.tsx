import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  variant?: "menu-item" | "cart-item" | "text" | "image";
  count?: number;
  hasOffer?: boolean;
}

function MenuItemSkeleton({ hasOffer = true }: { hasOffer?: boolean }) {
  return (
    <div className="overflow-hidden bg-card">
      {/* Image Section matching CompoundMenuCard.ImageSection */}
      <div className="relative w-full rounded-2xl bg-muted" style={{ aspectRatio: "1 / 1" }}>
        <Skeleton className="h-full w-full rounded-2xl" />

        {/* FoodTypeOverlay placeholder (bottom-left) */}
        <div className="absolute bottom-2 left-2 z-10">
          <Skeleton className="h-4 w-4 rounded-sm" />
        </div>

        {/* RatingOverlay placeholder (bottom-right) */}
        {hasOffer && (
          <div className="absolute bottom-2 right-2 z-10">
            <Skeleton className="h-5 w-16 rounded-full bg-emerald-500/20" />
          </div>
        )}
      </div>

      {/* Header matching CompoundMenuCard.Header */}
      <div className="pt-2 pb-1">
        {/* Item name */}
        <Skeleton className="h-4 w-3/4 mb-1.5" />
        <Skeleton className="h-3 w-1/2 mb-1.5" />

        {/* Price & Add Button Row */}
        <div className="flex items-center justify-between gap-1 mt-2">
          <div className="flex flex-col gap-0.5">
            <Skeleton className="h-3 w-10" />
            <Skeleton className="h-5 w-14 rounded" />
          </div>
          <Skeleton className="h-8 w-14 rounded-lg" />
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
