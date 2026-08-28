import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { KitchenNavbar, KitchenFooter, KitchenFAQ } from "@/components/kitchen";
import { KitchenTestimonials } from "@/components/kitchen/kitchen-testimonials";
import { KitchenPageSkeleton } from "@/components/kitchen/kitchen-page-skeleton";
import { Play, CheckCircle2, ShieldCheck, TrendingUp, Clock, Megaphone, Users, Wallet, HeartHandshake, CircleDollarSign, ClipboardList, ChefHat, ShoppingBag } from "lucide-react";
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
    <div className="absolute top-12 right-0 lg:-right-6 bg-[#FFFFFF] rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-6 flex flex-col border border-[#F9F9F9] z-20 w-[180px]">
      <div className="flex items-center gap-3 mb-4">
        <Users className="h-8 w-8 text-[#006F3D]" strokeWidth={2} />
        <p className="font-extrabold text-[#111111] text-2xl">{count > 1500 ? count.toLocaleString("en-IN") + "+" : "1500+"}</p>
      </div>
      <div>
        <p className="text-[14px] font-extrabold text-[#111111] mb-1.5">Home Chefs</p>
        <p className="text-[12px] text-[#666666] leading-relaxed">are earning<br/>with RRC Kitchen</p>
      </div>
    </div>
  );
}

function KitchenChefCountSkeleton() {
  return (
    <div className="absolute top-12 right-0 lg:-right-6 bg-[#FFFFFF] rounded-[20px] shadow-[0_8px_40px_rgba(0,0,0,0.08)] p-6 flex flex-col border border-[#F9F9F9] z-20 w-[180px] animate-in fade-in duration-300">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-16" />
      </div>
      <div>
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-3/4" />
      </div>
    </div>
  );
}

export default async function KitchenPage() {
  const session = await getSession();
  const isLoggedIn = !!session?.user;

  return (
    <div className="min-h-screen bg-[#FEFEFE] font-sans overflow-hidden">
      <KitchenNavbar isLoggedIn={isLoggedIn} />
      
      <Suspense fallback={<KitchenPageSkeleton />}>
        <main>
        {/* Hero Section */}
        <section className="relative bg-[#FEFCFA] pt-12 pb-20 lg:pt-20 lg:pb-0 overflow-hidden border-b border-[#F5F5F5]">
          
          <div className="mx-auto max-w-[1300px] px-4 sm:px-6 relative">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center lg:items-end">
              <div className="max-w-2xl lg:pb-28">
                <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold tracking-tight text-[#111111] mb-6 leading-[1.15]">
                  Turn Your Passion for <br />
                  <span className="text-[#006F3D]">Cooking</span> into <span className="text-[#FD4F03]">Happiness</span>
                </h1>
                <p className="text-[17px] text-[#555555] mb-10 max-w-lg leading-[1.7] font-medium">
                  Join RRC Kitchen and become a trusted home chef. Share your homemade food with more people and earn on your own terms.
                </p>
                
                <div className="grid grid-cols-3 gap-2 sm:gap-6 mb-12">
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ShieldCheck className="h-6 w-6 text-[#006F3D]" strokeWidth={2} />
                      <p className="font-extrabold text-[#111111] text-[13px] sm:text-[14px] leading-tight">100% Trusted</p>
                    </div>
                    <p className="text-[#777777] text-[12px] leading-relaxed">Loved by thousands<br/>of families</p>
                  </div>
                  
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="h-6 w-6 text-[#006F3D]" strokeWidth={2} />
                      <p className="font-extrabold text-[#111111] text-[13px] sm:text-[14px] leading-tight">Grow Your<br/>Business</p>
                    </div>
                    <p className="text-[#777777] text-[12px] leading-relaxed mt-1">Increase your<br/>income</p>
                  </div>
                  
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-2 mb-1">
                      <ClipboardList className="h-6 w-6 text-[#006F3D]" strokeWidth={2} />
                      <p className="font-extrabold text-[#111111] text-[13px] sm:text-[14px] leading-tight">Be Your<br/>Own Boss</p>
                    </div>
                    <p className="text-[#777777] text-[12px] leading-relaxed mt-1">Work on your<br/>own schedule</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6">
                  <Button asChild size="lg" className="bg-[#FD4F03] hover:bg-[#E94700] text-[#FFFFFF] rounded-xl px-8 py-7 text-[16px] font-bold shadow-[0_4px_16px_rgba(253,79,3,0.25)] transition-transform hover:scale-[1.02]">
                    <Link href={isLoggedIn ? "/kitchen/dashboard" : "/kitchen/signup"}>Join as a Home Chef</Link>
                  </Button>
                  <Button variant="ghost" size="lg" className="rounded-xl px-4 py-7 text-[16px] font-bold text-[#111111] hover:bg-transparent hover:opacity-70 transition-all group">
                    <div className="flex items-center justify-center h-12 w-12 rounded-full border-[2px] border-[#FD4F03] mr-3 transition-transform group-hover:scale-110">
                      <Play className="h-4 w-4 text-[#FD4F03] ml-1 fill-[#FD4F03]" />
                    </div>
                    Watch How It Works
                  </Button>
                </div>
              </div>
              
              <div className="relative lg:ml-auto flex justify-center lg:justify-end w-full mt-10 lg:mt-0">
                {/* Background circle decoration */}
                <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square bg-[#FFF4EE] rounded-full z-0 opacity-80"></div>
                
                {/* Dotted pattern decoration */}
                <div className="absolute top-[20%] -left-[10%] w-24 h-24 hidden lg:grid grid-cols-4 gap-2.5 opacity-[0.15] z-0">
                  {Array.from({length: 12}).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#006F3D]"></div>)}
                </div>

                {/* Explicit height image container to fix visibility issues */}
                <div className="relative w-full max-w-[550px] h-[450px] sm:h-[550px] lg:h-[700px] z-10">
                  <Image 
                    src="/kitchen/hero-chef.webp" 
                    alt="Home Chef" 
                    fill 
                    className="object-contain object-bottom drop-shadow-2xl"
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
        <section id="how-it-works" className="py-20 lg:py-28 bg-[#FEFEFE]">
          <div className="mx-auto max-w-[1300px] px-4 sm:px-6">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 relative flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#111111] mb-4 sm:mb-6">How It Works?</h2>
              <p className="text-base sm:text-lg text-[#555555] font-medium">Become a home chef in 4 simple steps</p>
            </div>
            
            <div className="bg-[#FFFFFF] rounded-[32px] sm:rounded-[40px] shadow-[0_8px_40px_rgba(0,0,0,0.03)] border border-[#F5F5F5] p-8 sm:p-12 lg:p-16 relative w-full mx-auto">
              
              {/* Desktop Connecting Line */}
              <div className="hidden md:block absolute top-[88px] lg:top-[119px] left-[12.5%] right-[12.5%] h-[1px] bg-[#EEEEEE] z-0">
                {/* Midpoint Orange Dots */}
                <div className="absolute top-1/2 left-[16.6%] -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FD4F03] opacity-60"></div>
                <div className="absolute top-1/2 left-[50%] -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FD4F03] opacity-60"></div>
                <div className="absolute top-1/2 left-[83.3%] -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#FD4F03] opacity-60"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
                {steps.map((step, i) => (
                  <div key={i} className="flex flex-col items-center text-center group">
                    <div className="h-20 w-20 lg:h-[110px] lg:w-[110px] rounded-full bg-[#FFFFFF] flex items-center justify-center mb-5 lg:mb-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] border border-[#F5F5F5] text-[#006F3D] group-hover:scale-105 transition-transform duration-300 relative z-10">
                      <step.icon className="h-8 w-8 lg:h-10 lg:w-10" strokeWidth={1.5} />
                    </div>
                    <span className="text-[#FD4F03] font-bold text-[13px] lg:text-[14px] mb-1.5 lg:mb-2 tracking-wide">{step.num}</span>
                    <h3 className="text-base lg:text-[18px] font-extrabold text-[#111111] mb-1.5 lg:mb-2">{step.title}</h3>
                    <p className="text-[#777777] text-[13px] lg:text-[14px] px-2 sm:px-6 lg:px-4 leading-[1.6]">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Who Can Join Section */}
        <section className="py-20 lg:py-28 bg-[#FEFEFE] overflow-hidden">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              
              <div className="relative z-10 lg:pl-4">
                <div className="relative inline-block mb-6">
                  <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#111111] leading-[1.2]">
                    Who Can Join <br />
                    <span className="text-[#075C35]">RRC</span> <span className="text-[#FD4F03]">Kitchen?</span>
                  </h2>
                  <div className="w-8 h-[3px] bg-[#FD4F03] mt-4"></div>
                </div>
                <p className="text-base sm:text-lg text-[#666666] mb-8 leading-relaxed max-w-[95%]">
                  If you love cooking and want to share your<br className="hidden sm:block" />
                  homemade food with others, you&apos;re eligible!
                </p>
                
                <ul className="space-y-4 mb-10">
                  {["Passionate home cooks", "Expertise in any cuisine", "Hygienic & safe cooking environment", "Commitment to quality & on-time delivery"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="bg-[#EAF6EE] p-1 rounded-full shrink-0 flex items-center justify-center w-[22px] h-[22px]">
                        <CheckCircle2 className="h-4 w-4 text-[#006F3D] fill-[#006F3D] stroke-white" />
                      </div>
                      <span className="text-[#333333] font-medium text-[15px]">{item}</span>
                    </li>
                  ))}
                </ul>
                
                <Button asChild variant="outline" className="border-[1.5px] border-[#006F3D] text-[#006F3D] hover:bg-[#F1F8F3] hover:text-[#006F3D] rounded-lg px-8 py-6 text-base font-semibold bg-[#FFFFFF] transition-colors">
                  <Link href={isLoggedIn ? "/kitchen/dashboard" : "/kitchen/signup"}>Join as a Home Chef</Link>
                </Button>
              </div>
              
              <div className="relative mt-12 lg:mt-0 w-full lg:pr-8">
                {/* Decorative dots background */}
                <div className="absolute -top-10 -right-6 lg:right-6 w-24 h-24 sm:w-32 sm:h-32 grid grid-cols-4 gap-2 sm:gap-3 opacity-30 z-0">
                  {Array.from({length: 16}).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#006F3D]"></div>)}
                </div>
                <div className="absolute -bottom-8 -left-6 sm:-left-12 w-24 h-24 sm:w-32 sm:h-32 grid grid-cols-4 gap-2 sm:gap-3 opacity-30 z-0">
                  {Array.from({length: 16}).map((_, i) => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#006F3D]"></div>)}
                </div>
                
                {/* Decorative Leaves (SVG approximations) */}
                <div className="absolute bottom-10 -left-16 sm:-left-24 opacity-30 z-0 hidden lg:block" style={{ width: '120px', height: '120px' }}>
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M40 80 C 20 60, 20 20, 50 10 C 80 20, 80 60, 40 80" fill="#006F3D" opacity="0.3"/>
                    <path d="M50 10 Q 45 45, 40 80" stroke="#006F3D" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                
                <div className="flex flex-row gap-4 sm:gap-6 lg:gap-8 relative z-10 w-full h-[350px] sm:h-[450px] lg:h-[500px]">
                  
                  {/* Left Large Image */}
                  <div className="relative w-[50%] lg:w-[52%] h-full">
                    <div className="relative w-full h-full rounded-2xl lg:rounded-[24px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                      <Image src="/kitchen/chef1.webp" alt="Chef 1" fill sizes="(min-width: 1024px) 26vw, 45vw" className="object-cover" />
                    </div>
                    {/* Flexible Time Badge */}
                    <div className="absolute -bottom-5 sm:-bottom-8 left-1/2 -translate-x-1/2 bg-[#FFFFFF] rounded-xl lg:rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 sm:gap-4 border border-[#F5F5F5] z-20 w-max">
                      <div className="flex items-center justify-center shrink-0">
                        <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-[#006F3D]" strokeWidth={2} />
                      </div>
                      <div>
                        <p className="text-[13px] sm:text-[15px] font-bold text-[#111111] mb-0.5 sm:mb-1">Flexible Time</p>
                        <p className="text-[11px] sm:text-[12px] text-[#777777]">Work at your convenience</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Two Images */}
                  <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 w-[50%] lg:w-[48%] h-full">
                    {/* Top Right Image */}
                    <div className="relative w-full h-[calc(50%-8px)] sm:h-[calc(50%-12px)] lg:h-[calc(50%-16px)]">
                      <div className="relative w-full h-full rounded-2xl lg:rounded-[24px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                        <Image src="/kitchen/chef2.webp" alt="Chef 2" fill sizes="(min-width: 1024px) 24vw, 45vw" className="object-cover" />
                      </div>
                      {/* Grow Your Income Badge */}
                      <div className="absolute -top-4 sm:-top-8 -right-2 sm:-right-12 bg-[#FFFFFF] rounded-xl lg:rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 sm:gap-4 border border-[#F5F5F5] z-20 w-max">
                        <div className="flex items-center justify-center shrink-0">
                          <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-[#006F3D]" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-[13px] sm:text-[15px] font-bold text-[#111111] mb-0.5 sm:mb-1">Grow Your Income</p>
                          <p className="text-[11px] sm:text-[12px] text-[#777777]">Earn on every order</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Bottom Right Image */}
                    <div className="relative w-full h-[calc(50%-8px)] sm:h-[calc(50%-12px)] lg:h-[calc(50%-16px)]">
                      <div className="relative w-full h-full rounded-2xl lg:rounded-[24px] overflow-hidden shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
                        <Image src="/kitchen/chef3.webp" alt="Chef 3" fill sizes="(min-width: 1024px) 24vw, 45vw" className="object-cover" />
                      </div>
                      {/* Be Your Own Boss Badge */}
                      <div className="absolute bottom-6 sm:bottom-12 -right-2 sm:-right-12 bg-[#FFFFFF] rounded-xl lg:rounded-[16px] shadow-[0_8px_30px_rgba(0,0,0,0.08)] px-4 py-3 sm:px-6 sm:py-4 flex items-center gap-3 sm:gap-4 border border-[#F5F5F5] z-20 w-max">
                        <div className="flex items-center justify-center shrink-0">
                          <ClipboardList className="h-6 w-6 sm:h-8 sm:w-8 text-[#006F3D]" strokeWidth={2} />
                        </div>
                        <div>
                          <p className="text-[13px] sm:text-[15px] font-bold text-[#111111] mb-0.5 sm:mb-1">Be Your Own Boss</p>
                          <p className="text-[11px] sm:text-[12px] text-[#777777]">Build your brand</p>
                        </div>
                      </div>
                    </div>
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
        <section className="py-16 lg:py-24 bg-[#FEFEFE] relative overflow-hidden border-t border-[#F9F9F9]">
          {/* Watermark text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 select-none">
             <span className="text-[100px] sm:text-[160px] lg:text-[200px] font-black text-[#FD4F03] opacity-[0.03] whitespace-nowrap tracking-tighter">
                HOME CHEF
             </span>
          </div>
          
          <div className="mx-auto max-w-[1250px] w-full px-4 sm:px-6 relative z-10 flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8">
            
            {/* Left Image */}
            <div className="shrink-0 relative w-48 h-48 lg:w-[240px] lg:h-[240px]">
               <Image src="/kitchen/heart-bowl.webp" alt="Heart Bowl" fill sizes="240px" className="object-contain" priority />
            </div>

            {/* Middle Text */}
            <div className="flex-1 text-center lg:text-left max-w-xl lg:px-4 relative z-10">
               <h2 className="text-3xl sm:text-4xl lg:text-[38px] font-extrabold text-[#111111] leading-[1.3] lg:leading-[1.3] mb-4 lg:mb-5">
                 Ready to Start Your Journey <br className="hidden lg:block"/> as a <span className="text-[#FD4F03]">Home Chef?</span>
               </h2>
               <p className="text-[15px] lg:text-[17px] text-[#555555] font-medium leading-[1.6]">
                 Join thousands of home chefs who are earning <br className="hidden lg:block"/> with love, trust and RRC Kitchen.
               </p>
            </div>

            {/* Right Action */}
            <div className="flex flex-col items-center justify-center shrink-0 lg:pr-32 xl:pr-16 lg:-mt-4 relative z-10">
               <Button asChild size="lg" className="bg-[#FD4F03] hover:bg-[#E94700] text-[#FFFFFF] rounded-xl px-12 py-7 text-[16px] lg:text-[17px] font-bold shadow-[0_6px_20px_rgba(253,79,3,0.3)] w-full sm:w-auto mb-3 lg:mb-4 transition-transform hover:scale-[1.02]">
                 <Link href={isLoggedIn ? "/kitchen/dashboard" : "/kitchen/signup"}>Join as a Home Chef</Link>
               </Button>
               <p className="text-[13px] sm:text-[14px] text-[#777777] font-medium">It&apos;s free and only takes a few minutes!</p>
            </div>

            {/* Far Right Image (Leaf) */}
            <div className="hidden lg:block absolute right-0 xl:-right-10 top-1/2 -translate-y-1/2 w-[160px] h-[160px] xl:w-[200px] xl:h-[200px] pointer-events-none z-0">
               <Image src="/kitchen/leaf.webp" alt="Leaf Decoration" fill sizes="200px" className="object-contain" priority />
            </div>
            
          </div>
        </section>
        </main>
      </Suspense>
      
      <KitchenFooter />
    </div>
  );
}