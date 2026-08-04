import { Metadata } from "next";
import { OrdersClient } from "@/components/order/orders-client";

export const metadata: Metadata = {
  title: "My Orders | RRC Kitchen",
  description: "Track and manage all your orders in one place.",
};

export default function OrdersPage() {
  return (
    <div className="bg-[#FAFAFA] min-h-screen">
      <OrdersClient />
    </div>
  );
}
