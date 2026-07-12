"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 md:py-20">
      <div className="flex w-full max-w-4xl flex-col items-center text-center">
        
        {/* 404 Design - Pure SVG kitchen tools style */}
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          
          {/* First 4: Created using a spoon */}
          <div className="relative h-40 w-28 md:h-64 md:w-48">
            <svg viewBox="0 0 100 140" className="h-full w-full overflow-visible">
              {/* Triangular part of 4 */}
              <path 
                d="M15 85 L15 50 L65 85 H15" 
                stroke="#1B2F45" 
                strokeWidth="12" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="none"
              />
              {/* Spoon forming the vertical stem */}
              <g transform="translate(45, -15)">
                {/* Spoon Head */}
                <ellipse cx="25" cy="30" rx="18" ry="24" fill="#1B2F45" />
                {/* Spoon Handle */}
                <rect x="21" y="50" width="8" height="105" rx="4" fill="#1B2F45" />
                {/* Handle Hole */}
                <circle cx="25" cy="145" r="2" fill="white" />
              </g>
            </svg>
          </div>

          {/* 0: Women Chef recreated as SVG */}
          <div className="relative flex h-48 w-48 items-center justify-center md:h-72 md:w-72">
             <div className="relative h-full w-full p-2">
                {/* Orange House Outline */}
                <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full">
                  <path 
                    d="M35 95 L100 35 L165 95 L165 170 L35 170 Z" 
                    stroke="#EE7005" 
                    strokeWidth="10" 
                    fill="none" 
                    strokeLinejoin="round"
                  />
                  {/* House Window squares */}
                  <rect x="135" y="115" width="10" height="10" fill="#EE7005" />
                  <rect x="135" y="130" width="10" height="10" fill="#EE7005" />
                  <rect x="120" y="115" width="10" height="10" fill="#EE7005" />
                  <rect x="120" y="130" width="10" height="10" fill="#EE7005" />

                  {/* Woman Chef Graphic (SVG manual recreation) */}
                  <g transform="translate(45, 60) scale(0.55)">
                    {/* Hair/Head Silhouette */}
                    <path 
                      d="M60 70 Q45 70 45 90 Q45 105 55 110 Q45 120 45 130" 
                      fill="#1B2F45" 
                    />
                    <circle cx="65" cy="90" r="28" fill="#1B2F45" />
                    
                    {/* Face Profile (Simplified silhouette) */}
                    <path 
                      d="M85 85 Q105 90 100 110 Q95 125 85 130 L80 145" 
                      fill="white" 
                      stroke="#1B2F45" 
                      strokeWidth="1.5" 
                    />
                    
                    {/* Chef Hat */}
                    <path 
                      d="M55 70 Q55 30 85 30 Q115 30 115 70 L55 70" 
                      fill="white" 
                      stroke="#EE7005" 
                      strokeWidth="8" 
                    />
                    <path 
                      d="M65 70 V85 H105 V70" 
                      fill="none" 
                      stroke="#EE7005" 
                      strokeWidth="8" 
                    />
                    
                    {/* Apron & Body */}
                    <path 
                      d="M55 145 Q45 170 50 230 H120 Q125 170 115 145 Z" 
                      fill="#EE7005" 
                    />
                    
                    {/* Stirring Bowl */}
                    <path 
                      d="M65 200 H145 Q140 240 105 240 Q70 240 65 200 Z" 
                      fill="#1B2F45" 
                    />
                    
                    {/* Stirring Spoon (in hand) */}
                    <path 
                      d="M110 170 L130 205" 
                      stroke="#1B2F45" 
                      strokeWidth="6" 
                      strokeLinecap="round" 
                    />
                    
                    {/* Steam Lines */}
                    <path d="M115 190 Q120 175 115 165" fill="none" stroke="#EE7005" strokeWidth="3" />
                    <path d="M130 190 Q135 175 130 165" fill="none" stroke="#EE7005" strokeWidth="3" />
                  </g>
                </svg>
             </div>
          </div>

          {/* Last 4: Created using a spatula */}
          <div className="relative h-40 w-28 md:h-64 md:w-48">
            <svg viewBox="0 0 100 140" className="h-full w-full overflow-visible">
               {/* Triangular part of 4 */}
               <path 
                d="M15 85 L15 50 L65 85 H15" 
                stroke="#1B2F45" 
                strokeWidth="12" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="none"
              />
              {/* Spatula forming the vertical stem */}
              <g transform="translate(45, -15)">
                {/* Spatula Head */}
                <rect x="8" y="5" width="34" height="45" rx="5" fill="#1B2F45" />
                {/* Slits in spatula */}
                <rect x="15" y="15" width="4" height="25" rx="2" fill="white" />
                <rect x="23" y="15" width="4" height="25" rx="2" fill="white" />
                <rect x="31" y="15" width="4" height="25" rx="2" fill="white" />
                {/* Handle */}
                <rect x="21" y="50" width="8" height="105" rx="4" fill="#1B2F45" />
                {/* Handle Hole */}
                <circle cx="25" cy="145" r="2" fill="white" />
              </g>
            </svg>
          </div>
        </div>

        <div className="mt-12 space-y-6 md:mt-16">
          <h1 className="text-4xl font-black uppercase tracking-tight text-[#1B2F45] md:text-6xl">
            Lost in the Kitchen?
          </h1>
          <p className="mx-auto max-w-xl text-lg text-gray-500 md:text-xl">
            The page you are looking for seems to have been eaten! 
            Let&apos;s get you back to delicious meals.
          </p>
          
          <div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#EE7005] px-10 py-4 text-lg font-extrabold text-white transition-all hover:bg-[#D66404] hover:shadow-xl active:scale-95 sm:w-auto"
            >
              GO TO HOME
            </Link>
            <Link
              href="/menu"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1B2F45] px-10 py-4 text-lg font-extrabold text-[#1B2F45] transition-all hover:bg-[#1B2F45] hover:text-white active:scale-95 sm:w-auto"
            >
              BROWSE MENU
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
