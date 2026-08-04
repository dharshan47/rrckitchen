"use server";

import { queryKitchenDetail } from "@/lib/kitchen-detail";
import type { KitchenDetail } from "@/components/kitchen/kitchen-detail-client";

export async function getKitchenDetailLive(kitchenSlug: string): Promise<KitchenDetail | null> {
  return queryKitchenDetail(kitchenSlug);
}
