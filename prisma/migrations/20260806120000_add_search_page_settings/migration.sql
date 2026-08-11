-- SearchPageContent: add settings / layout / SEO fields
ALTER TABLE "search_page_content"
  ADD COLUMN "backgroundColor" TEXT NOT NULL DEFAULT '#F0FDF4',
  ADD COLUMN "metaTitle" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "metaDescription" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "keywords" TEXT NOT NULL DEFAULT '',
  ADD COLUMN "showKitchens" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showKitchensLimit" TEXT NOT NULL DEFAULT '32 kitchens',
  ADD COLUMN "showDishes" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showDishesLimit" TEXT NOT NULL DEFAULT '16 dishes',
  ADD COLUMN "showCategories" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showCategoriesLimit" TEXT NOT NULL DEFAULT '15 categories',
  ADD COLUMN "autoSuggest" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "recentSearches" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showKitchenBadges" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "showDistance" BOOLEAN NOT NULL DEFAULT true;

-- Kitchen card overrides per search page (admin can set card image / badge per kitchen)
CREATE TABLE "search_page_kitchen_card" (
  "id" TEXT NOT NULL,
  "searchPageContentId" TEXT NOT NULL,
  "kitchenPartnerId" TEXT NOT NULL,
  "imageUrl" TEXT,
  "badge" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "search_page_kitchen_card_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "search_page_kitchen_card_searchPageContentId_idx" ON "search_page_kitchen_card"("searchPageContentId");

ALTER TABLE "search_page_kitchen_card" ADD CONSTRAINT "search_page_kitchen_card_searchPageContentId_fkey" FOREIGN KEY ("searchPageContentId") REFERENCES "search_page_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
