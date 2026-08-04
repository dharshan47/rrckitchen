import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { ContactForm } from "@/components/contact/contact-form";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ChevronRight,
  Headset,
  ShoppingBag,
  UserCircle,
  ArrowRight,
  IndianRupee,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contact Us | RRC Kitchen",
  description: "Have a question, feedback, or need support? Reach out to RRC Kitchen and we'll get back to you within 24 hours.",
};

export default function ContactPage() {
  return (
    <div className="w-full overflow-x-hidden bg-white">
      {/* ─── Hero / Header Section ─── */}
      <section className="relative px-6 pt-8 pb-10 overflow-hidden">
        {/* Decorative orange blobs */}
        <div className="absolute w-[220px] h-[220px] rounded-full pointer-events-none z-0 bg-[radial-gradient(circle,rgba(238,112,5,0.12)_0%,transparent_70%)] -top-[60px] right-[80px]" />
        <div className="absolute w-[140px] h-[140px] rounded-full pointer-events-none z-0 bg-[radial-gradient(circle,rgba(238,112,5,0.08)_0%,transparent_70%)] -bottom-[20px] left-[60px]" />
        <div className="absolute w-[100px] h-[100px] rounded-full pointer-events-none z-0 bg-[radial-gradient(circle,rgba(238,112,5,0.06)_0%,transparent_70%)] top-[40%] right-[30%]" />

        <div className="relative z-10 max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
          <div className="flex-1 text-center md:text-left">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-3 flex justify-center md:justify-start">
              <ol className="flex items-center gap-1.5 text-[13px] text-gray-500 m-0 p-0">
                <li>
                  <Link href="/" className="hover:text-[#EE7005] transition-colors">
                    Home
                  </Link>
                </li>
                <li className="flex items-center text-gray-400">
                  <ChevronRight size={14} />
                </li>
                <li>
                  <span className="text-gray-800 font-medium">
                    Contact Us
                  </span>
                </li>
              </ol>
            </nav>

            <h1 className="text-[26px] md:text-[36px] font-extrabold text-[#1a1a1a] m-0 mb-1 tracking-tight leading-tight">
              Contact Us
            </h1>
            <p className="text-[16px] md:text-[22px] font-bold text-[#EE7005] m-0 mb-4">
              We&apos;re here to help!
            </p>
            <div className="w-full max-w-[400px] h-px bg-gradient-to-r from-gray-200 to-transparent mb-3.5 mx-auto md:mx-0" />
            <p className="text-[13px] md:text-[14px] text-gray-500 leading-relaxed m-0">
              Have a question, feedback, or need support?
              <br />
              Reach out to us and we&apos;ll get back to you as soon as
              possible.
            </p>
          </div>

          <div className="shrink-0 w-[200px] md:w-[280px] lg:w-[340px] flex justify-center">
            <Image
              src="/contact/contact-header.webp"
              alt="Contact us illustration with envelope and phone"
              width={360}
              height={240}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* ─── Main Content: Reach Us + Form ─── */}
      <section className="px-4 md:px-6 py-6 md:py-10 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 bg-white border border-gray-100 rounded-[12px] md:rounded-[16px] p-5 md:p-10 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          {/* Left Column - Reach Us */}
          <div>
            <h2 className="text-[19px] md:text-[22px] font-bold text-[#1a1a1a] m-0 mb-6 pb-2.5 border-b-[3px] border-[#EE7005] inline-block">Reach Us</h2>

            {/* Email Card */}
            <div className="flex items-start gap-3 md:gap-4 py-3.5 md:py-4 border-b border-gray-100">
              <div className="w-[42px] h-[42px] md:w-[48px] md:h-[48px] rounded-full flex items-center justify-center shrink-0 border-2 border-[#FFE4CC] bg-[#FFF3E6] text-[#EE7005]">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] m-0 mb-1">Email Us</h3>
                <a
                  href="mailto:support@rrckitchen.com"
                  className="text-[14px] text-[#EE7005] font-medium block mb-0.5 transition-colors hover:text-[#d45e00] hover:underline"
                >
                  support@rrckitchen.com
                </a>
                <p className="text-[13px] text-gray-400 m-0">
                  We usually reply within 24 hours
                </p>
              </div>
            </div>

            {/* Phone Card */}
            <div className="flex items-start gap-3 md:gap-4 py-3.5 md:py-4 border-b border-gray-100">
              <div className="w-[42px] h-[42px] md:w-[48px] md:h-[48px] rounded-full flex items-center justify-center shrink-0 border-2 border-[#dcfce7] bg-[#E8F5E9] text-[#16A34A]">
                <Phone size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] m-0 mb-1">Call Us</h3>
                <a href="tel:+918015804580" className="text-[14px] text-[#EE7005] font-medium block mb-0.5 transition-colors hover:text-[#d45e00] hover:underline">
                  +91 8015 8045 80
                </a>
                <p className="text-[13px] text-gray-400 m-0">
                  Mon – Sat (9:00 AM – 6:00 PM)
                </p>
              </div>
            </div>

            {/* Office Card */}
            <div className="flex items-start gap-3 md:gap-4 py-3.5 md:py-4 border-b border-gray-100">
              <div className="w-[42px] h-[42px] md:w-[48px] md:h-[48px] rounded-full flex items-center justify-center shrink-0 border-2 border-[#FFE4CC] bg-[#FFF3E6] text-[#EE7005]">
                <MapPin size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] m-0 mb-1">Registered Office</h3>
                <p className="text-[14px] text-gray-600 leading-[1.6] m-0">
                  Deen Complex Mary&apos;s Corner,
                  <br />
                  Thanjavur, 613001,
                  <br />
                  Tamil Nadu, India
                </p>
              </div>
            </div>

            {/* Business Hours Card */}
            <div className="flex items-start gap-3 md:gap-4 py-3.5 md:py-4">
              <div className="w-[42px] h-[42px] md:w-[48px] md:h-[48px] rounded-full flex items-center justify-center shrink-0 border-2 border-[#dcfce7] bg-[#E8F5E9] text-[#16A34A]">
                <Clock size={20} />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-semibold text-[#1a1a1a] m-0 mb-1">Business Hours</h3>
                <p className="text-[14px] text-gray-600 leading-[1.6] m-0">
                  Mon – Sat: 9:00 AM – 6:00 PM
                  <br />
                  Sunday: Closed
                </p>
              </div>
            </div>

            {/* Need instant help */}
            <div className="flex flex-wrap md:flex-nowrap items-center justify-center md:justify-start text-center md:text-left gap-2.5 md:gap-3.5 mt-6 p-3.5 md:px-5 md:py-4 bg-[#FFF8F2] border border-[#FFE4CC] rounded-xl">
              <div className="w-[48px] h-[48px] rounded-full bg-gradient-to-br from-[#EE7005] to-[#ff8c38] text-white flex items-center justify-center shrink-0">
                <Headset size={24} />
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold text-[#1a1a1a] m-0 mb-0.5">
                  Need instant help?
                </p>
                <p className="text-[12px] text-gray-500 m-0 leading-[1.5]">
                  Visit our Support Center to create and
                  <br className="hidden sm:block" />
                  track your support tickets.
                </p>
              </div>
              <Link href="/support" className="inline-flex items-center justify-center w-full md:w-auto mt-1 md:mt-0 px-4.5 py-2 bg-white text-[#EE7005] text-[13px] font-semibold border-2 border-[#EE7005] rounded-lg transition-colors hover:bg-[#EE7005] hover:text-white whitespace-nowrap">
                Go to Support
              </Link>
            </div>
          </div>

          {/* Right Column - Contact Form */}
          <div className="relative">
            <h2 className="text-[19px] md:text-[22px] font-bold text-[#1a1a1a] m-0 mb-1.5">Send Us a Message</h2>
            <p className="text-[14px] text-gray-500 m-0 mb-6">
              Fill out the form below and we&apos;ll get back to you.
            </p>

            <ContactForm />
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section className="px-3.5 md:px-6 py-8 md:py-12 border-t border-gray-100">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-[20px] md:text-[24px] font-bold text-[#1a1a1a] text-center m-0 mb-6 md:mb-9">Frequently Asked Questions</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 md:gap-6">
            {/* Orders & Delivery */}
            <div className="flex items-start gap-4 p-[18px] md:p-6 bg-white border border-gray-100 rounded-[14px] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
              <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 bg-[#FFF3E6] text-[#EE7005]">
                <ShoppingBag size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-bold text-[#1a1a1a] m-0 mb-1.5">
                  Orders &amp; Delivery
                </h3>
                <p className="text-[13px] text-gray-500 leading-[1.55] m-0 mb-2.5">
                  Track orders, delivery times, cancellations and more.
                </p>
                <Link href="/help" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#EE7005] transition-colors hover:text-[#d45e00]">
                  View FAQs <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Payments & Refunds */}
            <div className="flex items-start gap-4 p-[18px] md:p-6 bg-white border border-gray-100 rounded-[14px] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
              <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 bg-[#E8F5E9] text-[#16A34A]">
                <IndianRupee size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-bold text-[#1a1a1a] m-0 mb-1.5">
                  Payments &amp; Refunds
                </h3>
                <p className="text-[13px] text-gray-500 leading-[1.55] m-0 mb-2.5">
                  Payments, refunds, offers and wallet related queries.
                </p>
                <Link href="/help" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#EE7005] transition-colors hover:text-[#d45e00]">
                  View FAQs <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Account & Profile */}
            <div className="flex items-start gap-4 p-[18px] md:p-6 bg-white border border-gray-100 rounded-[14px] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.06)] hover:-translate-y-0.5">
              <div className="w-[48px] h-[48px] rounded-full flex items-center justify-center shrink-0 bg-[#F3E8FF] text-[#9333EA]">
                <UserCircle size={22} />
              </div>
              <div className="flex-1">
                <h3 className="text-[15px] font-bold text-[#1a1a1a] m-0 mb-1.5">
                  Account &amp; Profile
                </h3>
                <p className="text-[13px] text-gray-500 leading-[1.55] m-0 mb-2.5">
                  Login issues, profile updates and account related help.
                </p>
                <Link href="/help" className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#EE7005] transition-colors hover:text-[#d45e00]">
                  View FAQs <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Grievance Redressal Section ─── */}
      <section className="bg-[#F0F7F0] px-3.5 md:px-6 py-8 md:py-12">
        <div className="max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-12 items-center text-center md:text-left">
          {/* Left */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#1a1a1a] m-0 mb-3.5">Grievance Redressal</h2>
            <p className="text-[13px] md:text-[14px] text-gray-600 leading-[1.7] m-0 mb-6">
              If you have any complaints or concerns regarding our services, you
              can contact our Grievance cum Nodal Officer.
            </p>
            <Link href="/grievance-policy" className="inline-flex items-center px-[22px] py-2.5 bg-white text-[#2e7d32] text-[14px] font-semibold border-2 border-[#2e7d32] rounded-[10px] transition-colors hover:bg-[#2e7d32] hover:text-white mx-auto md:mx-0">
              View Grievance Policy
            </Link>
          </div>

          {/* Right */}
          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-5">
            {/* Decorative icon */}
            <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#2e7d32] to-[#43a047] text-white flex items-center justify-center shrink-0">
              <Headset size={28} />
            </div>

            <div className="flex-1">
              <h3 className="text-[16px] font-bold text-[#1a1a1a] m-0 mb-1.5">
                Grievance cum Nodal Officer
              </h3>
              <p className="text-[13px] font-semibold text-gray-600 m-0 mb-1.5">
                RRC Kitchen Marketplace Private Limited
              </p>
              <p className="text-[13px] text-gray-500 leading-[1.6] m-0 mb-3.5">
                Deen Complex Mary&apos;s Corner,
                <br />
                Thanjavur, 613001, Tamil Nadu, India
              </p>

              <div className="flex items-center justify-center md:justify-start gap-2 text-[13px] text-gray-600 mb-1.5">
                <Mail size={14} className="text-[#2e7d32] shrink-0" />
                <a href="mailto:grievances@rrckitchen.com" className="text-[#2e7d32] font-medium transition-colors hover:underline">
                  grievances@rrckitchen.com
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-[13px] text-gray-600 mb-1.5">
                <Phone size={14} className="text-[#2e7d32] shrink-0" />
                <a href="tel:+918015804580" className="text-[#2e7d32] font-medium transition-colors hover:underline">
                  +91 8015 8045 80
                </a>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-2 text-[13px] text-gray-600 mb-1.5">
                <Clock size={14} className="text-[#2e7d32] shrink-0" />
                <span>Mon – Sat (9:00 AM – 6:00 PM)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social Connect Footer ─── */}
      <section className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-5 px-3.5 md:px-6 py-5 md:py-7 border-t border-gray-100">
        <p className="text-[13px] md:text-[14px] text-gray-500 m-0">
          You can also connect with us on
        </p>
        <div className="flex items-center gap-3">
          <a
            href="https://instagram.com/rrckitchen"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="w-[38px] h-[38px] rounded-full border border-gray-200 flex items-center justify-center text-gray-700 transition-all hover:bg-[#EE7005] hover:border-[#EE7005] hover:text-white hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6m9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8 1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5 5 5 0 0 1-5 5 5 5 0 0 1-5-5 5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3 3 3 0 0 0 3 3 3 3 0 0 0 3-3 3 3 0 0 0-3-3z" />
            </svg>
          </a>
          <a
            href="https://facebook.com/rrckitchen"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="w-[38px] h-[38px] rounded-full border border-gray-200 flex items-center justify-center text-gray-700 transition-all hover:bg-[#EE7005] hover:border-[#EE7005] hover:text-white hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
            </svg>
          </a>
          <a
            href="https://twitter.com/rrckitchen"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="w-[38px] h-[38px] rounded-full border border-gray-200 flex items-center justify-center text-gray-700 transition-all hover:bg-[#EE7005] hover:border-[#EE7005] hover:text-white hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
            </svg>
          </a>
          <a
            href="https://youtube.com/rrckitchen"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="YouTube"
            className="w-[38px] h-[38px] rounded-full border border-gray-200 flex items-center justify-center text-gray-700 transition-all hover:bg-[#EE7005] hover:border-[#EE7005] hover:text-white hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M10 15l5.19-3L10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z" />
            </svg>
          </a>
        </div>
      </section>
    </div>
  );
}
