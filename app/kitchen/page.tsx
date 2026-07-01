import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KitchenNavbar, KitchenFooter, KitchenFAQ } from "@/components/kitchen-hub";
import { ChefHat, Clock, DollarSign, TrendingUp, Users, ShieldCheck } from "lucide-react";

const benefits = [
  {
    icon: DollarSign,
    title: "Extra Income",
    desc: "Earn from your cooking skills. Set your own prices and serve what you love to make.",
  },
  {
    icon: Clock,
    title: "Flexible Schedule",
    desc: "Choose your available time slots. Cook only when it suits you.",
  },
  {
    icon: TrendingUp,
    title: "Grow Your Reach",
    desc: "Get discovered by customers in your area. Build a loyal following.",
  },
  {
    icon: Users,
    title: "Community",
    desc: "Join a network of local home chefs. Share tips and grow together.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Platform",
    desc: "Secure payments, order management, and customer support handled for you.",
  },
  {
    icon: ChefHat,
    title: "No Investment Needed",
    desc: "Start with your home kitchen. No rental or equipment costs required.",
  },
];

const steps = [
  { num: "1", title: "Register", desc: "Sign up with your mobile number and basic details." },
  { num: "2", title: "Set Your Menu", desc: "Add dishes with prices, photos, and time slots." },
  { num: "3", title: "Mark Availability", desc: "Set which slots you'll serve for tomorrow." },
  { num: "4", title: "Receive Orders", desc: "Get notified when customers place orders." },
  { num: "5", title: "Cook & Deliver", desc: "Prepare fresh meals and hand them over." },
  { num: "6", title: "Get Paid", desc: "Receive weekly settlements directly to your account." },
];

export default function KitchenPage() {
  return (
    <>
      <KitchenNavbar />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-white py-20">
          <div className="mx-auto max-w-4xl px-6 text-center space-y-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Turn Your Home Kitchen Into a Business
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-7">
              Join RrcKitchen&apos;s network of home chefs in Thanjavur. Cook what you love, set your own schedule, and earn from your passion.
            </p>
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="rounded-full">
                <Link href="/login/kitchen">Register Your Kitchen</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full">
                <Link href="#how-it-works">How It Works</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">How It Works</h2>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.num} className="text-center space-y-3 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm mx-auto">
                    {step.num}
                  </div>
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-6">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="bg-muted/30 py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-3xl font-bold tracking-tight text-center mb-12">
              Why Partner With Us
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {benefits.map((b) => (
                <div key={b.title} className="rounded-2xl border border-border bg-white p-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <b.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-6">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <KitchenFAQ />

        {/* CTA */}
        <section className="bg-primary/5 py-16">
          <div className="mx-auto max-w-2xl px-6 text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Ready to Get Started?</h2>
            <p className="text-muted-foreground">
              Join hundreds of home chefs already earning on RrcKitchen.
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/login/kitchen">Register Your Kitchen</Link>
            </Button>
          </div>
        </section>
      </main>
      <KitchenFooter />
    </>
  );
}
