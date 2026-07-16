import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Button } from "@/components/ui/button";
import { KitchenNavbar, KitchenFooter, KitchenFAQ } from "@/components/kitchen";
import { ChefHat, Clock, DollarSign, TrendingUp, Users, ShieldCheck, LayoutDashboard } from "lucide-react";
import { getSession } from "@/lib/auth-server";

export const metadata: Metadata = {
  title: "Become a Kitchen Partner",
  description:
    "Join as a home kitchen partner in Thanjavur. Earn from your cooking skills, set your own schedule, and reach local customers. No investment needed.",
  keywords: ["home kitchen partner", " Thanjavur food business", "home chef registration", "earn from cooking"],
  openGraph: {
    title: "Become a Kitchen Partner",
    description:
      "Join as a home kitchen partner in Thanjavur. Earn from your cooking skills, set your own schedule, and reach local customers.",
    type: "website",
    locale: "en_IN",
  },
};

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

export default async function KitchenPage() {
  const session = await getSession();
  const isLoggedIn = !!session?.user;

  return (
    <>
      <KitchenNavbar isLoggedIn={isLoggedIn} />
      <main>
        {/* Hero */}
        <section className="bg-linear-to-b from-primary/5 to-white py-12 md:py-20" aria-labelledby="hero-heading">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-8">
                <h1 id="hero-heading" className="text-4xl md:text-5xl font-bold tracking-tight">
                  Turn Your Home Kitchen Into a Business
                </h1>
                <p className="text-lg text-muted-foreground leading-7">
                  Join RRC Kitchen&apos;s network of home chefs in Thanjavur. Cook what you love, set your own schedule, and earn from your passion.
                </p>
                {isLoggedIn && (
                  <div>
                    <Button asChild size="lg">
                      <Link href="/kitchen/dashboard">
                        <LayoutDashboard className="h-5 w-5 mr-1.5" />
                        Dashboard
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <Image
                  src="/banners/womenchef.png"
                  alt="Home chef cooking"
                  width={400}
                  height={400}
                  className="object-contain max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section id="benefits" className="bg-muted/30 py-16" aria-labelledby="benefits-heading">
          <div className="mx-auto max-w-5xl px-6">
            <h2 id="benefits-heading" className="text-3xl font-bold tracking-tight text-center mb-12">
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
        <section className="bg-primary/5 py-16" aria-labelledby="cta-heading">
          <div className="mx-auto max-w-4xl px-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-6 text-center md:text-left">
                <h2 id="cta-heading" className="text-3xl font-bold tracking-tight">Ready to Get Started?</h2>
                <p className="text-muted-foreground">
                  Join hundreds of home chefs already earning on RRC Kitchen.
                </p>
                {isLoggedIn && (
                  <div className="flex justify-center md:justify-start">
                    <Button asChild size="lg">
                      <Link href="/kitchen/dashboard">
                        <LayoutDashboard className="h-5 w-5 mr-1.5" />
                        Dashboard
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              <div className="flex justify-center">
                <Image
                  src="/banners/become-chef.png"
                  alt="Become a chef"
                  width={350}
                  height={350}
                  className="object-contain max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <KitchenFooter />
    </>
  );
}