"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"
import { uniqueSlug } from "@/lib/slug"

type AllowedRole = "CUSTOMER" | "KITCHENPARTNER" | "DELIVERYPARTNER"

export async function assignUserRole(roleName: AllowedRole) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const role = await prisma.role.findUnique({ where: { name: roleName } })
  if (!role) {
    throw new Error("Role not found")
  }

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: session.user.id,
        roleId: role.id,
      },
    },
    create: {
      userId: session.user.id,
      roleId: role.id,
    },
    update: {},
  })

  if (roleName === "KITCHENPARTNER") {
    const existingSlugs = new Set(
      (await prisma.kitchenPartner.findMany({ select: { slug: true } }))
        .map(k => k.slug)
        .filter(Boolean) as string[]
    )
    const slug = uniqueSlug(session.user.name ?? "kitchen", existingSlugs)
    await prisma.kitchenPartner.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id, slug },
      update: {},
    })
  } else if (roleName === "DELIVERYPARTNER") {
    await prisma.deliveryPartner.upsert({
      where: { userId: session.user.id },
      create: { userId: session.user.id },
      update: {},
    })
  }
}

export async function checkPhoneRegistered(rawPhone: string) {
  const digits = rawPhone.replace(/\D/g, "")
  const variants = [rawPhone]
  if (digits.length === 10) variants.push(`+91${digits}`)
  else if (digits.length === 12 && digits.startsWith("91")) variants.push(`+${digits}`)

  const user = await prisma.user.findFirst({
    where: { phoneNumber: { in: variants } },
    select: { id: true },
  })

  return !!user
}

export async function updateUserName(name: string, email?: string) {
  const session = await getSession()
  if (!session?.user?.id) {
    throw new Error("Not authenticated")
  }

  const data: Record<string, string> = { name, fullName: name }
  if (email) data.email = email

  await prisma.user.update({
    where: { id: session.user.id },
    data,
  })
}
