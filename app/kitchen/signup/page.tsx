import { SignupForm } from "@/components/auth";

export default function KitchenSignupPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-12 overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--primary)/0.08),transparent_50%)] pointer-events-none" />
      <div className="relative w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <SignupForm
          role="kitchen"
          title="Kitchen Partner Sign Up"
          subtitle="Register your kitchen with us"
          accountLinkHref="/kitchen/login"
          accountLinkLabel="Already have an account?"
        />
      </div>
    </main>
  );
}
