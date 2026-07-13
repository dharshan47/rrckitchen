"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function NotFound() {
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

        <div className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6">
          <span className="text-7xl font-black tracking-tighter sm:text-8xl md:text-9xl" style={{ color: "#1B2F45" }}>4</span>
          <span className="text-7xl font-black tracking-tighter text-primary sm:text-8xl md:text-9xl">0</span>
          <span className="text-7xl font-black tracking-tighter sm:text-8xl md:text-9xl" style={{ color: "#1B2F45" }}>4</span>
        </div>

        <div className="mt-8 space-y-6 md:mt-12">
          <h1 className="text-3xl font-black uppercase tracking-tight text-foreground md:text-5xl">
            Lost in the Kitchen?
          </h1>
          <p className="mx-auto max-w-xl text-base text-muted-foreground md:text-lg">
            The page you are looking for seems to have been eaten! 
            Let&apos;s get you back to delicious meals.
          </p>

          <div className="flex flex-col items-center justify-center gap-4 pt-4 sm:flex-row">
            <Link
              href="/"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3.5 text-base font-extrabold text-primary-foreground transition-all hover:brightness-110 active:scale-95 sm:w-auto"
            >
              GO TO HOME
            </Link>
            <Link
              href="/menu"
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-foreground px-8 py-3.5 text-base font-extrabold text-foreground transition-all hover:bg-foreground hover:text-white active:scale-95 sm:w-auto"
            >
              BROWSE MENU
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
