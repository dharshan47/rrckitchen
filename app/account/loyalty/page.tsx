import { Metadata } from "next";
import { LoyaltyContent } from "@/components/account/loyalty-content";

export const metadata: Metadata = {
  title: "Loyalty & Rewards | RRC Kitchen",
  description: "Earn points with every order and unlock exciting rewards",
};

export default function LoyaltyPage() {
  return <LoyaltyContent />;
}
