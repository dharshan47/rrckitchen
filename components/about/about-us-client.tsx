"use client";

import { ChevronRight, ChefHat, Users, Package, ShieldCheck, CheckCircle2, MapPin, Search, CalendarDays, Bike, Heart, Leaf, ConciergeBell } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AppDownloadBanner } from "@/components/home/app-download-banner";

export function AboutUsClient() {
   return (
      <div className="bg-[#FEFEFE] min-h-screen text-[#333333] font-sans overflow-x-hidden">

         {/* 1. Hero Section */}
      <section className="relative bg-[#FEFEFE] pt-6 pb-0 lg:pt-10 lg:pb-32 overflow-hidden flex flex-col lg:block">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mb-6 lg:mb-0">
          {/* Breadcrumbs */}
          <div className="text-[13px] font-medium text-[#6B7280] flex items-center gap-2 mb-6 lg:mb-12">
            <Link href="/" className="hover:text-[#111111] transition-colors">Home</Link> 
            <ChevronRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
            <span className="text-[#003015] font-bold">About Us</span>
          </div>

          <div className="max-w-xl">
            <h1 className="text-[32px] md:text-[56px] font-bold text-[#003015] leading-[1.1] mb-4 lg:mb-5 tracking-tight">
              About <span className="text-[#F04E00]">RRC Kitchen</span>
            </h1>
            <p className="text-[16px] md:text-[22px] font-bold text-[#111111] leading-snug mb-4 lg:mb-5 max-w-lg">
              A platform that celebrates the love, tradition, and flavors of homemade food.
            </p>
            <p className="text-[13px] md:text-[15px] text-[#4B5563] leading-relaxed font-medium">
              RRC Kitchen is a home food delivery platform that connects passionate home chefs with food lovers who crave delicious, hygienic, and home-cooked meals. We believe that <span className="text-[#087A35] font-bold">every homemaker is a chef</span>, and their kitchen holds the power to serve happiness.
            </p>
          </div>
        </div>

        {/* Background Graphic elements */}
        <div className="relative lg:absolute right-0 top-0 bottom-0 w-full lg:w-[55%] h-[300px] sm:h-[400px] lg:h-auto z-0 mt-4 lg:mt-0 shrink-0">
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#FEFEFE] via-[#FEFEFE]/90 to-transparent z-10 md:w-1/2" />
          <Image 
            src="/about/hero-chef.webp"
            alt="Woman cooking"
            fill
            className="object-cover object-[center_right] lg:object-left opacity-90 lg:opacity-100"
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
          />
        </div>
      </section>

      {/* 2. Stats & Mission Section */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-8 lg:-mt-12">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          
          {/* Stats */}
          <div className="flex-[2.5] bg-[#FFF7F1] rounded-[16px] border border-[#FFE5D7] p-6 lg:p-8 grid grid-cols-2 lg:flex items-center justify-between gap-y-8 gap-x-4 lg:gap-y-0 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4">
              <ChefHat className="w-10 h-10 text-[#F04E00] shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-bold text-[#111111] leading-none mb-1">500+</h3>
                <p className="text-[13px] text-[#4B5563] font-medium">Home Chefs</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-[#087A35] shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-bold text-[#111111] leading-none mb-1">10,000+</h3>
                <p className="text-[13px] text-[#4B5563] font-medium">Happy Customers</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Package className="w-10 h-10 text-[#F04E00] shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-bold text-[#111111] leading-none mb-1">25,000+</h3>
                <p className="text-[13px] text-[#4B5563] font-medium">Orders Delivered</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <ShieldCheck className="w-10 h-10 text-[#087A35] shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-bold text-[#111111] leading-none mb-1">100%</h3>
                <p className="text-[13px] text-[#4B5563] font-medium">Hygienic & Safe</p>
              </div>
            </div>
          </div>

          {/* Our Mission */}
          <div className="flex-1 bg-[#F3F9F4] rounded-[16px] border border-[#DDEDE0] p-6 lg:px-8 lg:py-6 flex flex-col justify-center shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
             <div className="flex items-start justify-between mb-2">
                <h2 className="text-[20px] font-bold text-[#003015] tracking-tight">Our Mission</h2>
                <div className="w-12 h-12 bg-[#FFFFFF] rounded-full flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#EEEEEE] p-2">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
                     <path d="M 66 29 A 34 34 0 1 0 82 58" stroke="#003015" strokeWidth="5.5" fill="none" strokeLinecap="round" />
                     <circle cx="48" cy="58" r="19" stroke="#F04E00" strokeWidth="5.5" fill="none" />
                     <circle cx="48" cy="58" r="5" stroke="#F04E00" strokeWidth="5.5" fill="none" />
                     <path d="M 94 12 C 94 12, 90 28, 74 32 C 74 32, 78 16, 94 12 Z" fill="#F3F9F4" stroke="#003015" strokeWidth="4" strokeLinejoin="round" />
                     <line x1="92" y1="14" x2="52" y2="54" stroke="#003015" strokeWidth="5" strokeLinecap="round" />
                     <polygon points="46,58 58,54 52,46" fill="#003015" stroke="#003015" strokeWidth="2" strokeLinejoin="round" />
                  </svg>
                </div>
             </div>
             <p className="text-[13px] text-[#4B5563] font-medium leading-relaxed mt-2">
                To empower home chefs, promote healthy eating, and bring communities closer through the <span className="font-bold text-[#111111]">goodness</span> of homemade food.
             </p>
          </div>

        </div>
      </section>

      {/* 4. Why RRC Kitchen & Our Journey */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12 lg:mt-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Why RRC Kitchen */}
          <div className="w-full lg:w-[60%] bg-[#FFFFFF] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E7E7E7] p-8 lg:p-10 relative overflow-hidden flex flex-col">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-[#003015] mb-3 tracking-tight">Why RRC Kitchen?</h2>
            <p className="text-[13px] text-[#4B5563] font-medium leading-relaxed mb-6 lg:pr-[40%] relative z-10">
              We are more than just a food delivery platform. We are a movement to recognize and empower the incredible women who cook with love every day.
            </p>
            <div className="space-y-3 mb-8 lg:mb-0 relative z-10">
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-[#087A35] shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-[13px] text-[#111111] font-bold leading-snug">100% homemade food by verified home chefs</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-[#087A35] shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-[13px] text-[#111111] font-bold leading-snug">Hygienic preparation and safe packaging</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-[#087A35] shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-[13px] text-[#111111] font-bold leading-snug">No restaurants, no middlemen</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-[#087A35] shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-[13px] text-[#111111] font-bold leading-snug">Timely delivery of pre-booked orders</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-[#087A35] shrink-0 mt-0.5" strokeWidth={2} />
                <span className="text-[13px] text-[#111111] font-bold leading-snug">Supporting local communities and women empowerment</span>
              </div>
            </div>
            
            {/* Graphic positioning */}
            <div className="mt-6 lg:absolute lg:bottom-0 lg:right-6 lg:w-[40%] h-48 lg:h-[90%] flex items-end justify-center lg:justify-end z-0">
              <div className="relative w-full max-w-[280px] h-full">
                <Image 
                  src="/about/about-rrc-chef.webp"
                  alt="Cooking illustration" 
                  fill
                  className="object-contain object-bottom drop-shadow-md opacity-90"
                />
              </div>
            </div>
          </div>

          {/* Our Journey */}
          <div className="w-full lg:w-[40%] bg-[#FFF7F1] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#FFE8DA] p-8 pb-[200px] sm:pb-[250px] lg:p-10 relative overflow-hidden flex flex-col">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-[#003015] mb-4 tracking-tight">Our Journey</h2>
            <div className="relative z-10 lg:pr-8 w-full lg:max-w-none">
               <p className="text-[13px] text-[#4B5563] font-medium leading-relaxed mb-4">
                 RRC Kitchen started with a simple idea &ndash; to help home chefs turn their passion into a source of income while serving healthy and delicious meals to people.
               </p>
               <p className="text-[13px] text-[#4B5563] font-medium leading-relaxed">
                 Today, we are proud to be a trusted platform for thousands of families who believe that the best meals come from home.
               </p>
            </div>
            
            <div className="absolute right-0 bottom-0 w-[85%] sm:w-[70%] lg:w-[85%] h-[220px] sm:h-[260px] lg:h-[240px] flex items-end justify-end pointer-events-none overflow-hidden pb-4 pr-4">
                <Image 
                  src="/about/path.webp"
                  alt="Our Journey Path"
                  fill
                  className="object-contain object-bottom right-0 bottom-0"
                />
            </div>
          </div>
        </div>
      </section>

      {/* 5. How RRC Kitchen Works */}
      <section className="bg-[#FEFEFE] py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative border border-[#E7E7E7] rounded-[16px] mt-4 lg:mt-8 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#FEFEFE] px-6 z-10">
              <h2 className="text-[18px] md:text-[20px] font-bold text-[#003015] tracking-tight whitespace-nowrap">How RRC Kitchen Works</h2>
            </div>
            
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-start lg:justify-between gap-8 lg:gap-2 px-6 py-10 lg:px-8 lg:py-12">
               {[
                  { step: 1, icon: MapPin, title: "Choose\nLocation", desc: "Select your\ndelivery location" },
                  { step: 2, icon: Search, title: "Browse\nKitchens", desc: "Explore home chefs\nand their menus" },
                  { step: 3, icon: CalendarDays, title: "Pre-Book\nYour Meal", desc: "Select date, time\nand place your order" },
                  { step: 4, icon: ConciergeBell, title: "Home Chef\nPrepares", desc: "Fresh, hygienic and\nhomemade with love" },
                  { step: 5, icon: Bike, title: "Delivered\nto You", desc: "Get your order\non time at your door" },
               ].map((item, index) => (
                  <div key={item.step} className="flex flex-col lg:flex-row items-center lg:flex-1 shrink-0 w-full lg:w-auto">
                    <div className="flex flex-row items-center w-full lg:w-auto justify-start lg:justify-center">
                       {/* Overlapping Badges */}
                       <div className="relative flex items-center w-[84px] h-[56px] shrink-0">
                         <div className="absolute left-0 w-10 h-10 rounded-full bg-[#FFF0E8] flex items-center justify-center z-0">
                           <span className="font-bold text-[#F04E00] text-[15px]">{item.step}</span>
                         </div>
                         <div className="absolute right-0 w-14 h-14 rounded-full bg-[#F3F9F4] flex items-center justify-center z-10 border-[3px] border-[#FEFEFE]">
                           <item.icon className="w-[24px] h-[24px] text-[#087A35]" strokeWidth={1.5} />
                         </div>
                       </div>
                       
                       {/* Text */}
                       <div className="text-left ml-3">
                          <h4 className="font-bold text-[13px] text-[#111111] leading-tight mb-1 whitespace-pre-line">{item.title}</h4>
                          <p className="text-[11px] text-[#6B7280] font-medium leading-[1.3] whitespace-pre-line">{item.desc}</p>
                       </div>
                    </div>
                    {index < 4 && (
                      <>
                        <div className="hidden lg:flex shrink-0 px-3 lg:px-2 xl:px-3 items-center justify-center">
                          <Image src="/about/arrow.webp" width={20} height={20} alt="arrow" className="object-contain opacity-70" />
                        </div>
                        <div className="flex lg:hidden shrink-0 py-4 items-center justify-start w-full pl-[42px]">
                          <Image src="/about/arrow.webp" width={20} height={20} alt="arrow" className="object-contain opacity-70 rotate-90" />
                        </div>
                      </>
                    )}
                  </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Values & Home Chef CTA */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mb-10">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Our Values */}
          <div className="w-full lg:w-[60%] bg-[#FFFFFF] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E7E7E7] p-8 lg:p-10 flex flex-col justify-center">
            <h2 className="text-[20px] lg:text-[24px] font-bold text-[#003015] mb-8 tracking-tight text-center lg:text-left">Our Values</h2>
            <div className="grid grid-cols-2 lg:flex gap-6 lg:gap-6 justify-between text-center">
              
              <div className="flex flex-col items-center flex-1 min-w-[120px]">
                 <div className="w-12 h-12 flex items-center justify-center mb-3">
                    <Heart className="w-8 h-8 text-[#F04E00] stroke-[1.5]" />
                 </div>
                 <h4 className="font-bold text-[13px] text-[#111111] mb-1">Love & Care</h4>
                 <p className="text-[11px] text-[#6B7280] font-medium leading-snug">Every meal is cooked<br/>with love and care</p>
              </div>

              <div className="flex flex-col items-center flex-1 min-w-[120px]">
                 <div className="w-12 h-12 flex items-center justify-center mb-3">
                    <Leaf className="w-8 h-8 text-[#087A35] stroke-[1.5]" />
                 </div>
                 <h4 className="font-bold text-[13px] text-[#111111] mb-1">Hygiene First</h4>
                 <p className="text-[11px] text-[#6B7280] font-medium leading-snug">Clean, safe and hygienic<br/>at every step</p>
              </div>

              <div className="flex flex-col items-center flex-1 min-w-[120px]">
                 <div className="w-12 h-12 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-8 h-8 text-[#087A35] stroke-[1.5]" />
                 </div>
                 <h4 className="font-bold text-[13px] text-[#111111] mb-1">Trust & Transparency</h4>
                 <p className="text-[11px] text-[#6B7280] font-medium leading-snug">Verified chefs and<br/>transparent process</p>
              </div>

              <div className="flex flex-col items-center flex-1 min-w-[120px]">
                 <div className="w-12 h-12 flex items-center justify-center mb-3">
                    <Users className="w-8 h-8 text-[#F04E00] stroke-[1.5]" />
                 </div>
                 <h4 className="font-bold text-[13px] text-[#111111] mb-1">Community Support</h4>
                 <p className="text-[11px] text-[#6B7280] font-medium leading-snug">Empowering homemakers<br/>and local communities</p>
              </div>
            </div>
          </div>

          {/* Are You a Home Chef? CTA */}
          <div className="w-full lg:w-[40%] bg-[#F3F9F4] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#DDEDE0] overflow-hidden relative flex flex-col min-h-[300px]">
            <div className="p-8 lg:p-10 relative z-10 w-full lg:w-[65%]">
               <h2 className="text-[20px] lg:text-[24px] font-bold text-[#003015] mb-4 tracking-tight leading-tight">Are You a Home Chef?</h2>
               <p className="text-[12px] text-[#111111] font-medium leading-relaxed mb-6">
                 Turn your passion for cooking into income. Join RRC Kitchen and reach thousands of happy customers.
               </p>
               <button className="bg-[#003015] hover:bg-[#001f0d] text-[#FFFFFF] px-5 py-2.5 rounded-[24px] font-bold text-[11px] tracking-wide transition-colors shadow-[0_5px_14px_rgba(0,48,21,0.18)]">
                 BECOME A HOME CHEF
               </button>
            </div>
            {/* Image container on the right */}
            <div className="absolute right-0 bottom-0 top-0 w-[55%] hidden md:block">
               <Image 
                  src="/about/about-cta-chef.webp"
                  alt="Home Chef" 
                  fill
                  className="object-cover object-left opacity-95"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-[#F3F9F4] via-[#F3F9F4]/60 to-transparent"></div>
               {/* Floating Badge */}
               <div className="absolute top-1/4 right-4 w-20 h-20 bg-[#FFFFFF] rounded-full border border-[#E7E7E7] shadow-[0_4px_14px_rgba(0,0,0,0.06)] flex flex-col items-center justify-center text-center p-1 z-20">
                  <div className="w-full h-full rounded-full border border-dashed border-[#087A35] flex flex-col items-center justify-center">
                     <Heart className="w-3 h-3 text-[#087A35] mb-0.5" strokeWidth={2} />
                     <span className="text-[8px] font-bold text-[#003015] leading-[1.1]">Every<br/>Homemaker<br/>is a Chef</span>
                     <Heart className="w-3 h-3 text-[#087A35] mt-0.5" strokeWidth={2} />
                  </div>
               </div>
            </div>
            {/* Mobile Image */}
            <div className="md:hidden relative h-48 w-full mt-auto">
               <Image 
                  src="/about/about-cta-chef.webp"
                  alt="Home Chef" 
                  fill
                  className="object-cover object-top"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#F3F9F4]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. App Download Banner */}
      <AppDownloadBanner />

    </div>
  );

}
