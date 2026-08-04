import type { Metadata } from "next"
import AdminInvitesPage from "@/components/admin/invites-client"

export const metadata: Metadata = {
  title: "Invites",
  description: "Invite kitchen partners to RRC Kitchen",
}

export default function InvitesPage() {
  return <AdminInvitesPage />
}
