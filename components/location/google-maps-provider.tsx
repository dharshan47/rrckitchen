"use client"

import { APIProvider } from "@vis.gl/react-google-maps"
import { SERVICE_CENTER_LAT, SERVICE_CENTER_LNG } from "./location-autocomplete"

export function GoogleMapsProvider({ children }: { children: React.ReactNode }) {
  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""}
      libraries={["places"]}
    >
      {children}
    </APIProvider>
  )
}

const THANJAVUR_LAT = SERVICE_CENTER_LAT
const THANJAVUR_LNG = SERVICE_CENTER_LNG
export { THANJAVUR_LAT, THANJAVUR_LNG }
