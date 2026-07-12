import { Suspense } from "react";
import { SkeletonCard } from "@/components/patterns/skeleton-card";
import { HomeClient } from "@/components/home/home-client";
import { getHomePageData } from "@/actions/catalog/home-data";
import { getSession } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await getSession();
  const userId = session?.user?.id;

  const homeData = await getHomePageData(userId);

  return (
    <Suspense fallback={<HomeFallback />}>
      <HomeClient
        topRatedKitchens={homeData.topRatedKitchens}
        newKitchens={homeData.newKitchens}
        recentOrderKitchens={homeData.recentOrderKitchens}
      />
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
