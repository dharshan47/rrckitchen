"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "How do I register as a kitchen partner?",
    a: "Click the 'Register Kitchen' button, enter your mobile number, and complete the OTP verification. Fill in your kitchen details, menu items, and availability slots.",
  },
  {
    q: "What are the time slots for delivery?",
    a: "We offer four time slots: Morning Breakfast (7-10 AM), Afternoon Lunch (12-3 PM), Evening Snacks (4-6 PM), and Night Dinner (7-10 PM). You can choose which slots to serve.",
  },
  {
    q: "How do I set my menu for tomorrow?",
    a: "After logging in, use the Menu Builder to add items with prices, descriptions, and photos. Mark your availability for each time slot before the daily cutoff.",
  },
  {
    q: "When do I get paid?",
    a: "Payments are settled weekly. You can track your earnings and order history from your kitchen dashboard.",
  },
  {
    q: "Can I update my menu after publishing?",
    a: "Yes, you can update your menu at any time before the cutoff. Changes after cutoff will apply to the next day's menu.",
  },
  {
    q: "What kitchen equipment do I need?",
    a: "A standard home kitchen with basic cooking equipment is sufficient. We focus on home-style cooking using fresh ingredients.",
  },
  {
    q: "Is there a minimum order requirement?",
    a: "No minimum order requirement. You can offer as many or as few items as you'd like for each time slot.",
  },
];

export function KitchenFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-3xl font-bold tracking-tight text-center mb-10">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-white overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="flex items-center justify-between w-full px-6 py-4 text-left"
              >
                <span className="font-medium text-sm">{faq.q}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    openIndex === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-muted-foreground leading-6">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
