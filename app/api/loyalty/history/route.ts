import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth-server"
import { getLoyaltyHistory } from "@/actions/loyalty/loyalty"

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const history = await getLoyaltyHistory()
  return NextResponse.json(history)
}