"use client";

import Link from "next/link";
import Image from "next/image";
import { useKitchenCategories } from "@/hooks/useExploreKitchens";
import { getCategoryImageUrl } from "@/lib/category-images";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CategoriesPage() {
  const { data: categories = [] } = useKitchenCategories();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="mx-auto max-w-7xl px-4 lg:px-12 py-6">
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-muted-foreground -ml-2 mb-2 md:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <h1 className="text-xl font-bold">All Cuisines</h1>
        </div>

        {categories.length === 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {Array.from({ length: 14 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-full aspect-square md:rounded-2xl bg-muted animate-pulse" />
                <div className="h-3 w-16 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((cat) => {
              const imageUrl = getCategoryImageUrl(cat.name);
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className="relative w-full aspect-square md:rounded-2xl md:overflow-hidden md:bg-muted md:shadow-sm md:group-hover:shadow-md md:transition-shadow">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={cat.name}
                        fill
                        sizes="(max-width: 640px) 33vw, 25vw"
                        className="object-contain scale-110 p-2"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted md:rounded-2xl">
                        <span className="text-3xl font-bold text-muted-foreground/30">
                          {cat.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-bold text-center text-muted-foreground leading-tight truncate w-full">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
