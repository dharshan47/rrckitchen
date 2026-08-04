import { Metadata } from "next";
import { AboutUsClient } from "@/components/about/about-us-client";

export const metadata: Metadata = {
  title: "About Us | RRC Kitchen",
  description: "Learn more about RRC Kitchen, our mission, values, and how we connect you with passionate home chefs.",
};

export default function AboutUsPage() {
  return <AboutUsClient />;
}
