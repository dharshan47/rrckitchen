"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Clock } from "lucide-react";

export default function ContactPage() {
  const router = useRouter();

  return (
    <>
      <div className="md:hidden sticky top-0 z-10 bg-background border-b border-border px-4 h-12 flex items-center">
        <Button variant="ghost" size="icon-sm" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">
          Contact Us
        </h1>
        <p className="text-muted-foreground mb-10">
          Have a question, feedback, or need assistance? We&apos;re here to help.
        </p>

        <div className="grid gap-8 sm:grid-cols-2">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Get in Touch</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Email</p>
                  <a
                    href="mailto:support@rrckitchen.com"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    support@rrckitchen.com
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Phone</p>
                  <a
                    href="tel:+918015804580"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    +91 8015 8045 80
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Registered Office</p>
                  <p className="text-sm text-muted-foreground">
                    Deen Complex Mary&apos;s Corner Thanjavur, 613001, Tamil Nadu,
                    India
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium">Business Hours</p>
                  <p className="text-sm text-muted-foreground">
                    Mon &ndash; Sat: 9:00 AM &ndash; 6:00 PM
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Grievance Redressal</h2>
            <p className="text-sm text-muted-foreground">
              If you have any complaints or concerns regarding our services, you
              can contact our Grievance cum Nodal Officer:
            </p>
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              <p>
                <span className="font-medium">Grievance cum Nodal Officer</span>
              </p>
              <p className="text-muted-foreground">
                RRC Kitchen Marketplace Private Limited
              </p>
              <p className="text-muted-foreground">
                Deen Complex Mary&apos;s Corner Thanjavur, 613001, Tamil Nadu,
                    India
              </p>
              <p>
                <span className="font-medium">Email:</span>{" "}
                <a
                  href="mailto:grievances@rrckitchen.com"
                  className="text-primary hover:underline"
                >
                  grievances@rrckitchen.com
                </a>
              </p>
              <p className="text-muted-foreground">
                Mon &ndash; Sat (9:00 &ndash; 18:00)
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
