"use client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";
import { ChefHat, Sparkles, Bike, ArrowRight } from "lucide-react";

const slides = [
  {
    icon: ChefHat,
    title: "Become a Home Chef",
    desc: "Cook from home, set your own hours, and earn extra income.",
    cta: "/kitchen/signup",
    label: "Start earning",
    gradient: "from-orange-500/25 to-amber-500/10",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-600",
  },
  {
    icon: Sparkles,
    title: "Fresh Home-Cooked Meals",
    desc: "Order delicious meals prepared with love by local home chefs.",
    cta: "/menu",
    label: "Order now",
    gradient: "from-green-500/25 to-emerald-500/10",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-600",
  },
  {
    icon: Bike,
    title: "Deliver With Us",
    desc: "Join as a delivery partner and earn on your own schedule.",
    cta: "/delivery-partner/signup",
    label: "Join now",
    gradient: "from-blue-500/25 to-sky-500/10",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-600",
  },
];

export function HeroCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);

  return (
    <section className="overflow-hidden rounded-lg" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide, i) => (
          <Link
            key={i}
            href={slide.cta}
            className="flex-[0_0_100%] min-w-0"
          >
            <div className={`bg-linear-to-r ${slide.gradient} flex items-center gap-4 sm:gap-5 px-4 sm:px-6 py-5 sm:py-6 min-h-[84px] sm:min-h-[96px]`}>
              <div className={`${slide.iconBg} ${slide.iconColor} h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center shrink-0`}>
                <slide.icon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-foreground">{slide.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 line-clamp-1">{slide.desc}</p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary shrink-0">
                {slide.label}
                <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
