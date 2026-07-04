import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  variant?: "menu-item" | "cart-item" | "text" | "image";
  count?: number;
}

function MenuItemSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-12 rounded-full" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <div className="pt-1">
          <Skeleton className="h-4 w-20" />
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

export function SkeletonCard({ variant = "menu-item", count = 1 }: SkeletonCardProps) {
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
        <div key={i} className="snap-start shrink-0 w-[220px] lg:w-[240px]">
          <MenuItemSkeleton />
        </div>
      ))}
    </>
  );
}
