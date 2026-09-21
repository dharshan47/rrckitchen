"use client";

import Image from "next/image";
import { 
  Search, ArrowRight, CheckCircle2, Ticket, ShieldCheck, Mail, Phone, 
  MessageSquare, FileText, ChevronRight, HelpCircle, Package, User, 
  ChefHat, Truck, CreditCard, AlertTriangle, BookOpen, Clock, AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLiveChatStore } from "@/stores";
import dynamic from "next/dynamic";
const LiveChatWidget = dynamic(() => import("@/components/chat/live-chat-widget").then(mod => mod.LiveChatWidget), { ssr: false });

// Help Topics based on input.txt and screenshots
const helpTopics = [
  { id: "account", label: "Account & Login Issues", desc: "Login problems, password reset, account locked, access issues", icon: User, iconColor: "text-[#087A36]", bg: "bg-[#EAF7EF]" },
  { id: "otp", label: "OTP & Verification", desc: "OTP not received, resend not working, verification failed", icon: ShieldCheck, iconColor: "text-[#FF731A]", bg: "bg-[#FFF1E7]" },
  { id: "order", label: "Orders", desc: "Order placement, changes, cancellations, refunds", icon: Package, iconColor: "text-[#FF731A]", bg: "bg-[#FFF8F2]" },
  { id: "payment", label: "Payments", desc: "Payment failed, refunds, wallet, transactions", icon: CreditCard, iconColor: "text-[#7C3AED]", bg: "bg-[#F4EEFF]" },
  { id: "menus", label: "Menus & Items", desc: "Menu related issues, availability, customization, prices", icon: FileText, iconColor: "text-[#087A36]", bg: "bg-[#EAF7EF]" },
  { id: "delivery", label: "Delivery Issues", desc: "Late delivery, delivery location, partial delivery, delays", icon: Truck, iconColor: "text-[#7C3AED]", bg: "bg-[#F4EEFF]" },
  { id: "track-order", label: "Track Order Issues", desc: "Tracking not updating, wrong status, tracking errors", icon: CheckCircle2, iconColor: "text-[#087A36]", bg: "bg-[#EAF7EF]" },
  { id: "reviews", label: "Reviews & Ratings", desc: "Review not showing, rating issues, feedback", icon: Ticket, iconColor: "text-[#F59E0B]", bg: "bg-[#FFF7E6]" }, 
  { id: "notifications", label: "Notifications", desc: "Alerts not received, update issues, preferences", icon: AlertCircle, iconColor: "text-[#FF731A]", bg: "bg-[#FFF1E7]" }, 
  { id: "kitchen", label: "Kitchen Partner Support", desc: "Menu management, orders, payouts, dashboard issues", icon: ChefHat, iconColor: "text-[#FF731A]", bg: "bg-[#FFF1E7]" },
  { id: "delivery-partner", label: "Delivery Partner Support", desc: "Earnings, delivery app issues, OTP issues, account help", icon: Truck, iconColor: "text-[#7C3AED]", bg: "bg-[#F4EEFF]" },
  { id: "other", label: "General Support", desc: "Other issues, app bugs, feature requests", icon: HelpCircle, iconColor: "text-[#087A36]", bg: "bg-[#EAF7EF]" },
];

export function SupportClient() {
  const openChat = useLiveChatStore((state) => state.openChat);

  return (
    <div className="bg-[#FEFEFE] min-h-screen text-[#334155]" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* HERO SECTION */}
      <section className="relative px-4 pt-10 pb-16 md:px-8 overflow-hidden" 
               style={{ 
                 background: "linear-gradient(135deg, #FFF8F2 0%, #FFF4EA 50%, #FFFDF9 100%)",
                 borderBottom: "1px solid #F9DCC5",
                 borderBottomLeftRadius: "24px",
                 borderBottomRightRadius: "24px"
               }}>
        <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="flex-1 max-w-xl relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight text-[#0F172A]">
              <span className="text-[#087A36]">Hi!</span> How can<br />we help you today?
            </h1>
            <p className="text-[#475569] text-base md:text-lg mb-8 max-w-md leading-relaxed">
              We&apos;re here to help and make your experience smooth and worry-free.
            </p>
            
            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Search for help articles, topics or keywords..." 
                className="w-full h-14 pl-5 pr-14 rounded-xl border border-[#E5E7EB] bg-white text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:ring-2 focus:ring-[#087A36]/30 shadow-sm text-[15px]"
              />
              <button className="absolute right-2 top-2 bottom-2 w-12 bg-[#087A36] hover:bg-[#06652D] text-white rounded-lg flex items-center justify-center transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-[#64748B] mr-2">Popular searches:</span>
              {["Login Issues", "Order Issues", "Payment Failed", "Delivery Delay", "OTP Not Received"].map(tag => (
                <button key={tag} className="px-3 py-1.5 text-xs font-medium bg-white border border-[#E5E7EB] rounded-full text-[#334155] hover:bg-[#F3FAF5] hover:border-[#CDEBD8] hover:text-[#087A36] transition-colors shadow-sm">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 relative hidden md:block max-w-[450px]">
            <Image 
              src="/support/support.webp" 
              alt="Support 3D illustration" 
              width={500} 
              height={500} 
              className="w-full h-auto object-contain drop-shadow-xl z-10 relative"
              priority
            />
          </div>
        </div>
      </section>

      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-12 md:py-16 space-y-16">
        
        {/* ROLE CARDS */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Who are you seeking help for?</h2>
          <p className="text-[#475569] mb-8 text-[15px]">Select an option to get personalized support</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            <button className="group p-5 bg-white border border-[#E5E7EB] hover:border-[#087A36] hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)] rounded-[14px] transition-all flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-[#EAF7EF] text-[#087A36] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <User className="w-7 h-7" />
              </div>
              <div className="flex-1 pr-2 text-left">
                <h3 className="font-bold text-[#0F172A] text-[17px] mb-1.5">I&apos;m a Customer</h3>
                <p className="text-sm text-[#475569] leading-relaxed mb-3">Get help with orders, payments, menus, delivery & more</p>
                <div className="flex justify-end w-full">
                  <ArrowRight className="w-5 h-5 text-[#0F172A] group-hover:text-[#087A36] transition-colors" />
                </div>
              </div>
            </button>

            <button className="group p-5 bg-white border border-[#E5E7EB] hover:border-[#E5E7EB] hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)] rounded-[14px] transition-all flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-[#FFF1E7] text-[#FF731A] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <ChefHat className="w-7 h-7" />
              </div>
              <div className="flex-1 pr-2 text-left">
                <h3 className="font-bold text-[#0F172A] text-[17px] mb-1.5">I&apos;m a Kitchen Partner</h3>
                <p className="text-sm text-[#475569] leading-relaxed mb-3">Get support for kitchen dashboard, orders, payouts & more</p>
                <div className="flex justify-end w-full">
                  <ArrowRight className="w-5 h-5 text-[#0F172A] transition-colors" />
                </div>
              </div>
            </button>

            <button className="group p-5 bg-white border border-[#E5E7EB] hover:border-[#E5E7EB] hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)] rounded-[14px] transition-all flex items-start gap-4">
              <div className="w-14 h-14 rounded-full bg-[#F4EEFF] text-[#7C3AED] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Truck className="w-7 h-7" />
              </div>
              <div className="flex-1 pr-2 text-left">
                <h3 className="font-bold text-[#0F172A] text-[17px] mb-1.5">I&apos;m a Delivery Partner</h3>
                <p className="text-sm text-[#475569] leading-relaxed mb-3">Get help with deliveries, earnings, app issues & more</p>
                <div className="flex justify-end w-full">
                  <ArrowRight className="w-5 h-5 text-[#0F172A] transition-colors" />
                </div>
              </div>
            </button>
          </div>
        </section>

        {/* HELP TOPICS */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-[#0F172A]">Browse Help Topics</h2>
            <button className="text-[#087A36] font-semibold text-sm flex items-center gap-1 hover:text-[#06652D]">
              View all topics <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            {helpTopics.map(topic => {
              const Icon = topic.icon;
              return (
                <button key={topic.id} className="group p-5 bg-white border border-[#E5E7EB] hover:border-[#E5E7EB] hover:bg-[#FAFFFC] hover:shadow-[0_6px_18px_rgba(15,23,42,0.07)] rounded-[12px] transition-all text-left flex items-start gap-4 h-full">
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform", topic.bg, topic.iconColor)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 flex flex-col justify-between h-full min-w-0">
                    <div>
                      <h3 className="font-bold text-[#0F172A] text-[15px] mb-1 leading-tight">{topic.label}</h3>
                      <p className="text-[13px] text-[#475569] leading-snug line-clamp-2">{topic.desc}</p>
                    </div>
                    <div className="flex justify-end mt-4">
                      <ArrowRight className="w-4 h-4 text-[#64748B] group-hover:text-[#0F172A] transition-colors" />
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        {/* TWO COLUMNS: Need More Help & Highlights */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Need More Help */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#F4FAF6] to-[#FFFFFF] border border-[#D7EBDD] rounded-[16px] p-6 md:p-8 flex flex-col md:flex-row gap-8 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
            <div className="flex-1">
              <h2 className="text-[22px] font-bold text-[#0F172A] mb-1">Need more help?</h2>
              <p className="text-[#475569] text-sm mb-6">Our support team is ready to assist you.</p>
              <div className="relative h-[200px] w-[240px] hidden md:block mt-auto mx-auto lg:mx-0">
                <Image src="/support/women.webp" alt="Support Agent" fill className="object-contain object-bottom" />
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              <div 
                className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer"
                onClick={openChat}
              >
                <div className="w-10 h-10 rounded-full bg-[#EAF7EF] text-[#087A36] flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#0F172A] text-sm">Live Chat</h4>
                  <p className="text-[12px] text-[#64748B] truncate">Chat with our support team in real-time</p>
                </div>
                <div className="flex flex-col gap-1 items-end shrink-0">
                   <span className="text-[10px] font-bold bg-[#EAF7EF] text-[#087A36] px-2 py-0.5 rounded-full uppercase tracking-wide">Live</span>
                   <button className="text-sm font-semibold text-[#087A36] hover:text-[#06652D]">Chat Now</button>
                </div>
              </div>

              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#FFF1E7] text-[#FF731A] flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#0F172A] text-sm">Email Support</h4>
                  <p className="text-[12px] text-[#64748B] truncate">support@rrckitchen.com</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">We reply within 24 hours</p>
                </div>
                <div className="shrink-0">
                  <button className="text-sm font-semibold text-[#087A36] hover:text-[#06652D] px-2">Send Email</button>
                </div>
              </div>

              <div className="bg-white rounded-[12px] border border-[#E5E7EB] p-4 flex items-center gap-4 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-[#EAF7EF] text-[#087A36] flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-[#0F172A] text-sm">Call Support</h4>
                  <p className="text-[12px] text-[#64748B] truncate">+91 98765 43210</p>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Mon - Sat (9:00 AM - 9:00 PM)</p>
                </div>
                <div className="shrink-0">
                  <button className="text-sm font-semibold text-[#087A36] hover:text-[#06652D] px-2">Call Now</button>
                </div>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className="lg:col-span-1 bg-[#FAF7FF] border border-[#E9DDFB] rounded-[16px] p-6 md:p-8 shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
             <h3 className="text-lg font-bold text-[#4C1D95] mb-6">Support Center Highlights</h3>
             <div className="space-y-6">
               {[
                 { icon: CheckCircle2, title: "Fast & Friendly Support", desc: "We're here to help you quickly" },
                 { icon: Clock, title: "24/7 Assistance", desc: "Get help anytime you need" },
                 { icon: ShieldCheck, title: "Secure & Reliable", desc: "Your data and privacy are safe" },
                 { icon: MessageSquare, title: "Multiple Channels", desc: "Chat, Email or Call us easily" }
               ].map((h, i) => (
                 <div key={i} className="flex gap-4">
                   <div className="w-10 h-10 rounded-full bg-[#F4EEFF] text-[#7C3AED] flex items-center justify-center shrink-0">
                      <h.icon className="w-5 h-5" />
                   </div>
                   <div>
                     <h4 className="font-bold text-[#0F172A] text-[15px] mb-0.5">{h.title}</h4>
                     <p className="text-[13px] text-[#475569]">{h.desc}</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </section>

        {/* Quick Links */}
        <section>
          <h3 className="text-lg font-bold text-[#0F172A] mb-4">Quick Links</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { icon: BookOpen, title: "Help Articles", desc: "Step-by-step guides", color: "text-[#087A36]", bg: "bg-[#EAF7EF]" },
              { icon: AlertTriangle, title: "Report an Issue", desc: "Facing an issue? Let us know", color: "text-[#FF731A]", bg: "bg-[#FFF1E7]" },
              { icon: Ticket, title: "Submit a Ticket", desc: "We'll get back to you", color: "text-[#7C3AED]", bg: "bg-[#F4EEFF]" },
              { icon: FileText, title: "Terms & Policies", desc: "Read our policies", color: "text-[#2563EB]", bg: "bg-[#EFF6FF]" },
              { icon: Package, title: "App & Features", desc: "Learn more about app", color: "text-[#087A36]", bg: "bg-[#EAF7EF]" },
            ].map((q, i) => (
              <button key={i} className="bg-white border border-[#E5E7EB] hover:shadow-[0_4px_16px_rgba(15,23,42,0.05)] rounded-[12px] p-4 flex flex-col gap-3 items-start transition-all text-left">
                 <div className={cn("w-9 h-9 rounded-full flex items-center justify-center shrink-0", q.bg, q.color)}>
                   <q.icon className="w-4 h-4" />
                 </div>
                 <div>
                   <h4 className="font-bold text-[#0F172A] text-sm mb-0.5">{q.title}</h4>
                   <p className="text-[11px] text-[#64748B]">{q.desc}</p>
                 </div>
              </button>
            ))}
          </div>
        </section>

        {/* Satisfaction Banner */}
        <section className="bg-[#F4FAF6] border border-[#D7EBDD] rounded-[16px] p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
           <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-full bg-[#EAF7EF] text-[#087A36] flex items-center justify-center shrink-0 shadow-sm border border-[#CDEBD8]">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <div>
               <h3 className="font-bold text-[#0F172A] text-base md:text-lg mb-1">Your satisfaction is our priority!</h3>
               <p className="text-sm text-[#475569]">If you don&apos;t find the answer you&apos;re looking for, our support team will help you personally.</p>
             </div>
           </div>
           <button className="bg-white border border-[#087A36] text-[#087A36] hover:bg-[#F3FAF5] px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors whitespace-nowrap w-full md:w-auto shadow-sm">
             Contact Support
           </button>
        </section>

      </div>
      <LiveChatWidget />
    </div>
  );
}
