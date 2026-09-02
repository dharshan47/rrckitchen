"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import NotFoundIcon from "@/components/icons/404";
import { Home, Compass } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  useEffect(() => {
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");
    const nav = document.querySelector("nav");
    const navSpacer = document.querySelector(".h-16\\.md\\:hidden");
    if (header) header.style.display = "none";
    if (footer) footer.style.display = "none";
    if (nav) nav.style.display = "none";
    if (navSpacer) (navSpacer as HTMLElement).style.display = "none";
    return () => {
      if (header) header.style.display = "";
      if (footer) footer.style.display = "";
      if (nav) nav.style.display = "";
      if (navSpacer) (navSpacer as HTMLElement).style.display = "";
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 md:py-20">
      <div className="flex w-full max-w-4xl flex-col items-center text-center">
        
        <div className="w-full max-w-2xl px-4 flex justify-center">
          <NotFoundIcon className="w-full h-auto" />
        </div>

        <div className="mt-8 space-y-4 md:mt-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#0F172A] md:text-5xl">
            Oops!
          </h1>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A] md:text-2xl">
            The page you&apos;re looking for is not found.
          </h2>
          <div className="mx-auto max-w-xl text-sm text-gray-500 md:text-base space-y-1">
            <p>It might have been removed, renamed, or temporarily unavailable.</p>
            <p>Let&apos;s get you back on track!</p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 pt-6 sm:flex-row">
            <button
              onClick={() => router.push("/")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-none bg-[#087F35] px-6 py-3.5 text-sm font-bold text-white shadow-[0_4px_12px_rgba(8,127,53,0.18)] transition-all hover:bg-[#066B2C] active:scale-95 sm:w-auto"
            >
              <Home className="h-5 w-5" />
              <span>Back to Home</span>
            </button>
            <button
              onClick={() => router.push("/categories")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-[1.5px] border-[#159447] bg-white px-6 py-3.5 text-sm font-bold text-[#087F35] shadow-none transition-all hover:border-[#087F35] hover:bg-[#F0FDF4] active:scale-95 sm:w-auto"
            >
              <Compass className="h-5 w-5" />
              <span>Explore Kitchens</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
