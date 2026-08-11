"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Package,
  Users,
  UtensilsCrossed,
  Soup,
  Box,
  ShieldCheck,
  Quote,
  Heart,
  StarHalf,
} from "lucide-react";
import { useKitchenReviews, useKitchenReviewsLoading, useKitchenReviewsQuery } from "@/stores";
import type { KitchenDetail } from "@/components/kitchen/kitchen-detail-client";
import type { KitchenReview } from "@/stores/kitchenReviewsStore";
import { ReviewsKitchenTabSkeleton } from "@/components/kitchen/kitchen-tab-skeletons";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  kitchen: KitchenDetail;
}

function renderStars(rating: number, size = "h-4 w-4") {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => {
        const isFull = s <= Math.floor(rating);
        const isHalf = !isFull && s === Math.ceil(rating);
        const Icon = isHalf ? StarHalf : Star;

        return (
          <Icon
            key={s}
            className={`${size} ${isFull || isHalf ? "fill-[#FF4D00] text-[#FF4D00]" : "fill-[#EEEEEE] text-[#EEEEEE]"}`}
          />
        );
      })}
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-[#FFFFFF] rounded-[26px] p-5 md:p-6 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] flex flex-col ${className}`}>{children}</div>;
}

function Title({ children }: { children: React.ReactNode }) {
  return <h3 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#111827] mb-4">{children}</h3>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function avgAspect(reviews: KitchenReview[], pick: (r: KitchenReview) => number | null | undefined) {
  const values = reviews.map(pick).filter((v): v is number => typeof v === "number");
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function countAspect(reviews: KitchenReview[], pick: (r: KitchenReview) => number | null | undefined) {
  return reviews.filter((r) => typeof pick(r) === "number").length;
}

function formatCount(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k+`;
  if (count > 0) return `${count}+`;
  return "0";
}

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function ReviewsKitchenTab({ kitchen }: Props) {
  useKitchenReviewsQuery(kitchen.id);
  const reviews = useKitchenReviews();
  const isStoreLoading = useKitchenReviewsLoading();

  const [starFilter, setStarFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const avgRating =
    kitchen.avgRating ??
    (reviews.length > 0 ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10 : null);
  const totalReviewsCount = reviews.length > 0 ? reviews.length : kitchen.totalReviews;

  const starCounts = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      const rounded = Math.min(5, Math.max(1, Math.round(r.rating)));
      counts[rounded as keyof typeof counts]++;
    });
    return counts;
  }, [reviews]);
  const totalStarCount = reviews.length || 1;

  const recommendPercent = reviews.length > 0 ? Math.round((reviews.filter((r) => r.rating >= 4).length / reviews.length) * 100) : 0;

  const tasteAvg = avgAspect(reviews, (r) => r.tasteRating);
  const packagingAvg = avgAspect(reviews, (r) => r.packagingRating);
  const portionAvg = avgAspect(reviews, (r) => r.portionSizeRating);

  const aspectItems = [
    { label: "Taste & Flavors", icon: Soup, rating: tasteAvg, count: countAspect(reviews, (r) => r.tasteRating) },
    { label: "Packaging", icon: Box, rating: packagingAvg, count: countAspect(reviews, (r) => r.packagingRating) },
    { label: "Portion Size", icon: UtensilsCrossed, rating: portionAvg, count: countAspect(reviews, (r) => r.portionSizeRating) },
  ].filter((item) => item.rating != null);

  const loveItems = useMemo(() => {
    const pct = (num: number, den: number) => (den > 0 ? Math.round((num / den) * 100) : 0);
    const items: { label: string; icon: React.ComponentType<{ className?: string; strokeWidth?: number }>; pct: number }[] = [];
    const tasteReviews = reviews.filter((r) => typeof r.tasteRating === "number");
    if (tasteReviews.length > 0) {
      items.push({ label: "Great taste", icon: Soup, pct: pct(tasteReviews.filter((r) => (r.tasteRating ?? 0) >= 4).length, tasteReviews.length) });
    }
    const packagingReviews = reviews.filter((r) => typeof r.packagingRating === "number");
    if (packagingReviews.length > 0) {
      items.push({ label: "Neat packaging", icon: Package, pct: pct(packagingReviews.filter((r) => (r.packagingRating ?? 0) >= 4).length, packagingReviews.length) });
    }
    const portionReviews = reviews.filter((r) => typeof r.portionSizeRating === "number");
    if (portionReviews.length > 0) {
      items.push({ label: "Right portion size", icon: UtensilsCrossed, pct: pct(portionReviews.filter((r) => (r.portionSizeRating ?? 0) >= 4).length, portionReviews.length) });
    }
    if (reviews.length > 0) {
      items.push({ label: "Highly rated (4★+)", icon: ThumbsUp, pct: pct(reviews.filter((r) => r.rating >= 4).length, reviews.length) });
    }
    return items;
  }, [reviews]);

  const latestReview = reviews[0];

  const allPhotos = useMemo(
    () => reviews.flatMap((r) => (r.mediaUrls ?? []).map((url) => ({ url, reviewId: r.id }))),
    [reviews]
  );

  const visibleReviews = useMemo(() => {
    const list = starFilter === "all" ? [...reviews] : reviews.filter((r) => Math.round(r.rating) === Number(starFilter));
    if (sortBy === "highest") list.sort((a, b) => b.rating - a.rating);
    else if (sortBy === "lowest") list.sort((a, b) => a.rating - b.rating);
    return list;
  }, [reviews, starFilter, sortBy]);

  if (isStoreLoading) {
    return <ReviewsKitchenTabSkeleton />;
  }

  return (
    <div className="w-full flex flex-col gap-4 md:gap-5 pb-8">
      {/* ROW 1: 3 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">

        {/* Overall Rating */}
        <Card className="lg:col-span-3 items-center text-center justify-center">
          <h3 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#111827] mb-2 w-full text-left">Overall Rating</h3>
          <div className="text-[56px] font-extrabold text-[#087A36] leading-none mb-3 mt-2">
            {avgRating != null ? avgRating.toFixed(1) : "—"}
          </div>
          <div className="mb-2">{renderStars(avgRating ?? 0, "h-5 w-5")}</div>
          <p className="text-[11px] text-[#171717] font-semibold mb-6">Based on {totalReviewsCount} Reviews</p>

          <div className="bg-[#F0F8F3] border border-[#D9EBDD] rounded-xl p-4 flex items-center gap-3 w-full justify-center">
            <ThumbsUp className="w-7 h-7 text-[#087A36] shrink-0" strokeWidth={2} />
            <div className="text-left">
              <div className="font-extrabold text-[#087A36] text-[15px] leading-tight mb-0.5">
                {reviews.length > 0 ? `${recommendPercent}%` : "—"}
              </div>
              <div className="text-[10px] text-[#555555] font-semibold leading-tight">
                Customers recommend<br />{kitchen.displayName}
              </div>
            </div>
          </div>
        </Card>

        {/* Rating Overview & Key Aspects */}
        <Card className="lg:col-span-6 p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row h-full">
            {/* Left: Overview */}
            <div className="w-full md:w-[35%] p-5 md:p-6 border-b md:border-b-0 md:border-r border-[#EEEEEE]">
              <h3 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#111827] mb-1">Rating Overview</h3>
              <p className="text-[11px] text-[#555555] font-medium mb-6">Based on {totalReviewsCount} customer reviews</p>

              <div className="space-y-3">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = starCounts[star as keyof typeof starCounts];
                  const pct = (count / totalStarCount) * 100;
                  return (
                    <div key={star} className="flex items-center gap-3 text-[12px] font-bold text-[#555555]">
                      <div className="flex items-center gap-1 w-6 shrink-0 text-[#171717]">
                        {star} <Star className="h-3 w-3 fill-[#FF4D00] text-[#FF4D00]" />
                      </div>
                      <Progress value={pct} className="h-2 w-full bg-[#EEEEEE] [&>div]:bg-[#087A36]" />
                      <span className="w-8 shrink-0 text-right text-[#555555] font-medium text-[11px]">({count})</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Key Aspects */}
            <div className="w-full md:w-[65%] p-5 md:p-6 flex flex-col">
              <h3 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#111827] mb-6">Rating on Key Aspects</h3>

              {aspectItems.length > 0 ? (
                <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 mb-6">
                  {aspectItems.map((item, idx) => (
                    <div key={idx} className="flex flex-col items-center text-center">
                      <div className="w-10 h-10 rounded-[12px] bg-[#FFFFFF] border border-[#EEEEEE] shadow-sm flex items-center justify-center mb-2 shrink-0">
                        <item.icon className="w-5 h-5 text-[#087A36]" strokeWidth={1.5} />
                      </div>
                      <span className="text-[9px] font-bold text-[#171717] leading-tight h-[20px] mb-1">{item.label}</span>
                      <span className="text-[15px] font-extrabold text-[#087A36] mb-1">{item.rating!.toFixed(1)}</span>
                      <div className="scale-50 origin-top -mt-2 -mb-2 w-[80px] flex justify-center">
                        {renderStars(item.rating!)}
                      </div>
                      <span className="text-[9px] text-[#555555] font-medium">({item.count})</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#555555] font-semibold leading-[1.8] mb-6">
                  Aspect ratings appear once customers rate taste, packaging & portion size.
                </p>
              )}

              <div className="mt-auto bg-[#F0F8F3] rounded-lg p-3 flex items-center gap-2 border border-[#D9EBDD]">
                <Heart className="w-4 h-4 text-[#087A36] shrink-0" />
                <span className="text-[10px] font-medium text-[#555555]">
                  {reviews.length > 0
                    ? `Rated ${avgRating?.toFixed(1) ?? "—"}/5 by ${totalReviewsCount} customers.`
                    : "No reviews yet — be the first to share your experience."}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* What Customers Love */}
        <Card className="lg:col-span-3">
          <Title>What Customers Love</Title>
          <div className="space-y-4 mb-auto">
            {loveItems.length > 0 ? (
              loveItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-[11px] font-bold text-[#555555]">
                    <item.icon className="w-4 h-4 text-[#087A36]" strokeWidth={2} />
                    {item.label}
                  </div>
                  <span className="text-[11px] font-extrabold text-[#087A36]">{item.pct}%</span>
                </div>
              ))
            ) : (
              <p className="text-[11px] text-[#555555] font-semibold leading-[1.8]">
                Highlights will appear here once customers start reviewing.
              </p>
            )}
          </div>

          {latestReview?.comment ? (
            <div className="mt-6 bg-[#FFFFFF] rounded-[12px] p-4 border border-[#EEEEEE] shadow-sm flex gap-3">
              <Quote className="w-6 h-6 text-[#FF4D00] shrink-0 fill-[#FF4D00] opacity-80" />
              <div className="flex flex-col">
                <span className="text-[12px] font-bold text-[#171717] italic mb-1">
                  {latestReview.comment.length > 60 ? latestReview.comment.slice(0, 60) + "…" : latestReview.comment}
                </span>
                <span className="text-[10px] text-[#555555] font-medium">
                  – {latestReview.user.name ?? "Anonymous"}
                </span>
              </div>
            </div>
          ) : null}
        </Card>

      </div>

      {/* ROW 2: Reviews and Right Column */}
      <Tabs defaultValue="all" className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">

          {/* Left: Reviews List */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <Card className="p-0 overflow-hidden flex flex-col h-full">

              {/* Filters Header */}
              <div className="p-4 md:p-5 border-b border-[#EEEEEE] flex flex-wrap items-center gap-3 bg-[#FAFAFA]">

                <TabsList className="bg-transparent p-0 h-auto gap-3 flex-wrap">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:border-[#087A36] data-[state=active]:text-[#087A36] data-[state=active]:bg-[#F0F8F3] border border-[#EEEEEE] text-[#555555] bg-[#FFFFFF] rounded-lg px-4 py-2 text-[12px] font-bold data-[state=active]:shadow-none transition-all"
                  >
                    <Star className="w-4 h-4 mr-2" /> All Reviews ({totalReviewsCount})
                  </TabsTrigger>
                </TabsList>

                <Select value={starFilter} onValueChange={setStarFilter}>
                  <SelectTrigger className="w-[90px] h-[34px] bg-[#FFFFFF] border-[#EEEEEE] text-[#555555] font-semibold text-[12px] rounded-lg">
                    <SelectValue placeholder="Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="1">1 Star</SelectItem>
                  </SelectContent>
                </Select>

                <div className="ml-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[120px] h-[34px] bg-[#FFFFFF] border-[#EEEEEE] text-[#171717] font-semibold text-[12px] rounded-lg">
                      <SelectValue placeholder="Most Recent" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Most Recent</SelectItem>
                      <SelectItem value="highest">Highest Rated</SelectItem>
                      <SelectItem value="lowest">Lowest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Reviews Content */}
              <TabsContent value="all" className="m-0 focus-visible:outline-none">
                <div className="flex flex-col p-4 md:p-6 divide-y divide-[#EEEEEE]">
                  {isStoreLoading ? (
                    <div className="py-10 text-center">
                      <div className="inline-block w-6 h-6 border-2 border-[#EEEEEE] border-t-[#087A36] rounded-full animate-spin mb-3"></div>
                      <p className="text-[12px] text-[#555555] font-semibold">Loading reviews...</p>
                    </div>
                  ) : visibleReviews.length === 0 ? (
                    <div className="py-10 text-center">
                      <MessageSquare className="w-8 h-8 text-[#CCCCCC] mx-auto mb-3" strokeWidth={1.5} />
                      <p className="text-[12px] text-[#555555] font-semibold">No reviews yet. Be the first to review this kitchen!</p>
                    </div>
                  ) : (
                    visibleReviews.map((rev, i) => (
                      <div key={rev.id} className={`flex flex-col md:flex-row gap-4 md:gap-6 ${i === 0 ? "pb-6" : "py-6"}`}>
                        {/* User Info Sidebar */}
                        <div className="flex items-center md:flex-col md:items-start gap-3 md:w-[140px] shrink-0">
                          <div className="w-12 h-12 rounded-full bg-[#FAFAFA] overflow-hidden shrink-0 border border-[#EEEEEE] flex items-center justify-center">
                            {rev.user.image ? (
                              <Image src={rev.user.image} alt={rev.user.name ?? "Customer"} width={48} height={48} className="object-cover" />
                            ) : (
                              <span className="text-[13px] font-extrabold text-[#555555]">
                                {initialsOf(rev.user.name ?? "A")}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-extrabold text-[13px] text-[#171717]">{rev.user.name ?? "Anonymous"}</span>
                            <div className="flex items-center gap-1 text-[10px] text-[#087A36] font-bold mt-0.5">
                              Verified Customer <ShieldCheck className="w-3 h-3" strokeWidth={3} />
                            </div>
                            <span className="text-[10px] text-[#555555] font-medium mt-1">
                              {formatDate(rev.createdAt)}
                            </span>
                          </div>
                        </div>

                        {/* Review Body */}
                        <div className="flex-1 w-full">
                          <div className="flex items-center gap-3 mb-2.5">
                            {renderStars(rev.rating, "h-4 w-4")}
                            <span className="font-extrabold text-[13px] text-[#171717]">{rev.rating}.0</span>
                          </div>
                          <p className="text-[12px] text-[#555555] leading-relaxed font-medium mb-4">
                            {rev.comment || "No written comment was left with this rating."}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {rev.tasteRating != null && (
                              <div className="px-3 py-1 bg-[#F0F8F3] text-[#087A36] rounded-md text-[10px] font-bold border border-[#D9EBDD]">
                                Taste & Flavors
                              </div>
                            )}
                            {rev.packagingRating != null && (
                              <div className="px-3 py-1 bg-[#F0F8F3] text-[#087A36] rounded-md text-[10px] font-bold border border-[#D9EBDD]">
                                Packaging
                              </div>
                            )}
                            {rev.portionSizeRating != null && (
                              <div className="px-3 py-1 bg-[#F0F8F3] text-[#087A36] rounded-md text-[10px] font-bold border border-[#D9EBDD]">
                                Portion Size
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>
            </Card>
          </div>

          {/* Right: Photos & Categories */}
          <div className="lg:col-span-4 flex flex-col gap-4 md:gap-5">

            {/* Customer Photos */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[20px] font-extrabold tracking-[-0.03em] text-[#111827]">Customer Photos</h3>
                <span className="text-[12px] font-bold text-[#555555]">{allPhotos.length} photo{allPhotos.length === 1 ? "" : "s"}</span>
              </div>
              {allPhotos.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {allPhotos.slice(0, 6).map((photo, idx) => (
                    <div key={`${photo.reviewId}-${idx}`} className="aspect-square rounded-[12px] overflow-hidden bg-[#FAFAFA] relative border border-[#EEEEEE] shadow-sm">
                      <Image src={photo.url} alt="Customer food photo" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#555555] font-semibold leading-[1.8]">
                  Customer photos will appear here once reviews include them.
                </p>
              )}
            </Card>

            {/* Rating Distribution by Category */}
            <Card>
              <Title>Rating Distribution by Category</Title>
              {aspectItems.length > 0 ? (
                <div className="space-y-3.5">
                  {aspectItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-[11px] font-bold text-[#555555]">
                      <span className="w-[110px] shrink-0 text-[#171717]">{item.label}</span>
                      <Progress value={(item.rating! / 5) * 100} className="h-2 w-full bg-[#EEEEEE] [&>div]:bg-[#087A36]" />
                      <span className="w-6 text-right font-medium text-[#555555]">{item.rating!.toFixed(1)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[#555555] font-semibold leading-[1.8]">
                  Category ratings appear once customers review them.
                </p>
              )}
            </Card>

          </div>
        </div>
      </Tabs>

      {/* ROW 3: FOOTER STATS */}
      <div className="bg-[#FEF9F5] rounded-[26px] p-6 md:p-8 border border-[#eef1f5] shadow-[0_10px_28px_rgba(15,23,42,0.05)] mt-2">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-[#EEEEEE]">

          <div className="flex items-center gap-4 justify-center pt-4 md:pt-0 first:pt-0 first:border-0">
            <MessageSquare className="w-8 h-8 text-[#087A36] shrink-0" strokeWidth={1.5} />
            <div className="text-left">
              <div className="font-extrabold text-[20px] text-[#171717] leading-tight mb-0.5">{totalReviewsCount}</div>
              <div className="text-[11px] font-semibold text-[#555555]">Total Reviews</div>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center pt-4 md:pt-0">
            <Star className="w-8 h-8 text-[#087A36] shrink-0" strokeWidth={1.5} />
            <div className="text-left">
              <div className="font-extrabold text-[20px] text-[#171717] leading-tight mb-0.5">{avgRating != null ? avgRating.toFixed(1) : "—"}</div>
              <div className="text-[11px] font-semibold text-[#555555]">Average Rating</div>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center pt-4 md:pt-0">
            <ThumbsUp className="w-8 h-8 text-[#087A36] shrink-0" strokeWidth={1.5} />
            <div className="text-left">
              <div className="font-extrabold text-[20px] text-[#171717] leading-tight mb-0.5">{reviews.length > 0 ? `${recommendPercent}%` : "—"}</div>
              <div className="text-[11px] font-semibold text-[#555555]">Recommend Kitchen</div>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center pt-4 md:pt-0">
            <Users className="w-8 h-8 text-[#087A36] shrink-0" strokeWidth={1.5} />
            <div className="text-left">
              <div className="font-extrabold text-[20px] text-[#171717] leading-tight mb-0.5">{formatCount(kitchen.totalOrdersDelivered ?? 0)}</div>
              <div className="text-[11px] font-semibold text-[#555555]">Meals Delivered</div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
