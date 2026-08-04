"use server";

import { getMenuItemByIdentifier } from "./catalog/menu";

export async function getMenuItemByIdentifierClient(kitchenSlug: string, itemIdentifier: string) {
  return getMenuItemByIdentifier(kitchenSlug, itemIdentifier);
}
