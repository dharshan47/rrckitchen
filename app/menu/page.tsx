import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { MenuContent } from "./menu-content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tomorrow's Menu",
  description: "Browse home-cooked meals for tomorrow. Filter by time slot, Veg/Non-Veg, and kitchen.",
};

function MenuSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
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

export default function MenuPage() {
  return (
    <Suspense fallback={<MenuSkeleton />}>
      <MenuContent />
    </Suspense>
  );
}
