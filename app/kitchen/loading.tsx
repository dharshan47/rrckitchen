import { Skeleton } from "@/components/ui/skeleton";

export default function KitchenHubLoading() {
  return (
    <main>
      <section className="bg-linear-to-b from-primary/5 to-white py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-8">
              <Skeleton className="h-12 w-full max-w-lg" />
              <Skeleton className="h-20 w-full max-w-md" />
              <Skeleton className="h-11 w-44 rounded-lg" />
            </div>
            <div className="flex justify-center">
              <Skeleton className="h-[400px] w-[400px] rounded-2xl" />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-5xl px-6">
          <Skeleton className="h-9 w-72 mx-auto mb-12" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-border bg-white p-6 space-y-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
