"use client";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from 'next/image'
import Link from 'next/link'

const slides = [
  { image: "/banners/become-chef.png", cta: "/kitchen/signup" },
  { image: "/banners/fresh-daily.png", cta: "/menu" },
  { image: "/banners/order-tomorrow.png", cta: "/menu" },
];

export function HeroCarousel() {
  const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000, stopOnInteraction: false })]);

  return (
    <section className="overflow-hidden rounded-sm shadow-lg" ref={emblaRef}>
      <div className="flex">
        {slides.map((slide, i) => (
          <Link
            key={i}
            href={slide.cta}
            className="flex-[0_0_100%]"
          >
            <Image
              src={slide.image}
              alt=""
              width={1200}
              height={200}
              className="w-full h-auto"
              priority={i === 0}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}