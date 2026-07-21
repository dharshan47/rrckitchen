"use client"

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
  const cuisineLabel = cuisineTags.length > 0 ? cuisineTags.join(", ") : "delicious"
  const topItems = bestSellers.slice(0, 4)

  return (
    <section className="py-6 sm:py-8 max-w-4xl mx-auto">
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-base sm:text-lg font-extrabold text-foreground">
            About {displayName}
          </h2>
        </div>

        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed text-center max-w-3xl mx-auto">
          <p>
            {displayName} is a kitchen known for serving delicious {cuisineLabel.toLowerCase()} food.
            Customers can order from {displayName} for fresh preparation, satisfying portions, and flavorful dishes.
          </p>

          {topItems.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-foreground text-base">Best-Selling Dishes</h3>
              <div className="grid grid-cols-2 gap-3">
                {topItems.map((item) => (
                  <div key={item.name} className="rounded-xl border border-border bg-card p-3 text-left">
                    <span className="font-semibold text-foreground text-sm block">{item.name}</span>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {item.name} is one of the popular dishes at {displayName}, prepared with quality ingredients.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl bg-muted/50 p-4 sm:p-6 space-y-2">
            <h3 className="font-bold text-foreground text-base">Why Customers Love {displayName}</h3>
            <p>
              Customers prefer {displayName} for its tasty food, reliable service, quick preparation,
              and diverse menu choices. The kitchen serves {cuisineLabel.toLowerCase()} dishes,
              making it suitable for different food preferences.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="more" className="border rounded-xl px-4">
              <AccordionTrigger className="text-primary font-semibold text-sm py-3">
                Discover more about {displayName}
              </AccordionTrigger>
              <AccordionContent className="text-left space-y-3 pb-4">
                <p>RRC Kitchen makes it easy to order food from {displayName}. Customers can browse the menu, choose their favorite dishes, place an order online, make secure payments, track the order live, and enjoy doorstep delivery from {displayName}.</p>
                <p>Thanjavur has many kitchens offering different cuisines, snacks, meals, desserts, and beverages. Customers exploring food delivery in Thanjavur can discover more kitchens and order their favorite food online through RRC Kitchen.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>

      <div className="space-y-3 mt-8">
        <h2 className="text-base sm:text-lg font-extrabold text-foreground text-center">
          FAQs about {displayName}
        </h2>

        <Accordion type="multiple" className="w-full text-sm space-y-2">
          <AccordionItem value="delivery" className="border rounded-xl px-4">
            <AccordionTrigger className="font-semibold text-foreground text-sm py-3">
              Does {displayName} deliver food in Thanjavur?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-3">
              Yes, {displayName} delivers food in Thanjavur through RRC Kitchen. Customers can order their favorite dishes online and enjoy doorstep delivery.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="known-for" className="border rounded-xl px-4">
            <AccordionTrigger className="font-semibold text-foreground text-sm py-3">
              What is {displayName} known for?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-3">
              {displayName} is known for serving delicious {cuisineLabel.toLowerCase()} food with quality ingredients and satisfying portions.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="popular" className="border rounded-xl px-4">
            <AccordionTrigger className="font-semibold text-foreground text-sm py-3">
              What are the most popular dishes at {displayName}?
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground pb-3">
              {topItems.length > 0 ? topItems.map(i => i.name).join(", ") : "Various dishes"} are among the most popular items at {displayName}.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  )
}
