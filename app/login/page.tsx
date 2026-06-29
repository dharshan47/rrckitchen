import { MobileOtpLogin } from "@/components/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">RrcKitchen</h1>
          <p className="text-sm text-muted-foreground mt-2">Sign in to order meals for tomorrow</p>
        </div>
        <MobileOtpLogin role="customer" />
      </div>
    </main>
  );
}
