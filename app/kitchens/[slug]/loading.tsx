import { Skeleton } from "@/components/ui/skeleton";

const SLOTS = ["MORNING", "LUNCH", "EVENINGSNACKS", "DINNER"];

function MenuCardSkeleton() {
  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative w-full overflow-hidden rounded-[18px] bg-muted" style={{ aspectRatio: "1 / 1" }}>
        <Skeleton className="absolute top-2 right-2 h-8 w-8 rounded-full" />
      </div>
      <div className="pt-1 pb-2 flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Skeleton className="h-[15px] w-[15px] rounded-sm" />
          <Skeleton className="h-[17px] w-12 rounded-sm" />
        </div>
        <div className="space-y-1.5">
          <Skeleton className="h-[15px] w-full rounded-sm" />
          <Skeleton className="h-[15px] w-2/3 rounded-sm" />
        </div>
        <div className="flex items-end justify-between mt-0.5">
          <Skeleton className="h-4 w-12 rounded-sm" />
          <Skeleton className="h-[32px] w-[72px] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export default function KitchenDetailLoading() {
  return (
    <main className="min-h-screen bg-white text-foreground pb-20">
      {/* HERO SECTION SKELETON */}
      <section className="max-w-4xl mx-auto pt-4 px-4">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <Skeleton className="h-8 sm:h-9 w-56 rounded-md" />
            <Skeleton className="h-4 w-32 rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-9 rounded-full" />
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
        </div>

        <Skeleton className="w-full aspect-16/7 sm:aspect-16/6 rounded-2xl" />

        <div className="mt-4 px-1 space-y-2">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-[18px] w-[18px] rounded-full shrink-0" />
            <Skeleton className="h-4 w-16 rounded-sm" />
            <Skeleton className="h-4 w-[4px] rounded-full" />
            <Skeleton className="h-4 w-20 rounded-sm" />
          </div>
          <Skeleton className="h-4 w-48 rounded-sm" />
          <Skeleton className="h-4 w-36 rounded-sm" />
        </div>

        <div className="mt-6 h-[1px] bg-gray-100" />
      </section>

      {/* STICKY NAV SKELETON */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 py-3 space-y-3">
          <Skeleton className="w-full h-12 rounded-xl" />
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <Skeleton className="h-[34px] w-[68px] rounded-3xl shrink-0" />
            <Skeleton className="h-[34px] w-[86px] rounded-3xl shrink-0" />
            <Skeleton className="h-[34px] w-[96px] rounded-3xl shrink-0" />
          </div>
        </div>
      </div>

      {/* ACCORDION SECTIONS SKELETON */}
      <div className="max-w-4xl mx-auto px-4 mt-8 space-y-12">
        {SLOTS.map((slot, slotIdx) => (
          <div key={slot} className="space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-2xl" />
              <div className="text-left space-y-1">
                <Skeleton className="h-6 w-32 rounded-sm" />
                <Skeleton className="h-3 w-20 rounded-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {Array.from({ length: slotIdx === 0 ? 4 : 3 }).map((_, itemIdx) => (
                <MenuCardSkeleton key={itemIdx} />
              ))}
            </div>
            <div className="h-4 bg-gray-50/50 -mx-4 border-y border-gray-100/30" />
          </div>
        ))}
      </div>
    </main>
  );
}
