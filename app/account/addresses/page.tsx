import { Metadata } from "next";
import { AddressesContent } from "@/components/account/addresses-content";

export const metadata: Metadata = {
  title: "Saved Addresses | RRC Kitchen",
  description: "Manage your saved delivery addresses",
};

export default function AddressesPage() {
  return <AddressesContent />;
}