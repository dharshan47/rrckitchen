"use client";

import { ChevronRight, ChefHat, Users, Package, ShieldCheck, CheckCircle2, Heart, Leaf, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { AppDownloadBanner } from "@/components/home/app-download-banner";
import CustomLeaf from "@/components/icons/leaf";
import React from "react";
import { cn } from "@/lib/utils";

export interface AboutUsStats {
  chefsCount: number;
  customersCount: number;
  ordersCount: number;
}

export function AboutUsClient({ stats }: { stats?: AboutUsStats }) {
   // Format numbers nicely
   const formatNumber = (num?: number) => {
     if (num === undefined) return "0";
     return new Intl.NumberFormat('en-IN').format(num);
   };

   return (
      <div className="bg-[#FEFEFE] min-h-screen text-[#333333] font-sans overflow-x-hidden">

         {/* 1. Hero Section */}
      <section className="relative bg-[#FEFEFE] pt-6 pb-0 lg:pt-10 lg:pb-12 overflow-hidden flex flex-col lg:block">
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
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 mt-8 lg:mt-8">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          
          {/* Stats */}
          <div className="flex-[2.5] bg-[#FFF7F1] rounded-[16px] border border-[#FFE5D7] p-6 lg:p-8 grid grid-cols-2 lg:flex items-center justify-between gap-y-8 gap-x-4 lg:gap-y-0 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
            <div className="flex items-center gap-4">
              <ChefHat className="w-10 h-10 text-[#F04E00] shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-bold text-[#111111] leading-none mb-1">{formatNumber(stats?.chefsCount)}+</h3>
                <p className="text-[13px] text-[#4B5563] font-medium">Home Chefs</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Users className="w-10 h-10 text-[#087A35] shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-bold text-[#111111] leading-none mb-1">{formatNumber(stats?.customersCount)}+</h3>
                <p className="text-[13px] text-[#4B5563] font-medium">Happy Customers</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Package className="w-10 h-10 text-[#F04E00] shrink-0" strokeWidth={1.5} />
              <div>
                <h3 className="text-[20px] lg:text-[24px] font-bold text-[#111111] leading-none mb-1">{formatNumber(stats?.ordersCount)}+</h3>
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
          <div className="flex-1 bg-[#F3F9F4] rounded-[16px] border border-[#DDEDE0] p-6 lg:px-8 lg:py-6 flex items-center justify-between gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]">
             <div className="flex-1">
                <h2 className="text-[20px] font-bold text-[#003015] tracking-tight mb-2">Our Mission</h2>
                <p className="text-[13px] text-[#4B5563] font-medium leading-relaxed">
                   To empower home chefs, promote healthy eating, and bring communities closer through the <span className="font-bold text-[#111111]">goodness</span> of homemade food.
                </p>
             </div>
             <div className="w-14 h-14 bg-[#FFFFFF] rounded-full flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#EEEEEE] relative overflow-hidden">
               <Image 
                 src="/about/arrow.webp"
                 alt="Mission Target"
                 fill
                 className="object-contain p-2"
               />
             </div>
          </div>

        </div>
      </section>

      {/* 4. Why RRC Kitchen & Our Journey */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8 lg:mt-8 lg:mb-4">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          
          {/* Why RRC Kitchen */}
          <div className="w-full lg:w-1/2 bg-[#FFFFFF] rounded-[16px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#E7E7E7] p-8 lg:p-10 relative overflow-hidden flex flex-col lg:flex-row lg:items-end lg:justify-between">
            <div className="flex-1 relative z-10 lg:pr-6">
              <h2 className="text-[20px] lg:text-[24px] font-bold text-[#003015] mb-3 tracking-tight">Why RRC Kitchen?</h2>
              <p className="text-[13px] text-[#4B5563] font-medium leading-relaxed mb-6">
                We are more than just a food delivery platform. We are a movement to recognize and empower the incredible women who cook with love every day.
              </p>
              <div className="space-y-3 mb-8 lg:mb-0">
                <div className="flex gap-2.5 items-start">
                  <CheckCircle2 className="w-4 h-4 text-[#087A35] shrink-0 mt-0.5" strokeWidth={2} />
                  <span className="text-[13px] text-[#111111] font-bold leading-snug">100% homemade food by verified home kitchens</span>
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
            </div>
            
            {/* Graphic positioning */}
            <div className="mt-auto pt-6 lg:pt-0 flex items-end justify-center lg:justify-end z-0 shrink-0">
              <div className="relative w-[180px] h-[180px] lg:w-[150px] lg:h-[150px] xl:w-[200px] xl:h-[200px]">
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
          <div className="w-full lg:w-1/2 bg-[#FFF9F4] rounded-[16px] border border-[#FFE8DA] p-8 lg:p-10 relative overflow-hidden flex flex-col lg:flex-row lg:items-center lg:justify-between shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex-1 relative z-10 lg:pr-6">
               <h2 className="text-[20px] lg:text-[24px] font-bold text-[#003015] mb-4 tracking-tight">Our Journey</h2>
               <p className="text-[13px] lg:text-[14px] text-[#4B5563] font-medium leading-[1.7] mb-4">
                 RRC Kitchen started with a simple idea &ndash; to help home chefs turn their passion into a source of income while serving healthy and delicious meals to people.
               </p>
               <p className="text-[13px] lg:text-[14px] text-[#4B5563] font-medium leading-[1.7]">
                 Today, we are proud to be a trusted platform for thousands of families who believe that the best meals come from home.
               </p>
            </div>
            
            <div className="relative w-full lg:w-[150px] xl:w-[200px] h-[180px] lg:h-[200px] mt-8 lg:mt-0 flex items-center justify-center pointer-events-none shrink-0">
                <Image 
                  src="/about/path.webp"
                  alt="Our Journey Path"
                  fill
                  className="object-contain object-center"
                />
            </div>
          </div>
        </div>
      </section>

      {/* 5. How RRC Kitchen Works */}
      <section className="flex flex-col items-center pt-8 pb-4 lg:pt-10 lg:pb-6 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBFCF5] border border-[#F0F2E3] mb-8">
          <CustomLeaf className="w-3.5 h-3.5 text-[#0A6831]" />
          <span className="text-[11px] font-bold text-[#3D8135] tracking-wider uppercase">How It Works</span>
          <CustomLeaf className="w-3.5 h-3.5 text-[#0A6831]" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-bold text-[#0A151F] mb-4 text-center">
          From Order to <span className="text-[#0A6831]">Next-Day Tiffin Pickup</span>
        </h2>
        
        <p className="text-[#455064] text-[14px] md:text-[15px] text-center max-w-2xl mb-12 px-4">
          Simple steps to enjoy homemade meals in a reusable tiffin – delivered to you, picked up by us. <span className="text-[#F8680A]">♡</span>
        </p>

        <div className="bg-[#FFFFFF] border border-[#EEF1EC] rounded-[24px] lg:rounded-[32px] shadow-[0_8px_30px_rgba(10,21,31,0.06)] w-full">
          <div className="w-full px-6 lg:px-10 xl:px-14 py-6 lg:py-10 flex justify-center">
            <div className="flex flex-col lg:flex-row justify-between items-center lg:items-start gap-10 lg:gap-2 w-full max-w-7xl">
            {[
              {
                num: 1,
                title: "Choose Location",
                desc: "Select your delivery location.",
                img: "/home/location.webp",
                color: "green",
              },
              {
                num: 2,
                title: "Select Kitchen",
                desc: "Choose a trusted home kitchen.",
                img: "/home/house.webp",
                color: "orange",
              },
              {
                num: 3,
                title: "Pick Your Menu",
                desc: "Choose the meal you want.",
                img: "/home/menu-pointing.webp",
                color: "green",
              },
              {
                num: 4,
                title: "Receive Tiffin",
                desc: "Your meal arrives in our reusable tiffin carrier.",
                img: "/home/carrier.webp",
                color: "orange",
              },
              {
                num: 5,
                title: "Enjoy Your Meal",
                desc: "Enjoy fresh, homemade food at home.",
                img: "/home/bowl.webp",
                color: "green",
                imageClassName: "scale-[1.15] translate-y-1",
              },
              {
                num: 6,
                title: "Keep Tiffin Ready",
                desc: "Keep the empty carrier ready after your meal.",
                img: "/home/open-carrier.webp",
                color: "orange",
              },
              {
                num: 7,
                title: "We Pick It Up",
                desc: "We collect the tiffin carrier the next day.",
                img: "/home/delivery-person.webp",
                color: "green",
              },
            ].map((step, idx, arr) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center text-center flex-1 min-w-[100px] max-w-[130px]">
                  <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center text-white text-[14px] font-bold mb-4 ${step.color === 'green' ? 'bg-[#0A6831]' : 'bg-[#F8680A]'}`}>
                    {step.num}
                  </div>
                  
                  <div className="mb-5 flex items-center justify-center">
                    <Image src={step.img} alt={step.title} width={100} height={100} className={cn("object-contain", step.imageClassName)} />
                  </div>
                  
                  <h4 className={`text-[15px] font-bold mb-3 leading-tight ${step.color === 'green' ? 'text-[#0A6831]' : 'text-[#BE5A10]'}`}>
                    {step.title.split(' ').map((word, i, words) => (
                      <React.Fragment key={i}>
                        {word}
                        {i < words.length - 1 && (
                            words.length === 2 || (words.length === 3 && i === 1) ? <br className="hidden lg:block"/> : ' '
                        )}
                      </React.Fragment>
                    ))}
                  </h4>
                  
                  <div className={`w-[46px] h-1 rounded-full mb-3 ${step.color === 'green' ? 'bg-[#0A6831]' : 'bg-[#F8680A]'}`} />
                  
                  <p className="text-[12px] text-[#455064] leading-relaxed px-1">
                    {step.desc}
                  </p>
                </div>

                {/* Desktop Arrow */}
                {idx < arr.length - 1 && (
                  <div className="hidden lg:flex items-center justify-center h-[100px] mt-[44px] text-[#0A6831] opacity-90 shrink-0 mx-1 xl:mx-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M2 12h18" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
                      <path d="M14 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                
                {/* Mobile Arrow down */}
                {idx < arr.length - 1 && (
                  <div className="flex lg:hidden items-center justify-center h-10 text-[#0A6831] opacity-90">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="rotate-90">
                      <path d="M2 12h18" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
                      <path d="M14 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
            </div>
          </div>
          
          {/* Reusable Tiffin Section */}
          <div className="mt-12 bg-[#F8FAF5] border border-[#E8EEE7] rounded-b-[20px] p-6 md:p-8 flex flex-col xl:flex-row items-center justify-between gap-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-5 max-w-2xl">
              <div className="relative shrink-0 flex items-center justify-center mt-1">
                 <Image src="/home/carrier.webp" alt="Reusable Tiffin" width={64} height={64} className="object-contain drop-shadow-sm" />
              </div>
              <div className="pt-1">
                <h4 className="text-[16px] md:text-[18px] font-bold text-[#0A6831] mb-2 leading-tight">Reusable Tiffin. Hassle-Free for You.</h4>
                <p className="text-[13px] md:text-[14px] text-[#455064] leading-relaxed font-medium">
                  We deliver your meals in reusable tiffin carriers and pick them up the next day, making it easy, convenient, and mindful.
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full xl:w-auto mt-4 xl:mt-0">
              {/* Feature 1 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F6EF] border border-[#E8F0E0] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-[18px] h-[18px] text-[#0A6831]" strokeWidth={2} />
                </div>
                <span className="text-[12px] font-bold text-[#455064] leading-[1.2]">Safe &<br/>Hygienic</span>
              </div>
              
              {/* Feature 2 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FEF4E8] border border-[#F8E2CC] flex items-center justify-center shrink-0">
                  <Clock className="w-[18px] h-[18px] text-[#F8680A]" strokeWidth={2} />
                </div>
                <span className="text-[12px] font-bold text-[#455064] leading-[1.2]">Next-Day<br/>Pickup</span>
              </div>
              
              {/* Feature 3 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F3F6EF] border border-[#E8F0E0] flex items-center justify-center shrink-0">
                  <CustomLeaf className="w-[18px] h-[18px] text-[#0A6831]" />
                </div>
                <span className="text-[12px] font-bold text-[#455064] leading-[1.2]">Convenient<br/>for You</span>
              </div>

              {/* Feature 4 */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FEF4E8] border border-[#F8E2CC] flex items-center justify-center shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px] text-[#F8680A]"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                </div>
                <span className="text-[12px] font-bold text-[#455064] leading-[1.2]">Zero Extra<br/>Effort</span>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* 6. Values & Home Chef CTA */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-8 lg:pt-4 lg:pb-12 mb-6 lg:mb-0">
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
                  src="/about/about-chef-cta.webp"
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
                  src="/about/about-chef-cta.webp"
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
      <div className="lg:-mt-10 xl:-mt-16 mb-4">
        <AppDownloadBanner />
      </div>

    </div>
  );

}
