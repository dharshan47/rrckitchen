import type { Metadata } from "next";
import { MobileOtpLogin } from "@/components/auth";

export const metadata: Metadata = {
  title: "Kitchen Partner Login",
  description: "Login to your kitchen partner account to manage your menu, view orders, and track earnings.",
};

export default function KitchenLoginPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-linear-to-br from-primary/5 via-background to-primary/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_50%)] pointer-events-none" />
      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <MobileOtpLogin role="kitchen" noAccountHref="/kitchen/signup" noAccountLabel="Don&apos;t have an account?" />
      </div>
    </main>
  );
}
