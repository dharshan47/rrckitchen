"use server"

import prisma from "@/lib/prisma"
import { requirePermission } from "@/lib/auth-guards"
import { getCategoryImageUrl } from "@/lib/category-images"
import { getAblyRest } from "@/lib/ably/server"

export async function getAllCategories() {
  await requirePermission("MANAGE_CMS")

  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { kitchenCategories: true } },
    },
    orderBy: { name: "asc" },
  })

  return categories.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    isActive: c.isActive,
    kitchenCount: c._count.kitchenCategories,
    imageUrl: c.imageUrl ?? getCategoryImageUrl(c.name),
    createdAt: c.createdAt.toISOString(),
  }))
}

export async function updateCategoryImage(id: string, imageUrl: string | null) {
  await requirePermission("MANAGE_CMS")

  await prisma.category.update({
    where: { id },
    data: { imageUrl },
  })

  await publishCategoryUpdate(id, "image-updated", { imageUrl })

  return { success: true }
}

async function publishCategoryUpdate(categoryId: string, event: string, data: Record<string, unknown>) {
  try {
    const ably = getAblyRest()
    const channel = ably.channels.get(`category:${categoryId}`)
    await channel.publish(event, data)
  } catch {
    // skip
  }
}

export async function addCategory(data: { name: string; description?: string | null; imageUrl?: string | null }) {
  await requirePermission("MANAGE_CMS")

  const existing = await prisma.category.findUnique({
    where: { name: data.name },
  })

  if (existing) {
    if (!existing.isActive) {
      await prisma.category.update({
        where: { id: existing.id },
        data: { isActive: true, imageUrl: data.imageUrl !== undefined ? data.imageUrl : existing.imageUrl },
      })
      return { success: true, id: existing.id }
    }
    return { success: false, error: "Category already exists" }
  }

  const category = await prisma.category.create({
    data: { name: data.name, description: data.description || null, imageUrl: data.imageUrl || null },
  })

  return { success: true, id: category.id }
}

export async function updateCategory(id: string, data: { name?: string; description?: string | null; imageUrl?: string | null }) {
  await requirePermission("MANAGE_CMS")

  const updateData: Record<string, string | null> = {}
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl

  if (Object.keys(updateData).length === 0) return { success: true }

  await prisma.category.update({ where: { id }, data: updateData })

  return { success: true }
}

export async function getCategory(id: string) {
  await requirePermission("MANAGE_CMS")

  const cat = await prisma.category.findUnique({ where: { id } })
  return cat ? { id: cat.id, name: cat.name, description: cat.description } : null
}

export async function toggleCategory(id: string, isActive: boolean) {
  await requirePermission("MANAGE_CMS")

  await prisma.category.update({
    where: { id },
    data: { isActive },
  })

  return { success: true }
}

export async function deleteCategory(id: string) {
  await requirePermission("MANAGE_CMS")

  await prisma.$transaction([
    prisma.kitchenCategory.deleteMany({
      where: { categoryId: id },
    }),
    prisma.menuItem.updateMany({
      where: { categoryId: id },
      data: { categoryId: null },
    }),
    prisma.category.delete({
      where: { id },
    }),
  ])

  return { success: true }
}
