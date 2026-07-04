"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

export async function getUserProfile() {
  const session = await getSession()
  if (!session?.user?.id) return null
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, phoneNumber: true },
  })
  return user
}

export async function updateProfileNameEmail(data: { name?: string; email?: string }) {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: "Unauthorized" }

  const updateData: Record<string, string> = {}
  if (data.name) {
    updateData.name = data.name
    updateData.fullName = data.name
  }
  if (data.email !== undefined) updateData.email = data.email

  if (Object.keys(updateData).length === 0) return { success: false, error: "Nothing to update" }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    })
    return { success: true }
  } catch (err: unknown) {
    if (err && typeof err === "object" && "code" in err && (err as { code: string }).code === "P2002") {
      return { success: false, error: "This email is already taken by another account." }
    }
    return { success: false, error: "Failed to update profile." }
  }
}
