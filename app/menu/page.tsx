import { Suspense } from "react";
import { SkeletonCard } from "@/components/patterns/skeleton-card";
import { MenuContent } from "./menu-content";

export const revalidate = 30;
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Tomorrow's Menu — RrcKitchen",
  description: "Browse home-cooked meals for tomorrow. Filter by time slot, Veg/Non-Veg, and kitchen.",
};

function MenuSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 lg:px-10">
        <section className="space-y-4">
          <SkeletonCard variant="menu-item" count={6} />
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
