"use server"

import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

export async function getAvailableCuisines() {
  const cuisines = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  })
  return cuisines
}

export async function getKitchenProfileData() {
  const session = await getSession()
  if (!session?.user) return null

  const kitchen = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
    include: {
      kitchenAlias: true,
      kitchenAddress: true,
      kitchenCategories: {
        include: { category: { select: { id: true, name: true } } },
      },
    },
  })
  if (!kitchen) return null

  return {
    id: kitchen.id,
    displayName: kitchen.kitchenAlias?.displayName,
    imageUrl: kitchen.kitchenAlias?.imageUrl,
    description: kitchen.kitchenAlias?.description,
    story: kitchen.kitchenAlias?.story,
    experienceYears: kitchen.kitchenAlias?.experienceYears,
    operatingHours: kitchen.operatingHours as Record<string, { open: string; close: string }> | null,
    estimatedPrepTime: kitchen.estimatedPrepTime,
    cuisineIds: kitchen.kitchenCategories.map((kc) => kc.categoryId),
    cuisines: kitchen.kitchenCategories.map((kc) => kc.category.name),
    address: kitchen.kitchenAddress
      ? {
          lineOne: kitchen.kitchenAddress.lineOne,
          doorNo: kitchen.kitchenAddress.doorNo,
          area: kitchen.kitchenAddress.area,
          landmark: kitchen.kitchenAddress.landmark,
          pincode: kitchen.kitchenAddress.pincode,
        }
      : null,
  }
}

export async function updateKitchenProfilePicture(image: string | null) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { image },
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update profile picture" }
  }
}

export async function updateKitchenImage(imageUrl: string | null) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchen = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!kitchen) return { success: false, error: "Kitchen not found" }

  try {
    await prisma.kitchenAlias.upsert({
      where: { kitchenPartnerId: kitchen.id },
      update: { imageUrl },
      create: {
        kitchenPartnerId: kitchen.id,
        displayName: kitchen.slug,
        sequenceNumber: 0,
        imageUrl,
      },
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update image" }
  }
}

export async function updateKitchenDisplayName(displayName: string) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchen = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!kitchen) return { success: false, error: "Kitchen not found" }

  try {
    await prisma.kitchenAlias.upsert({
      where: { kitchenPartnerId: kitchen.id },
      update: { displayName },
      create: {
        kitchenPartnerId: kitchen.id,
        displayName,
        sequenceNumber: 0,
      },
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update display name" }
  }
}

export async function updateKitchenDescription(description: string | null) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchen = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!kitchen) return { success: false, error: "Kitchen not found" }

  try {
    await prisma.kitchenAlias.upsert({
      where: { kitchenPartnerId: kitchen.id },
      update: { description },
      create: {
        kitchenPartnerId: kitchen.id,
        displayName: kitchen.slug,
        sequenceNumber: 0,
        description,
      },
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update description" }
  }
}

export async function updateKitchenOperatingHours(
  operatingHours: Record<string, { open: string; close: string }> | null,
) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchen = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!kitchen) return { success: false, error: "Kitchen not found" }

  try {
    await prisma.kitchenPartner.update({
      where: { id: kitchen.id },
      data: { operatingHours: operatingHours as object },
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update operating hours" }
  }
}

export async function updateKitchenPrepTime(estimatedPrepTime: number | null) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchen = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!kitchen) return { success: false, error: "Kitchen not found" }

  try {
    await prisma.kitchenPartner.update({
      where: { id: kitchen.id },
      data: { estimatedPrepTime },
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update prep time" }
  }
}

export async function updateKitchenCuisines(categoryIds: string[]) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchen = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!kitchen) return { success: false, error: "Kitchen not found" }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.kitchenCategory.deleteMany({ where: { kitchenPartnerId: kitchen.id } })
      if (categoryIds.length > 0) {
        await tx.kitchenCategory.createMany({
          data: categoryIds.map((categoryId) => ({
            kitchenPartnerId: kitchen.id,
            categoryId,
          })),
        })
      }
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update cuisines" }
  }
}

export async function updateKitchenStoryAndExperience(story: string | null, experienceYears: number | null) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchen = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!kitchen) return { success: false, error: "Kitchen not found" }

  try {
    await prisma.kitchenAlias.upsert({
      where: { kitchenPartnerId: kitchen.id },
      update: { story, experienceYears },
      create: {
        kitchenPartnerId: kitchen.id,
        displayName: kitchen.slug,
        sequenceNumber: 0,
        story,
        experienceYears,
      },
    })
    return { success: true }
  } catch {
    return { success: false, error: "Failed to update story and experience" }
  }
}
