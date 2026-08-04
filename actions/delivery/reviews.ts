"use server"

import { getSession } from "@/lib/auth-server"
import prisma from "@/lib/prisma"
import { startOfMonth, subMonths, format } from "date-fns"

export async function getDeliveryReviewsData() {
  const session = await getSession()
  if (!session?.user) {
    return null
  }

  const deliveryPartner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
  })

  if (!deliveryPartner) {
    return null
  }

  const now = new Date()
  const thisMonthStart = startOfMonth(now)
  
  // Fetch all reviews for this partner
  const allReviews = await prisma.deliveryReview.findMany({
    where: { deliveryPartnerId: deliveryPartner.id },
    include: {
      user: { select: { name: true, image: true } },
      order: { select: { id: true } }
    },
    orderBy: { createdAt: "desc" }
  })

  const totalReviews = allReviews.length
  
  // Basic stats
  const sumRating = allReviews.reduce((sum, r) => sum + r.rating, 0)
  const overallRating = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : 0
  
  const reviewsThisMonth = allReviews.filter(r => r.createdAt >= thisMonthStart).length
  
  const fiveStarReviews = allReviews.filter(r => r.rating === 5).length
  const fiveStarPercentage = totalReviews > 0 ? Math.round((fiveStarReviews / totalReviews) * 100) : 0

  // No response tracking exists in the schema, so the real response rate is 0 until data is recorded
  const responseRate = 0

  // Calculate repeat customers (users who have reviewed > 1 time)
  const userReviewCounts = allReviews.reduce((acc, r) => {
      acc[r.userId] = (acc[r.userId] || 0) + 1
      return acc
  }, {} as Record<string, number>)
  const repeatCustomers = Object.values(userReviewCounts).filter(count => count > 1).length

  // Rating Breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map(stars => {
      const count = allReviews.filter(r => r.rating === stars).length
      const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
      return { stars, count, percent }
  })

  // Category Scores - only count reviews that actually have each score
  let speedTotal = 0
  let speedCount = 0
  let behaviorTotal = 0
  let behaviorCount = 0
  let hygieneTotal = 0
  let hygieneCount = 0

  allReviews.forEach(r => {
      if (r.speedRating != null) {
          speedTotal += r.speedRating
          speedCount++
      }
      if (r.behaviorHygiene != null) {
          behaviorTotal += r.behaviorHygiene ? 5 : 1
          behaviorCount++
      }
      if (r.safetyContactless != null) {
          hygieneTotal += r.safetyContactless ? 5 : 1
          hygieneCount++
      }
  })

  const speedScore = speedCount > 0 ? Number((speedTotal / speedCount).toFixed(1)) : 0
  const behaviorScore = behaviorCount > 0 ? Number((behaviorTotal / behaviorCount).toFixed(1)) : 0
  const hygieneScore = hygieneCount > 0 ? Number((hygieneTotal / hygieneCount).toFixed(1)) : 0

  // Your Progress (Last 6 months)
  const progressData = []
  for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(now, i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0, 23, 59, 59)
      
      const monthReviews = allReviews.filter(r => r.createdAt >= monthStart && r.createdAt <= monthEnd)
      const monthAvg = monthReviews.length > 0 
          ? Number((monthReviews.reduce((sum, r) => sum + r.rating, 0) / monthReviews.length).toFixed(1))
          : 0
          
      progressData.push({
          name: format(monthDate, "MMM"),
          value: monthAvg,
      })
  }

  // Calculate improvement this month
  const thisMonthAvg = progressData[5].value
  const lastMonthAvg = progressData[4].value
  const ratingImprovement = Number((thisMonthAvg - lastMonthAvg).toFixed(1))

  // Map reviews for the list
  const mappedReviews = allReviews.map(r => {
      const speed = r.speedRating ?? 0
      const behavior = r.behaviorHygiene === null ? 0 : (r.behaviorHygiene ? 5 : 1)
      const hygiene = r.safetyContactless === null ? 0 : (r.safetyContactless ? 5 : 1)
      
      // Determine overall category based on rating
      let category = "Excellent"
      if (r.rating === 4) category = "Good"
      else if (r.rating === 3) category = "Average"
      else if (r.rating < 3) category = "Poor"
      
      return {
          id: r.id,
          userName: r.user.name,
          userInitials: r.user.name ? r.user.name.substring(0, 1).toUpperCase() : "",
          orderId: `ORD${r.order.id.substring(r.order.id.length - 6).toUpperCase()}`,
          date: format(r.createdAt, "dd MMM yyyy"),
          createdAt: r.createdAt.toISOString(),
          rating: r.rating,
          category,
          scores: { speed, behavior, hygiene },
          comment: r.comment || "",
      }
  })

  return {
    stats: {
        overallRating,
        totalReviews,
        reviewsThisMonth,
        fiveStarReviews,
        fiveStarPercentage,
        responseRate,
        repeatCustomers,
    },
    ratingBreakdown,
    categoryScores: {
        speed: speedScore,
        behavior: behaviorScore,
        hygiene: hygieneScore
    },
    progressData,
    ratingImprovement,
    reviews: mappedReviews
  }
}
