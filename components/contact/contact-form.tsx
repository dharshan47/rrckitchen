"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { submitContactForm } from "@/actions/contact/contact";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Phone,
  Pen,
  User,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

const contactSchema = z.object({
  fullName: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Please select a subject"),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000, "Message too long"),
})

type ContactForm = z.infer<typeof contactSchema>

export function ContactForm() {
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
    defaultValues: { fullName: "", email: "", phone: "", subject: "", message: "" },
  })

  const mutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: () => {
      toast.success("Message sent successfully! We'll get back to you within 24 hours.")
      reset()
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : "Failed to send message. Please try again.")
    },
  })

  const onSubmit = (data: ContactForm) => {
    mutation.mutate(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4.5 md:gap-4.5 space-y-4">
      {/* Full Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-fullName" className="text-[13px] font-semibold">
          Full Name
        </Label>
        <div className="relative flex items-center">
          <User size={16} className="absolute left-3.5 text-gray-400 pointer-events-none z-10" />
          <Input
            id="contact-fullName"
            type="text"
            placeholder="Enter your full name"
            className="pl-[40px] h-[42px] md:h-[44px] rounded-[10px]"
            {...register("fullName")}
          />
        </div>
        {errors.fullName && <p className="text-[12px] text-red-500 m-0">{errors.fullName.message}</p>}
      </div>

      {/* Email Address */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-email" className="text-[13px] font-semibold">
          Email Address
        </Label>
        <div className="relative flex items-center">
          <Mail size={16} className="absolute left-3.5 text-gray-400 pointer-events-none z-10" />
          <Input
            id="contact-email"
            type="email"
            placeholder="Enter your email address"
            className="pl-[40px] h-[42px] md:h-[44px] rounded-[10px]"
            {...register("email")}
          />
        </div>
        {errors.email && <p className="text-[12px] text-red-500 m-0">{errors.email.message}</p>}
      </div>

      {/* Phone Number */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-phone" className="text-[13px] font-semibold">
          Phone Number (Optional)
        </Label>
        <div className="relative flex items-center">
          <Phone size={16} className="absolute left-3.5 text-gray-400 pointer-events-none z-10" />
          <Input
            id="contact-phone"
            type="tel"
            placeholder="Enter your phone number"
            className="pl-[40px] h-[42px] md:h-[44px] rounded-[10px]"
            {...register("phone")}
          />
        </div>
      </div>

      {/* Subject */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-subject" className="text-[13px] font-semibold">
          Subject
        </Label>
        <div className="relative flex items-center">
          <Send size={16} className="absolute left-3.5 text-gray-400 pointer-events-none z-10" />
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full h-[42px] md:h-[44px] pl-[40px] pr-3.5 rounded-[10px]">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="order">Order Related</SelectItem>
                  <SelectItem value="delivery">Delivery Issue</SelectItem>
                  <SelectItem value="payment">Payment & Refund</SelectItem>
                  <SelectItem value="account">Account Issue</SelectItem>
                  <SelectItem value="feedback">Feedback</SelectItem>
                  <SelectItem value="partnership">Partnership</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {errors.subject && <p className="text-[12px] text-red-500 m-0">{errors.subject.message}</p>}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="contact-message" className="text-[13px] font-semibold">
          Message
        </Label>
        <div className="relative">
          <Pen size={16} className="absolute left-3.5 top-3.5 text-gray-400 pointer-events-none z-10" />
          <Textarea
            id="contact-message"
            placeholder="Type your message here..."
            className="pl-[40px] min-h-[110px] rounded-[10px]"
            {...register("message")}
          />
        </div>
        {errors.message && <p className="text-[12px] text-red-500 m-0">{errors.message.message}</p>}
      </div>

      {/* Submit */}
      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full h-[46px] md:h-[50px] rounded-[12px] mt-2 md:mt-4 cursor-pointer"
      >
        {mutation.isPending ? (
          <><Loader2 size={18} className="animate-spin" /> Sending...</>
        ) : mutation.isSuccess ? (
          <><CheckCircle2 size={18} /> Message Sent!</>
        ) : (
          <><Send size={18} /> Send Message</>
        )}
      </Button>

      <p className="text-[12px] text-gray-400 text-center m-0 mt-2">
        We value your privacy and will never share your information.
      </p>
    </form>
  );
}
