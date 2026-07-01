import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  variant?: "menu-item" | "cart-item" | "text" | "image";
  count?: number;
}

function MenuItemSkeleton() {
  return (
    <div className="rounded-3xl border border-border bg-white p-6">
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-6 w-14 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="mt-4 flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-9 w-20 rounded-full" />
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
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((_, i) => <MenuItemSkeleton key={i} />)}
    </div>
  );
}
