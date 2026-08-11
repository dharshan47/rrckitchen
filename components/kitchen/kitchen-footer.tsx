import Link from "next/link";
import { Phone, Mail, Clock } from "lucide-react";
import { FaFacebook, FaInstagram, FaYoutube, FaWhatsapp } from "react-icons/fa";

export function KitchenFooter() {
  return (
    <footer className="bg-[#003F23] py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="mb-6">
              <span className="text-3xl font-bold font-serif italic text-[#FD4F03]">RRC <span className="text-[#7BAF72]">Kitchen</span></span>
              <p className="text-sm italic text-[#D7E8DE] mt-1 font-serif">Every Homemaker is a Chef</p>
            </div>
            <p className="text-sm text-[#D7E8DE] leading-6 mb-8 pr-4">
              RRC Kitchen is India&apos;s trusted platform that connects home chefs with food lovers. Cook with love, earn with pride.
            </p>
            
            <div className="flex gap-3">
              <Link href="#" className="w-9 h-9 rounded-full bg-[#1877F2] flex items-center justify-center hover:opacity-90 transition-opacity">
                <FaFacebook className="text-white h-5 w-5" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-[#E4405F] flex items-center justify-center hover:opacity-90 transition-opacity">
                <FaInstagram className="text-white h-5 w-5" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-[#FF0000] flex items-center justify-center hover:opacity-90 transition-opacity">
                <FaYoutube className="text-white h-5 w-5" />
              </Link>
              <Link href="#" className="w-9 h-9 rounded-full bg-[#25D366] flex items-center justify-center hover:opacity-90 transition-opacity">
                <FaWhatsapp className="text-white h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#C8E6C9] mb-4">Quick Links</h4>
            <div className="flex flex-col gap-3">
              <Link href="/" className="text-sm text-[#FFFFFF] hover:text-[#FD4F03] transition-colors">
                Home
              </Link>
              <Link href="#why-partner" className="text-sm text-[#FFFFFF] hover:text-[#FD4F03] transition-colors">
                Why Partner With Us
              </Link>
              <Link href="#how-it-works" className="text-sm text-[#FFFFFF] hover:text-[#FD4F03] transition-colors">
                How It Works
              </Link>
              <Link href="#requirements" className="text-sm text-[#FFFFFF] hover:text-[#FD4F03] transition-colors">
                Requirements
              </Link>
              <Link href="#faq" className="text-sm text-[#FFFFFF] hover:text-[#FD4F03] transition-colors">
                FAQ
              </Link>
              <Link href="/contact" className="text-sm text-[#FFFFFF] hover:text-[#FD4F03] transition-colors">
                Contact Us
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#C8E6C9] mb-4">For Partners</h4>
            <div className="flex flex-col gap-3">
              <Link href="/kitchen/signup" className="text-sm text-[#FFFFFF] hover:text-[#FD4F03] transition-colors">
                Join as a Home Chef
              </Link>
              <Link href="#" className="text-sm text-[#FFFFFF] hover:text-[#FD4F03] transition-colors">
                Partner Benefits
              </Link>
              <Link href="#" className="text-sm text-[#FFFFFF] hover:text-[#FD4F03] transition-colors">
                Success Stories
              </Link>
              <Link href="#" className="text-sm text-[#FFFFFF] hover:text-[#FD4F03] transition-colors">
                Resources
              </Link>
              <Link href="#" className="text-sm text-[#FFFFFF] hover:text-[#FD4F03] transition-colors">
                Help Center
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-[#C8E6C9] mb-4">Get in Touch</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#7BAF72] mt-0.5" />
                <span className="text-sm text-[#FFFFFF]">+91 98765 43210</span>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#7BAF72] mt-0.5" />
                <span className="text-sm text-[#FFFFFF]">partner@rrckitchen.com</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-[#7BAF72] mt-0.5" />
                <span className="text-sm text-[#FFFFFF]">9:00 AM - 7:00 PM (Mon - Sat)</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-[#D7E8DE]">We&apos;re here to help!</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-16 pt-8 border-t border-[#006F3D]/30 flex flex-col items-center justify-center">
          <p className="text-sm text-[#B9D3C4]">
            &copy; 2024 RRC Kitchen Partner Program. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
