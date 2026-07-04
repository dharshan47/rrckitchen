import type { Metadata } from "next";
import { SignupForm } from "@/components/auth";

export const metadata: Metadata = {
  title: "Delivery Partner Sign Up — RrcKitchen Thanjavur",
  description: "Join RrcKitchen as a delivery partner and start earning by delivering home-cooked meals in Thanjavur.",
};

export default function DeliveryPartnerSignupPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.08),transparent_50%)] pointer-events-none" />
      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <SignupForm
          role="delivery-partner"
          title="Delivery Partner Sign Up"
          subtitle="Join us as a delivery partner"
          accountLinkHref="/delivery-partner/login"
          accountLinkLabel="Already have an account?"
        />
      </div>
    </main>
  );
}
