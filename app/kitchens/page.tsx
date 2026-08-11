import { Suspense } from "react";
import { Metadata } from "next";
import { InfiniteKitchenGrid } from "@/components/kitchen/infinite-kitchen-grid";
import { KitchensPageSkeleton } from "@/components/kitchen/kitchens-page-skeleton";

export const metadata: Metadata = {
  title: "Kitchens | RRC Kitchen",
  description: "Explore home kitchens near you and order fresh homemade food.",
};

export default function KitchensPage() {
  return (
    <div className="bg-[#fcfbf9] min-h-screen">
      <Suspense fallback={<KitchensPageSkeleton />}>
        <InfiniteKitchenGrid />
      </Suspense>
    </div>
  );
}
