import { notFound } from "next/navigation";
import { CategoryCuisineClient } from "@/components/categories/category-cuisine-client";
import { getKitchensByCategory } from "@/actions/catalog/home-data";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ");
  const display = name.charAt(0).toUpperCase() + name.slice(1);
  return {
    title: `${display} Kitchens`,
    description: `Browse home kitchens preparing ${name} cuisine`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryName = slug.replace(/-/g, " ");

  const category = await prisma.category.findFirst({
    where: { name: { equals: categoryName, mode: "insensitive" }, isActive: true },
  });
  if (!category) notFound();

  const kitchens = await getKitchensByCategory(categoryName);

  return <CategoryCuisineClient categoryName={categoryName} kitchens={kitchens} />;
}
