"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button, Input, Card } from "@/components/ui";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import Link from "next/link";

const ticketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(200, "Subject too long"),
  description: z.string().min(10, "Please provide more detail (at least 10 characters)").max(2000, "Description too long"),
  orderId: z.string().optional(),
});

type TicketForm = z.infer<typeof ticketSchema>;

export default function ContactPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [submitted, setSubmitted] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketForm>({
    resolver: zodResolver(ticketSchema),
  });

  const submitMutation = useMutation({
    mutationFn: async (data: TicketForm) => {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: data.subject.trim(),
          description: data.description.trim(),
          orderId: data.orderId?.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed to submit" }));
        throw new Error(err.error || "Failed to submit ticket");
      }
    },
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Support ticket submitted!");
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to submit ticket");
    },
  });

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

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-8">
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
                      Deen Complex Mary&apos;s Corner Thanjavur, 613001, Tamil Nadu, India
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
                <p><span className="font-medium">Grievance cum Nodal Officer</span></p>
                <p className="text-muted-foreground">RRC Kitchen Marketplace Private Limited</p>
                <p className="text-muted-foreground">
                  Deen Complex Mary&apos;s Corner Thanjavur, 613001, Tamil Nadu, India
                </p>
                <p>
                  <span className="font-medium">Email:</span>{" "}
                  <a href="mailto:grievances@rrckitchen.com" className="text-primary hover:underline">
                    grievances@rrckitchen.com
                  </a>
                </p>
                <p className="text-muted-foreground">Mon &ndash; Sat (9:00 &ndash; 18:00)</p>
              </div>
            </div>
          </div>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Submit a Ticket</h2>

            {submitted ? (
              <div className="text-center py-8 space-y-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-100 mx-auto">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Ticket Submitted!</p>
                  <p className="text-sm text-muted-foreground mt-1">We&apos;ll get back to you as soon as possible.</p>
                </div>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => { setSubmitted(false); reset(); }}>
                    Submit Another
                  </Button>
                  {session && (
                    <Button asChild variant="outline">
                      <Link href="/account/orders">View Orders</Link>
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit((data) => submitMutation.mutate(data))} className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Subject *</label>
                  <Input
                    placeholder="Brief summary of your issue"
                    {...register("subject")}
                  />
                  {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description *</label>
                  <textarea
                    {...register("description")}
                    placeholder="Describe your issue in detail..."
                    rows={4}
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {errors.description && <p className="text-xs text-destructive mt-1">{errors.description.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">
                    Order ID <span className="text-muted-foreground font-normal">(optional)</span>
                  </label>
                  <Input
                    placeholder="Paste order ID if related to an order"
                    {...register("orderId")}
                  />
                </div>
                {!session && (
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-700 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>You are submitting anonymously.{" "}
                      <Link href="/login" className="font-semibold underline">Log in</Link> to track your tickets.
                    </span>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={submitMutation.isPending}>
                  {submitMutation.isPending ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" /> Submit Ticket</>
                  )}
                </Button>
              </form>
            )}
          </Card>
        </div>
      </div>
    </>
  );
}