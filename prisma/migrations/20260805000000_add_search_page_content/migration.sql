-- CreateTable
CREATE TABLE "search_page_content" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "bannerImageUrl" TEXT NOT NULL DEFAULT '',
    "heading" TEXT NOT NULL DEFAULT '',
    "subHeading" TEXT NOT NULL DEFAULT '',
    "cardsPerPage" INTEGER NOT NULL DEFAULT 12,
    "defaultSort" TEXT NOT NULL DEFAULT 'Relevance',
    "showRatings" BOOLEAN NOT NULL DEFAULT true,
    "kitchensCount" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_page_content_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_page_filter" (
    "id" TEXT NOT NULL,
    "searchPageContentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "options" TEXT[],
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "search_page_filter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_page_badge" (
    "id" TEXT NOT NULL,
    "searchPageContentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "search_page_badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_page_info_item" (
    "id" TEXT NOT NULL,
    "searchPageContentId" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT 'Heart',
    "title" TEXT NOT NULL,
    "subtitle" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'text-orange-500',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "search_page_info_item_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SearchPageContent_keyword_key" ON "search_page_content"("keyword");

-- CreateIndex
CREATE INDEX "SearchPageContent_isActive_idx" ON "search_page_content"("isActive");

-- CreateIndex
CREATE INDEX "SearchPageFilter_searchPageContentId_idx" ON "search_page_filter"("searchPageContentId");

-- CreateIndex
CREATE INDEX "SearchPageBadge_searchPageContentId_idx" ON "search_page_badge"("searchPageContentId");

-- CreateIndex
CREATE INDEX "SearchPageInfoItem_searchPageContentId_idx" ON "search_page_info_item"("searchPageContentId");

-- AddForeignKey
ALTER TABLE "search_page_filter" ADD CONSTRAINT "search_page_filter_searchPageContentId_fkey" FOREIGN KEY ("searchPageContentId") REFERENCES "search_page_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_page_badge" ADD CONSTRAINT "search_page_badge_searchPageContentId_fkey" FOREIGN KEY ("searchPageContentId") REFERENCES "search_page_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "search_page_info_item" ADD CONSTRAINT "search_page_info_item_searchPageContentId_fkey" FOREIGN KEY ("searchPageContentId") REFERENCES "search_page_content"("id") ON DELETE CASCADE ON UPDATE CASCADE;