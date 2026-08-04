"use client";

import { useMemo } from "react";
import Image from "next/image";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  Utensils,
  Package,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  useKitchenReviews,
  useKitchenReviewsLoading,
  useKitchenReviewsQuery,
} from "@/stores";
import type { KitchenDetail } from "@/components/kitchen/kitchen-detail-client";

interface Props {
  kitchen: KitchenDetail;
}

export function ReviewsKitchenTab({ kitchen }: Props) {
  const { isLoading: loading } = useKitchenReviewsQuery(kitchen.id);
  const reviews = useKitchenReviews();
  const isStoreLoading = useKitchenReviewsLoading();

  const avgRating = kitchen.avgRating ?? 0;

  // Real counts for 5, 4, 3, 2, 1 stars computed from fetched reviews.
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach((r) => {
      const rounded = Math.round(r.rating);
      if (rounded >= 1 && rounded <= 5) counts[rounded as keyof typeof counts]++;
    });
    return counts;
  }, [reviews]);

  const totalStarCount = Object.values(starCounts).reduce((a, b) => a + b, 0) || 1;

  // Real aspect ratings averaged from reviews that include each rating.
  const aspectRatings = useMemo(() => {
    const avg = (key: "tasteRating" | "packagingRating" | "portionSizeRating") => {
      const valid = reviews.filter((r) => typeof r[key] === "number");
      if (valid.length === 0) return null;
      const sum = valid.reduce((s, r) => s + (r[key] as number), 0);
      return sum / valid.length;
    };
    return {
      taste: avg("tasteRating"),
      packaging: avg("packagingRating"),
      portion: avg("portionSizeRating"),
    };
  }, [reviews]);

  const positiveReviews = reviews.filter((r) => r.rating >= 4).length;
  const recommendPercent = reviews.length > 0 ? Math.round((positiveReviews / reviews.length) * 100) : null;

  // What customers love — real percentages from reviews.
  const loveStats = useMemo(() => {
    const pct = (num: number, denom: number) => (denom > 0 ? Math.round((num / denom) * 100) : null);
    const withTaste = reviews.filter((r) => typeof r.tasteRating === "number");
    const withPkg = reviews.filter((r) => typeof r.packagingRating === "number");
    return {
      taste: pct(withTaste.filter((r) => (r.tasteRating as number) >= 4).length, withTaste.length),
      packaging: pct(withPkg.filter((r) => (r.packagingRating as number) >= 4).length, withPkg.length),
      overall: pct(positiveReviews, reviews.length),
    };
  }, [reviews, positiveReviews]);

  const reviewPhotos = useMemo(() => {
    const photos: string[] = [];
    reviews.forEach((r) => {
      if (r.mediaUrls && r.mediaUrls.length > 0) {
        photos.push(...r.mediaUrls);
      }
    });
    return photos;
  }, [reviews]);

  const renderStars = (rating: number, size = "h-3 w-3") => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <Star
            key={s}
            className={`${size} ${s <= Math.round(rating) ? "fill-[#EE7005] text-[#EE7005]" : "fill-muted text-muted"}`}
          />
        ))}
      </div>
    );
  };

  const aspectItems = [
    { key: "taste" as const, label: "Taste & Flavors", icon: UtensilsCrossed, value: aspectRatings.taste, count: reviews.filter((r) => typeof r.tasteRating === "number").length },
    { key: "packaging" as const, label: "Packaging", icon: Package, value: aspectRatings.packaging, count: reviews.filter((r) => typeof r.packagingRating === "number").length },
    { key: "portion" as const, label: "Portion Size", icon: Utensils, value: aspectRatings.portion, count: reviews.filter((r) => typeof r.portionSizeRating === "number").length },
  ].filter((a) => a.value !== null);

  if (loading && isStoreLoading && reviews.length === 0) {
    return (
      <div className="w-full flex flex-col gap-4 md:gap-6 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-56 rounded-2xl" />
        </div>
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 md:gap-6 pb-8">
      {/* ROW 1: OVERVIEWS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="rounded-2xl p-5 flex flex-col justify-center items-center text-center border-gray-100 shadow-sm">
          <CardHeader className="w-full p-0 pb-2">
            <CardTitle className="text-[13px] font-bold text-gray-800 text-left">Overall Rating</CardTitle>
          </CardHeader>
          <CardContent className="w-full p-0 flex flex-col items-center text-center">
            <div className="text-[54px] font-extrabold text-[#EE7005] leading-none mb-3">
              {avgRating ? avgRating.toFixed(1) : "—"}
            </div>
            <div className="mb-2">{renderStars(avgRating, "h-4 w-4")}</div>
            <p className="text-[12px] text-gray-900 font-bold mb-5">Based on {kitchen.totalReviews} Reviews</p>
            <div className="bg-[#E8F5E9] border border-green-200 rounded-xl p-4 flex items-center justify-center gap-4 w-full">
              <ThumbsUp className="w-8 h-8 text-green-600" />
              <div className="text-left">
                <div className="font-extrabold text-green-800 text-[16px] leading-tight">
                  {recommendPercent !== null ? `${recommendPercent}%` : "—"}
                </div>
                <div className="text-[11px] text-green-700 font-medium">
                  Customers recommend
                  <br />
                  {kitchen.displayName}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl p-5 flex flex-col justify-center border-gray-100 shadow-sm">
          <CardHeader className="p-0 pb-1">
            <CardTitle className="text-[13px] font-bold text-gray-800">Rating Overview</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <p className="text-[11px] text-gray-500 mb-6">Based on {reviews.length} fetched reviews</p>
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = starCounts[star as keyof typeof starCounts];
                const pct = (count / totalStarCount) * 100;
                return (
                  <div key={star} className="flex items-center gap-3 text-[12px] font-semibold text-gray-600">
                    <span className="w-2">{star}</span>
                    <Star className="h-3.5 w-3.5 fill-[#EE7005] text-[#EE7005]" />
                    <Progress value={pct} className="h-2.5 flex-1 bg-gray-100" />
                    <span className="w-8 text-right text-gray-500 font-medium">({count})</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: RATING ON KEY ASPECTS (real review averages only) */}
      {aspectItems.length > 0 && (
        <Card className="rounded-2xl p-5 border-gray-100 shadow-sm">
          <CardHeader className="p-0 pb-5">
            <CardTitle className="text-[13px] font-bold text-gray-800">Rating on Key Aspects</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-6 gap-x-2">
              {aspectItems.map((item) => (
                <div key={item.key} className="flex flex-col items-center text-center px-1">
                  <item.icon className="w-6 h-6 text-green-600 mb-3" />
                  <span className="text-[10px] font-bold text-gray-800 leading-tight mb-2 h-[20px]">{item.label}</span>
                  <span className="text-[18px] font-extrabold text-green-700 mb-1">{(item.value as number).toFixed(1)}</span>
                  <div className="scale-75 origin-top mb-1">{renderStars(item.value as number)}</div>
                  <span className="text-[10px] text-gray-400">({item.count})</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ROW 3: WHAT CUSTOMERS LOVE (real percentages) */}
      {(loveStats.taste !== null || loveStats.packaging !== null) && (
        <Card className="rounded-2xl p-5 border-gray-100 shadow-sm">
          <CardHeader className="p-0 pb-5">
            <CardTitle className="text-[13px] font-bold text-gray-800">What Customers Love</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12 px-2">
              {loveStats.overall !== null && (
                <div className="flex items-center justify-between text-[12px] font-semibold text-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                      <Star className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    Overall positive rating
                  </div>
                  <span className="text-green-600 font-bold">{loveStats.overall}%</span>
                </div>
              )}
              {loveStats.taste !== null && (
                <div className="flex items-center justify-between text-[12px] font-semibold text-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                      <UtensilsCrossed className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    Great taste & flavors
                  </div>
                  <span className="text-green-600 font-bold">{loveStats.taste}%</span>
                </div>
              )}
              {loveStats.packaging !== null && (
                <div className="flex items-center justify-between text-[12px] font-semibold text-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center">
                      <Package className="w-3.5 h-3.5 text-green-600" />
                    </div>
                    Neat packaging
                  </div>
                  <span className="text-green-600 font-bold">{loveStats.packaging}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* REVIEWS LIST */}
      <Card className="rounded-2xl border-gray-100 shadow-sm flex flex-col">
        <div className="p-4 md:p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <Badge className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E8F5E9] text-green-700 border-green-200 text-[12px] font-bold">
            <Star className="w-4 h-4" /> All Reviews ({kitchen.totalReviews})
          </Badge>
        </div>

        <div className="flex flex-col p-4 md:p-6 gap-6">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-gray-400 text-center">
              <MessageSquare className="w-12 h-12 mb-3 text-gray-300" />
              <p className="text-[14px] font-bold text-gray-700 mb-1">No reviews yet</p>
              <p className="text-[12px]">Be the first to review this kitchen.</p>
            </div>
          ) : (
            reviews.map((review, idx) => (
              <div key={review.id}>
                <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <div className="flex items-center sm:flex-col sm:items-start gap-3 sm:w-[140px] shrink-0">
                    <Avatar className="w-12 h-12 border border-gray-200">
                      {review.user?.image ? (
                        <AvatarImage src={review.user.image} alt={review.user.name ?? "Reviewer"} />
                      ) : null}
                      <AvatarFallback className="bg-orange-100 text-[#EE7005] font-bold text-lg">
                        {review.user?.name?.charAt(0).toUpperCase() ?? "R"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-extrabold text-[13px] text-gray-900">{review.user?.name}</span>
                      <div className="flex items-center gap-1 text-[9px] text-green-700 font-bold mt-0.5">
                        Verified Customer
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium mt-1">
                        {new Date(review.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2">
                      {renderStars(review.rating, "h-4 w-4")}
                      <span className="font-extrabold text-[14px] text-gray-900">
                        {review.rating >= 4.5
                          ? "Excellent Homemade Food!"
                          : review.rating >= 4
                            ? "Great Taste & Quality"
                            : review.rating >= 3
                              ? "Good Experience"
                              : "Average Experience"}
                      </span>
                    </div>

                    {review.comment ? (
                      <p className="text-[13px] text-gray-600 leading-relaxed font-medium mb-3">{review.comment}</p>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                      {review.tasteRating && review.tasteRating >= 4 && (
                        <Badge variant="secondary" className="px-3 py-1 bg-[#F9FAFB] text-green-700 rounded-lg text-[10px] font-bold border border-green-100">
                          Taste & Flavors
                        </Badge>
                      )}
                      {review.packagingRating && review.packagingRating >= 4 && (
                        <Badge variant="secondary" className="px-3 py-1 bg-[#F9FAFB] text-green-700 rounded-lg text-[10px] font-bold border border-green-100">
                          Packaging
                        </Badge>
                      )}
                      {review.portionSizeRating && review.portionSizeRating >= 4 && (
                        <Badge variant="secondary" className="px-3 py-1 bg-[#F9FAFB] text-green-700 rounded-lg text-[10px] font-bold border border-green-100">
                          Portion Size
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {idx !== reviews.length - 1 && <Separator className="mt-6 bg-gray-100" />}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* CUSTOMER PHOTOS (real review media only) */}
      {reviewPhotos.length > 0 && (
        <Card className="rounded-2xl p-5 md:p-6 border-gray-100 shadow-sm">
          <CardHeader className="p-0 pb-5">
            <CardTitle className="text-[15px] font-bold text-gray-900">Customer Photos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {reviewPhotos.slice(0, 6).map((photo, i) => (
                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 relative border border-gray-200">
                  <Image src={photo} alt="Customer photo" fill className="object-cover" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FOOTER STATS (real backend data) */}
      <div className="bg-[#F8FAF9] rounded-2xl p-6 md:p-8 border border-[#E8F5E9]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-gray-200">
          <div className="flex items-center gap-4 justify-center pt-4 md:pt-0 first:pt-0 first:border-0">
            <MessageSquare className="w-8 h-8 text-green-700 shrink-0" />
            <div>
              <div className="font-extrabold text-[22px] text-gray-900 leading-tight">{kitchen.totalReviews}</div>
              <div className="text-[12px] font-semibold text-gray-500">Total Reviews</div>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center pt-4 md:pt-0">
            <Star className="w-8 h-8 text-green-700 shrink-0" />
            <div>
              <div className="font-extrabold text-[22px] text-gray-900 leading-tight">
                {avgRating ? avgRating.toFixed(1) : "—"}
              </div>
              <div className="text-[12px] font-semibold text-gray-500">Average Rating</div>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center pt-4 md:pt-0">
            <ThumbsUp className="w-8 h-8 text-green-700 shrink-0" />
            <div>
              <div className="font-extrabold text-[22px] text-gray-900 leading-tight">
                {recommendPercent !== null ? `${recommendPercent}%` : "—"}
              </div>
              <div className="text-[12px] font-semibold text-gray-500">Recommend Kitchen</div>
            </div>
          </div>
          <div className="flex items-center gap-4 justify-center pt-4 md:pt-0">
            <Users className="w-8 h-8 text-green-700 shrink-0" />
            <div>
              <div className="font-extrabold text-[22px] text-gray-900 leading-tight">
                {kitchen.totalReviews > 0 ? kitchen.totalReviews : "—"}
              </div>
              <div className="text-[12px] font-semibold text-gray-500">Happy Customers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
