"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight } from "lucide-react"

const categories = [
  {
    name: "Breakfast",
    slug: "breakfast",
    image:
      "https://images.pexels.com/photos/376464/pexels-photo-376464.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "Lunch",
    slug: "lunch",
    image:
      "https://images.pexels.com/photos/5938/food-salad-healthy-lunch.jpg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "Dinner",
    slug: "dinner",
    image:
      "https://images.pexels.com/photos/691114/pexels-photo-691114.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "Veg Meals",
    slug: "veg-meals",
    image:
      "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "Non Veg Meals",
    slug: "non-veg-meals",
    image:
      "https://images.pexels.com/photos/2338407/pexels-photo-2338407.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "South Indian",
    slug: "south-indian",
    image:
      "https://images.pexels.com/photos/5560763/pexels-photo-5560763.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "North Indian",
    slug: "north-indian",
    image:
      "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "Healthy Meals",
    slug: "healthy-meals",
    image:
      "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "Kids Meals",
    slug: "kids-meals",
    image:
      "https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "Snacks",
    slug: "snacks",
    image:
      "https://images.pexels.com/photos/1624487/pexels-photo-1624487.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "Desserts",
    slug: "desserts",
    image:
      "https://images.pexels.com/photos/291528/pexels-photo-291528.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "Beverages",
    slug: "beverages",
    image:
      "https://images.pexels.com/photos/50593/coca-cola-cold-drink-soft-drink-coke-50593.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
]

export function WhatsOnYourMind() {
  return (
    <section>
      <div className="flex items-center justify-between gap-4 mb-6 sm:mb-8">
        <h2 className="text-[17px] sm:text-2xl lg:text-[1.65rem] font-bold text-black tracking-tight uppercase">
          What Would You Like To Eat?
        </h2>
        <Link
          href="/categories"
          className="flex items-center gap-1 sm:gap-1.5 text-[12px] sm:text-sm font-bold text-[#053F1F] hover:underline shrink-0"
        >
          View All Categories
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Horizontal scroll on mobile, 2 rows layout */}
      <div className="grid grid-rows-2 grid-flow-col gap-x-4 sm:gap-x-8 lg:gap-x-12 gap-y-6 sm:gap-y-10 overflow-x-auto pb-4 hide-scrollbar snap-x">
        {categories.map((cat) => (
          <Link
            key={cat.slug}
            href={`/categories/${cat.slug}`}
            className="flex flex-col items-center gap-3 group/cat w-[85px] sm:w-[110px] md:w-[130px] snap-start"
          >
            <div className="relative w-full aspect-square rounded-full overflow-hidden transition-transform duration-300 group-hover/cat:scale-105 shadow-[0_4px_20px_rgba(0,0,0,0.08)] bg-white">
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 85px, (max-width: 768px) 110px, 130px"
                className="object-cover"
              />
            </div>
            <span className="text-[12px] sm:text-[14px] font-bold text-center text-black group-hover/cat:text-[#FF4B00] transition-colors leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}

