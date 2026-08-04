import { Suspense } from "react";
import { HomeClient } from "@/components/home/home-client";
import { HomeSkeleton } from "@/components/home/home-skeleton";


export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeClient />
    </Suspense>
  );
}
