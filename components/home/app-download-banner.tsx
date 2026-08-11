"use client";

import Image from "next/image";

export function AppDownloadBanner() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12 mt-6 lg:mt-10">
      <div className="w-full pt-16 lg:pt-24">
        <div className="bg-[#003015] w-full max-w-[1200px] mx-auto rounded-xl shadow-2xl relative flex flex-col lg:flex-row items-center lg:items-end lg:justify-between px-6 lg:pl-6 lg:pr-10 pb-8 lg:pb-0 gap-8 lg:gap-0 lg:h-[150px]">
          
          {/* Top section for mobile (Phone + Text), Left section for Desktop */}
          <div className="flex flex-col sm:flex-row items-center sm:items-end w-full lg:w-auto gap-6 sm:gap-4 lg:gap-0">
            {/* Phone mockup */}
            <div className="relative h-[200px] w-[160px] lg:h-[220px] lg:w-[180px] shrink-0 z-10 -mt-24 lg:-mt-0 lg:self-end lg:ml-2">
              <Image
                src="/home/mobile-template.webp"
                alt="RRC Kitchen App on Mobile"
                fill
                className="object-contain object-bottom drop-shadow-[0_15px_25px_rgba(0,0,0,0.4)]"
                sizes="(max-width: 1024px) 160px, 180px"
                priority
              />
            </div>

            {/* Text & Buttons */}
            <div className="flex flex-col justify-center items-center sm:items-start text-center sm:text-left gap-1 z-10 shrink-0 lg:ml-4 lg:mb-5">
              <h2 className="text-[18px] sm:text-[20px] lg:text-[22px] font-bold text-white tracking-wide leading-snug">
                Delicious Home Cooked Meals
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Delivered in Ever Silver Box Carrier
              </h2>
              <p className="text-white/90 text-[13px] sm:text-[14px] mt-1 mb-3 font-medium">
                Download the RRC Kitchen App Today!
              </p>
              
              {/* App store buttons */}
              <div className="flex flex-row items-center gap-3">
                <button className="bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-gray-900 transition-colors border border-white/20 shrink-0 shadow-lg">
                  <svg viewBox="0 0 512 512" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor">
                    <path fill="#4285F4" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z" />
                    <path fill="#EA4335" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                    <path fill="#FBBC04" d="M384.2 174.2l-58.9 60.1 58.9 60.1 65.7-34.1c19.2-14.3 19.2-46.5-5.7-86.1z" />
                    <path fill="#34A853" d="M47 0l256.6 256L104.6 499C91.6 505.8 82.9 493.4 82.9 477.3V35.3C82.9 19.2 91.6 6.8 104.6 13z" />
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-[7px] sm:text-[8px] leading-[1.1] text-gray-300 tracking-wide uppercase">GET IT ON</span>
                    <span className="text-[11px] sm:text-[13px] font-bold leading-[1.1] mt-0.5">Google Play</span>
                  </div>
                </button>
                <button className="bg-black text-white px-3 py-1.5 rounded-lg flex items-center gap-2.5 hover:bg-gray-900 transition-colors border border-white/20 shrink-0 shadow-lg">
                  <svg viewBox="0 0 384 512" className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor">
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                  <div className="flex flex-col items-start">
                    <span className="text-[7px] sm:text-[8px] leading-[1.1] text-gray-300">Download on the</span>
                    <span className="text-[11px] sm:text-[13px] font-bold leading-[1.1] mt-0.5">App Store</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          <div className="hidden lg:block flex-1"></div>

          {/* Feature icons */}
          <div className="flex flex-row flex-wrap justify-center lg:justify-end items-center gap-6 sm:gap-8 lg:gap-10 z-10 w-full lg:w-auto lg:mb-5">
            {[
              { 
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 sm:h-6 sm:w-6 text-[#D9B84C]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v20m0-20H8.5a2.5 2.5 0 00-2.5 2.5v3.5h12V4.5A2.5 2.5 0 0015.5 2H12zM6 8h12v4H6V8zm0 4h12v4H6v-4zm0 4h12v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z" />
                  </svg>
                ), 
                label: "Easy Ordering" 
              },
              { 
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 sm:h-6 sm:w-6 text-[#D9B84C]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 2c-3.3 0-6 2.7-6 6 0 2.2 1 4.2 2.6 5.5l.4.3v4.2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4.2l.4-.3c1.6-1.3 2.6-3.3 2.6-5.5 0-3.3-2.7-6-6-6zm0 10.5c-1.3-1.1-2.2-2.7-2.2-4.5 0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.8-.9 3.4-2.2 4.5l-.8.7v2.8h-2v-2.8l-.8-.7z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12h5" />
                  </svg>
                ), 
                label: "Live Tracking" 
              },
              { 
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 sm:h-6 sm:w-6 text-[#D9B84C]">
                    <rect x="3" y="6" width="18" height="12" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 14h.01" />
                    <rect x="14" y="14" width="3" height="2" rx="0.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ), 
                label: "Multiple Payment\nOptions" 
              },
              { 
                icon: (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5 sm:h-6 sm:w-6 text-[#D9B84C]">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ), 
                label: "Exclusive Offers" 
              },
            ].map((item, index) => (
              <div key={index} className="flex flex-col items-center gap-2 sm:gap-3 w-[70px] sm:w-[90px] lg:w-[100px]">
                <div className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-full bg-[rgba(255,255,255,0.08)] flex items-center justify-center relative shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
                  {item.icon}
                </div>
                <span className="text-[10px] sm:text-[11px] lg:text-[12px] font-medium text-white/95 text-center whitespace-pre-line leading-[1.3]">
                  {item.label}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}


