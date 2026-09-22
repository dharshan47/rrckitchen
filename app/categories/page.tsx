import { Metadata } from "next";
import { CategoriesClient } from "@/components/categories/categories-client";

export const metadata: Metadata = {
  title: "Categories",
  description: "Explore a wide variety of homemade meals from talented home chefs by cuisine, meal time and preference.",
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}
