"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Is there any joining fee?",
    a: "No, joining RRC Kitchen is completely free. There are no hidden charges or setup fees.",
  },
  {
    q: "Do I need a FSSAI license?",
    a: "We assist you in the process of obtaining an FSSAI registration if you don't already have one.",
  },
  {
    q: "How will I receive orders?",
    a: "You will receive orders directly through the RRC Kitchen Partner app or dashboard.",
  },
  {
    q: "Can I work from home?",
    a: "Yes! That's the whole point. You cook from your own home kitchen.",
  },
  {
    q: "How and when will I get paid?",
    a: "Payments are settled weekly directly into your bank account. You can track all earnings in your dashboard.",
  },
  {
    q: "What if I need help?",
    a: "We have a dedicated support team available to help you with any issues you face while taking or delivering orders.",
  },
  {
    q: "How do I set my menu for tomorrow?",
    a: "After logging in, use the Menu Builder to add items with prices, descriptions, and photos. Mark your availability for each time slot before the daily cutoff.",
  },
  {
    q: "What are the time slots for delivery?",
    a: "We offer four time slots: Morning Breakfast, Afternoon Lunch, Evening Snacks, and Night Dinner. You choose which slots to serve.",
  },
];

export function KitchenFAQ() {
  const leftFaqs = faqs.slice(0, Math.ceil(faqs.length / 2));
  const rightFaqs = faqs.slice(Math.ceil(faqs.length / 2));

  return (
    <Accordion type="single" collapsible className="w-full">
      <div className="grid md:grid-cols-2 gap-4 md:gap-8">
        <div className="space-y-4">
          {leftFaqs.map((faq, i) => (
            <AccordionItem key={i} value={`left-item-${i}`} className="border border-[#EEEEEE] bg-[#FFFFFF] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] px-6 overflow-hidden transition-colors hover:bg-[#FEFBF8] hover:border-[#E8E8E8]">
              <AccordionTrigger className="text-left font-semibold text-[#222222] hover:no-underline py-5 [&[data-state=open]>svg]:text-[#FD4F03] [&>svg]:text-[#222222]">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[#666666] text-sm leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </div>
        <div className="space-y-4">
          {rightFaqs.map((faq, i) => (
            <AccordionItem key={i} value={`right-item-${i}`} className="border border-[#EEEEEE] bg-[#FFFFFF] rounded-[10px] shadow-[0_2px_8px_rgba(0,0,0,0.05)] px-6 overflow-hidden transition-colors hover:bg-[#FEFBF8] hover:border-[#E8E8E8]">
              <AccordionTrigger className="text-left font-semibold text-[#222222] hover:no-underline py-5 [&[data-state=open]>svg]:text-[#FD4F03] [&>svg]:text-[#222222]">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-[#666666] text-sm leading-relaxed pb-5">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </div>
      </div>
    </Accordion>
  );
}
