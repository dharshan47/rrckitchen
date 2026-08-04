"use server"

import { getHomePageData } from "@/actions/catalog/home-data"
import type { RelatedKitchen } from "@/actions/catalog/home-data"

export async function getRecommendedKitchens(): Promise<RelatedKitchen[]> {
  try {
    const data = await getHomePageData();
    return data.topRatedKitchens.map(k => ({
      id: k.id,
      slug: k.slug,
      displayName: k.displayName,
      avgRating: k.avgRating,
      totalReviews: k.totalReviews,
      imageUrl: k.imageUrl,
      cuisineTags: k.cuisineTags,
      timeSlots: k.timeSlots,
      estimatedPrepTime: k.estimatedPrepTime,
    }));
  } catch (error) {
    console.error("Error fetching recommended kitchens", error);
    return [];
  }
}
