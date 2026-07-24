"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

export async function goOnline(): Promise<{ success: boolean }> {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  const person = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
  })

  if (!person) throw new Error("Delivery partner not found")

  await prisma.deliveryPartner.update({
    where: { id: person.id },
    data: { isOnline: true },
  })

  return { success: true }
}

export async function goOffline(): Promise<{ success: boolean }> {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  const person = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
  })

  if (!person) throw new Error("Delivery partner not found")

  await prisma.deliveryPartner.update({
    where: { id: person.id },
    data: { isOnline: false },
  })

  return { success: true }
}

export interface PendingOrderItem {
  id: string
  status: string
  totalAmount: number
  createdAt: Date
  items: Array<{
    kitchenName: string
    itemName: string
    imageUrl: string | null
    quantity: number
    unitPrice: number
    kitchenAddress: string
    kitchenLat: number
    kitchenLng: number
  }>
  customerPhone: string
  customerAddress: string
  customerLat: number
  customerLng: number
}

export async function getPendingOrders(): Promise<PendingOrderItem[]> {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("Not authenticated")
  }

  const orders = await prisma.order.findMany({
    where: { status: "READYFORPICKUP" },
    include: {
      orderItems: {
        include: {
          menuItem: {
            select: { name: true },
            include: { photos: { take: 1, select: { imageUrl: true } } },
          },
          kitchenPartner: {
            select: { id: true },
            include: {
              kitchenAlias: { select: { displayName: true } },
              kitchenAddress: { select: { lineOne: true, pincode: true, latitude: true, longitude: true } },
            },
          },
        },
      },
      user: {
        select: { phoneNumber: true },
      },
      address: true,
    },
    orderBy: { createdAt: "asc" },
  })

  return orders.map((o) => {
    return {
      id: o.id,
      status: o.status,
      totalAmount: Number(o.totalAmount),
      createdAt: o.createdAt,
      items: o.orderItems.map((i) => ({
        kitchenName: i.kitchenPartner?.kitchenAlias?.displayName ?? "",
        itemName: i.menuItem.name,
        imageUrl: i.menuItem.photos?.[0]?.imageUrl ?? null,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
        kitchenAddress: i.kitchenPartner?.kitchenAddress
          ? `${i.kitchenPartner.kitchenAddress.lineOne}, ${i.kitchenPartner.kitchenAddress.pincode}`
          : "",
        kitchenLat: i.kitchenPartner?.kitchenAddress?.latitude ?? 0,
        kitchenLng: i.kitchenPartner?.kitchenAddress?.longitude ?? 0,
      })),
      customerPhone: o.user?.phoneNumber ?? "",
      customerAddress: o.address
        ? `${o.address.lineOne}${o.address.lineTwo ? ", " + o.address.lineTwo : ""}, ${o.address.pincode}`
        : "",
      customerLat: o.address?.latitude ?? 0,
      customerLng: o.address?.longitude ?? 0,
    }
  })
}
