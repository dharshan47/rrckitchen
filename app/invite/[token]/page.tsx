import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { AcceptInviteForm } from "@/components/admin/accept-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const invite = await prisma.adminInvite.findUnique({ where: { token } });
  if (
    !invite ||
    invite.consumedAt ||
    invite.revokedAt ||
    invite.expiresAt < new Date()
  ) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <AcceptInviteForm token={token} />
    </main>
  );
}
