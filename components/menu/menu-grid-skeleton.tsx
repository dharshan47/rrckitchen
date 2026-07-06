import { Skeleton } from "@/components/ui/skeleton";

function MenuItemSkeleton({ hasOffer = true }: { hasOffer?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="relative aspect-square w-full bg-white p-3">
        <div className="relative h-full w-full">
          <Skeleton className="h-full w-full rounded-sm" />
        </div>
        {hasOffer && (
          <div className="absolute left-2 top-0 z-10 h-9 w-9">
            <Skeleton
              className="h-full w-full bg-[#1B2F45]/20 rounded-none"
              style={{
                clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 83% 92%, 66% 100%, 50% 92%, 33% 100%, 16% 92%, 0% 100%)",
              }}
            />
          </div>
        )}
      </div>
      <div className="px-3 pb-4 pt-1.5">
        <div className="flex flex-col">
          <Skeleton className="h-5 w-1/2" />
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-7 w-16 rounded-md bg-orange-100" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-8 w-16 rounded-lg border border-orange-200" />
          </div>
          <div className="mt-4 border-t border-dashed border-border" />
        </div>
      </div>
    </div>
  );
}

export function MenuGridSkeleton({ hasOffer = true }: { hasOffer?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <MenuItemSkeleton key={i} hasOffer={hasOffer} />
      ))}
    </div>
  );
}
