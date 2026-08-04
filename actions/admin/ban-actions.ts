"use server";

import prisma from "@/lib/prisma";
import { requirePermission, logAdminAction } from "@/lib/auth-guards";

export async function banUser(userId: string, reason: string, banExpires?: string) {
  const { session } = await requirePermission("BAN_USERS");

  if (userId === session.user.id) {
    throw new Error("You cannot ban yourself");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      banned: true,
      banReason: reason || null,
      banExpires: banExpires ? new Date(banExpires) : null,
    },
  });

  await logAdminAction({
    actorUserId: session.user.id,
    action: "BAN_USER",
    targetType: "User",
    targetId: userId,
    metadata: { reason, banExpires },
  });
}

export async function unbanUser(userId: string) {
  const { session } = await requirePermission("BAN_USERS");

  await prisma.user.update({
    where: { id: userId },
    data: { banned: false, banReason: null, banExpires: null },
  });

  await logAdminAction({
    actorUserId: session.user.id,
    action: "UNBAN_USER",
    targetType: "User",
    targetId: userId,
  });
}

export async function searchUsers(search: string, page = 1, limit = 20) {
  await requirePermission("BAN_USERS");

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phoneNumber: { contains: search } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users: users.map((u) => ({
      ...u,
      createdAt: u.createdAt.toISOString(),
      banExpires: u.banExpires?.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getUserBanStatus(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { banned: true, banReason: true, banExpires: true },
  });
  return user ?? null;
}
