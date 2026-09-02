"use server"

import prisma from "@/lib/prisma"
import { allocatePublicCode, PUBLIC_ID_SPECS } from "@/lib/public-id"
import { auth } from "@/lib/auth"
import { headers, cookies } from "next/headers"
import { getAblyRest } from "@/lib/ably/server"

export async function getActiveLiveChat() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  
  const userId = session?.user?.id
  let guestId: string | undefined = undefined

  if (!userId) {
    const cookieStore = await cookies()
    guestId = cookieStore.get("live_chat_guest_id")?.value
    if (!guestId) {
      return { success: true, data: null }
    }
  }

  const activeTicket = await prisma.supportTicket.findFirst({
    where: {
      ...(userId ? { userId } : { guestId }),
      category: "LIVE_CHAT",
      status: {
        in: ["OPEN", "INPROGRESS"],
      }
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc"
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return { success: true, data: activeTicket }
}

export async function startLiveChatSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  
  const userId = session?.user?.id
  let guestId: string | undefined = undefined
  const cookieStore = await cookies()
  
  if (!userId) {
    guestId = cookieStore.get("live_chat_guest_id")?.value
    if (!guestId) {
      guestId = crypto.randomUUID()
      cookieStore.set("live_chat_guest_id", guestId, { maxAge: 60 * 60 * 24 * 7 }) // 7 days
    }
  }
  
  // Check if one already exists
  const existing = await prisma.supportTicket.findFirst({
    where: {
      ...(userId ? { userId } : { guestId }),
      category: "LIVE_CHAT",
      status: {
        in: ["OPEN", "INPROGRESS"],
      }
    },
  })
  
  if (existing) {
    return { success: true, data: existing }
  }

  const newTicket = await prisma.$transaction(async (tx) => {
    return await tx.supportTicket.create({
      data: {
        publicCode: await allocatePublicCode(tx, PUBLIC_ID_SPECS.SUPPORT_TICKET),
        ...(userId ? { userId } : { guestId }),
        subject: "Live Chat Support",
        description: "Live chat initiated by user",
        category: "LIVE_CHAT",
        status: "OPEN",
        priority: "MEDIUM",
      }
    })
  })

  return { success: true, data: newTicket }
}

export async function sendChatMessage(ticketId: string, message: string, mediaUrls: string[] = []) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  
  const userId = session?.user?.id
  let guestId: string | undefined = undefined
  
  if (!userId) {
    const cookieStore = await cookies()
    guestId = cookieStore.get("live_chat_guest_id")?.value
    if (!guestId) return { success: false, error: "Unauthorized" }
  }

  // Ensure ticket belongs to user OR user is admin
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  })
  
  if (!ticket) return { success: false, error: "Ticket not found" }
  
  if (userId) {
    if (ticket.userId !== userId && session?.user?.role !== "admin" && session?.user?.role !== "support" && session?.user?.role !== "SUPPORTAGENT") {
      return { success: false, error: "Unauthorized" }
    }
  } else {
    if (ticket.guestId !== guestId) {
      return { success: false, error: "Unauthorized" }
    }
  }

  const msg = await prisma.ticketMessage.create({
    data: {
      ticketId,
      senderId: userId || guestId,
      message,
      mediaUrls,
    }
  })
  
  // Update the ticket's updatedAt timestamp to bring it to the top of the list
  await prisma.supportTicket.update({
    where: { id: ticketId },
    data: { updatedAt: new Date() }
  })
  
  // Publish to Ably channel
  try {
    const ably = getAblyRest();
    const channel = ably.channels.get(`live-chat:${ticketId}`);
    await channel.publish("message", { message: msg });
  } catch (err) {
    console.error("Failed to publish to Ably:", err);
  }

  return { success: true, data: msg }
}

export async function getLiveChatMessages(ticketId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  
  const userId = session?.user?.id
  let guestId: string | undefined = undefined
  
  if (!userId) {
    const cookieStore = await cookies()
    guestId = cookieStore.get("live_chat_guest_id")?.value
    if (!guestId) return { success: false, error: "Unauthorized" }
  }
  
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
  })
  
  if (!ticket) return { success: false, error: "Ticket not found" }
  
  if (userId) {
    if (ticket.userId !== userId && session?.user?.role !== "admin" && session?.user?.role !== "support" && session?.user?.role !== "SUPPORTAGENT") {
      return { success: false, error: "Unauthorized" }
    }
  } else {
    if (ticket.guestId !== guestId) {
      return { success: false, error: "Unauthorized" }
    }
  }

  const messages = await prisma.ticketMessage.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" }
  })

  return { success: true, data: messages }
}

export async function getAllLiveChats() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  
  if (!session?.user || (session.user.role !== "admin" && session.user.role !== "support" && session.user.role !== "SUPPORTAGENT")) {
    return { success: false, error: "Unauthorized" }
  }

  const tickets = await prisma.supportTicket.findMany({
    where: {
      category: "LIVE_CHAT",
      status: {
        in: ["OPEN", "INPROGRESS"],
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
        }
      },
      messages: {
        orderBy: {
          createdAt: "desc"
        },
        take: 1
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  })

  return { success: true, data: tickets }
}
