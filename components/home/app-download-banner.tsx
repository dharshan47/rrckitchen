"use client";

import Image from "next/image";

export function AppDownloadBanner() {
  const features = [
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 xl:h-5 xl:w-5 text-[#D9B84C]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2v20m0-20H8.5a2.5 2.5 0 00-2.5 2.5v3.5h12V4.5A2.5 2.5 0 0015.5 2H12zM6 8h12v4H6V8zm0 4h12v4H6v-4zm0 4h12v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4z"
          />
        </svg>
      ),
      label: "Easy Ordering",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 xl:h-5 xl:w-5 text-[#D9B84C]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 2c-3.3 0-6 2.7-6 6 0 2.2 1 4.2 2.6 5.5l.4.3v4.2c0 1.1.9 2 2 2h2c1.1 0 2-.9 2-2v-4.2l.4-.3c1.6-1.3 2.6-3.3 2.6-5.5 0-3.3-2.7-6-6-6zm0 10.5c-1.3-1.1-2.2-2.7-2.2-4.5 0-2.2 1.8-4 4-4s4 1.8 4 4c0 1.8-.9 3.4-2.2 4.5l-.8.7v2.8h-2v-2.8l-.8-.7z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.5 12h5" />
        </svg>
      ),
      label: "Live Tracking",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 xl:h-5 xl:w-5 text-[#D9B84C]"
        >
          <rect
            x="3"
            y="6"
            width="18"
            height="12"
            rx="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 10h18M7 14h.01"
          />
          <rect
            x="14"
            y="14"
            width="3"
            height="2"
            rx="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      label: "Multiple Payment Options",
    },
    {
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          className="h-4 w-4 sm:h-5 sm:w-5 lg:h-5 lg:w-5 xl:h-5 xl:w-5 text-[#D9B84C]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <circle
            cx="12"
            cy="12"
            r="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      label: "Exclusive Offers",
    },
  ];

  return (
    <section className="w-full px-3 sm:px-6 lg:px-8 mt-10 sm:mt-12 lg:mt-12 xl:mt-16 mb-1">
      <div className="w-full mx-auto max-w-[1300px]">
        <div className="bg-gradient-to-br from-[#003015] via-[#003819] to-[#00220e] border border-emerald-900/40 w-full rounded-2xl sm:rounded-[24px] shadow-xl sm:shadow-2xl relative px-4 sm:px-8 lg:px-8 xl:px-10 py-5 sm:py-7 lg:py-4 xl:py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-6 overflow-hidden">
          
          {/* Left Side: Phone Mockup + Text Content + Download Buttons */}
          <div className="flex flex-row items-center gap-3 sm:gap-6 lg:gap-8 flex-1 min-w-0">
            {/* Phone mockup inside banner */}
            <div className="relative h-[150px] w-[80px] sm:h-[200px] sm:w-[110px] md:h-[240px] md:w-[135px] lg:h-[160px] lg:w-[90px] xl:h-[180px] xl:w-[100px] shrink-0 z-10">
              <Image
                src="/home/mobile-template.webp"
                alt="RRC Kitchen App on Mobile"
                fill
                className="object-contain object-center drop-shadow-[0_8px_16px_rgba(0,0,0,0.5)] sm:drop-shadow-[0_16px_28px_rgba(0,0,0,0.55)]"
                sizes="(max-width: 640px) 90px, (max-width: 768px) 135px, (max-width: 1024px) 155px, (max-width: 1280px) 185px, 220px"
              />
            </div>

            {/* Text & Buttons */}
            <div className="flex flex-col justify-center items-start text-left z-10 flex-1 min-w-0">
              <h2 className="text-sm sm:text-xl md:text-2xl lg:text-[18px] xl:text-[20px] font-bold text-white tracking-wide leading-snug lg:leading-[1.25]">
                Delicious Home-Cooked Meals
                <br className="hidden sm:block" />
                {" "}Delivered in an Ever Silver Tiffin Carrier
              </h2>
              <div className="mt-1 sm:mt-2 lg:mt-1.5 xl:mt-2 mb-4 sm:mb-5 lg:mb-3 flex flex-col items-start gap-0.5 xl:gap-1">
                <span className="text-emerald-100/90 text-xs sm:text-sm lg:text-[13px] xl:text-[14px] font-medium">
                  The RRC Kitchen App is
                </span>
                <div className="flex items-center gap-1.5 xl:gap-2">
                  <span className="text-[#D9B84C] text-xl sm:text-2xl lg:text-2xl xl:text-[28px] font-black tracking-wide">
                    Coming Soon!
                  </span>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="h-5 w-5 sm:h-6 sm:w-6 lg:h-5 lg:w-5 xl:h-6 xl:w-6 text-[#D9B84C] animate-pulse">
                    <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" fill="currentColor" />
                  </svg>
                </div>
              </div>

              {/* Stay Tuned Card */}
              <div className="flex flex-row items-center gap-3 sm:gap-4 p-2.5 sm:p-3 lg:p-2 xl:p-2.5 rounded-xl border border-[#D9B84C]/40 bg-[#00220e]/60 shadow-inner max-w-[280px] sm:max-w-sm lg:max-w-[240px] xl:max-w-[260px] w-full">
                <div className="h-8 w-8 sm:h-10 sm:w-10 lg:h-8 lg:w-8 xl:h-9 xl:w-9 rounded-full bg-[#D9B84C]/10 flex items-center justify-center shrink-0 border border-[#D9B84C]/20">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 xl:h-4 xl:w-4 text-[#D9B84C]">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-white text-xs sm:text-sm lg:text-[13px] xl:text-sm font-bold tracking-wide">Stay Tuned!</span>
                  <span className="text-emerald-100/90 text-[10px] sm:text-xs lg:text-[9px] xl:text-[10px] leading-snug mt-0.5">We&apos;re cooking something amazing for you.</span>
                </div>
              </div>
              
              {/* App store buttons - HIDDEN FOR NOW
              <p className="text-emerald-100/90 text-xs sm:text-sm lg:text-[15px] xl:text-[17px] mt-1 mb-2.5 sm:mt-2 sm:mb-4 lg:mt-2.5 lg:mb-5 font-medium">
                Download the RRC Kitchen App Today!
              </p>
              <div className="flex flex-row items-center gap-1.5 sm:gap-3 flex-wrap sm:flex-nowrap">
                <button
                  type="button"
                  className="bg-black/90 hover:bg-black text-white px-2 py-1.5 sm:px-3.5 sm:py-2 lg:px-4 lg:py-2.5 rounded-lg flex items-center gap-1.5 sm:gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/20 shrink-0 shadow-md sm:shadow-lg cursor-pointer"
                >
                  <svg
                    viewBox="0 0 512 512"
                    className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0"
                    fill="currentColor"
                  >
                    <path fill="#4285F4" d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8z" />
                    <path fill="#EA4335" d="M104.6 499l280.8-161.2-60.1-60.1L104.6 499z" />
                    <path fill="#FBBC04" d="M384.2 174.2l-58.9 60.1 58.9 60.1 65.7-34.1c19.2-14.3 19.2-46.5-5.7-86.1z" />
                    <path fill="#34A853" d="M47 0l256.6 256L104.6 499C91.6 505.8 82.9 493.4 82.9 477.3V35.3C82.9 19.2 91.6 6.8 104.6 13z" />
                  </svg>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[6px] sm:text-[8px] lg:text-[9px] leading-tight text-gray-300 tracking-wider uppercase">
                      GET IT ON
                    </span>
                    <span className="text-[9px] sm:text-[12px] lg:text-[14px] font-bold leading-tight mt-0.5">
                      Google Play
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  className="bg-black/90 hover:bg-black text-white px-2 py-1.5 sm:px-3.5 sm:py-2 lg:px-4 lg:py-2.5 rounded-lg flex items-center gap-1.5 sm:gap-2.5 hover:scale-[1.02] active:scale-[0.98] transition-all border border-white/20 shrink-0 shadow-md sm:shadow-lg cursor-pointer"
                >
                  <svg
                    viewBox="0 0 384 512"
                    className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0"
                    fill="currentColor"
                  >
                    <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
                  </svg>
                  <div className="flex flex-col items-start text-left">
                    <span className="text-[6px] sm:text-[8px] lg:text-[9px] leading-tight text-gray-300">
                      Download on the
                    </span>
                    <span className="text-[9px] sm:text-[12px] lg:text-[14px] font-bold leading-tight mt-0.5">
                      App Store
                    </span>
                  </div>
                </button>
              </div>
              */}
            </div>
          </div>

          {/* Right Side: Feature icons with perfect horizontal alignment (items-start) */}
          <div className="flex flex-row flex-nowrap items-start justify-between sm:justify-around lg:justify-end gap-2 sm:gap-4 lg:gap-2 xl:gap-4 z-10 w-full lg:w-auto shrink-0 pt-4 lg:pt-0 border-t border-white/10 lg:border-t-0">
            {features.map((item, index) => (
              <div
                key={index}
                className="flex flex-col items-center w-[72px] sm:w-[86px] lg:w-[72px] xl:w-[86px]"
              >
                {/* Circle Icon Container - Exact same size for all items */}
                <div className="h-9 w-9 sm:h-11 sm:w-11 lg:h-10 lg:w-10 xl:h-11 xl:w-11 rounded-full bg-white/10 hover:bg-white/15 border border-white/10 flex items-center justify-center relative shadow-[0_2px_8px_rgba(0,0,0,0.2)] shrink-0 transition-transform duration-200 hover:scale-105">
                  {item.icon}
                </div>

                {/* Text Label - Aligned below circle with consistent top alignment */}
                <span className="text-[10px] sm:text-[11px] lg:text-[10px] xl:text-[11px] font-medium text-white/95 text-center leading-tight sm:leading-snug mt-2 min-h-[2.2rem] sm:min-h-[2.5rem] flex items-start justify-center">
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



