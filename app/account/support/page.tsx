import { Metadata } from "next";
import { SupportContent } from "@/components/account/support-content";

export const metadata: Metadata = {
  title: "Support Center | RRC Kitchen",
  description: "Raise a support ticket, track your issues and get the assistance you need",
};

export default function AccountSupportPage() {
  return <SupportContent />;
}
