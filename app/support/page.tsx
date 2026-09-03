import { SupportClient } from "@/components/support/support-client";
import { SiteHeader } from "@/components/site/site-header";

export const metadata = {
  title: "Support | RRC Kitchen",
  description: "Get help with orders, delivery, account, and more.",
};

export default function SupportPage() {
  return (
    <>
      <SiteHeader />
      <SupportClient />
    </>
  );
}
