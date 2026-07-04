"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"
import { z } from "zod"

const addressSchema = z.object({
  label: z.string().optional(),
  lineOne: z.string().min(3),
  lineTwo: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/),
})

export async function getUserAddresses() {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Not authenticated")

  return prisma.address.findMany({
    where: { userId: session.user.id },
    include: { serviceZone: { select: { name: true } } },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  })
}

export async function addAddress(data: z.infer<typeof addressSchema>) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Not authenticated")

  const parsed = addressSchema.parse(data)

  const zone = await prisma.serviceZone.findFirst({ where: { pincodes: { has: parsed.pincode } } })
  if (!zone) throw new Error("Delivery not available in this pincode")

  const existingCount = await prisma.address.count({ where: { userId: session.user.id } })
  const isDefault = existingCount === 0

  return prisma.address.create({
    data: {
      userId: session.user.id,
      label: parsed.label,
      lineOne: parsed.lineOne,
      lineTwo: parsed.lineTwo,
      pincode: parsed.pincode,
      serviceZoneId: zone.id,
      isDefault,
    },
  })
}

export async function deleteAddress(id: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Not authenticated")

  await prisma.address.deleteMany({ where: { id, userId: session.user.id } })
}
