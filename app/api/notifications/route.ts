import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

export async function GET() {
  const session = await getSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const logs = await prisma.notificationLog.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      channel: true,
      templateKey: true,
      title: true,
      body: true,
      status: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })

  return NextResponse.json(
    logs.map((l) => ({
      id: l.id,
      channel: l.channel,
      templateKey: l.templateKey,
      title: l.title ?? "Notification",
      body: l.body ?? "",
      status: l.status,
      createdAt: l.createdAt.toISOString(),
    })),
  )
}