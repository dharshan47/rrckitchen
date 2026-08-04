import type { Metadata } from "next"
import AdminTwoFactorSetupPage from "@/components/admin/two-factor-setup-client"

export const metadata: Metadata = {
  title: "Two-Factor Authentication Setup",
  description: "Set up two-factor authentication for your admin account",
}

export default function TwoFactorSetupPage() {
  return <AdminTwoFactorSetupPage />
}
