import { Metadata } from "next";
import { ReferralsContent } from "@/components/account/referrals-content";

export const metadata: Metadata = {
  title: "Referrals | RRC Kitchen",
  description: "Refer friends, earn points, and unlock rewards",
};

export default function ReferralsPage() {
  return <ReferralsContent />;
}