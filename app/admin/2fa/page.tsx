import type { Metadata } from "next"
import AdminTwoFactorChallengePage from "@/components/admin/two-factor-client"

export const metadata: Metadata = {
  title: "Two-Factor Authentication",
  description: "Verify your two-factor authentication code",
}

export default function TwoFactorPage() {
  return <AdminTwoFactorChallengePage />
}
