import { Suspense } from "react";
import { SkeletonCard } from "@/components/patterns/skeleton-card";
import { HomeClient } from "@/components/home/home-client";

export default function HomePage() {
  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeClient />
    </Suspense>
  );
}

function HomeFallback() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 lg:px-8 py-8">
        <div className="flex gap-4 overflow-hidden">
          <SkeletonCard variant="menu-item" count={6} />
        </div>
      </div>
    </main>
  );
}
