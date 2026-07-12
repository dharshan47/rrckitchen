"use client"

import { THANJAVUR_CENTER } from "@/lib/geo/thanjavur-bounds"

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export const THANJAVUR_LAT = THANJAVUR_CENTER[0]
export const THANJAVUR_LNG = THANJAVUR_CENTER[1]
