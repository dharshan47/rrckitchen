import { notFound } from "next/navigation";
import { CategoryCuisineClient } from "@/components/categories/category-cuisine-client";
import prisma from "@/lib/prisma";
import { cached } from "@/lib/server-cache";
import type { Metadata } from "next";

function getCategory(slug: string) {
  return cached(`category:${slug}`, 60_000, () =>
    prisma.category.findFirst({
      where: { name: { equals: slug.replace(/-/g, " "), mode: "insensitive" }, isActive: true },
    }),
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const name = slug.replace(/-/g, " ");
  const display = name.charAt(0).toUpperCase() + name.slice(1);

  const category = await cached(`category-content:${slug}`, 60_000, () =>
    prisma.category.findFirst({
      where: { name: { equals: name, mode: "insensitive" }, isActive: true },
      include: {
        categoryPageContent: {
          select: { metaTitle: true, metaDescription: true, keywords: true, canonicalUrl: true },
        },
      },
    }),
  );

  if (category?.categoryPageContent?.metaTitle) {
    return {
      title: category.categoryPageContent.metaTitle,
      description: category.categoryPageContent.metaDescription || `Browse home kitchens preparing ${name} cuisine`,
      keywords: category.categoryPageContent.keywords,
      alternates: category.categoryPageContent.canonicalUrl
        ? { canonical: category.categoryPageContent.canonicalUrl }
        : { canonical: `/categories/${slug}` },
    };
  }

  return {
    title: `${display} Kitchens`,
    description: `Browse home kitchens preparing ${name} cuisine`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categoryName = slug.replace(/-/g, " ");

  const category = await getCategory(slug);
  if (!category) notFound();

  return <CategoryCuisineClient categoryName={categoryName} />;
}
