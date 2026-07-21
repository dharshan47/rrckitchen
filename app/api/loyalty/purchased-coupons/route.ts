import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-server"
import { getUserPurchasedCoupons } from "@/actions/loyalty/loyalty-coupons"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const coupons = await getUserPurchasedCoupons()
    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Failed to fetch purchased coupons:", error)
    return NextResponse.json({ error: "Failed to fetch purchased coupons" }, { status: 500 })
  }
}