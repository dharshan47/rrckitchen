-- SearchPageBadge: add position field (left|right) to control which side of the kitchen card the badge renders on

ALTER TABLE "search_page_badge" ADD COLUMN "position" TEXT NOT NULL DEFAULT 'left';