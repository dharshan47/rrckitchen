import { MobileOtpLogin } from "@/components/auth";

export default function SupplierLoginPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="w-full max-w-md py-12">
        <MobileOtpLogin role="supplier" />
      </div>
    </main>
  );
}
