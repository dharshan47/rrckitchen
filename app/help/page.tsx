"use client";

import Image from "next/image";
import { 
  Search, ShoppingBag, Wallet, ChefHat, HelpCircle, 
  CheckCircle2, MessageSquare, PhoneCall, 
  ShieldCheck, ThumbsUp, Bike, User, Lock
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Accordion, AccordionContent, AccordionItem, AccordionTrigger 
} from "@/components/ui/accordion";
import {
  useHelpActiveCategory,
  useHelpActiveTab,
  useHelpActions,
} from "@/stores";
import { LiveChatWidget } from "@/components/chat/live-chat-widget";
import { useLiveChatStore } from "@/stores";

const CATEGORIES = [
  { id: "orders", icon: ShoppingBag, title: "Help with Orders", subtitle: "Track, cancel, return or modify orders", color: "text-orange-500" },
  { id: "delivery", icon: Bike, title: "Delivery Support", subtitle: "Delivery tracking, delays and related issues", color: "text-emerald-600" },
  { id: "payments", icon: Wallet, title: "Payments & Refunds", subtitle: "Payment methods, refunds and offers", color: "text-orange-500" },
  { id: "kitchens", icon: ChefHat, title: "For Kitchens", subtitle: "Kitchen onboarding, menu & earnings", color: "text-emerald-600" },
  { id: "partners", icon: Bike, title: "For Delivery Partners", subtitle: "Onboarding, earnings and guidelines", color: "text-orange-500" },
  { id: "general", icon: HelpCircle, title: "General Help", subtitle: "Policies, terms and other information", color: "text-emerald-600" }
];

const FAQ_DATA = {
  placing: [
    { q: "How to place an order?", a: "Browse kitchens and menus, add items to your cart, choose delivery address, select payment method and place your order. You will receive a confirmation once the kitchen accepts." },
    { q: "Order not going through?", a: "Please check your internet connection or try a different payment method. If the issue persists, contact our support team." },
  ],
  tracking: [
    { q: "How do I track my order?", a: "You can track your order in real-time on the 'My Orders' page once it has been accepted by the kitchen." },
    { q: "Where is my delivery partner?", a: "Once your order is picked up, you will see the delivery partner's location on the live map." },
  ],
  cancel: [
    { q: "Cancel or modify an order", a: "You can cancel or modify your order within 1 minute of placing it from the order details page." },
    { q: "Why was my order cancelled?", a: "Orders may be cancelled if the kitchen is unable to fulfill them or if there are payment issues." },
  ],
  returns: [
    { q: "How do I get a refund?", a: "Refunds for cancelled orders are processed automatically and will reflect in your account within 5-7 business days." },
    { q: "Food quality issue", a: "If you have issues with the food quality, please take a photo and contact support within 24 hours." },
  ],
  others: [
    { q: "Can I change my delivery address after placing an order?", a: "Delivery addresses cannot be changed once the order is placed to ensure timely delivery." },
    { q: "How to reorder from the same kitchen?", a: "Go to your 'My Orders' history and click the 'Reorder' button next to your past order." },
  ]
};

const SIDEBAR_TOPICS = [
  { id: "orders", icon: ShoppingBag, label: "Help with Orders" },
  { id: "delivery", icon: Bike, label: "Delivery Support" },
  { id: "payments", icon: Wallet, label: "Payments & Refunds" },
  { id: "kitchens", icon: ChefHat, label: "For Kitchens" },
  { id: "partners", icon: Bike, label: "For Delivery Partners" },
  { id: "general", icon: HelpCircle, label: "General Help" },
  { id: "safety", icon: ShieldCheck, label: "Safety & Trust" },
  { id: "account", icon: User, label: "Account & Profile" },
];

export default function HelpPage() {
  const activeCategory = useHelpActiveCategory();
  const activeTab = useHelpActiveTab();
  const actions = useHelpActions();
  const openChat = useLiveChatStore((state) => state.openChat);

  const activeCategoryInfo = CATEGORIES.find((c) => c.id === activeCategory) ?? CATEGORIES[0];

  return (
     <div className="min-h-screen bg-gray-50/40 flex flex-col items-center">
       {/* Hero Section */}
       <div className="w-full max-w-[1200px] px-4 md:px-8 pt-12 pb-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="max-w-xl">
             <h1 className="text-[46px] md:text-[60px] font-extrabold text-[#0D3025] leading-[1.1] mb-6 tracking-tight">
                How can we <br />
                <span className="text-[#FF5722]">help you?</span>
             </h1>
             <p className="text-gray-600 text-lg mb-8 max-w-[400px] font-medium leading-relaxed">
               Find answers to common questions or get help from our support team.
             </p>
             <div className="relative w-full max-w-md shadow-sm">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input 
                   placeholder="Search for help articles..." 
                   className="pl-14 pr-16 h-14 rounded-full border-gray-200 text-base shadow-sm focus-visible:ring-1 focus-visible:ring-emerald-500"
                />
                <Button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full h-10 w-10 p-0 bg-[#0D3025] hover:bg-[#0D3025]/90 shadow-md">
                   <Search className="h-5 w-5 text-white" />
                </Button>
             </div>
          </div>
          <div className="hidden md:block relative w-full max-w-[500px]">
             <Image 
                src="/help/help.webp" 
                alt="Help Support" 
                width={600} 
                height={500} 
                className="w-full h-auto object-contain"
                priority
             />
          </div>
       </div>

       {/* Horizontal Categories */}
       <div className="w-full max-w-[1200px] px-4 md:px-8 -mt-8 mb-10 relative z-10">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex overflow-x-auto custom-scrollbar">
             {CATEGORIES.map((cat) => (
                <div 
                  key={cat.id}
                  onClick={() => actions.setActiveCategory(cat.id)}
                  className={`flex flex-col items-center justify-center p-6 min-w-[170px] flex-1 cursor-pointer transition-colors border-b-[4px] ${
                    activeCategory === cat.id 
                    ? "border-[#FF5722] bg-orange-50/40" 
                    : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <div className={`p-3 rounded-full mb-3 shadow-sm bg-white border border-gray-100 flex items-center justify-center`}>
                     <cat.icon className={`h-6 w-6 ${cat.color} stroke-[2.5]`} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1.5 text-center">{cat.title}</h3>
                  <p className="text-[11px] text-gray-500 text-center max-w-[130px] leading-snug">{cat.subtitle}</p>
                </div>
             ))}
          </div>
       </div>

       {/* Main Content Layout */}
       <div className="w-full max-w-[1200px] px-4 md:px-8 pb-16 flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar */}
          <div className="w-full lg:w-[280px] shrink-0 flex flex-col gap-5">
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#0D3025] text-white p-4 font-bold text-sm">
                   Help Topics
                </div>
                <div className="py-2">
                   {SIDEBAR_TOPICS.map((topic, i) => {
                      const isActive = activeCategory === topic.id;
                      return (
                        <div 
                           key={i} 
                           onClick={() => actions.setActiveCategory(topic.id)}
                           className={`flex items-center gap-3 px-5 py-3.5 text-sm font-bold cursor-pointer transition-colors ${
                              isActive 
                              ? "text-[#FF5722] bg-orange-50/60" 
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                           }`}
                        >
                           <topic.icon className={`h-4 w-4 ${isActive ? "text-[#FF5722]" : "text-emerald-700"} stroke-[2.5]`} />
                           {topic.label}
                        </div>
                      );
                   })}
                </div>
             </div>

             <div className="bg-orange-50/60 rounded-xl p-6 text-center border border-orange-100/50">
                <h4 className="font-bold text-gray-900 mb-2">Can&apos;t find what you need?</h4>
                <p className="text-sm text-gray-600 mb-6 font-medium">Our support team is ready to help you.</p>
                <Button className="w-full bg-[#FF5722] hover:bg-[#F4511E] text-white font-bold h-11 rounded-lg shadow-sm shadow-orange-200">
                   <PhoneCall className="mr-2 h-4 w-4" />
                   Contact Support
                </Button>
             </div>
          </div>

          {/* Right Content */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col relative">
             {/* Fancy Header */}
             <div className="p-6 md:p-8 border-b border-gray-100 bg-gradient-to-r from-orange-50/80 to-white relative overflow-hidden">
                <div className="flex items-center gap-4 relative z-10">
                   <div className="p-3.5 bg-white rounded-xl shadow-sm border border-orange-100 flex items-center justify-center">
                      <activeCategoryInfo.icon className={`h-6 w-6 ${activeCategoryInfo.color} stroke-[2.5]`} />
                   </div>
                   <div>
                      <h2 className="text-[22px] font-bold text-gray-900 tracking-tight">{activeCategoryInfo.title}</h2>
                      <p className="text-[13px] text-gray-500 mt-1 font-medium">{activeCategoryInfo.subtitle}</p>
                   </div>
                </div>
             </div>

             <div className="p-6 md:p-8 flex-1 bg-white">
                {/* Sub-tabs */}
                <div className="flex flex-wrap gap-2 md:gap-3 mb-8">
                   {["Placing an Order", "Tracking Orders", "Cancel / Modify", "Returns & Refunds", "Others"].map((tab) => {
                      const tabKey = tab.toLowerCase().split(' ')[0];
                      return (
                        <div 
                           key={tab}
                           onClick={() => actions.setActiveTab(tabKey)}
                           className={`px-4 py-2 text-[13px] font-bold rounded-md border cursor-pointer transition-colors ${
                              activeTab === tabKey
                              ? "bg-[#0D3025] text-white border-[#0D3025]"
                              : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                           }`}
                        >
                           {tab}
                        </div>
                      );
                   })}
                </div>

                 {/* Accordions */}
                 <Accordion type="single" collapsible className="w-full space-y-3">
                    {(() => {
                       const faqs = FAQ_DATA[activeTab as keyof typeof FAQ_DATA] || FAQ_DATA.placing;
                       return faqs.map((faq, i) => (
                          <AccordionItem key={i} value={`item-${i}`} className="border border-gray-100 rounded-lg bg-gray-50/30 overflow-hidden px-1 hover:border-gray-200 transition-all data-[state=open]:bg-white data-[state=open]:border-emerald-100 data-[state=open]:shadow-sm">
                             <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-gray-50/50 transition-colors text-left">
                                <div className="flex items-center gap-3">
                                   <HelpCircle className="h-5 w-5 text-emerald-600 shrink-0 stroke-[2]" />
                                   <span className="font-bold text-gray-900 text-[15px]">{faq.q}</span>
                                </div>
                             </AccordionTrigger>
                             <AccordionContent className="px-4 pb-5 pt-0 text-left">
                                <div className="pl-8 text-gray-600 leading-relaxed text-[14px]">
                                   {faq.a}
                                </div>
                             </AccordionContent>
                          </AccordionItem>
                       ));
                    })()}
                 </Accordion>
              </div>

             {/* Bottom Contact Banner */}
             <div className="bg-gray-50/80 border border-emerald-100/50 p-6 flex flex-col md:flex-row items-center justify-between gap-6 m-6 mt-0 rounded-xl">
                <div className="flex items-center gap-4">
                   <div className="p-3 bg-white rounded-xl shadow-sm border border-emerald-100">
                      <ShieldCheck className="h-6 w-6 text-emerald-600 stroke-[2]" />
                   </div>
                   <div>
                      <h4 className="font-bold text-gray-900 text-[15px]">Need more help?</h4>
                      <p className="text-sm text-gray-500 font-medium">We&apos;re here for you 24/7</p>
                   </div>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                   <Button 
                      variant="outline" 
                      className="flex-1 md:flex-none border-gray-200 text-gray-700 font-bold bg-white hover:bg-gray-50 h-11 px-6 shadow-sm"
                      onClick={openChat}
                   >
                      <MessageSquare className="mr-2 h-4 w-4 text-emerald-600 stroke-[2.5]" />
                      Chat with Us
                   </Button>
                   <Button variant="outline" className="flex-1 md:flex-none border-orange-200 text-[#FF5722] font-bold bg-white hover:bg-orange-50 h-11 px-6 shadow-sm">
                      <PhoneCall className="mr-2 h-4 w-4 text-[#FF5722] stroke-[2.5]" />
                      Call Support
                   </Button>
                </div>
             </div>
          </div>
       </div>

       {/* Footer Info Row */}
       <div className="w-full bg-gray-50/50 border-t border-gray-200 py-10 mt-auto">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full border-2 border-orange-100 flex items-center justify-center text-orange-500 font-bold bg-orange-50 shrink-0 text-lg">
                   24
                </div>
                <div>
                   <h5 className="font-bold text-gray-900 text-[13px] mb-0.5">24/7 Support</h5>
                   <p className="text-[11px] text-gray-500 font-medium">We are always here to help you</p>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full border-2 border-emerald-100 flex items-center justify-center text-emerald-600 font-bold bg-emerald-50 shrink-0">
                   <CheckCircle2 className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                   <h5 className="font-bold text-gray-900 text-[13px] mb-0.5">Quick Solutions</h5>
                   <p className="text-[11px] text-gray-500 font-medium">Get fast and reliable solutions</p>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full border-2 border-orange-100 flex items-center justify-center text-orange-500 font-bold bg-orange-50 shrink-0">
                   <ThumbsUp className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                   <h5 className="font-bold text-gray-900 text-[13px] mb-0.5">Trusted by Thousands</h5>
                   <p className="text-[11px] text-gray-500 font-medium">Loved by kitchens and customers alike</p>
                </div>
             </div>
             
             <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full border-2 border-emerald-100 flex items-center justify-center text-emerald-600 font-bold bg-emerald-50 shrink-0">
                   <Lock className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                   <h5 className="font-bold text-gray-900 text-[13px] mb-0.5">Safe & Secure</h5>
                   <p className="text-[11px] text-gray-500 font-medium">Your data and privacy are our priority</p>
                </div>
             </div>
          </div>
       </div>

       <LiveChatWidget />
     </div>
  );
}
