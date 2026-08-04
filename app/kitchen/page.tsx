import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KitchenNavbar, KitchenFooter, KitchenFAQ } from "@/components/kitchen";
import { KitchenTestimonials } from "@/components/kitchen/kitchen-testimonials";
import { KitchenPageSkeleton } from "@/components/kitchen/kitchen-page-skeleton";
import { Play, CheckCircle2, ShieldCheck, TrendingUp, Clock, Megaphone, Lock, CalendarCheck, Handshake, CheckCircle } from "lucide-react";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Become a Home Chef | RRC Kitchen",
  description: "Join RRC Kitchen and become a trusted home chef. Share your homemade food with more people and earn on your own terms.",
};

const benefits = [
  { icon: Handshake, title: "Trusted Platform", desc: "Join a trusted brand that customers love and rely on." },
  { icon: TrendingUp, title: "Earn More", desc: "Get fair earnings on every order you receive." },
  { icon: ShieldCheck, title: "No Investment", desc: "Start your kitchen with zero setup or joining fees." },
  { icon: Clock, title: "Flexible Hours", desc: "Work on your time. You decide what and when to cook." },
  { icon: Megaphone, title: "We Promote You", desc: "We help you reach more customers in your area." },
  { icon: Lock, title: "100% Secure", desc: "Safe payments, data privacy and full support." },
];

const steps = [
  { num: "Step 1", title: "Register", desc: "Sign up and tell us about your kitchen.", icon: CalendarCheck },
  { num: "Step 2", title: "Verification", desc: "We verify your kitchen for quality & hygiene.", icon: ShieldCheck },
  { num: "Step 3", title: "Setup Your Menu", desc: "Add your delicious dishes and photos.", icon: CheckCircle2 },
  { num: "Step 4", title: "Start Receiving Orders", desc: "Get orders, cook with love and earn daily.", icon: Clock },
];

async function KitchenChefCount() {
  const count = await prisma.kitchenPartner.count({
    where: { status: { in: ["APPROVED", "ACTIVE"] } },
  });

  return (
    <div className="absolute top-10 -right-4 lg:-right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4 border border-gray-100 z-10">
      <div className="h-12 w-12 rounded-full bg-[#007A33]/10 flex items-center justify-center">
        <CheckCircle className="h-6 w-6 text-[#007A33]" />
      </div>
      <div>
        <p className="font-extrabold text-gray-900 text-xl">{count.toLocaleString("en-IN")}+</p>
        <p className="text-sm font-semibold text-gray-800">Home Chefs</p>
        <p className="text-xs text-gray-500">are earning with RRC Kitchen</p>
      </div>
    </div>
  );
}

function KitchenChefCountSkeleton() {
  return (
    <div className="absolute top-10 -right-4 lg:-right-4 bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4 border border-gray-100 z-10 animate-in fade-in duration-300">
      <Skeleton className="h-12 w-12 rounded-full" />
      <div>
        <Skeleton className="h-6 w-20 mb-1" />
        <Skeleton className="h-4 w-28 mb-1" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

export default async function KitchenPage() {
  const session = await getSession();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans">
      <KitchenNavbar isLoggedIn={isLoggedIn} />
      
      <Suspense fallback={<KitchenPageSkeleton />}>
        <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#FAFAFA] pt-12 pb-20 lg:pt-20 lg:pb-28">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="max-w-2xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
                  Turn Your Passion for <br />
                  <span className="text-[#007A33]">Cooking</span> into <span className="text-[#EE7005]">Happiness</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                  Join RRC Kitchen and become a trusted home chef. Share your homemade food with more people and earn on your own terms.
                </p>
                
                <div className="flex flex-wrap gap-4 mb-10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5 text-[#007A33]" />
                    <div className="text-sm">
                      <p className="font-bold text-gray-900">100% Trusted</p>
                      <p className="text-gray-500 text-xs">Loved by thousands of families</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-[#007A33]" />
                    <div className="text-sm">
                      <p className="font-bold text-gray-900">Grow Your Business</p>
                      <p className="text-gray-500 text-xs">Increase your income</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-[#007A33]" />
                    <div className="text-sm">
                      <p className="font-bold text-gray-900">Be Your Own Boss</p>
                      <p className="text-gray-500 text-xs">Work on your own schedule</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Button asChild size="lg" className="bg-[#EE7005] hover:bg-[#EE7005]/90 text-white rounded-full px-8 py-6 text-base shadow-lg shadow-[#EE7005]/30">
                    <Link href={isLoggedIn ? "/kitchen/dashboard" : "/kitchen/signup"}>Join as a Home Chef!</Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="rounded-full px-6 py-6 text-base font-semibold hover:bg-transparent hover:opacity-80">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full border-2 border-[#EE7005] mr-3">
                      <Play className="h-4 w-4 text-[#EE7005] ml-1" />
                    </div>
                    Watch How It Works
                  </Button>
                </div>
              </div>
              
              <div className="relative lg:ml-auto flex justify-center lg:justify-end">
                <div className="relative w-full max-w-lg aspect-square">
                  <Image 
                    src="/kitchen/hero-chef.webp" 
                    alt="Home Chef" 
                    fill 
                    className="object-contain"
                    priority
                  />
                  {/* Floating Badge */}
                  <Suspense fallback={<KitchenChefCountSkeleton />}>
                    <KitchenChefCount />
                  </Suspense>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Partner With Us Section */}
        <section id="why-partner" className="py-20 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                Why <span className="text-[#EE7005]">Partner</span> With Us?
              </h2>
              <p className="text-lg text-gray-600">
                We make it simple, rewarding and secure for home chefs to grow and succeed.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-center hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-shadow">
                  <div className="mx-auto h-16 w-16 mb-6 flex items-center justify-center text-[#007A33]">
                    <b.icon className="h-10 w-10" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{b.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-[#FAFAFA]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">How It Works?</h2>
              <p className="text-lg text-gray-600">Become a home chef in 4 simple steps</p>
            </div>
            
            <div className="relative max-w-5xl mx-auto">
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-[#EE7005]/20"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className={`h-24 w-24 rounded-full bg-white flex items-center justify-center mb-6 shadow-lg border-2 ${i === 0 ? 'border-[#EE7005] text-[#EE7005]' : 'border-white text-[#007A33]'}`}>
                      <step.icon className="h-10 w-10" />
                    </div>
                    <span className="text-[#EE7005] font-bold text-sm mb-2">{step.num}</span>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-500 text-sm">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Who Can Join Section */}
        <section className="py-20 bg-white overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                  Who Can Join <br />
                  <span className="text-[#EE7005]">RRC Kitchen?</span>
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  If you love cooking and want to share your homemade food with others, you&apos;re eligible!
                </p>
                
                <ul className="space-y-4 mb-10">
                  {["Passionate home cooks", "Expertise in any cuisine", "Hygienic & safe cooking environment", "Commitment to quality & on-time delivery"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="bg-[#007A33]/10 p-1 rounded-full shrink-0">
                        <CheckCircle2 className="h-5 w-5 text-[#007A33]" />
                      </div>
                      <span className="text-gray-800 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Button asChild variant="outline" size="lg" className="border-2 border-[#007A33] text-[#007A33] hover:bg-[#007A33] hover:text-white rounded-full px-8 py-6 text-base font-semibold">
                  <Link href={isLoggedIn ? "/kitchen/dashboard" : "/kitchen/signup"}>Join as a Home Chef</Link>
                </Button>
              </div>
              
              <div className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="relative h-48 sm:h-64 rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                      <Image src="/kitchen/chef2.webp" alt="Chef 2" fill className="object-cover" />
                    </div>
                    <div className="relative h-40 sm:h-48 rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                      <Image src="/kitchen/chef3.webp" alt="Chef 3" fill className="object-cover" />
                    </div>
                  </div>
                  <div className="relative h-full min-h-[300px] sm:min-h-[400px] rounded-3xl overflow-hidden shadow-lg border border-gray-100">
                    <Image src="/kitchen/chef1.webp" alt="Chef 1" fill className="object-cover" />
                  </div>
                </div>
                
                {/* Floating Badges */}
                <div className="absolute top-10 -right-4 sm:-right-8 bg-white rounded-xl shadow-lg p-3 flex items-center gap-3 border border-gray-100 z-10">
                  <TrendingUp className="h-5 w-5 text-[#007A33]" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Grow Your Income</p>
                    <p className="text-[10px] text-gray-500">Earn on every order</p>
                  </div>
                </div>
                
                <div className="absolute bottom-10 -left-4 sm:-left-8 bg-white rounded-xl shadow-lg p-3 flex items-center gap-3 border border-gray-100 z-10">
                  <Clock className="h-5 w-5 text-[#007A33]" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Flexible Time</p>
                    <p className="text-[10px] text-gray-500">Work at your convenience</p>
                  </div>
                </div>
                
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-lg p-3 flex items-center gap-3 border border-gray-100 z-10 hidden sm:flex">
                  <Lock className="h-5 w-5 text-[#007A33]" />
                  <div>
                    <p className="text-xs font-bold text-gray-900">Be Your Own Boss</p>
                    <p className="text-[10px] text-gray-500">Build your brand</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <KitchenTestimonials />

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-white">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
                Frequently <span className="text-[#EE7005]">Asked</span> Questions
              </h2>
            </div>
            <KitchenFAQ />
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#FAFAFA]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="bg-white rounded-[2rem] sm:rounded-[3rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8 md:p-12 lg:p-16 border border-gray-100 relative overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                <div className="flex justify-center md:justify-start">
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 drop-shadow-xl">
                    <Image src="/kitchen/heart-bowl.webp" alt="Heart Bowl" fill className="object-contain" />
                  </div>
                </div>
                
                <div className="text-center md:text-left space-y-6">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
                    Ready to Start Your Journey <br className="hidden md:block" />
                    as a <span className="text-[#EE7005]">Home Chef?</span>
                  </h2>
                  <p className="text-lg text-gray-600">
                    Join thousands of home chefs who are earning with love, trust and RRC Kitchen.
                  </p>
                  
                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                    <Button asChild size="lg" className="bg-[#EE7005] hover:bg-[#EE7005]/90 text-white rounded-full px-8 py-6 text-base font-bold shadow-lg shadow-[#EE7005]/30">
                      <Link href={isLoggedIn ? "/kitchen/dashboard" : "/kitchen/signup"}>Join as a Home Chef!</Link>
                    </Button>
                    <p className="text-sm font-medium text-gray-500">It&apos;s free and only takes a few minutes!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </main>
      </Suspense>
      
      <KitchenFooter />
    </div>
  );
}