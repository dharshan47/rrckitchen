import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { endpoint, p256dh, auth, userAgent } = await req.json()
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: "Missing subscription fields" }, { status: 400 })
  }

  const existing = await prisma.pushSubscription.findUnique({ where: { endpoint } })
  if (existing) {
    return NextResponse.json({ message: "Already subscribed" })
  }

  await prisma.pushSubscription.create({
    data: { userId: session.user.id, endpoint, p256dh, auth, userAgent: userAgent ?? null },
  })

  return NextResponse.json({ message: "Subscribed" })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { endpoint } = await req.json()
  if (!endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 })
  }

  await prisma.pushSubscription.deleteMany({
    where: { endpoint, userId: session.user.id },
  })

  return NextResponse.json({ message: "Unsubscribed" })
}
