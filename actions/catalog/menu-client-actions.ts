"use server";

import { getMenuItemByIdentifier } from "./menu";

export async function getMenuItemByIdentifierClient(kitchenSlug: string, itemIdentifier: string) {
  return getMenuItemByIdentifier(kitchenSlug, itemIdentifier);
}
