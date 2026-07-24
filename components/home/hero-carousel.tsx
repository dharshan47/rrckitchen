"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ArrowRight, Sparkles, ShieldCheck, Clock, ChefHat, Bike } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroSlide {
  tag: string
  tagIcon: "sparkle" | "shield" | "clock" | "chef" | "bike"
  headline: string
  accentText: string
  description: string
  primaryCta: { label: string; href: string }
  secondaryCta: { label: string; href: string }
  image: string
  imageAlt: string
  bgGradient: string
  accentColor: string
  floatImages: { src: string; alt: string; className: string }[]
}

const slides: HeroSlide[] = [
  {
    tag: "100% HOME COOKED",
    tagIcon: "sparkle",
    headline: "Fresh Home",
    accentText: "Cooked Food, Delivered Daily",
    description:
      "Delicious, healthy and hygienic meals made by trusted home chefs near you.",
    primaryCta: { label: "ORDER NOW", href: "/search" },
    secondaryCta: { label: "EXPLORE MENU", href: "/categories" },
    image: "/banners/fresh-cooked.png",
    imageAlt: "Fresh home cooked food in a tiffin carrier",
    bgGradient: "from-[#FFF8F0] via-[#FFF5EB] to-[#FFE8D0]",
    accentColor: "#EE7005",
    floatImages: [
      { src: "/banners/tiffin-carrier.png", alt: "Tiffin", className: "hero-float-1" },
    ],
  },
  {
    tag: "HYGIENIC & SAFE",
    tagIcon: "shield",
    headline: "Taste the Difference",
    accentText: "of Homemade Meals",
    description:
      "Every meal is prepared with love, using the freshest ingredients from local kitchens.",
    primaryCta: { label: "ORDER NOW", href: "/search" },
    secondaryCta: { label: "HOW IT WORKS", href: "/help" },
    image: "/banners/tiffin-carrier.png",
    imageAlt: "Delicious home cooked meals delivered fresh",
    bgGradient: "from-[#F0FFF4] via-[#F0FDF4] to-[#DCFCE7]",
    accentColor: "#22C55E",
    floatImages: [
      { src: "/banners/fresh-daily.png", alt: "Fresh", className: "hero-float-2" },
    ],
  },
  {
    tag: "ON-TIME DELIVERY",
    tagIcon: "clock",
    headline: "Your Favorite",
    accentText: "Home Food, On Time",
    description:
      "Hot and fresh meals delivered to your doorstep. Experience the warmth of home cooking.",
    primaryCta: { label: "ORDER NOW", href: "/search" },
    secondaryCta: { label: "EXPLORE KITCHENS", href: "/categories" },
    image: "/banners/fresh-daily.png",
    imageAlt: "Fresh daily meals delivered to your door",
    bgGradient: "from-[#FFF7ED] via-[#FFFBEB] to-[#FEF3C7]",
    accentColor: "#F59E0B",
    floatImages: [
      { src: "/banners/fresh-cooked.png", alt: "Cooked", className: "hero-float-3" },
    ],
  },
  {
    tag: "BECOME A HOME CHEF",
    tagIcon: "chef",
    headline: "Turn Your Passion",
    accentText: "Into Your Profession",
    description:
      "Cook from home, earn on your terms, and build something extraordinary with RRC Kitchen.",
    primaryCta: { label: "JOIN NOW", href: "/kitchen/signup" },
    secondaryCta: { label: "LEARN MORE", href: "/kitchen" },
    image: "/banners/become-chef.png",
    imageAlt: "Become a home chef with RRC Kitchen",
    bgGradient: "from-[#F5F3FF] via-[#EDE9FE] to-[#DDD6FE]",
    accentColor: "#7C3AED",
    floatImages: [
      { src: "/banners/womenchef.png", alt: "Chef", className: "hero-float-1" },
    ],
  },
  {
    tag: "DELIVER WITH US",
    tagIcon: "bike",
    headline: "Deliver Happiness,",
    accentText: "Earn Big Rewards",
    description:
      "Join our delivery partner network. Flexible hours, great earnings, and be part of your community's food journey.",
    primaryCta: { label: "SIGN UP", href: "/delivery-partner/signup" },
    secondaryCta: { label: "KNOW MORE", href: "/help" },
    image: "/banners/delivery-with-us.png",
    imageAlt: "Delivery partner with RRC Kitchen",
    bgGradient: "from-[#EFF6FF] via-[#DBEAFE] to-[#BFDBFE]",
    accentColor: "#2563EB",
    floatImages: [
      { src: "/banners/freshpacakaged.png", alt: "Packaged", className: "hero-float-2" },
    ],
  },
]

const features = [
  { icon: Sparkles, text: "Home Cooked with Love" },
  { icon: ShieldCheck, text: "Hygienic & Safe" },
  { icon: Clock, text: "On-time Everyday" },
  { icon: ChefHat, text: "Fresh Ingredients" },
]

function TagIcon({ type }: { type: "sparkle" | "shield" | "clock" | "chef" | "bike" }) {
  if (type === "sparkle") return <Sparkles className="h-3.5 w-3.5" />
  if (type === "shield") return <ShieldCheck className="h-3.5 w-3.5" />
  if (type === "clock") return <Clock className="h-3.5 w-3.5" />
  if (type === "chef") return <ChefHat className="h-3.5 w-3.5" />
  return <Bike className="h-3.5 w-3.5" />
}

export function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, duration: 40 },
    [Autoplay({ delay: 6000, stopOnInteraction: false })]
  )
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setCurrent(emblaApi.selectedScrollSnap())
    }
    emblaApi.on("select", onSelect)
    emblaApi.on("reInit", onSelect)
    return () => {
      emblaApi.off("select", onSelect)
      emblaApi.off("reInit", onSelect)
    }
  }, [emblaApi])

  return (
    <section className="hero-section relative w-full overflow-hidden">
      {/* Animated background shapes */}
      <div className="hero-bg-shapes absolute inset-0 overflow-hidden pointer-events-none">
        <div className="hero-blob hero-blob-1" />
        <div className="hero-blob hero-blob-2" />
        <div className="hero-blob hero-blob-3" />
        <div className="hero-grid-pattern" />
      </div>

      <div className="relative" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="min-w-0 shrink-0 grow-0 basis-full"
            >
              <div
                className={cn(
                  "hero-slide relative min-h-105 sm:min-h-120 lg:min-h-135 xl:min-h-145",
                  `bg-linear-to-br ${slide.bgGradient}`,
                  current === index && "hero-slide-active"
                )}
              >
                {/* Decorative floating shapes */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div
                    className={cn(
                      "hero-deco-circle hero-deco-1",
                      current === index && "hero-deco-active"
                    )}
                    style={{ borderColor: `${slide.accentColor}20` }}
                  />
                  <div
                    className={cn(
                      "hero-deco-circle hero-deco-2",
                      current === index && "hero-deco-active"
                    )}
                    style={{ borderColor: `${slide.accentColor}15` }}
                  />
                  <div
                    className={cn(
                      "hero-deco-ring",
                      current === index && "hero-deco-active"
                    )}
                    style={{ borderColor: `${slide.accentColor}10` }}
                  />
                </div>

                {/* Content area */}
                <div className="relative z-10 h-full flex items-center pt-32.5 sm:pt-25 lg:pt-27.5">
                  <div className="w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 xl:px-16">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-4 items-center min-h-95 sm:min-h-110 lg:min-h-125">
                      {/* Left: Text Content */}
                      <div className="space-y-4 sm:space-y-5 lg:space-y-6">
                        {/* Tag */}
                        <div
                          className={cn(
                            "hero-tag inline-flex items-center gap-2 rounded-full px-4 py-2 backdrop-blur-md border shadow-sm",
                            current === index && "hero-tag-active"
                          )}
                          style={{
                            backgroundColor: `${slide.accentColor}10`,
                            borderColor: `${slide.accentColor}25`,
                            color: slide.accentColor,
                          }}
                        >
                          <TagIcon type={slide.tagIcon} />
                          <span className="text-xs sm:text-sm font-bold tracking-wider">
                            {slide.tag}
                          </span>
                        </div>

                        {/* Headline */}
                        <div className="space-y-1">
                          <h1
                            className={cn(
                              "hero-headline text-2xl sm:text-3xl md:text-4xl lg:text-[3rem] xl:text-[3.5rem] font-black leading-[1.08] tracking-tight text-gray-900",
                              current === index && "hero-headline-active"
                            )}
                          >
                            {slide.headline}
                          </h1>
                          <h1
                            className={cn(
                              "hero-headline hero-headline-accent text-2xl sm:text-3xl md:text-4xl lg:text-[3rem] xl:text-[3.5rem] font-black leading-[1.08] tracking-tight",
                              current === index && "hero-headline-active"
                            )}
                            style={{ color: slide.accentColor }}
                          >
                            {slide.accentText}
                          </h1>
                        </div>

                        {/* Description */}
                        <p
                          className={cn(
                            "hero-desc text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed max-w-lg font-medium",
                            current === index && "hero-desc-active"
                          )}
                        >
                          {slide.description}
                        </p>

                        {/* CTAs */}
                        <div
                          className={cn(
                            "hero-ctas flex flex-wrap gap-3 sm:gap-4",
                            current === index && "hero-ctas-active"
                          )}
                        >
                          <Link
                            href={slide.primaryCta.href}
                            className="hero-btn-primary group inline-flex items-center gap-2.5 rounded-full px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white shadow-xl transition-all duration-500 active:scale-95"
                            style={{
                              backgroundColor: slide.accentColor,
                              boxShadow: `0 20px 50px ${slide.accentColor}30`,
                            }}
                          >
                            {slide.primaryCta.label}
                            <ArrowRight className="h-4 w-4 group-hover:translate-x-1.5 transition-transform duration-300" />
                          </Link>
                          <Link
                            href={slide.secondaryCta.href}
                            className="hero-btn-secondary inline-flex items-center gap-2 rounded-full px-6 sm:px-8 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-gray-800 bg-white/70 backdrop-blur-sm border border-gray-200/80 hover:bg-white hover:border-gray-300 hover:shadow-lg transition-all duration-300 active:scale-95"
                          >
                            {slide.secondaryCta.label}
                            <ArrowRight className="h-4 w-4 opacity-50" />
                          </Link>
                        </div>

                        {/* Feature pills */}
                        <div
                          className={cn(
                            "hero-features flex flex-wrap gap-2 sm:gap-2.5 pt-2",
                            current === index && "hero-features-active"
                          )}
                        >
                          {features.map((feat, i) => (
                            <div
                              key={feat.text}
                              className="hero-feature-pill inline-flex items-center gap-1.5 rounded-full bg-white/60 backdrop-blur-sm px-3 py-1.5 border border-white/80 shadow-sm"
                              style={{ animationDelay: `${0.8 + i * 0.1}s` }}
                            >
                              <feat.icon
                                className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                                style={{ color: slide.accentColor }}
                              />
                              <span className="text-[10px] sm:text-xs font-semibold text-gray-700">
                                {feat.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Image Area */}
                      <div className="relative h-60 sm:h-75 lg:h-110 xl:h-125">
                        {/* Main image */}
                        <div
                          className={cn(
                            "hero-main-image absolute inset-0 flex items-center justify-center",
                            current === index && "hero-main-image-active"
                          )}
                        >
                          <div className="relative w-55 h-55 sm:w-70 sm:h-70 lg:w-90 lg:h-90 xl:w-105 xl:h-105">
                            <Image
                              src={slide.image}
                              alt={slide.imageAlt}
                              fill
                              className="object-contain drop-shadow-2xl"
                              sizes="(max-width: 1024px) 80vw, 40vw"
                              priority={index === 0}
                            />
                          </div>
                        </div>

                        {/* Glow effect behind image */}
                        <div
                          className={cn(
                            "hero-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-65 h-65 lg:w-90 lg:h-90 rounded-full blur-3xl opacity-30",
                            current === index && "hero-glow-active"
                          )}
                          style={{ backgroundColor: slide.accentColor }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
