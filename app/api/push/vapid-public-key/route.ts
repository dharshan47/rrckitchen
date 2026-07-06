import { NextResponse } from "next/server"
import { getVapidPublicKey } from "@/lib/notification"

export async function GET() {
  return NextResponse.json({ publicKey: getVapidPublicKey() })
}
