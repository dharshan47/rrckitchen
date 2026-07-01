import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { HomeClient } from "@/components/home/home-client";

export const revalidate = 30;
export const dynamic = "force-dynamic";

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
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="py-8 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </main>
  );
}
