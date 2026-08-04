"use client";

import Image from "next/image";

export function AppDownloadBanner() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12 lg:py-16 mt-6 lg:mt-10">
      <div className="bg-[#043319] w-full rounded-xl shadow-xl relative flex flex-col lg:flex-row items-center lg:items-stretch lg:justify-between px-6 py-8 lg:py-0 lg:pl-0 lg:pr-10 xl:pr-12 gap-6 lg:gap-0">
        
        {/* Phone mockup */}
        <div className="relative h-[240px] sm:h-[300px] lg:h-auto lg:absolute lg:left-6 xl:left-10 lg:-top-10 lg:-bottom-10 lg:w-[200px] xl:w-[230px] w-[180px] sm:w-[220px] shrink-0 -mt-20 lg:mt-0 z-10 mx-auto lg:mx-0">
          <Image
            src="/home/mobile-template.webp"
            alt="RRC Kitchen App on Mobile"
            fill
            className="object-contain object-bottom lg:object-center drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)]"
            sizes="(max-width: 1024px) 220px, 230px"
            priority
          />
        </div>

        {/* Spacer for phone on desktop */}
        <div className="hidden lg:block lg:w-[240px] xl:w-[280px] shrink-0"></div>

        {/* Text & Buttons */}
        <div className="text-center lg:text-left flex flex-col justify-center gap-1.5 z-10 flex-1 py-2 lg:py-10">
          <h2 className="text-[18px] sm:text-[20px] lg:text-[22px] font-bold text-white tracking-wide leading-snug">
            Delicious Home Cooked Meals
            <br />
            Delivered in Ever Silver Box Carrier
          </h2>
          <p className="text-white/90 text-[13px] sm:text-[14px] mt-1 mb-4 font-medium">
            Download the RRC Kitchen App Today!
          </p>
          
          {/* App store buttons */}
          <div className="flex flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4">
            <button className="bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-2.5 hover:bg-gray-900 transition-colors border border-gray-700/60 shrink-0 shadow-lg">
              <svg viewBox="0 0 512 512" className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor">
                <path fill="#4285F4" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z" />
                <path fill="#EA4335" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                <path fill="#FBBC04" d="M384.2 174.2l-58.9 60.1 58.9 60.1 65.7-34.1c19.2-14.3 19.2-46.5-5.7-86.1z" />
                <path fill="#34A853" d="M47 0l256.6 256L104.6 499C91.6 505.8 82.9 493.4 82.9 477.3V35.3C82.9 19.2 91.6 6.8 104.6 13z" />
              </svg>
              <div className="flex flex-col items-start">
                <span className="text-[8px] sm:text-[9px] leading-[1.1] text-gray-300 tracking-wide uppercase">GET IT ON</span>
                <span className="text-[12px] sm:text-[14px] font-bold leading-[1.1] mt-0.5">Google Play</span>
              </div>
            </button>
            <button className="bg-black text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg flex items-center gap-2.5 hover:bg-gray-900 transition-colors border border-gray-700/60 shrink-0 shadow-lg">
              <svg viewBox="0 0 384 512" className="h-5 w-5 sm:h-6 sm:w-6" fill="currentColor">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
              </svg>
              <div className="flex flex-col items-start">
                <span className="text-[8px] sm:text-[9px] leading-[1.1] text-gray-300">Download on the</span>
                <span className="text-[12px] sm:text-[14px] font-bold leading-[1.1] mt-0.5">App Store</span>
              </div>
            </button>
          </div>
        </div>

        {/* Feature icons */}
        <div className="grid grid-cols-2 lg:flex lg:flex-row items-start lg:items-center justify-center lg:justify-end gap-x-6 gap-y-6 sm:gap-x-10 lg:gap-8 z-10 py-4 lg:py-10">
          {[
            { 
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 sm:h-7 sm:w-7 text-[#EEDB80]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m0-20H8.5a2.5 2.5 0 00-2.5 2.5v3.5h12V4.5A2.5 2.5 0 0015.5 2H12zM6 8h12v4H6V8zm0 4h12v4H6v-4zm0 4h12v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" />
                </svg>
              ), 
              label: "Easy\nOrdering" 
            },
            { 
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 sm:h-7 sm:w-7 text-[#EEDB80]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 2c-3.3 0-6 2.7-6 6 0 2.2 1 4.2 2.6 5.5l.4.3v4.2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4.2l.4-.3c1.6-1.3 2.6-3.3 2.6-5.5 0-3.3-2.7-6-6-6zm0 10.5c-1.3-1.1-2.2-2.7-2.2-4.5 0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.8-.9 3.4-2.2 4.5l-.8.7v2.8h-2v-2.8l-.8-.7z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12h5" />
                </svg>
              ), 
              label: "Live\nTracking" 
            },
            { 
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 sm:h-7 sm:w-7 text-[#EEDB80]">
                  <rect x="3" y="6" width="18" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 14h.01" />
                  <rect x="14" y="14" width="3" height="2" rx="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ), 
              label: "Multiple Payment\nOptions" 
            },
            { 
              icon: (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6 sm:h-7 sm:w-7 text-[#EEDB80]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ), 
              label: "Exclusive\nOffers" 
            },
          ].map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2 sm:gap-3 w-[120px] sm:w-[110px]">
              <div className="h-14 w-14 sm:h-14 sm:w-14 rounded-full bg-black/20 shadow-[0_0_15px_rgba(238,219,128,0.05)] flex items-center justify-center relative border border-white/5 ring-4 ring-[#EEDB80]/10">
                {item.icon}
              </div>
              <span className="text-[11px] sm:text-[11.5px] font-medium text-white/95 text-center whitespace-pre-line leading-[1.3]">
                {item.label}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
