import { Metadata } from "next";
import { SettingsContent } from "@/components/account/settings-content";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings",
};

export default function SettingsPage() {
  return <SettingsContent />;
}