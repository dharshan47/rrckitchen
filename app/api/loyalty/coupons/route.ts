import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-server"
import { getAvailableLoyaltyCoupons } from "@/actions/loyalty/loyalty-coupons"

export async function GET() {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const coupons = await getAvailableLoyaltyCoupons()
    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Error fetching loyalty coupons:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}