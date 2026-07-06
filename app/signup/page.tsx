import Link from "next/link";
import { SignupForm } from "@/components/auth";

export default function SignupPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-linear-to-br from-primary/5 via-background to-primary/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.08),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--primary)/0.05),transparent_50%)] pointer-events-none" />
      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-extrabold tracking-tight bg-linear-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              RRC Kitchen
            </h1>
          </Link>
          <p className="text-sm text-muted-foreground mt-3 max-w-xs mx-auto">
            Create your account to order home-cooked meals
          </p>
        </div>
        <SignupForm role="customer" accountLinkHref="/login" accountLinkLabel="Already have an account?" />
      </div>
    </main>
  );
}
