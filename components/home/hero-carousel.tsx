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
  UsersRound,
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
    tag: "100% HOMEMADE",
    headline: (
      <>
        <span className="block text-[#003015] font-black text-lg sm:text-4xl lg:text-[4rem] leading-[1.1] tracking-tight">
          Home-Cooked Food
        </span>
        <span className="block text-[#003015] font-black text-lg sm:text-4xl lg:text-[4rem] leading-[1.1] tracking-tight mt-0.5 lg:mt-2">
          Delivered in an{" "}
          <span className="text-[#F04E00] font-serif italic font-semibold">
            Ever Silver
          </span>
        </span>
        <span className="block text-[#003015] font-black text-lg sm:text-4xl lg:text-[4rem] leading-[1.1] tracking-tight mt-0.5 lg:mt-2">
          Tiffin Carrier
        </span>
      </>
    ),
    description: (
      <span className="block">
        Healthy, hygienic, and delicious meals prepared by <span className="text-[#003015] font-bold">verified home chefs</span>{" "}
        and delivered to your doorstep in an <span className="text-[#003015] font-bold">Ever Silver Tiffin Carrier.</span>
      </span>
    ),
    primaryCta: { label: "ORDER NOW", href: "/kitchens" },
    secondaryCta: { label: "EXPLORE KITCHENS", href: "/categories" },
    trustBar: [
      { icon: Heart, text: "100%\nHomemade" },
      { icon: ShieldCheck, text: "Verified\nKitchens" },
      { icon: Clock, text: "On-time\nDelivery" },
      { icon: Package, text: "Ever Silver\nTiffin Carrier" },
      { icon: Leaf, text: "Fresh\nIngredients" },
      { icon: UsersRound, text: "Support a\nHomemaker" },
    ],
    rightCard: [
      { icon: Flame, title: "Food stays hot", subtitle: "for longer" },
      { icon: ShieldCheck, title: "Leak-proof", subtitle: "& spill-safe" },
      { icon: Recycle, title: "Eco-friendly", subtitle: "completely reusable" },
      { icon: Ban, title: "Zero plastic", subtitle: "only Ever Silver" },
    ],
    bgImage:
      "/hero/hero-tiffin-carrier.webp",
    imageAlt: "Home chef holding an Ever Silver tiffin carrier",
  },
  {
    tag: "BECOME A HOME CHEF",
    headline: (
      <>
        <span className="block text-[#003015] font-black text-lg sm:text-4xl lg:text-[4rem] leading-[1.1] tracking-tight">
          Turn Your Passion
        </span>
        <span className="block text-[#003015] font-black text-lg sm:text-4xl lg:text-[4rem] leading-[1.1] tracking-tight mt-0.5 lg:mt-2">
          Into Your{" "}
          <span className="text-[#F04E00] font-serif italic font-semibold">
            Profession
          </span>
        </span>
      </>
    ),
    description:
      "Cook from home, earn on your own terms, and support your family. Join our growing community of verified home kitchens at RRC Kitchen.",
    primaryCta: { label: "JOIN NOW", href: "/kitchen/signup" },
    secondaryCta: { label: "LEARN MORE", href: "/kitchen" },
    trustBar: [
      { icon: Heart, text: "Be Your\nOwn Boss" },
      { icon: Clock, text: "Flexible\nHours" },
      { icon: ShieldCheck, text: "Verified\nPlatform" },
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
    imageAlt: "Become a verified home kitchen with RRC Kitchen",
  },
  {
    tag: "SUPPORT A HOMEMAKER",
    headline: (
      <>
        <span className="block text-[#003015] font-black text-lg sm:text-4xl lg:text-[4rem] leading-[1.1] tracking-tight">
          Every Order Supports
        </span>
        <span className="block text-[#003015] font-black text-lg sm:text-4xl lg:text-[4rem] leading-[1.1] tracking-tight mt-0.5 lg:mt-2">
          a{" "}
          <span className="text-[#F04E00] font-serif italic font-semibold">
            Homemaker
          </span>
        </span>
        <span className="block text-[#003015] font-black text-lg sm:text-4xl lg:text-[4rem] leading-[1.1] tracking-tight mt-0.5 lg:mt-2">
          & Her Family
        </span>
      </>
    ),
    description:
      "Enjoy 100% homemade meals cooked with love and care by verified home kitchens, delivered fresh in an Ever Silver Tiffin Carrier.",
    primaryCta: { label: "VIEW MENU", href: "/search" },
    secondaryCta: { label: "EXPLORE KITCHENS", href: "/kitchens" },
    trustBar: [
      { icon: UsersRound, text: "Empowering\nWomen" },
      { icon: ShieldCheck, text: "Verified\nKitchens" },
      { icon: Heart, text: "Cooked with\nLove" },
      { icon: Flame, text: "Hot\nDelivery" },
    ],
    rightCard: [
      { icon: Heart, title: "100% Homemade", subtitle: "cooked with care" },
      { icon: UsersRound, title: "Supports", subtitle: "local families" },
      { icon: ShieldCheck, title: "Verified", subtitle: "home kitchens" },
      { icon: Package, title: "Delivered in", subtitle: "an Ever Silver Tiffin Carrier" },
    ],
    bgImage:
      "/hero/hero-delivery-with-us.webp",
    imageAlt: "Freshly cooked 100% homemade meals delivered to your doorstep",
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
    <div className="relative flex flex-row w-full bg-[#FDFBF7] overflow-hidden min-h-[280px] sm:min-h-[400px] lg:min-h-[650px]">

      {/* Left Text Section - Exactly 50% Width */}
      <div className="w-[50%] flex flex-col justify-center px-3 sm:px-8 lg:px-12 pt-6 pb-16 sm:pt-12 sm:pb-28 lg:pt-24 lg:pb-40 z-10 relative">
        <div className="max-w-[700px] ml-auto w-full">
          <div
            className={cn(
              "space-y-1.5 sm:space-y-4 lg:space-y-8 transition-all duration-700 text-left flex flex-col items-start w-full",
              isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="inline-flex items-center gap-1 sm:gap-2 bg-[#FFF7E8] text-[#087A35] px-1.5 sm:px-4 py-0.5 sm:py-2 rounded-full shadow-sm border border-[#F2DDB9]">
              <Leaf className="h-2 w-2 sm:h-5 sm:w-5 text-[#087A35]" />
              <span className="text-[7px] sm:text-xs lg:text-sm font-bold tracking-wider uppercase">
                {slide.tag}
              </span>
            </div>

            <h1 className="flex flex-col items-start w-full">
              {slide.headline}
            </h1>

            <div className="text-[#333333] text-[9px] sm:text-sm lg:text-xl font-medium leading-[1.3] sm:leading-relaxed max-w-[95%]">
              {slide.description}
            </div>

            <div className="flex flex-row flex-wrap items-center justify-start gap-2 sm:gap-4 pt-2 sm:pt-2">
              <Link
                href={slide.primaryCta.href}
                className="inline-flex items-center justify-center gap-1 sm:gap-2 rounded-full px-3 sm:px-8 py-1.5 sm:py-4 text-[9px] sm:text-sm lg:text-base font-bold text-white shadow-sm sm:shadow-lg transition-all hover:opacity-90 active:scale-95 bg-[#F04E00]"
              >
                {slide.primaryCta.label}
                <ArrowRight className="h-2.5 w-2.5 sm:h-5 sm:w-5" />
              </Link>
              <Link
                href={slide.secondaryCta.href}
                className="inline-flex items-center justify-center gap-1 sm:gap-2 rounded-full px-3 sm:px-8 py-1.5 sm:py-4 text-[9px] sm:text-sm lg:text-base font-bold text-[#003015] bg-white border border-[#DCDCDC] shadow-sm transition-all hover:bg-gray-50 active:scale-95"
              >
                {slide.secondaryCta.label}
                <ChevronRight className="h-2.5 w-2.5 sm:h-5 sm:w-5 text-[#003015]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Image Section - Exactly 50% Width */}
      <div className="w-[50%] relative z-0">
        <Image
          src={slide.bgImage}
          alt={slide.imageAlt}
          fill
          className="object-cover object-[70%_center] lg:object-center"
          sizes="50vw"
          priority
        />
        {/* Soft edge blend for a smooth transition from the background color to the image */}
        <div className="absolute inset-y-0 left-0 w-[15%] lg:w-[20%] bg-gradient-to-r from-[#FDFBF7] to-transparent z-10" />

        {/* Right card on desktop absolute positioned */}
        <div className="hidden 2xl:flex absolute right-8 top-1/2 -translate-y-1/2 z-20">
          <div
            className={cn(
              "bg-[rgba(255,255,255,0.94)] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-8 flex flex-col w-[320px] border border-[#EEEEEE] transition-all duration-700 delay-150 relative",
              isActive ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            )}
          >
            {slide.rightCard.map((item, i) => (
              <div key={i} className="flex flex-col">
                <div className="flex items-center gap-5 py-2">
                  <div className="shrink-0 flex items-center justify-center">
                    <item.icon className="h-7 w-7 text-[#168846]" strokeWidth={1.75} />
                  </div>
                  <div className="flex flex-col justify-center">
                    <span className="font-bold text-base leading-tight text-gray-900">
                      {item.title}
                    </span>
                    <span className="text-sm text-gray-600 mt-0.5">
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

      {/* Trust bar positioned over the entire width at the bottom */}
      <div className="absolute bottom-2 sm:bottom-6 lg:bottom-10 left-0 right-0 z-30 px-2 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[1400px]">
          <div className="bg-white/95 backdrop-blur-sm rounded-lg lg:rounded-2xl border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.06)] px-2 sm:px-6 py-2 lg:px-8 lg:py-6 flex overflow-x-auto lg:overflow-visible items-center justify-between gap-3 sm:gap-6 scrollbar-hide">
            {slide.trustBar.map((item, i) => (
              <div key={i} className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="flex items-center gap-1.5 sm:gap-3">
                  <div className="flex items-center justify-center shrink-0">
                    <item.icon className={cn("h-3 w-3 sm:h-6 sm:w-6", i % 2 === 0 ? "text-[#F04E00]" : "text-[#087A35]")} strokeWidth={2} />
                  </div>
                  <span className="text-[8px] sm:text-sm lg:text-[15px] leading-tight font-bold text-gray-900 whitespace-pre-line text-left">
                    {item.text}
                  </span>
                </div>
                {i < slide.trustBar.length - 1 && (
                  <div className="w-[1px] h-4 sm:h-10 bg-gray-200 shrink-0 mx-1 lg:mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

