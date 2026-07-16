"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle, ShoppingBag, FileText, AlertTriangle, Scale, BookOpen, Building2, Truck, Ticket, MessageSquare, CheckCircle2, Clock, ShieldCheck, AlertCircle } from "lucide-react";

const tabs = [
  {
    id: "orders",
    label: "Help with orders",
    icon: ShoppingBag,
    content: (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold">Placing an order</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Browse menus, add items to your cart, select your delivery address, choose a payment method, and place your order. You will receive a confirmation once the kitchen accepts.</p>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="how-to-order">
              <AccordionTrigger>How to place an order?</AccordionTrigger>
              <AccordionContent>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Browse available kitchens and their menus on the home page or search for specific dishes.</li>
                  <li>Tap on a dish to view details, then tap &quot;Add to Cart.&quot;</li>
                  <li>Review your cart, add delivery address, and apply any coupon codes.</li>
                  <li>Select your preferred payment method (UPI, Cards, Net Banking, Wallet, or COD).</li>
                  <li>Tap &quot;Place Order&quot; and wait for confirmation from the kitchen.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="not-going-through">
              <AccordionTrigger>Order not going through</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">If your order is not going through, try the following:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li>Check your internet connection.</li>
                  <li>Ensure your delivery address is complete and correct.</li>
                  <li>Make sure the kitchen is accepting orders for the selected time slot.</li>
                  <li>Try a different payment method.</li>
                  <li>Clear your app cache or try using a different browser.</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">If the issue persists, please contact our support team.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="modify-order">
              <AccordionTrigger>Cancel or modify an order</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">Orders can be cancelled or modified only before the kitchen starts preparing your food.</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li>Go to your orders page and find the order you want to change.</li>
                  <li>If the status is &quot;Pending&quot; or &quot;Confirmed,&quot; you may cancel or modify items.</li>
                  <li>Once the kitchen starts preparing (&quot;Preparing&quot; status), changes cannot be made.</li>
                  <li>For modifications after preparation has started, contact the kitchen directly through the support number provided in your order details.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold">Tracking your delivery</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Once your order is placed, you can track it in real-time from the order details page.</p>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="track-status">
              <AccordionTrigger>Order statuses explained</AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li><span className="font-semibold text-foreground">Pending</span> — Your order has been received and is waiting for the kitchen to accept.</li>
                  <li><span className="font-semibold text-foreground">Confirmed</span> — The kitchen has accepted your order and will start preparing soon.</li>
                  <li><span className="font-semibold text-foreground">Preparing</span> — The kitchen is currently cooking your food.</li>
                  <li><span className="font-semibold text-foreground">Ready for Pickup</span> — Your order is packed and ready. If you selected pickup, you can now collect it.</li>
                  <li><span className="font-semibold text-foreground">Out for Delivery</span> — A delivery partner has picked up your order and is on the way to your address.</li>
                  <li><span className="font-semibold text-foreground">Delivered</span> — Your order has been delivered successfully.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="live-track">
              <AccordionTrigger>Live tracking on map</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">When your order is out for delivery, you can see the delivery partner&apos;s live location on a map:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li>Open the order details page from your orders list.</li>
                  <li>Look for the &quot;Track Delivery&quot; button or the live map section.</li>
                  <li>The delivery partner&apos;s location updates in real-time so you know exactly when to expect your food.</li>
                </ol>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="eta">
              <AccordionTrigger>Estimated delivery time</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">The estimated delivery time is shown on the order confirmation page and the order tracking page. This is calculated based on:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li>Kitchen preparation time.</li>
                  <li>Distance between the kitchen and your delivery address.</li>
                  <li>Current traffic conditions.</li>
                  <li>Number of orders the kitchen is handling at that time.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold">Delivery &amp; COD</h2>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="cod-otp">
              <AccordionTrigger>What is COD OTP and how does it work?</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">For Cash on Delivery (COD) orders, you will receive a one-time password (OTP) via SMS on your registered mobile number once the delivery partner arrives at your location.</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li>You must share this OTP with the delivery partner to confirm delivery.</li>
                  <li>The OTP ensures that the order is delivered to the correct person at the correct address.</li>
                  <li>Please do not share the OTP with anyone except the delivery partner at your doorstep.</li>
                  <li>If you did not receive the OTP, check your SMS inbox or request a resend from the order tracking page.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rider-communication">
              <AccordionTrigger>How to communicate with the delivery partner</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">You can communicate with the delivery rider in the following ways:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li><span className="font-semibold text-foreground">Call the rider</span> — A call button is available on the order tracking page once the order is out for delivery.</li>
                  <li><span className="font-semibold text-foreground">Delivery instructions</span> — When placing the order, you can add delivery instructions in the address section (e.g., &quot;Leave at the gate,&quot; &quot;Call on arrival,&quot; &quot;Ring the bell twice&quot;).</li>
                  <li><span className="font-semibold text-foreground">Contact support</span> — If you cannot reach the rider, contact RRC Kitchen support who will coordinate with the delivery partner.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="after-delivery">
              <AccordionTrigger>After delivery - What to check</AccordionTrigger>
              <AccordionContent>
                <p className="text-sm text-muted-foreground">Once your order is delivered, please check the following:</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                  <li>Verify all items are present as per your order.</li>
                  <li>Check the packaging for any damage or tampering.</li>
                  <li>Confirm the food temperature and quality.</li>
                  <li>For COD orders, hand over the exact cash amount to the delivery partner.</li>
                </ul>
                <p className="text-sm text-muted-foreground mt-2">If anything is missing or incorrect, report it immediately through the order details page or contact support within 24 hours.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    ),
  },
  {
    id: "faq",
    label: "RRC Kitchen One FAQs",
    icon: BookOpen,
    content: (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground leading-relaxed">Everything you need to know about RRC Kitchen One.</p>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="what">
            <AccordionTrigger>What is RRC Kitchen One?</AccordionTrigger>
            <AccordionContent>RRC Kitchen One is a food ordering platform that connects you with local home chefs and kitchen partners. We focus on fresh, home-style meals prepared with care by local culinary experts in your area.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="areas">
            <AccordionTrigger>Which areas do you serve?</AccordionTrigger>
            <AccordionContent>We currently serve Thanjavur and surrounding areas. Please check the app or website for the latest serviceable locations. We are expanding to more areas soon.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="timings">
            <AccordionTrigger>What are the operating hours?</AccordionTrigger>
            <AccordionContent>Operating hours vary by kitchen partner. Each kitchen sets its own schedule and available time slots. You can see the available time slots on the kitchen&apos;s menu page before placing an order.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="how-order">
            <AccordionTrigger>How do I place an order for delivery?</AccordionTrigger>
            <AccordionContent>Simply browse the menu, add items to your cart, enter your delivery address, select a payment method, and place the order. You will receive updates at every stage from confirmation to delivery.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="payment-accepted">
            <AccordionTrigger>What payment methods are accepted?</AccordionTrigger>
            <AccordionContent>We accept multiple payment methods: UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking, Wallets, and Cash on Delivery (COD). Choose whatever is most convenient for you at checkout.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    ),
  },
  {
    id: "general",
    label: "General issues",
    icon: FileText,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">Facing issues with the app or website? Here are some common fixes.</p>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="loading">
            <AccordionTrigger>App or website not loading</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">If the app or website is not loading properly:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>Check your internet connection.</li>
                <li>Clear your browser cache and cookies.</li>
                <li>Try using a different browser or device.</li>
                <li>Disable any VPN or ad-blocker temporarily.</li>
                <li>Restart your device.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="account">
            <AccordionTrigger>Account and login issues</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">If you are having trouble with your account:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>Ensure you are using the correct mobile number linked to your account.</li>
                <li>Check for OTP delivery issues — SMS might be delayed due to network congestion.</li>
                <li>Try requesting the OTP again after 30 seconds.</li>
                <li>If you continue to face login issues, contact support for assistance.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="payment-issue">
            <AccordionTrigger>Payment failures</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">If your payment fails but the amount was deducted:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>The amount will be automatically refunded within 3-5 business days.</li>
                <li>If the amount is not refunded, please contact support with your transaction details.</li>
                <li>For COD orders, ensure you have the exact change ready.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="notification">
            <AccordionTrigger>Not receiving order notifications</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">If you are not getting order updates:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>Check that browser/device notifications are enabled for RRC Kitchen.</li>
                <li>Verify your mobile number is correct in your profile settings.</li>
                <li>Check your spam/junk folder for email notifications.</li>
                <li>You can always check the latest order status from the Orders page.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    ),
  },
  {
    id: "kitchen-partner",
    label: "Kitchen Partner Onboarding",
    icon: Building2,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">Want to list your kitchen on RRC Kitchen and reach more customers? Here is everything you need to know.</p>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="eligibility">
            <AccordionTrigger>Who can become a kitchen partner?</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">Any home chef or commercial kitchen in our service area can apply. You need:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>A valid FSSAI license (for commercial kitchens).</li>
                <li>Clean and hygienic cooking space.</li>
                <li>Consistent quality and timely preparation.</li>
                <li>Valid bank account for payouts.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="how-join">
            <AccordionTrigger>How to sign up as a kitchen partner?</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Click the &quot;Become a Chef&quot; banner on our homepage.</li>
                <li>Fill in your kitchen details, menu items, and pricing.</li>
                <li>Upload required documents (FSSAI, bank details, ID proof).</li>
                <li>Our team will review your application and verify the details.</li>
                <li>Once approved, your kitchen goes live on the platform!</li>
              </ol>
              <p className="text-sm text-muted-foreground mt-2"><Link href="/kitchen/signup" className="text-primary underline">Start your kitchen partner application here.</Link></p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="commission">
            <AccordionTrigger>Commission and payouts</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">Kitchen partners earn per order after a nominal platform fee. Payouts are settled weekly directly to your registered bank account. You can track your earnings and order history from the kitchen dashboard.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    ),
  },
  {
    id: "delivery-partner",
    label: "Delivery Partner Onboarding",
    icon: Truck,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">Want to earn money by delivering orders? Join RRC Kitchen as a delivery partner.</p>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="delivery-eligibility">
            <AccordionTrigger>Who can become a delivery partner?</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">To become a delivery partner, you need:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>A valid driving license (for two-wheeler or bike).</li>
                <li>Registration certificate (RC) of the vehicle.</li>
                <li>Valid insurance for the vehicle.</li>
                <li>A smartphone with internet access.</li>
                <li>Good knowledge of local areas and routes.</li>
                <li>Age 18 years or above.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="delivery-how-join">
            <AccordionTrigger>How to sign up as a delivery partner?</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Click the &quot;Deliver With Us&quot; banner on our homepage.</li>
                <li>Fill in your personal details, vehicle information, and upload documents.</li>
                <li>Complete the verification process (document verification + background check).</li>
                <li>Attend a brief training session (online).</li>
                <li>Start accepting delivery orders and earning!</li>
              </ol>
              <p className="text-sm text-muted-foreground mt-2"><Link href="/delivery-partner/signup" className="text-primary underline">Apply to become a delivery partner here.</Link></p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="delivery-earnings">
            <AccordionTrigger>How earnings work</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">Delivery partners earn per delivery completed. Your earnings include:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li><span className="font-semibold text-foreground">Base fare</span> — Fixed amount per delivery.</li>
                <li><span className="font-semibold text-foreground">Distance pay</span> — Additional pay based on distance traveled.</li>
                <li><span className="font-semibold text-foreground">Peak time bonus</span> — Extra earnings during busy hours.</li>
                <li><span className="font-semibold text-foreground">Incentives</span> — Performance-based bonuses for completing a target number of deliveries.</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">Earnings are settled weekly directly to your registered bank account.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="delivery-tips">
            <AccordionTrigger>Tips for delivery partners</AccordionTrigger>
            <AccordionContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Always keep your phone charged and internet active.</li>
                <li>Follow traffic rules and prioritize safety.</li>
                <li>Use the in-app navigation for accurate directions.</li>
                <li>Maintain proper hygiene — use a clean delivery bag.</li>
                <li>Communicate with customers if there are any delays.</li>
                <li>Confirm the COD OTP from the customer before completing delivery.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    ),
  },
  {
    id: "safety",
    label: "Report Safety Emergency",
    icon: AlertTriangle,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">Your safety is our priority. If you have a safety concern or emergency, please report it immediately.</p>
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-destructive">Emergency Contact</h3>
          <p className="text-xs text-muted-foreground">
            For immediate safety concerns, contact our support team at{" "}
            <a href="mailto:safety@rrckitchen.com" className="text-primary underline">safety@rrckitchen.com</a>{" "}
            or call our helpline.
          </p>
        </div>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="report">
            <AccordionTrigger>How to report a safety issue</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">You can report safety issues through the app/website by going to your order details and selecting &quot;Report an Issue.&quot; For urgent matters, please contact us directly via phone or email.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="food-safety">
            <AccordionTrigger>Food safety concerns</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">If you receive food that appears spoiled, undercooked, or contaminated, please do not consume it. Take a photo, report the issue immediately through the app, and contact our support team. We take food safety complaints very seriously and will investigate.</p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    ),
  },
  {
    id: "support",
    label: "How to Use Support",
    icon: Ticket,
    content: (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Ticket className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold">How to Use Support</h2>
            <p className="text-sm text-muted-foreground">Get help with orders, deliveries, payments, and more.</p>
          </div>
        </div>

        <div className="rounded-lg border border-border p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Need help? Create a support ticket
          </h3>
          <p className="text-sm text-muted-foreground">
            Our support system lets you create tickets, upload images for cross-verification, and track resolution in real-time.
          </p>
          <Link href="/support">
            <Button size="sm" className="mt-1">
              <Ticket className="h-4 w-4 mr-1.5" /> Go to Support
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-primary" />
              How to Use Support
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">Our support system lets you create tickets, upload images for cross-verification, and track resolution in real-time.</p>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">1</div>
              <div>
                <h3 className="font-semibold text-sm">Choose a Category</h3>
                <p className="text-sm text-muted-foreground mt-1">Select the category that best matches your issue — Order, Delivery, Food Quality, Payment, or Account.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">2</div>
              <div>
                <h3 className="font-semibold text-sm">Describe Your Issue</h3>
                <p className="text-sm text-muted-foreground mt-1">Provide a clear subject and detailed description. If related to an order, include the Order ID for faster resolution.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">3</div>
              <div>
                <h3 className="font-semibold text-sm">Attach Evidence (Optional)</h3>
                <p className="text-sm text-muted-foreground mt-1">Upload images of the issue — damaged packaging, incorrect items, or food quality concerns — for cross-verification and faster resolution.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">4</div>
              <div>
                <h3 className="font-semibold text-sm">Submit & Track</h3>
                <p className="text-sm text-muted-foreground mt-1">Submit your ticket and track its status in real-time. Our support team will respond and you can reply directly from the ticket.</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              Ticket Statuses Explained
            </h2>
            <div className="space-y-3">
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700"><AlertCircle className="h-3 w-3" /> Open</span>
                </div>
                <p className="text-xs text-muted-foreground">Your ticket is received and queued for review.</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700"><Clock className="h-3 w-3" /> In Progress</span>
                </div>
                <p className="text-xs text-muted-foreground">A support agent is actively working on your issue.</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"><CheckCircle2 className="h-3 w-3" /> Resolved</span>
                </div>
                <p className="text-xs text-muted-foreground">Your issue has been resolved. The ticket will close automatically.</p>
              </div>
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700"><CheckCircle2 className="h-3 w-3" /> Closed</span>
                </div>
                <p className="text-xs text-muted-foreground">The ticket is closed. Create a new one if you need further assistance.</p>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4 space-y-2">
              <h3 className="text-sm font-semibold flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Tips for Faster Resolution
              </h3>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /><span>Provide the correct Order ID when reporting order-related issues.</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /><span>Upload clear images of the issue for faster cross-verification.</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /><span>Be detailed in your description — include time, date, and what went wrong.</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /><span>Reply promptly to support agent messages to avoid delays.</span></li>
                <li className="flex items-start gap-2"><CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 shrink-0" /><span>Check existing tickets before creating a duplicate for the same issue.</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      ),
    },
  {
    id: "legal",
    label: "Legal, Terms & Conditions",
    icon: Scale,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">Read our legal policies and terms of service to understand your rights and responsibilities.</p>
        <div className="space-y-3">
          <Link href="/terms-of-use" className="block rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
            <h3 className="text-sm font-semibold">Terms of Use</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Terms and conditions for using RRC Kitchen platform.</p>
          </Link>
          <Link href="/privacy-policy" className="block rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
            <h3 className="text-sm font-semibold">Privacy Policy</h3>
            <p className="text-xs text-muted-foreground mt-0.5">How we collect, use, and protect your personal data.</p>
          </Link>
          <Link href="/contact" className="block rounded-lg border border-border p-3 hover:bg-muted/30 transition-colors">
            <h3 className="text-sm font-semibold">Contact Us</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Get in touch with our support team for any queries.</p>
          </Link>
        </div>
      </div>
    ),
  },
  {
    id: "faqs",
    label: "FAQs",
    icon: HelpCircle,
    content: (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">Answers to commonly asked questions.</p>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="hours">
            <AccordionTrigger>What are your delivery hours?</AccordionTrigger>
            <AccordionContent>Delivery hours vary by kitchen. Each kitchen sets its own schedule. Check the menu page for available time slots. Generally, most kitchens operate during breakfast (7-10 AM), lunch (11 AM-3 PM), and dinner (6-10 PM) hours.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="minimum">
            <AccordionTrigger>Is there a minimum order value?</AccordionTrigger>
            <AccordionContent>Minimum order value may apply depending on the kitchen and your location. The minimum is displayed at checkout before you place the order.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="coupon">
            <AccordionTrigger>How do I apply a coupon or promo code?</AccordionTrigger>
            <AccordionContent>You can apply a coupon code at checkout on the Cart page. Look for the &quot;View Coupon Offers&quot; section, enter your code, and tap Apply. The discount will be reflected in your order total.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="refund">
            <AccordionTrigger>How do refunds work?</AccordionTrigger>
            <AccordionContent>
              <p className="text-sm text-muted-foreground">Refunds are processed in the following cases:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mt-2">
                <li>Order cancelled by the kitchen after payment.</li>
                <li>Payment deducted but order not placed successfully.</li>
                <li>Items missing from the delivered order (partial refund).</li>
              </ul>
              <p className="text-sm text-muted-foreground mt-2">Refunds are processed within 3-5 business days to the original payment method.</p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="change-address">
            <AccordionTrigger>Can I change my delivery address after placing an order?</AccordionTrigger>
            <AccordionContent>You may be able to change the delivery address if the order is still in &quot;Pending&quot; or &quot;Confirmed&quot; status. Contact support immediately if you need to make a change. Once the order is in &quot;Preparing&quot; status, address changes are not possible.</AccordionContent>
          </AccordionItem>
          <AccordionItem value="report-issue">
            <AccordionTrigger>How to report an issue with my order?</AccordionTrigger>
            <AccordionContent>Go to your Orders page, select the order, and tap &quot;Report an Issue.&quot; You can describe the problem and attach photos. Our support team will review and get back to you within 24 hours.</AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    ),
  },
];

export default function HelpPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="mx-auto max-w-5xl px-4 lg:px-8 py-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-muted-foreground -ml-2 mb-4 md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <HelpCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Help &amp; Support</h1>
            <p className="text-sm text-muted-foreground">Let&apos;s take a step ahead and help you better.</p>
          </div>
        </div>

        <Tabs defaultValue="orders" orientation="vertical" className="hidden md:flex gap-6">
          <TabsList variant="line" className="w-64 shrink-0 h-fit bg-transparent p-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="justify-start gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium">
                  <Icon className="h-4 w-4 shrink-0" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          <div className="flex-1 min-w-0">
            {tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="rounded-xl border border-border p-4 md:p-6 mt-0">
                {tab.content}
              </TabsContent>
            ))}
          </div>
        </Tabs>

        <Tabs defaultValue="orders" className="md:hidden">
          <TabsList className="w-full overflow-x-auto flex-nowrap justify-start gap-1 bg-transparent p-0 pb-3 scrollbar-none">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger key={tab.id} value={tab.id} className="shrink-0 gap-1.5 px-3 py-2 rounded-lg text-xs font-medium">
                  <Icon className="h-3.5 w-3.5 shrink-0" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
          {tabs.map((tab) => (
            <TabsContent key={tab.id} value={tab.id} className="rounded-xl border border-border p-4 mt-0">
              {tab.content}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
