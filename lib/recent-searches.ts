const RECENT_KEY = "recentlySearchedKitchens"
const MAX_RECENT = 5

export interface RecentKitchen {
  id: string
  slug: string
  name: string
}

export function getRecentKitchens(): RecentKitchen[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]")
  } catch {
    return []
  }
}

export function addRecentKitchen(kitchen: RecentKitchen) {
  const list = getRecentKitchens().filter((k) => k.id !== kitchen.id)
  list.unshift(kitchen)
  localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)))
}

export function removeRecentKitchen(id: string) {
  const list = getRecentKitchens().filter((k) => k.id !== id)
  localStorage.setItem(RECENT_KEY, JSON.stringify(list))
}
