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
    <section className="py-20 bg-[#FEFEFE]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 text-center flex flex-col items-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111111] mb-12 relative inline-block">
          What Our <span className="text-[#FD4F03]">Home Chefs</span> Say
          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#FD4F03]"></div>
        </h2>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-[#FFFFFF] rounded-[12px] p-8 border border-[#EEEEEE] shadow-[0_3px_12px_rgba(0,0,0,0.05)] text-left animate-in fade-in slide-in-from-bottom-3 duration-500"
                style={{ animationDelay: `${i * 60}ms`, animationFillMode: "backwards" }}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, j) => (
                    <Skeleton key={j} className="h-4 w-4 rounded-sm" />
                  ))}
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-11/12 mb-2" />
                <Skeleton className="h-4 w-3/4 mb-8" />
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-28 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Carousel className="w-full max-w-5xl mx-auto mt-4" opts={{ align: "start", loop: true }}>
            <CarouselContent>
              {testimonials.map((t, i) => (
                <CarouselItem key={t.id ?? i} className="md:basis-1/2 lg:basis-1/3 p-4">
                  <div className="bg-[#FFFFFF] rounded-[12px] p-8 border border-[#EEEEEE] shadow-[0_3px_12px_rgba(0,0,0,0.05)] h-full flex flex-col items-start text-left">
                    <div className="flex gap-1 mb-6">
                      {[...Array(5)].map((_, j) => (
                        <Star
                          key={j}
                          className={`h-4 w-4 ${j < t.rating ? "fill-[#FFA500] text-[#FFA500]" : "text-[#E8E8E8]"}`}
                        />
                      ))}
                    </div>
                    <p className="text-[#444444] mb-8 italic flex-1 font-medium leading-relaxed">&quot;{t.text}&quot;</p>
                    <div className="flex items-center gap-4 mt-auto">
                      <div className="h-12 w-12 rounded-full overflow-hidden relative bg-[#F1F8F3] shrink-0 border border-[#E8E8E8]">
                        <Image src={t.image} alt={t.name} fill className="object-cover" />
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-[#111111] text-sm">{t.name}</p>
                        <p className="text-xs text-[#666666]">{t.role}</p>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="flex justify-center gap-4 mt-10">
              <CarouselPrevious className="static transform-none bg-[#FFFFFF] border-[#E8E8E8] text-[#333333] hover:text-[#FD4F03] hover:border-[#FD4F03] shadow-sm rounded-full" />
              <CarouselNext className="static transform-none bg-[#FFFFFF] border-[#E8E8E8] text-[#333333] hover:text-[#FD4F03] hover:border-[#FD4F03] shadow-sm rounded-full" />
            </div>
          </Carousel>
        )}
      </div>
    </section>
  )
}
