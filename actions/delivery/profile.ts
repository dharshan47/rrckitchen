"use server"

import { getSession } from "@/lib/auth-server"
import prisma from "@/lib/prisma"

export async function getDeliveryProfileData() {
  const session = await getSession()
  if (!session?.user) {
    return null
  }

  const deliveryPartner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          phoneNumber: true,
          image: true,
          createdAt: true
        }
      },
      kyc: true,
      kitchenAssignments: {
        select: { status: true }
      },
      reviews: {
        select: { rating: true }
      }
    }
  })

  if (!deliveryPartner) {
    return null
  }

  // Calculate Quick Stats
  const totalDeliveries = deliveryPartner.kitchenAssignments.length
  const completedDeliveries = deliveryPartner.kitchenAssignments.filter(a => a.status === "DELIVERED").length
  const inProgressDeliveries = deliveryPartner.kitchenAssignments.filter(a => a.status === "PENDING").length
  const cancelledDeliveries = deliveryPartner.kitchenAssignments.filter(a => a.status === "CANCELLED").length

  // Calculate Rating
  const avgRating = deliveryPartner.reviews.length > 0
    ? (deliveryPartner.reviews.reduce((sum, r) => sum + r.rating, 0) / deliveryPartner.reviews.length).toFixed(1)
    : "0.0"

  return {
    profile: {
      id: deliveryPartner.id,
      name: deliveryPartner.user.name,
      email: deliveryPartner.user.email,
      phone: deliveryPartner.user.phoneNumber,
      image: deliveryPartner.user.image,
      memberSince: new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium' }).format(deliveryPartner.user.createdAt),
      partnerId: `DP${deliveryPartner.id.substring(deliveryPartner.id.length - 5).toUpperCase()}`,
      totalDeliveries,
      rating: avgRating,
    },
    stats: {
      total: totalDeliveries,
      completed: completedDeliveries,
      inProgress: inProgressDeliveries,
      cancelled: cancelledDeliveries,
    },
    bankDetails: {
      bankName: deliveryPartner.kyc?.bankName || "",
      accountHolderName: deliveryPartner.kyc?.accountHolderName || "",
      bankAccountNumber: deliveryPartner.kyc?.bankAccountNumber || "",
      ifscCode: deliveryPartner.kyc?.ifscCode || "",
      upiId: deliveryPartner.kyc?.upiId || "",
      googlePayNumber: deliveryPartner.kyc?.googlePayNumber || "",
      phonePeNumber: deliveryPartner.kyc?.phonePeNumber || "",
    }
  }
}
