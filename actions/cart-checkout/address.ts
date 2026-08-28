"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"
import { z } from "zod"

const addressSchema = z.object({
  label: z.string().optional(),
  lineOne: z.string().min(3),
  lineTwo: z.string().optional(),
  pincode: z.string().regex(/^\d{6}$/),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

export type AddAddressResult =
  | { success: true; address: { id: string; label: string | null; pincode: string } }
  | { success: false; error: string }

export async function getUserAddresses() {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Not authenticated")

  return prisma.address.findMany({
    where: { userId: session.user.id },
    include: { serviceZone: { select: { name: true } } },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  })
}

export async function addAddress(data: z.infer<typeof addressSchema>): Promise<AddAddressResult> {
  const session = await getSession()
  if (!session?.user?.id) return { success: false, error: "Not authenticated" }

  const parsed = addressSchema.safeParse(data)
  if (!parsed.success) {
    return { success: false, error: "Please fill in your address details correctly" }
  }

  const zone = await prisma.serviceZone.findFirst({
    where: { pincodes: { has: parsed.data.pincode }, isActive: true },
  })
  if (!zone) {
    return {
      success: false,
      error: `Delivery is not available in this pincode (${parsed.data.pincode}). Please pick a location within our service area.`,
    }
  }

  const existingCount = await prisma.address.count({ where: { userId: session.user.id } })
  const isDefault = existingCount === 0

  const address = await prisma.address.create({
    data: {
      userId: session.user.id,
      label: parsed.data.label,
      lineOne: parsed.data.lineOne,
      lineTwo: parsed.data.lineTwo,
      pincode: parsed.data.pincode,
      serviceZoneId: zone.id,
      isDefault,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    },
    select: { id: true, label: true, pincode: true },
  })

  return { success: true, address }
}

export async function deleteAddress(id: string) {
  const session = await getSession()
  if (!session?.user?.id) throw new Error("Not authenticated")

  await prisma.address.deleteMany({ where: { id, userId: session.user.id } })
}
