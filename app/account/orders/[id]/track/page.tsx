import { Metadata } from "next";
import { TrackOrderClient } from "@/components/order/track-order-client";

export const metadata: Metadata = {
  title: "Track Order | RRC Kitchen",
  description: "Track your RRC Kitchen order in real time.",
};

export default function TrackOrderPage({ params }: { params: { id: string } }) {
 
  return <TrackOrderClient orderId={params.id} />;
}
