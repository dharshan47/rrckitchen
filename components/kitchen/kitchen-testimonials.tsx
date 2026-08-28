"use client"

import Image from "next/image"
import { useQuery } from "@tanstack/react-query"
import { getKitchenTestimonials } from "@/actions/kitchen/rrc-review"
import { Star } from "lucide-react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { Skeleton } from "@/components/ui/skeleton"

const fallbackTestimonials = [
  { id: "1", name: "Kavitha B.", role: "Home Chef", text: "RRC Kitchen gave me the confidence to turn my passion into earnings. The support team is amazing!", image: "/kitchen/profile.webp", rating: 5 },
  { id: "2", name: "Meena S.", role: "Home Chef", text: "I love the flexibility and respect I get. Now I'm financially independent and doing what I love.", image: "/kitchen/profile.webp", rating: 5 },
  { id: "3", name: "Priya M.", role: "Home Chef", text: "Great platform, easy to use and the best part is happy customers who love my food!", image: "/kitchen/profile.webp", rating: 5 },
]

export function KitchenTestimonials() {
  const { data, isLoading } = useQuery({
    queryKey: ["kitchen-testimonials"],
    queryFn: async () => getKitchenTestimonials(),
    refetchInterval: 30_000,
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  })

  const testimonials = data && data.length > 0 ? data : fallbackTestimonials

  return (
    <section className="py-20 lg:py-24 bg-[#FEFEFE]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl lg:text-[40px] font-extrabold text-[#111111] mb-12 relative inline-block">
          What Our <span className="text-[#FD4F03]">Home Chefs</span> Say
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-[#FD4F03] rounded-full"></div>
        </h2>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-[1150px] mx-auto mt-6 px-4 lg:px-16">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#FFFFFF] rounded-[24px] p-8 border border-[#F5F5F5] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-left"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-5 w-5 rounded-sm" />
                  ))}
                </div>
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-11/12 mb-3" />
                <Skeleton className="h-4 w-3/4 mb-10" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="w-full max-w-[1200px] mx-auto relative mt-6 px-4 lg:px-16">
            <Carousel className="w-full" opts={{ align: "start", loop: true }}>
              <CarouselContent className="-ml-4 sm:-ml-6">
                {testimonials.map((t, i) => (
                  <CarouselItem key={t.id ?? i} className="pl-4 sm:pl-6 md:basis-1/2 lg:basis-1/3">
                    <div className="bg-[#FFFFFF] rounded-[24px] p-8 border border-[#F5F5F5] shadow-[0_4px_24px_rgba(0,0,0,0.04)] h-full flex flex-col items-start text-left">
                      <div className="flex gap-1 mb-6">
                        {[...Array(5)].map((_, j) => (
                          <Star
                            key={j}
                            className={`h-5 w-5 ${j < t.rating ? "fill-[#FFA500] text-[#FFA500]" : "text-[#E8E8E8]"}`}
                          />
                        ))}
                      </div>
                      <p className="text-[#333333] text-[15px] mb-10 flex-1 leading-[1.7]">&quot;{t.text}&quot;</p>
                      <div className="flex items-center gap-4 mt-auto">
                        <div className="h-12 w-12 rounded-full overflow-hidden relative bg-[#F1F8F3] shrink-0 border border-[#E8E8E8]">
                          <Image src={t.image} alt={t.name} fill sizes="48px" className="object-cover" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-[#111111] text-[15px]">- {t.name}</p>
                          <p className="text-[13px] text-[#666666] mt-0.5">{t.role}</p>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              
              {/* Desktop Navigation Arrows */}
              <div className="hidden lg:block">
                <CarouselPrevious className="absolute -left-12 lg:-left-16 top-1/2 -translate-y-1/2 bg-white border-0 shadow-[0_4px_16px_rgba(0,0,0,0.06)] h-12 w-12 hover:bg-gray-50 flex items-center justify-center text-[#111111] z-10" />
                <CarouselNext className="absolute -right-12 lg:-right-16 top-1/2 -translate-y-1/2 bg-white border-0 shadow-[0_4px_16px_rgba(0,0,0,0.06)] h-12 w-12 hover:bg-gray-50 flex items-center justify-center text-[#111111] z-10" />
              </div>
            </Carousel>
            
            {/* Pagination Dots */}
            <div className="flex justify-center items-center gap-2.5 mt-10">
              <div className="w-2.5 h-2.5 rounded-full bg-[#FD4F03]"></div>
              <div className="w-2 h-2 rounded-full bg-[#E5E5E5]"></div>
              <div className="w-2 h-2 rounded-full bg-[#E5E5E5]"></div>
              <div className="w-2 h-2 rounded-full bg-[#E5E5E5]"></div>
              <div className="w-2 h-2 rounded-full bg-[#E5E5E5]"></div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
