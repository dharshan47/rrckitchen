import { Skeleton } from "@/components/ui/skeleton";

export default function KitchenDetailLoading() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        <div className="flex items-center">
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <Skeleton className="h-9 sm:h-10 lg:h-11 w-72" />

          <Skeleton className="w-full max-w-3xl aspect-[16/9] sm:aspect-[16/7] rounded-lg" />

          <div className="flex items-center gap-1.5">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-5 w-24" />
          </div>

          <div className="flex gap-1.5">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
        </div>

        <div className="relative max-w-md mx-auto">
          <Skeleton className="h-10 w-full rounded-md" />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          <Skeleton className="h-8 w-20 rounded-full shrink-0" />
          <Skeleton className="h-8 w-24 rounded-full shrink-0" />
          <Skeleton className="h-8 w-28 rounded-full shrink-0" />
        </div>

        <div className="max-w-4xl mx-auto space-y-3">
          {Array.from({ length: 3 }).map((_, slotIdx) => (
            <div key={slotIdx} className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-10" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
                {Array.from({ length: 4 }).map((_, itemIdx) => (
                  <div key={itemIdx} className="rounded-xl border overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <div className="p-2 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-8 w-full rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
