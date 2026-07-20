import { NextRequest, NextResponse } from "next/server"
import { getNearbyKitchens } from "@/actions/catalog/nearby-kitchens"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 })
  }

  const latitude = parseFloat(lat)
  const longitude = parseFloat(lng)

  if (isNaN(latitude) || isNaN(longitude)) {
    return NextResponse.json({ error: "Invalid lat or lng" }, { status: 400 })
  }

  const kitchens = await getNearbyKitchens(latitude, longitude)

  return NextResponse.json(kitchens)
}
