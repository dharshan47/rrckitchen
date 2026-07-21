import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-server"
import { getOrCreateReferralCode } from "@/actions/referral/referral"

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const code = await getOrCreateReferralCode()
  return NextResponse.json(code)
}