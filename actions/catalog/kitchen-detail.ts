"use server";

import { queryKitchenDetail } from "@/lib/kitchen-detail";
import { cached } from "@/lib/server-cache";
import type { KitchenDetail } from "@/components/kitchen/kitchen-detail-client";

export async function getKitchenDetailLive(kitchenSlug: string): Promise<KitchenDetail | null> {
  return cached(`getKitchenDetailLive:${kitchenSlug}`, 30_000, () => queryKitchenDetail(kitchenSlug));
}
