"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import {
  ArrowRight,
  Leaf,
  Heart,
  ShieldCheck,
  Clock,
  Package,
  Flame,
  Recycle,
  Ban,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroSlide {
  tag: string
  headline: React.ReactNode
  description: React.ReactNode
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  trustBar: { icon: typeof Heart; text: string }[]
  rightCard: { icon: typeof Flame; title: string; subtitle: string }[]
  bgImage: string
  imageAlt: string
}

const slides: HeroSlide[] = [
  {
    tag: "100% HOME COOKED",
    headline: (
      <>
        <span className="block text-[#003015] font-black text-[2.5rem] sm:text-5xl lg:text-[3.75rem] leading-[1.05] tracking-tight">
          Home cooket food
        </span>
        <span className="block text-[#003015] font-black text-[2.5rem] sm:text-5xl lg:text-[3.75rem] leading-[1.05] tracking-tight mt-1 lg:mt-1.5">
          in{" "}
          <span className="text-[#F04E00] font-serif italic font-semibold">
            ever silver
          </span>
        </span>
        <span className="block text-[#003015] font-black text-[2.5rem] sm:text-5xl lg:text-[3.75rem] leading-[1.05] tracking-tight mt-1 lg:mt-1.5">
          Box carrier
        </span>
      </>
    ),
    description: (
      <span className="block">
        Healthy, hygienic and delicious meals prepared by trusted<br />
        home chefs and delivered to your doorstep in<br />
        <span className="text-[#003015] font-bold">traditional stainless steel tiffin box carrier.</span>
      </span>
    ),
    primaryCta: { label: "ORDER NOW", href: "/search" },
    secondaryCta: { label: "EXPLORE KITCHENS", href: "/categories" },
    trustBar: [
      { icon: Heart, text: "Cooked\nwith Love" },
      { icon: ShieldCheck, text: "Hygienic\n& Safe" },
      { icon: Clock, text: "On-time\nDelivery" },
      { icon: Package, text: "Packed in\nTiffin Carrier" },
      { icon: Leaf, text: "Fresh\nIngredients" },
      { icon: Package, text: "Steel Tiffin\nCarrier" },
    ],
    rightCard: [
      { icon: Flame, title: "Food stays hot", subtitle: "for longer" },
      { icon: ShieldCheck, title: "Leak proof", subtitle: "& spill safe" },
      { icon: Leaf, title: "Eco friendly", subtitle: "& reusable" },
      { icon: Ban, title: "No plastic", subtitle: "Only stainless steel" },
    ],
    bgImage:
      "/hero/hero-tiffin-carrier.webp",
    imageAlt: "Home chef holding stainless steel tiffin carrier",
  },
  {
    tag: "BECOME A HOME CHEF",
    headline: (
      <>
        <span className="block text-[#003015] font-black text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.1] tracking-tight">
          Turn Your Passion
        </span>
        <span className="block text-[#003015] font-black text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.1] tracking-tight mt-1">
          Into Your{" "}
          <span className="text-primary font-serif italic font-semibold">
            Profession
          </span>
        </span>
      </>
    ),
    description:
      "Cook from home, earn on your terms, and build something extraordinary with RRC Kitchen. Join our growing community of passionate home chefs.",
    primaryCta: { label: "JOIN NOW", href: "/kitchen/signup" },
    secondaryCta: { label: "LEARN MORE", href: "/kitchen" },
    trustBar: [
      { icon: Heart, text: "Be Your\nOwn Boss" },
      { icon: Clock, text: "Flexible\nHours" },
      { icon: ShieldCheck, text: "Trusted\nPlatform" },
      { icon: Package, text: "We Handle\nDelivery" },
    ],
    rightCard: [
      { icon: Heart, title: "Reach more", subtitle: "happy customers" },
      { icon: Clock, title: "Work when", subtitle: "you want to" },
      { icon: Flame, title: "Earn extra", subtitle: "income daily" },
      { icon: ShieldCheck, title: "Secure & safe", subtitle: "payments" },
    ],
    bgImage:
      "/hero/hero-women-chef.webp",
    imageAlt: "Become a home chef with RRC Kitchen",
  },
  {
    tag: "FRESHLY COOKED DAILY",
    headline: (
      <>
        <span className="block text-[#003015] font-black text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.1] tracking-tight">
          Fresh & Healthy
        </span>
        <span className="block text-[#003015] font-black text-4xl sm:text-5xl lg:text-[3.25rem] leading-[1.1] tracking-tight mt-1">
          <span className="text-primary font-serif italic font-semibold">
            Daily Menu
          </span>{" "}
          Delivered
        </span>
      </>
    ),
    description:
      "Explore a rotating daily menu crafted by home chefs using the freshest ingredients. Order by noon for same-day delivery in eco-friendly packaging.",
    primaryCta: { label: "VIEW TODAY'S MENU", href: "/today-specials" },
    secondaryCta: { label: "SUBSCRIBE NOW", href: "/categories" },
    trustBar: [
      { icon: Clock, text: "Daily Rotating\nMenu" },
      { icon: Leaf, text: "Farm Fresh\nProduce" },
      { icon: ShieldCheck, text: "Home Chef\nCertified" },
      { icon: Flame, text: "Hot\nDelivery" },
    ],
    rightCard: [
      { icon: Clock, title: "Order by", subtitle: "12:00 PM" },
      { icon: Leaf, title: "Farm to", subtitle: "table freshness" },
      { icon: Recycle, title: "Eco friendly", subtitle: "packaging" },
      { icon: Flame, title: "Hot & fresh", subtitle: "every day" },
    ],
    bgImage:
      "/hero/hero-delivery-with-us.webp",
    imageAlt: "Fresh daily home cooked meals",
  },
]

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 50 },
    [Autoplay({ delay: 7000, stopOnInteraction: false })]
  )
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => setCurrent(emblaApi.selectedScrollSnap())
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi])

  return (
    <section className="hero-section relative w-full overflow-hidden bg-[#FDFBF7]">
      <div ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={index} className="min-w-0 shrink-0 grow-0 basis-full">
              <SlideContent slide={slide} isActive={current === index} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function SlideContent({
  slide,
  isActive,
}: {
  slide: HeroSlide
  isActive: boolean
}) {
  return (
    <div className="relative min-h-145 sm:min-h-160 lg:min-h-155 flex flex-col lg:block">
      <div className="absolute inset-0 lg:inset-y-0 lg:left-auto lg:right-0 w-full lg:w-[70%] z-0 overflow-hidden">
        <Image
          src={slide.bgImage}
          alt={slide.imageAlt}
          fill
          className="object-cover object-[center_right] lg:object-left"
          sizes="(max-width: 1024px) 100vw, 70vw"
          priority
        />
        {/* Gradient to blend left edge of image into background on desktop */}
        <div className="hidden lg:block absolute inset-y-0 left-0 w-[45%] bg-linear-to-r from-[#FDFBF7] from-15% via-[#FDFBF7]/80 to-transparent z-10" />
        {/* Gradient for mobile to ensure text readability (fades left to right like design) */}
        <div className="lg:hidden absolute inset-0 bg-linear-to-r from-[#FDFBF7] from-50% via-[#FDFBF7]/85 to-transparent z-10" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pt-8 sm:pt-14 lg:pt-16 pb-36 sm:pb-40 lg:pb-32 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          <div
            className={cn(
              "lg:col-span-8 xl:col-span-7 space-y-6 lg:space-y-7 transition-all duration-700",
              isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="inline-flex items-center gap-1.5 bg-[#FFF7E8] text-[#087A35] px-3.5 py-1.5 rounded-full shadow-sm border border-[#F2DDB9]">
              <Leaf className="h-4 w-4 text-[#087A35]" />
              <span className="text-[11px] font-bold tracking-wider uppercase">
                {slide.tag}
              </span>
            </div>

            <h1>{slide.headline}</h1>

            <p className="text-[#333333] text-base lg:text-[1.05rem] max-w-xl font-medium leading-relaxed">
              {slide.description}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={slide.primaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[13px] font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95 bg-[#F04E00]"
              >
                {slide.primaryCta.label}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={slide.secondaryCta.href}
                className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[13px] font-bold text-[#003015] bg-white border border-[#DCDCDC] shadow-sm transition-all hover:bg-gray-50 active:scale-95"
              >
                {slide.secondaryCta.label}
                <ChevronRight className="h-4 w-4 text-[#003015]" />
              </Link>
            </div>
          </div>

          <div className="hidden xl:flex xl:col-span-5 justify-end">
            <div
              className={cn(
                "bg-[rgba(255,255,255,0.94)] rounded-[10px] shadow-[0_6px_20px_rgba(0,0,0,0.08)] p-6 flex flex-col w-[300px] border border-[#EEEEEE] transition-all duration-700 delay-150 relative",
                isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
              )}
            >
              {slide.rightCard.map((item, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center gap-4 py-1">
                    <div className="shrink-0 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-[#168846]" strokeWidth={1.75} />
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="font-bold text-[14.5px] leading-tight text-gray-900">
                        {item.title}
                      </span>
                      <span className="text-[13px] text-gray-600 mt-0.5">
                        {item.subtitle}
                      </span>
                    </div>
                  </div>
                  {i < slide.rightCard.length - 1 && (
                    <div className="w-full h-px bg-gray-100 my-4" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 lg:bottom-10 left-0 right-0 z-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-4 py-4 sm:px-6 lg:px-8 lg:py-5 flex overflow-x-auto lg:overflow-visible items-center lg:justify-between gap-x-6 gap-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {slide.trustBar.map((item, i) => (
              <div key={i} className="flex items-center gap-6 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="flex items-center justify-center shrink-0">
                    <item.icon className={cn("h-5 w-5", i % 2 === 0 ? "text-[#F04E00]" : "text-[#087A35]")} strokeWidth={2} />
                  </div>
                  <span className="text-[12px] sm:text-[13px] leading-[1.25] font-bold text-gray-900 whitespace-pre-line">
                    {item.text}
                  </span>
                </div>
                {i < slide.trustBar.length - 1 && (
                  <div className="w-[1px] h-6 bg-gray-200 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

