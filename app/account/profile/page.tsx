import { Metadata } from "next";
import { ProfileContent } from "@/components/account/profile-content";

export const metadata: Metadata = {
  title: "My Profile | RRC Kitchen",
  description: "Manage your profile, addresses, orders, loyalty points and referrals",
};

export default function AccountProfilePage() {
  return <ProfileContent />;
}
