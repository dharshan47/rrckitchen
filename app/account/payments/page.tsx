import { Metadata } from "next";
import { PaymentsContent } from "@/components/account/payments-content";

export const metadata: Metadata = {
  title: "Payment Methods | RRC Kitchen",
  description: "View available payment options and your payment history",
};

export default function PaymentsPage() {
  return <PaymentsContent />;
}