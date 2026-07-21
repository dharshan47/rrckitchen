import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-server"
import { getReferralStats } from "@/actions/referral/referral"

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const stats = await getReferralStats()
  return NextResponse.json(stats)
}