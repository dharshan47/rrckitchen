import { Suspense } from "react";
import { QueryClient, dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { MenuContent } from "./menu-content";
import { getTomorrowMenu } from "@/actions/catalog/menu";

export const metadata = {
  title: "Tomorrow's Menu",
  description: "Browse home-cooked meals for tomorrow. Filter by time slot, Veg/Non-Veg, and kitchen.",
};

function MenuSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <div className="h-5 w-32 bg-muted rounded mb-2" />
        <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
              <Skeleton className="aspect-4/3 w-full rounded-none" />
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
          ))}
        </section>
      </div>
    </main>
  );
}

export default async function MenuPage() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["tomorrow-menu", { q: "", foodType: "ALL", timeSlot: "ALL" }],
    queryFn: () => getTomorrowMenu({ foodType: "ALL", timeSlot: "ALL" }),
  });

  return (
    <Suspense fallback={<MenuSkeleton />}>
      <HydrationBoundary state={dehydrate(queryClient)}>
        <MenuContent />
      </HydrationBoundary>
    </Suspense>
  );
}
