import { Suspense } from "react";
import type { Metadata } from "next";
import { HomeChefsClient } from "@/components/home-chefs/home-chefs-client";
import { HomeChefsSkeleton } from "@/components/home-chefs/home-chefs-skeleton";

export const metadata: Metadata = {
  title: "Home Chefs | RRC Kitchen",
  description: "Discover talented home chefs who cook with love and passion. Support local homemakers and enjoy homemade meals.",
};

export default function HomeChefsPage() {
  return (
    <Suspense fallback={<HomeChefsSkeleton />}>
      <HomeChefsClient />
    </Suspense>
  );
}
