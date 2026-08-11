import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KitchenNavbar, KitchenFooter, KitchenFAQ } from "@/components/kitchen";
import { KitchenTestimonials } from "@/components/kitchen/kitchen-testimonials";
import { KitchenPageSkeleton } from "@/components/kitchen/kitchen-page-skeleton";
import { Play, CheckCircle2, ShieldCheck, TrendingUp, Clock, Megaphone, Lock, Users, Wallet, HeartHandshake, CircleDollarSign, ClipboardList, ChefHat, ShoppingBag } from "lucide-react";
import { getSession } from "@/lib/auth-server";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Become a Home Chef | RRC Kitchen",
  description: "Join RRC Kitchen and become a trusted home chef. Share your homemade food with more people and earn on your own terms.",
};

const benefits = [
  { icon: HeartHandshake, title: "Trusted Platform", desc: "Join a trusted brand that customers love and rely on." },
  { icon: CircleDollarSign, title: "Earn More", desc: "Get fair earnings on every order you receive." },
  { icon: Wallet, title: "No Investment", desc: "Start your kitchen with zero setup or joining fees." },
  { icon: Clock, title: "Flexible Hours", desc: "Work on your time. You decide what and when to cook." },
  { icon: Megaphone, title: "We Promote You", desc: "We help you reach more customers in your area." },
  { icon: ShieldCheck, title: "100% Secure", desc: "Safe payments, data privacy and full support." },
];

const steps = [
  { num: "Step 1", title: "Register", desc: "Sign up and tell us about your kitchen.", icon: ClipboardList },
  { num: "Step 2", title: "Verification", desc: "We verify your kitchen for quality & hygiene.", icon: ShieldCheck },
  { num: "Step 3", title: "Setup Your Menu", desc: "Add your delicious dishes and photos.", icon: ChefHat },
  { num: "Step 4", title: "Start Receiving Orders", desc: "Get orders, cook with love and earn daily.", icon: ShoppingBag },
];

async function KitchenChefCount() {
  const count = await prisma.kitchenPartner.count({
    where: { status: { in: ["APPROVED", "ACTIVE"] } },
  });

  return (
    <div className="absolute top-10 -right-4 lg:-right-4 bg-[#FFFFFF] rounded-[12px] shadow-[0_3px_12px_rgba(0,0,0,0.06)] p-5 flex items-center gap-4 border border-[#EEEEEE] z-10">
      <div className="h-12 w-12 rounded-full bg-[#F1F8F3] flex items-center justify-center">
        <Users className="h-6 w-6 text-[#006F3D]" />
      </div>
      <div>
        <p className="font-extrabold text-[#111111] text-xl">{count.toLocaleString("en-IN")}+</p>
        <p className="text-sm font-semibold text-[#111111]">Home Chefs</p>
        <p className="text-xs text-[#666666]">are earning<br/>with RRC Kitchen</p>
      </div>
    </div>
  );
}

function KitchenChefCountSkeleton() {
  return (
    <div className="absolute top-10 -right-4 lg:-right-4 bg-[#FFFFFF] rounded-[12px] shadow-[0_3px_12px_rgba(0,0,0,0.06)] p-5 flex items-center gap-4 border border-[#EEEEEE] z-10 animate-in fade-in duration-300">
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
    <div className="min-h-screen bg-[#FEFEFE] font-sans">
      <KitchenNavbar isLoggedIn={isLoggedIn} />
      
      <Suspense fallback={<KitchenPageSkeleton />}>
        <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#FEFBF8] pt-12 pb-20 lg:pt-20 lg:pb-28">
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-4 h-4 rounded-full bg-[#B8DDBF] opacity-50" />
          <div className="absolute top-40 right-1/2 w-6 h-6 rounded-full bg-[#B8DDBF] opacity-30" />
          <div className="mx-auto max-w-7xl px-4 sm:px-6 relative">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
              <div className="max-w-2xl">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#111111] mb-6 leading-tight">
                  Turn Your Passion for <br />
                  <span className="text-[#075C35]">Cooking</span> into <span className="text-[#FD4F03]">Happiness</span>
                </h1>
                <p className="text-lg text-[#333333] mb-8 max-w-lg leading-relaxed">
                  Join RRC Kitchen and become a trusted home chef. Share your homemade food with more people and earn on your own terms.
                </p>
                
                <div className="flex flex-wrap gap-6 mb-10">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#F1F8F3] flex items-center justify-center">
                      <HeartHandshake className="h-5 w-5 text-[#006F3D]" />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-[#111111]">100% Trusted</p>
                      <p className="text-[#666666] text-xs">Loved by thousands<br/>of families</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#F1F8F3] flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-[#006F3D]" />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-[#111111]">Grow Your Business</p>
                      <p className="text-[#666666] text-xs">Increase your<br/>income</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#F1F8F3] flex items-center justify-center">
                      <Clock className="h-5 w-5 text-[#006F3D]" />
                    </div>
                    <div className="text-sm">
                      <p className="font-bold text-[#111111]">Be Your Own Boss</p>
                      <p className="text-[#666666] text-xs">Work on your<br/>own schedule</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <Button asChild size="lg" className="bg-[#FD4F03] hover:bg-[#E94700] text-[#FFFFFF] rounded-[7px] px-8 py-6 text-base font-semibold shadow-[0_3px_12px_rgba(253,79,3,0.2)] transition-all">
                    <Link href={isLoggedIn ? "/kitchen/dashboard" : "/kitchen/signup"}>Join as a Home Chef!</Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="rounded-[7px] px-6 py-6 text-base font-semibold text-[#111111] hover:bg-transparent hover:opacity-80 transition-all group">
                    <div className="flex items-center justify-center h-10 w-10 rounded-full border-[1.5px] border-[#FD4F03] mr-3 group-hover:bg-[#FFF3EC] transition-colors">
                      <Play className="h-4 w-4 text-[#FD4F03] ml-1 fill-[#FD4F03]" />
                    </div>
                    Watch How It Works
                  </Button>
                </div>
              </div>
              
              <div className="relative lg:ml-auto flex justify-center lg:justify-end">
                {/* Background circle decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] aspect-square bg-[#FFF1E7] rounded-full z-0 opacity-70"></div>
                
                <div className="relative w-full max-w-lg aspect-square z-10">
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
        <section id="why-partner" className="py-20 bg-[#FEFEFE]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 relative">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-2 flex flex-col items-center">
                <span>Why <span className="text-[#FD4F03]">Partner</span> With Us?</span>
              </h2>
              <div className="w-8 h-[2px] bg-[#FD4F03] mx-auto mb-6"></div>
              <p className="text-lg text-[#666666]">
                We make it simple, rewarding and secure for home chefs<br className="hidden sm:block"/>to grow and succeed.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((b, i) => (
                <div key={i} className="bg-[#FFFFFF] rounded-[12px] p-8 border border-[#EEEEEE] shadow-[0_3px_12px_rgba(0,0,0,0.06)] text-center hover:shadow-[0_6px_18px_rgba(0,0,0,0.09)] transition-shadow">
                  <div className="mx-auto h-16 w-16 mb-6 rounded-full bg-[#F1F8F3] flex items-center justify-center text-[#006F3D]">
                    <b.icon className="h-8 w-8" strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-bold text-[#111111] mb-3">{b.title}</h3>
                  <p className="text-[#666666] text-sm leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-20 bg-[#FEFEFE]">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16 relative flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-2">How It Works?</h2>
              <div className="w-8 h-[2px] bg-[#FD4F03] mb-6"></div>
              <p className="text-lg text-[#666666]">Become a home chef in 4 simple steps</p>
            </div>
            
            <div className="relative max-w-5xl mx-auto pt-4">
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-[1px] bg-[#E7E7E7]"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center group">
                    <div className="h-20 w-20 rounded-full bg-[#FFFFFF] flex items-center justify-center mb-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border-[2px] border-[#E5EDE7] text-[#006F3D] group-hover:border-[#006F3D] transition-colors relative z-10">
                      <step.icon className="h-8 w-8" />
                      {/* Orange dots on line */}
                      {i < 3 && <div className="hidden md:block absolute -right-[120%] top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-[#FD4F03] opacity-40"></div>}
                    </div>
                    <span className="text-[#FD4F03] font-bold text-sm mb-2">{step.num}</span>
                    <h3 className="text-lg font-bold text-[#111111] mb-2">{step.title}</h3>
                    <p className="text-[#666666] text-sm px-2">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Who Can Join Section */}
        <section className="py-20 bg-[#FEFEFE] overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="relative inline-block mb-4">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] leading-tight">
                    Who Can Join <br />
                    <span className="text-[#075C35]">RRC</span> <span className="text-[#FD4F03]">Kitchen?</span>
                  </h2>
                  <div className="w-8 h-[2px] bg-[#FD4F03] mt-3"></div>
                </div>
                <p className="text-lg text-[#666666] mb-8 leading-relaxed">
                  If you love cooking and want to share your homemade food with others, you&apos;re eligible!
                </p>
                
                <ul className="space-y-4 mb-10">
                  {["Passionate home cooks", "Expertise in any cuisine", "Hygienic & safe cooking environment", "Commitment to quality & on-time delivery"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="bg-[#EAF6EE] p-1 rounded-full shrink-0 flex items-center justify-center w-6 h-6">
                        <CheckCircle2 className="h-4 w-4 text-[#006F3D] fill-[#006F3D] stroke-white" />
                      </div>
                      <span className="text-[#333333] font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Button asChild variant="outline" size="lg" className="border-[1.5px] border-[#006F3D] text-[#006F3D] hover:bg-[#F1F8F3] hover:text-[#006F3D] rounded-[7px] px-8 py-6 text-base font-semibold bg-[#FFFFFF]">
                  <Link href={isLoggedIn ? "/kitchen/dashboard" : "/kitchen/signup"}>Join as a Home Chef</Link>
                </Button>
              </div>
              
              <div className="relative mt-8 lg:mt-0">
                {/* Decorative dots background */}
                <div className="absolute -top-10 -left-10 w-32 h-32 grid grid-cols-4 gap-2 opacity-20">
                  {Array.from({length: 16}).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#006F3D]"></div>)}
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 grid grid-cols-4 gap-2 opacity-20">
                  {Array.from({length: 16}).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#006F3D]"></div>)}
                </div>
                
                <div className="grid grid-cols-2 gap-4 relative z-10">
                  <div className="relative h-full min-h-[300px] sm:min-h-[400px] rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E8E8E8]">
                    <Image src="/kitchen/chef1.webp" alt="Chef 1" fill className="object-cover" />
                  </div>
                  <div className="space-y-4 flex flex-col">
                    <div className="relative h-48 sm:h-64 rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E8E8E8]">
                      <Image src="/kitchen/chef2.webp" alt="Chef 2" fill className="object-cover" />
                    </div>
                    <div className="relative h-40 sm:h-48 rounded-[14px] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E8E8E8]">
                      <Image src="/kitchen/chef3.webp" alt="Chef 3" fill className="object-cover" />
                    </div>
                  </div>
                </div>
                
                {/* Floating Badges */}
                <div className="absolute top-10 -right-4 sm:-right-8 bg-[#FFFFFF] rounded-[12px] shadow-[0_3px_12px_rgba(0,0,0,0.06)] p-3 sm:p-4 flex items-center gap-3 border border-[#EEEEEE] z-20">
                  <div className="w-10 h-10 rounded-full bg-[#F1F8F3] flex items-center justify-center shrink-0">
                    <TrendingUp className="h-5 w-5 text-[#006F3D]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">Grow Your Income</p>
                    <p className="text-[11px] text-[#777777]">Earn on every order</p>
                  </div>
                </div>
                
                <div className="absolute top-[60%] -right-4 sm:-right-8 bg-[#FFFFFF] rounded-[12px] shadow-[0_3px_12px_rgba(0,0,0,0.06)] p-3 sm:p-4 flex items-center gap-3 border border-[#EEEEEE] z-20 hidden sm:flex">
                  <div className="w-10 h-10 rounded-full bg-[#F1F8F3] flex items-center justify-center shrink-0">
                    <Lock className="h-5 w-5 text-[#006F3D]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">Be Your Own Boss</p>
                    <p className="text-[11px] text-[#777777]">Build your brand</p>
                  </div>
                </div>
                
                <div className="absolute bottom-8 left-4 sm:left-[10%] bg-[#FFFFFF] rounded-[12px] shadow-[0_3px_12px_rgba(0,0,0,0.06)] p-3 sm:p-4 flex items-center gap-3 border border-[#EEEEEE] z-20">
                  <div className="w-10 h-10 rounded-full bg-[#F1F8F3] flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-[#006F3D]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#111111]">Flexible Time</p>
                    <p className="text-[11px] text-[#777777]">Work at your convenience</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <KitchenTestimonials />

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-[#FEFEFE]">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center mb-12 flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-2 relative inline-block">
                Frequently <span className="text-[#FD4F03]">Asked</span> Questions
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#FD4F03]"></div>
              </h2>
            </div>
            <div className="mt-12">
              <KitchenFAQ />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#FEFEFE]">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="bg-[#FEFBF8] rounded-[14px] shadow-[0_3px_12px_rgba(0,0,0,0.06)] p-8 md:p-12 lg:p-16 border border-[#E8E8E8] relative overflow-hidden">
              <div className="grid md:grid-cols-2 gap-8 items-center relative z-10">
                <div className="flex justify-center md:justify-start">
                  <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80">
                    {/* Placeholder for heart bowl image */}
                    <div className="absolute inset-0 bg-[#F1F8F3] rounded-full opacity-50 blur-3xl"></div>
                    <Image src="/kitchen/heart-bowl.webp" alt="Heart Bowl" fill className="object-contain relative z-10" />
                  </div>
                </div>
                
                <div className="text-center md:text-left space-y-6">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] leading-tight">
                    Ready to Start Your Journey <br className="hidden md:block" />
                    as a <span className="text-[#FD4F03]">Home Chef?</span>
                  </h2>
                  <p className="text-lg text-[#333333]">
                    Join thousands of home chefs who are earning with love, trust and RRC Kitchen.
                  </p>
                  
                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                    <Button asChild size="lg" className="bg-[#FD4F03] hover:bg-[#E94700] text-[#FFFFFF] rounded-[7px] px-8 py-6 text-base font-bold shadow-[0_3px_12px_rgba(253,79,3,0.2)]">
                      <Link href={isLoggedIn ? "/kitchen/dashboard" : "/kitchen/signup"}>Join as a Home Chef</Link>
                    </Button>
                    <p className="text-sm font-medium text-[#666666]">It&apos;s free and only takes a few minutes!</p>
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