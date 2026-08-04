"use client";

import { ChevronRight, ChefHat, Users, Package, ShieldCheck, Target, CheckCircle2, MapPin, Search, CalendarDays, Bike, Heart, Leaf, CookingPot } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AppDownloadBanner } from "@/components/home/app-download-banner";

export function AboutUsClient() {
   return (
      <div className="bg-white min-h-screen text-foreground font-sans overflow-x-hidden">

         {/* 1. Hero Section */}
      <section className="relative bg-[#FDFBF7] pt-6 pb-0 lg:pt-10 lg:pb-32 overflow-hidden flex flex-col lg:block">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full mb-6 lg:mb-0">
          {/* Breadcrumbs */}
          <div className="text-[13px] font-medium text-gray-500 flex items-center gap-2 mb-6 lg:mb-12">
            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link> 
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[#0A3D24] font-bold">About Us</span>
          </div>

          <div className="max-w-xl">
            <h1 className="text-[32px] md:text-[56px] font-black text-[#0A3D24] leading-[1.1] mb-4 lg:mb-5 tracking-tight">
              About <span className="text-[#EE7005]">RRC Kitchen</span>
            </h1>
            <p className="text-[16px] md:text-[22px] font-bold text-[#0A3D24] leading-snug mb-4 lg:mb-5 max-w-lg">
              A platform that celebrates the love, tradition, and flavors of homemade food.
            </p>
            <p className="text-[13px] md:text-[15px] text-gray-700 leading-relaxed font-medium">
              RRC Kitchen is a home food delivery platform that connects passionate home chefs with food lovers who crave delicious, hygienic, and home-cooked meals. We believe that <span className="text-[#168846] font-black">every homemaker is a chef</span>, and their kitchen holds the power to serve happiness.
            </p>
          </div>
        </div>

        {/* Background Graphic elements */}
        <div className="relative lg:absolute right-0 top-0 bottom-0 w-full lg:w-[55%] h-[300px] sm:h-[400px] lg:h-auto z-0 mt-4 lg:mt-0 shrink-0">
          <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#FDFBF7] via-[#FDFBF7]/90 to-transparent z-10 md:w-1/2" />
          <Image 
            src="/hero/hero-tiffin-carrier.webp"
            alt="Woman cooking"
            fill
            className="object-cover object-[center_right] lg:object-left opacity-90 lg:opacity-100"
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
          />
        </div>
      </section>

      {/* 2. Stats & Mission Section (Overlapping Hero) */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-8 lg:-mt-20">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Stats */}
          <div className="flex-1 bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 p-6 lg:p-8 grid grid-cols-2 lg:flex items-center justify-between gap-y-8 gap-x-4 lg:gap-y-0">
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-[#EE7005]/20 flex items-center justify-center shrink-0">
                <ChefHat className="w-5 h-5 sm:w-6 sm:h-6 text-[#EE7005]" />
              </div>
              <div>
                <h3 className="text-[18px] sm:text-[20px] lg:text-[24px] font-black text-[#0A3D24] leading-none mb-1">500+</h3>
                <p className="text-[11px] sm:text-[12px] text-gray-600 font-bold">Home Chefs</p>
              </div>
            </div>
            
            <div className="w-px h-12 bg-gray-100 hidden lg:block"></div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-[#168846]/20 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-[#168846]" />
              </div>
              <div>
                <h3 className="text-[18px] sm:text-[20px] lg:text-[24px] font-black text-[#0A3D24] leading-none mb-1">10,000+</h3>
                <p className="text-[11px] sm:text-[12px] text-gray-600 font-bold">Happy Customers</p>
              </div>
            </div>

            <div className="w-px h-12 bg-gray-100 hidden lg:block"></div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-[#EE7005]/20 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#EE7005]" />
              </div>
              <div>
                <h3 className="text-[18px] sm:text-[20px] lg:text-[24px] font-black text-[#0A3D24] leading-none mb-1">25,000+</h3>
                <p className="text-[11px] sm:text-[12px] text-gray-600 font-bold">Orders Delivered</p>
              </div>
            </div>

            <div className="w-px h-12 bg-gray-100 hidden lg:block"></div>

            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl border border-[#168846]/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#168846]" />
              </div>
              <div>
                <h3 className="text-[18px] sm:text-[20px] lg:text-[24px] font-black text-[#0A3D24] leading-none mb-1">100%</h3>
                <p className="text-[11px] sm:text-[12px] text-gray-600 font-bold">Hygienic & Safe</p>
              </div>
            </div>
          </div>
        </div>
      </section>
           
         {/* 3. Our Mission */}
         <section className="max-w-[1200px] mx-auto px-4 mt-8 lg:mt-12">
            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-8 lg:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
               <div className="max-w-3xl relative z-10">
                  <h2 className="text-[24px] md:text-[28px] font-black text-[#166534] mb-4 tracking-tight">Our Mission</h2>
                  <p className="text-[16px] md:text-[18px] text-gray-700 font-medium leading-relaxed">
                     To empower home chefs, promote healthy eating, and bring communities closer through the goodness of homemade food.
                  </p>
               </div>
               <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 relative z-10 bg-green-50 rounded-full flex items-center justify-center">
                  {/* Simulated Target icon graphic */}
                  <div className="relative w-12 h-12 flex items-center justify-center">
                     <div className="absolute inset-0 rounded-full border-4 border-[#166534] opacity-20"></div>
                     <div className="absolute inset-2 rounded-full border-4 border-[#166534] opacity-50"></div>
                     <div className="absolute inset-4 rounded-full bg-[#EE7005]"></div>
                     <Target className="absolute -top-2 -right-2 w-6 h-6 text-[#166534]" />
                  </div>
               </div>
               {/* Subtle background decoration */}
               <div className="absolute right-0 top-0 w-64 h-64 bg-green-50 rounded-full -translate-y-1/2 translate-x-1/3 opacity-50 z-0"></div>
            </div>
         </section>

         {/* 4. Why RRC Kitchen & Our Journey */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-12 lg:mt-8">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Why RRC Kitchen */}
          <div className="w-full lg:w-[60%] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10 relative overflow-hidden flex flex-col">
            <h2 className="text-[20px] lg:text-[24px] font-black text-[#0A3D24] mb-3 tracking-tight">Why RRC Kitchen?</h2>
            <p className="text-[13px] text-gray-700 font-medium leading-relaxed mb-6 lg:pr-[40%] relative z-10">
              We are more than just a food delivery platform. We are a movement to recognize and empower the incredible women who cook with love every day.
            </p>
            <div className="space-y-3 mb-8 lg:mb-0 relative z-10">
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-[#168846] shrink-0 mt-0.5" />
                <span className="text-[13px] text-[#0A3D24] font-bold leading-snug">100% homemade food by verified home chefs</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-[#168846] shrink-0 mt-0.5" />
                <span className="text-[13px] text-[#0A3D24] font-bold leading-snug">Hygienic preparation and safe packaging</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-[#168846] shrink-0 mt-0.5" />
                <span className="text-[13px] text-[#0A3D24] font-bold leading-snug">No restaurants, no middlemen</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-[#168846] shrink-0 mt-0.5" />
                <span className="text-[13px] text-[#0A3D24] font-bold leading-snug">Timely delivery of pre-booked orders</span>
              </div>
              <div className="flex gap-2.5 items-start">
                <CheckCircle2 className="w-4 h-4 text-[#168846] shrink-0 mt-0.5" />
                <span className="text-[13px] text-[#0A3D24] font-bold leading-snug">Supporting local communities and women empowerment</span>
              </div>
            </div>
            
            {/* Graphic positioning */}
            <div className="mt-6 lg:absolute lg:bottom-0 lg:right-6 lg:w-[40%] h-48 lg:h-[90%] flex items-end justify-center lg:justify-end z-0">
              <div className="relative w-full max-w-[280px] h-full">
                <Image 
                  src="/hero/home-cta-chef.webp" 
                  alt="Cooking illustration" 
                  fill
                  className="object-contain object-bottom drop-shadow-md opacity-90"
                />
              </div>
            </div>
          </div>

          {/* Our Journey */}
          <div className="w-full lg:w-[40%] bg-[#FAF7F2] rounded-2xl shadow-sm border border-[#F2EAE1] p-8 lg:p-10 relative overflow-hidden flex flex-col">
            <h2 className="text-[20px] lg:text-[24px] font-black text-[#0A3D24] mb-4 tracking-tight">Our Journey</h2>
            <div className="relative z-10 lg:pr-10">
               <p className="text-[13px] text-[#0A3D24] font-medium leading-relaxed mb-4">
                 RRC Kitchen started with a simple idea &ndash; to help home chefs turn their passion into a source of income while serving healthy and delicious meals to people.
               </p>
               <p className="text-[13px] text-[#0A3D24] font-medium leading-relaxed">
                 Today, we are proud to be a trusted platform for thousands of families who believe that the best meals come from home.
               </p>
            </div>
            
            {/* Winding Path Graphic */}
            <div className="absolute right-4 bottom-4 lg:right-4 lg:bottom-0 top-1/4 w-1/2 flex items-end pointer-events-none opacity-80">
                <svg viewBox="0 0 200 300" className="w-full h-full" preserveAspectRatio="xMidYMax meet">
                   {/* Winding Path */}
                   <path d="M 180 300 Q 80 280 100 220 T 130 140 T 70 80" stroke="#F5E6D3" strokeWidth="24" strokeLinecap="round" fill="none" />
                   <path d="M 180 300 Q 80 280 100 220 T 130 140 T 70 80" stroke="#FAF7F2" strokeWidth="12" strokeLinecap="round" fill="none" strokeDasharray="10 10" />
                   
                   {/* Bottom Green Flag */}
                   <g transform="translate(140, 260)">
                     <line x1="0" y1="0" x2="0" y2="-30" stroke="#168846" strokeWidth="3" strokeLinecap="round"/>
                     <polygon points="0,-30 20,-22 0,-14" fill="#168846" />
                   </g>
                   
                   {/* Middle Green Flag */}
                   <g transform="translate(100, 180)">
                     <line x1="0" y1="0" x2="0" y2="-30" stroke="#168846" strokeWidth="3" strokeLinecap="round"/>
                     <polygon points="0,-30 20,-22 0,-14" fill="#168846" />
                   </g>
                   
                   {/* Top Orange Flag */}
                   <g transform="translate(120, 100)">
                     <line x1="0" y1="0" x2="0" y2="-40" stroke="#EE7005" strokeWidth="3" strokeLinecap="round"/>
                     <polygon points="0,-40 25,-30 0,-20" fill="#EE7005" />
                   </g>
                </svg>
            </div>
          </div>
        </div>
      </section>

         {/* 5. How RRC Kitchen Works */}
      <section className="bg-white py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto pl-4 pr-0 sm:px-6 lg:px-8 text-left lg:text-center">
          <h2 className="text-[20px] md:text-[28px] font-black text-[#0A3D24] mb-8 lg:mb-12 tracking-tight">How RRC Kitchen Works</h2>
          
          <div className="flex overflow-x-auto lg:overflow-visible items-center justify-start lg:justify-between gap-4 lg:gap-2 relative pb-6 lg:pb-0 snap-x snap-mandatory hide-scrollbar pr-4 lg:pr-0">

             {[
                { step: 1, icon: MapPin, title: "Choose\nLocation", desc: "Select your\ndelivery location" },
                { step: 2, icon: Search, title: "Browse\nKitchens", desc: "Explore home chefs\nand their menus" },
                { step: 3, icon: CalendarDays, title: "Pre-Book\nYour Meal", desc: "Select date, time\nand place your order" },
                { step: 4, icon: CookingPot, title: "Home Chef\nPrepares", desc: "Fresh, hygienic and\nhomemade with love" },
                { step: 5, icon: Bike, title: "Delivered\nto You", desc: "Get your order\non time at your door" },
             ].map((item, index) => (
                <div key={item.step} className="flex items-center gap-2 lg:flex-1 shrink-0 snap-start">
                  <div className="flex flex-col lg:flex-row items-center gap-3 w-[140px] lg:w-full justify-center lg:justify-start">
                     <div className="w-7 h-7 rounded-full bg-[#FFF5EC] text-[#EE7005] font-black text-[12px] flex items-center justify-center shrink-0 shadow-sm">{item.step}</div>
                     <div className="w-12 h-12 rounded-xl bg-white border border-[#168846]/20 shadow-sm flex items-center justify-center shrink-0 relative">
                        <item.icon className="w-5 h-5 text-[#168846]" />
                     </div>
                     <div className="text-center lg:text-left mt-2 lg:mt-0">
                        <h4 className="font-black text-[12px] text-[#0A3D24] leading-tight mb-1 whitespace-pre-line">{item.title}</h4>
                        <p className="text-[10px] text-gray-500 font-bold leading-snug whitespace-pre-line">{item.desc}</p>
                     </div>
                  </div>
                  {index < 4 && (
                    <div className="text-gray-300 font-light text-xl shrink-0 px-2 lg:px-4 hidden lg:block">→</div>
                  )}
                  {index < 4 && (
                    <div className="text-gray-300 font-light text-xl shrink-0 px-2 lg:hidden">→</div>
                  )}
                </div>
             ))}

          </div>
        </div>
      </section>

         {/* 6. Values & Home Chef CTA */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mb-10">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Our Values */}
          <div className="w-full lg:w-[60%] bg-white rounded-2xl shadow-sm border border-gray-100 p-8 lg:p-10 flex flex-col justify-center">
            <h2 className="text-[20px] lg:text-[24px] font-black text-[#0A3D24] mb-8 tracking-tight text-center lg:text-left">Our Values</h2>
            <div className="grid grid-cols-2 lg:flex gap-6 lg:gap-6 justify-between text-center">
              
              <div className="flex flex-col items-center flex-1 min-w-[120px]">
                 <div className="w-12 h-12 flex items-center justify-center mb-3">
                    <Heart className="w-8 h-8 text-[#EE7005] stroke-[2]" />
                 </div>
                 <h4 className="font-black text-[12px] text-[#0A3D24] mb-1">Love & Care</h4>
                 <p className="text-[10px] text-gray-500 font-bold leading-snug">Every meal is cooked<br/>with love and care</p>
              </div>

              <div className="flex flex-col items-center flex-1 min-w-[120px]">
                 <div className="w-12 h-12 flex items-center justify-center mb-3">
                    <Leaf className="w-8 h-8 text-[#168846] stroke-[2]" />
                 </div>
                 <h4 className="font-black text-[12px] text-[#0A3D24] mb-1">Hygiene First</h4>
                 <p className="text-[10px] text-gray-500 font-bold leading-snug">Clean, safe and<br/>hygienic at every step</p>
              </div>

              <div className="flex flex-col items-center flex-1 min-w-[120px]">
                 <div className="w-12 h-12 flex items-center justify-center mb-3">
                    <ShieldCheck className="w-8 h-8 text-[#168846] stroke-[2]" />
                 </div>
                 <h4 className="font-black text-[12px] text-[#0A3D24] mb-1">Trust & Transparency</h4>
                 <p className="text-[10px] text-gray-500 font-bold leading-snug">Verified chefs and<br/>transparent process</p>
              </div>

              <div className="flex flex-col items-center flex-1 min-w-[120px]">
                 <div className="w-12 h-12 flex items-center justify-center mb-3">
                    <Users className="w-8 h-8 text-[#EE7005] stroke-[2]" />
                 </div>
                 <h4 className="font-black text-[12px] text-[#0A3D24] mb-1">Community Support</h4>
                 <p className="text-[10px] text-gray-500 font-bold leading-snug">Empowering homemakers<br/>and local communities</p>
              </div>
            </div>
          </div>

          {/* Are You a Home Chef? CTA */}
          <div className="w-full lg:w-[40%] bg-[#FAF7F2] rounded-2xl shadow-sm border border-[#F2EAE1] overflow-hidden relative flex flex-col min-h-[300px]">
            <div className="p-8 lg:p-10 relative z-10 w-full lg:w-[65%]">
               <h2 className="text-[20px] lg:text-[24px] font-black text-[#0A3D24] mb-4 tracking-tight leading-tight">Are You a Home Chef?</h2>
               <p className="text-[12px] text-[#0A3D24] font-medium leading-relaxed mb-6">
                 Turn your passion for cooking into income. Join RRC Kitchen and reach thousands of happy customers.
               </p>
               <button className="bg-[#168846] hover:bg-[#116b36] text-white px-5 py-2.5 rounded-lg font-black text-[11px] tracking-wide transition-colors">
                 BECOME A HOME CHEF
               </button>
            </div>
            {/* Image container on the right */}
            <div className="absolute right-0 bottom-0 top-0 w-[45%] hidden md:block">
               <Image 
                  src="/hero/home-cta-chef.webp" 
                  alt="Home Chef" 
                  fill
                  className="object-cover object-left opacity-95"
               />
               <div className="absolute inset-0 bg-gradient-to-r from-[#FAF7F2] via-[#FAF7F2]/40 to-transparent"></div>
               {/* Floating Badge */}
               <div className="absolute top-1/4 right-4 w-20 h-20 bg-white rounded-full border border-gray-100 shadow-lg flex flex-col items-center justify-center text-center p-1">
                  <div className="w-full h-full rounded-full border border-dashed border-gray-300 flex flex-col items-center justify-center">
                    <span className="text-[8px] font-black text-[#0A3D24] leading-[1.1] mt-0.5">Every<br/>Homemaker<br/>is a Chef</span>
                    <Heart className="w-3 h-3 text-[#168846] fill-none mt-0.5" />
                  </div>
               </div>
            </div>
            {/* Mobile Image */}
            <div className="md:hidden relative h-48 w-full mt-auto">
               <Image 
                  src="/hero/home-cta-chef.webp" 
                  alt="Home Chef" 
                  fill
                  className="object-cover object-top"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-transparent to-[#FAF7F2]"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. App Download Banner */}
      <AppDownloadBanner />

    </div>
  );
}
