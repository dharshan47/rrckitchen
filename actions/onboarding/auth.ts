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

  const legacyRoleMap: Record<AllowedRole, string> = {
    CUSTOMER: "customer",
    KITCHENPARTNER: "kitchen",
    DELIVERYPARTNER: "delivery-partner"
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { role: legacyRoleMap[roleName] }
  })

  if (roleName === "KITCHENPARTNER") {
    const existingSlugs = new Set(
      (await prisma.kitchenPartner.findMany({ select: { slug: true } }))
        .map(k => k.slug)
        .filter(Boolean) as string[]
    )
    const slug = uniqueSlug(session.user.name ?? session.user.id, existingSlugs)
    
    const { PUBLIC_ID_SPECS, allocatePublicCode } = await import("@/lib/public-id")
    await prisma.$transaction(async (tx) => {
      const existing = await tx.kitchenPartner.findUnique({ where: { userId: session.user.id } })
      if (!existing) {
        const publicCode = await allocatePublicCode(tx, PUBLIC_ID_SPECS.KITCHEN_PARTNER)
        await tx.kitchenPartner.create({
          data: { userId: session.user.id, slug, status: "APPROVED", publicCode },
        })
      }
    })
  } else if (roleName === "DELIVERYPARTNER") {
    const { PUBLIC_ID_SPECS, allocatePublicCode } = await import("@/lib/public-id")
    await prisma.$transaction(async (tx) => {
      const existing = await tx.deliveryPartner.findUnique({ where: { userId: session.user.id } })
      if (!existing) {
        const publicCode = await allocatePublicCode(tx, PUBLIC_ID_SPECS.DELIVERY_PARTNER)
        await tx.deliveryPartner.create({
          data: { userId: session.user.id, publicCode },
        })
      }
    })
  }
}

export async function checkPhoneRegistered(rawPhone: string) {
  const digits = rawPhone.replace(/\D/g, "")
  const variants = [rawPhone]
  if (digits.length === 10) variants.push(`+91${digits}`)
  else if (digits.length === 12 && digits.startsWith("91")) {
    variants.push(digits.slice(2))
    variants.push(`+${digits}`)
  }

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
