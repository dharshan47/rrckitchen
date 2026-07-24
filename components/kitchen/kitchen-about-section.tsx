"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

interface KitchenAboutItem {
  name: string
  description: string | null
  orderCount: number
}

interface Props {
  displayName: string
  cuisineTags: string[]
  bestSellers: KitchenAboutItem[]
}

export function KitchenAboutSection({ displayName, cuisineTags, bestSellers }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const cuisineLabel = cuisineTags.length > 0 ? cuisineTags.join(", ") : "indian"
  const topItems = bestSellers.slice(0, 2)

  const firstItem = topItems[0]
  const otherItems = topItems.slice(1)

  return (
    <section className="space-y-10">
      {/* About Section */}
      <div>
         <h2 className="text-[19px] sm:text-[21px] font-extrabold text-foreground tracking-tight mb-4 px-1">
           About {displayName}
         </h2>
         <div className="bg-white rounded-[1.25rem] border border-gray-100/80 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-5 sm:p-6">
            <div className="space-y-5">
              {/* Always visible part 1 */}
              <div>
                <h3 className="font-extrabold text-foreground text-[15.5px] mb-1.5 tracking-tight">
                  Best-Selling Dishes at {displayName}
                </h3>
                <p className="text-[14px] text-[#555] leading-[1.6]">
                  {displayName} is a popular food destination in Kumbakonam, known for serving delicious {cuisineLabel.toLowerCase()} food. Customers can order from {displayName} for fresh preparation, satisfying portions, and flavorful dishes.
                </p>
              </div>

              {/* Always visible part 2 (first item) */}
              {firstItem && (
                <div>
                  <h3 className="font-extrabold text-foreground text-[15.5px] mb-1.5 tracking-tight">
                    {firstItem.name}
                  </h3>
                  <p className={cn("text-[14px] text-[#555] leading-[1.6]", !isExpanded && "line-clamp-2")}>
                    {firstItem.name} is one of the popular dishes at {displayName}. It is prepared with quality ingredients and offers a satisfying taste for customers ordering from Kumbakonam.
                  </p>
                  
                  {!isExpanded && (
                    <button 
                      onClick={() => setIsExpanded(true)}
                      className="text-[14px] font-bold text-[#EE7005] hover:text-[#EE7005]/90 flex items-center gap-0.5 transition-colors mt-2"
                    >
                      See more <ChevronDown className="h-4 w-4" />
                    </button>
                  )}
                </div>
              )}

              {/* Expanded content */}
              {isExpanded && (
                <div className="space-y-5 animate-in fade-in slide-in-from-top-1 duration-300">
                  {/* Rest of the items */}
                  {otherItems.map((item) => (
                    <div key={item.name}>
                      <h3 className="font-extrabold text-foreground text-[15.5px] mb-1.5 tracking-tight">
                        {item.name}
                      </h3>
                      <p className="text-[14px] text-[#555] leading-[1.6]">
                        {item.name} is another preferred item from the menu. It is a good choice for customers looking to enjoy tasty {cuisineLabel.toLowerCase()} food in Kumbakonam.
                      </p>
                    </div>
                  ))}

                  {/* Why Customers Love... */}
                  <div>
                    <h3 className="font-extrabold text-foreground text-[15.5px] mb-1.5 tracking-tight">
                      Why Customers Love Ordering from {displayName}
                    </h3>
                    <p className="text-[14px] text-[#555] leading-[1.6]">
                      Customers prefer {displayName} for its tasty food, reliable service, quick preparation, and menu choices. The restaurant serves {cuisineLabel.toLowerCase()} dishes along with options such as beverages, making it suitable for different food preferences.
                    </p>
                  </div>

                  {/* Enjoy Food... */}
                  <div>
                    <h3 className="font-extrabold text-foreground text-[15.5px] mb-1.5 tracking-tight">
                      Enjoy Food from {displayName} at Home with RRC Kitchen
                    </h3>
                    <p className="text-[14px] text-[#555] leading-[1.6]">
                      RRC Kitchen makes it easy to order food from {displayName} in Kumbakonam. Customers can browse the menu, choose their favorite dishes, place an order online, make secure payments, track the order live, and enjoy doorstep delivery from {displayName}.
                    </p>
                  </div>

                  {/* Discover More... */}
                  <div>
                    <h3 className="font-extrabold text-foreground text-[15.5px] mb-1.5 tracking-tight">
                      Discover More Restaurants in Kumbakonam
                    </h3>
                    <p className="text-[14px] text-[#555] leading-[1.6]">
                      Kumbakonam has many restaurants offering different cuisines, snacks, meals, desserts, and beverages. Customers exploring food delivery in Kumbakonam can discover more restaurants and order their favorite food online through RRC Kitchen.
                    </p>
                  </div>

                  <button 
                    onClick={() => setIsExpanded(false)}
                    className="text-[14px] font-bold text-[#EE7005] hover:text-[#EE7005]/90 flex items-center gap-0.5 transition-colors mt-2"
                  >
                    See less <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
         </div>
      </div>

      {/* FAQs Section */}
      <div>
         <h2 className="text-[19px] sm:text-[21px] font-extrabold text-foreground tracking-tight mb-4 px-1">
           FAQs about {displayName}
         </h2>
         
         <Accordion type="multiple" className="w-full space-y-3.5">
            <AccordionItem value="delivery" className="bg-white rounded-[1rem] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] px-5">
              <AccordionTrigger className="text-foreground font-bold text-[15px] py-4.5 hover:no-underline [&_svg]:text-[#EE7005]">
                Does {displayName} deliver food in Kumbakonam on RRC Kitchen?
              </AccordionTrigger>
              <AccordionContent className="text-[#666] leading-[1.6] text-[14px] pb-5 pr-4 pt-1">
                Yes, {displayName} delivers food in Kumbakonam through RRC Kitchen. Customers can order their favorite dishes online and enjoy doorstep delivery.
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="known-for" className="bg-white rounded-[1rem] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] px-5">
              <AccordionTrigger className="text-foreground font-bold text-[15px] py-4.5 hover:no-underline [&_svg]:text-[#EE7005]">
                What is {displayName} known for?
              </AccordionTrigger>
              <AccordionContent className="text-[#666] leading-[1.6] text-[14px] pb-5 pr-4 pt-1">
                {displayName} is highly regarded for its {cuisineLabel.toLowerCase()} specialties. We focus on quality ingredients, authentic recipes, and consistent taste.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="popular" className="bg-white rounded-[1rem] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] px-5">
              <AccordionTrigger className="text-foreground font-bold text-[15px] py-4.5 hover:no-underline [&_svg]:text-[#EE7005]">
                What are the most popular dishes at {displayName}?
              </AccordionTrigger>
              <AccordionContent className="text-[#666] leading-[1.6] text-[14px] pb-5 pr-4 pt-1">
                {topItems.length > 0 ? topItems.map(i => i.name).join(", ") : "Our signature dishes"} are highly recommended by our regular customers for their exceptional taste.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="veg" className="bg-white rounded-[1rem] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] px-5">
              <AccordionTrigger className="text-foreground font-bold text-[15px] py-4.5 hover:no-underline [&_svg]:text-[#EE7005]">
                Does {displayName} offer vegetarian options?
              </AccordionTrigger>
              <AccordionContent className="text-[#666] leading-[1.6] text-[14px] pb-5 pr-4 pt-1">
                Yes, {displayName} offers a variety of vegetarian dishes prepared with fresh ingredients and authentic flavors.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="order" className="bg-white rounded-[1rem] border border-gray-200/80 shadow-[0_2px_8px_rgba(0,0,0,0.02)] px-5">
              <AccordionTrigger className="text-foreground font-bold text-[15px] py-4.5 hover:no-underline [&_svg]:text-[#EE7005]">
                How can I order from {displayName} online?
              </AccordionTrigger>
              <AccordionContent className="text-[#666] leading-[1.6] text-[14px] pb-5 pr-4 pt-1">
                You can easily order online through RRC Kitchen. Just browse the menu, add your items to the cart, and proceed to checkout for quick delivery.
              </AccordionContent>
            </AccordionItem>
         </Accordion>
      </div>
    </section>
  )
}
