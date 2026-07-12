import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-guards";
import { createAdminInvite } from "@/actions/admin/invites-actions";
import prisma from "@/lib/prisma";
import type { AdminPermission } from "@/lib/generated/prisma/client";

export async function GET() {
  try {
    await requirePermission("MANAGE_ADMINS");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const invites = await prisma.adminInvite.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(invites);
}

export async function POST(req: Request) {
  try {
    await requirePermission("MANAGE_ADMINS");
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { permissions } = await req.json();
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return NextResponse.json({ error: "At least one permission is required" }, { status: 400 });
    }

    const link = await createAdminInvite(permissions as AdminPermission[]);
    return NextResponse.json({ link });
  } catch (error) {
    console.error("[Admin Invite] Failed to create invite:", error);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}
