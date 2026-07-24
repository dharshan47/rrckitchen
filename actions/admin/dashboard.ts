"use server"

import { startOfDay, subMonths, format } from "date-fns"
import { getSession } from "@/lib/auth-server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"
import { uniqueSlug } from "@/lib/slug"


function formatTimeSlot(slot: string): string {
  const map: Record<string, string> = {
    MORNING: "Breakfast",
    LUNCH: "Lunch",
    EVENINGSNACKS: "Snacks",
    DINNER: "Dinner",
  }
  return map[slot] ?? slot
}

function formatOrderStatus(status: string): string {
  const map: Record<string, string> = {
    CONFIRMED: "Confirmed",
    PREPARING: "Preparing",
    READYFORPICKUP: "Ready",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    REFUNDED: "Refunded",
  }
  return map[status] ?? status
}

function formatPaymentStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: "Pending",
    SUCCESS: "Paid",
    FAILED: "Failed",
    REFUNDED: "Refunded",
  }
  return map[status] ?? status
}

// ============ ADMIN DASHBOARD ============

export async function getAdminDashboardData() {
  try {
    await requireAdmin()
  } catch {
    return null
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = new Date(todayStart.getTime() + 86400000)
  void subMonths(now, 5)

  const [
    totalRevenueAgg,
    todayOrdersAgg,
    todayRevenueAgg,
    completedCount,
    pendingCount,
    cancelledCount,
    customerCount,
    kitchenPartnerCount,
    deliveryPartnerCount,
    menuItemCount,
  ] = await Promise.all([
    prisma.payment.aggregate({ where: { status: "SUCCESS" }, _sum: { amount: true } }),
    prisma.order.count({ where: { createdAt: { gte: todayStart, lt: todayEnd } } }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS", paidAt: { gte: todayStart, lt: todayEnd } },
      _sum: { amount: true },
    }),
    prisma.order.count({ where: { status: "COMPLETED" } }),
    prisma.order.count({ where: { status: "CONFIRMED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
    prisma.user.count({ where: { role: "customer" } }),
    prisma.kitchenPartner.count({ where: { status: { in: ["APPROVED", "ACTIVE"] } } }),
    prisma.deliveryPartner.count({ where: { status: { in: ["APPROVED", "ACTIVE"] } } }),
    prisma.menuItem.count({ where: { deletedAt: null } }),
  ])

  const [
    recentOrdersData,
    ordersByTimeSlotData,
    vegNonVegData,
    orderStatusData,
    topSellingData,
    topKitchensData,
    kitchenPartnersData,
    deliveryPartnersData,
  ] = await Promise.all([
    prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        payment: { select: { status: true } },
        orderItems: {
          take: 1,
          include: { kitchenPartner: { include: { kitchenAlias: true } } },
        },
      },
    }),
    prisma.order.groupBy({
      by: ["timeSlot"],
      _count: { id: true },
    }),
    prisma.menuItem.groupBy({
      by: ["foodType"],
      _count: { id: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    }),
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 7,
    }),
    prisma.kitchenPartner.findMany({
      where: { status: { in: ["APPROVED", "ACTIVE"] } },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        kitchenAlias: true,
        _count: { select: { orderItems: true } },
        reviews: { select: { rating: true } },
        orderItems: {
          select: { unitPrice: true, quantity: true },
        },
      },
    }),
    prisma.kitchenPartner.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        kitchenAlias: true,
        _count: { select: { orderItems: true } },
        orderItems: {
          select: { unitPrice: true, quantity: true },
        },
      },
    }),
    prisma.deliveryPartner.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true } },
        _count: { select: { kitchenAssignments: true } },
        kyc: true,
        reviews: { select: { rating: true } },
      },
    }),
  ])

  const topSellingItemIds = topSellingData.map((i) => i.menuItemId)
  const topSellingItems = topSellingItemIds.length > 0
    ? await prisma.menuItem.findMany({
        where: { id: { in: topSellingItemIds } },
        select: { id: true, name: true },
      })
    : []
  const itemNameMap = new Map(topSellingItems.map((i) => [i.id, i.name]))

  const totalRevenue = Number(totalRevenueAgg._sum.amount ?? 0)
  const todayRevenue = Number(todayRevenueAgg._sum.amount ?? 0)

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthlyRevenue: { period: string; revenue: number; orders: number }[] = []
  const nowMonth = now.getMonth()
  for (let i = 5; i >= 0; i--) {
    const monthIdx = (nowMonth - i + 12) % 12
    monthlyRevenue.push({
      period: monthNames[monthIdx],
      revenue: 0,
      orders: 0,
    })
  }

  const ordersByTimeSlotMap: Record<string, number> = { MORNING: 0, LUNCH: 0, EVENINGSNACKS: 0, DINNER: 0 }
  for (const row of ordersByTimeSlotData) {
    ordersByTimeSlotMap[row.timeSlot] = row._count.id
  }
  const ordersByTimeSlot = Object.entries(ordersByTimeSlotMap).map(([slot, count]) => ({
    slot: formatTimeSlot(slot),
    orders: count,
  }))

  const foodTypeMap: Record<string, number> = { VEG: 0, NONVEG: 0 }
  for (const row of vegNonVegData) {
    foodTypeMap[row.foodType] = row._count.id
  }
  const vegNonVeg = [
    { type: "Veg", count: foodTypeMap.VEG, fill: "var(--color-veg)" },
    { type: "Non-Veg", count: foodTypeMap.NONVEG, fill: "var(--color-nonveg)" },
  ]

  const statusOrder = ["CONFIRMED", "PREPARING", "READYFORPICKUP", "COMPLETED", "CANCELLED", "REFUNDED"]
  const statusMap: Record<string, number> = {}
  for (const s of statusOrder) statusMap[s] = 0
  for (const row of orderStatusData) {
    statusMap[row.status] = row._count.id
  }
  const orderStatusDist = ["CONFIRMED", "PREPARING", "COMPLETED", "CANCELLED"]
    .map((s) => ({
      status: formatOrderStatus(s),
      count: statusMap[s],
      fill: `var(--color-${s.toLowerCase()})`,
    }))

  const topSelling = topSellingData.map((item) => ({
    item: itemNameMap.get(item.menuItemId) ?? "",
    orders: item._count.id,
  }))

  const topKitchens = topKitchensData.map((k) => {
    const totalRev = k.orderItems.reduce((sum, oi) => sum + Number(oi.unitPrice) * oi.quantity, 0)
    const avgRating =
      k.reviews.length > 0
        ? k.reviews.reduce((sum, r) => sum + r.rating, 0) / k.reviews.length
        : 0
    return {
      name: k.kitchenAlias?.displayName ?? "",
      orders: k._count.orderItems,
      revenue: totalRev,
      rating: Math.round(avgRating * 10) / 10,
    }
  })

  const deliveryPerformance = deliveryPartnersData.map((s) => {
    const avgRating =
      s.reviews.length > 0
        ? s.reviews.reduce((sum, r) => sum + r.rating, 0) / s.reviews.length
        : 0
    return {
      name: s.user?.name ?? "",
      deliveries: s._count.kitchenAssignments,
      rating: Math.round(avgRating * 10) / 10,
    }
  })

  const recentOrders = recentOrdersData.map((o) => {
    const kitchen = o.orderItems[0]?.kitchenPartner?.kitchenAlias?.displayName ?? ""
    return {
      id: o.id,
      customer: o.user?.name ?? "",
      kitchen,
      date: format(o.createdAt, "dd MMM yyyy"),
      amount: Number(o.totalAmount),
      status: formatOrderStatus(o.status),
      payment: formatPaymentStatus(o.payment?.status ?? "PENDING"),
    }
  })

  const kitchenPartnersList = kitchenPartnersData.map((k) => {
    const totalRev = k.orderItems.reduce((sum, oi) => sum + Number(oi.unitPrice) * oi.quantity, 0)
    return {
      name: k.kitchenAlias?.displayName ?? "",
      status: k.status === "ACTIVE" || k.status === "APPROVED" ? "Active" : k.status,
      orders: k._count.orderItems,
      revenue: totalRev,
    }
  })

  const deliveryPartnersList = deliveryPartnersData.map((s) => ({
    name: s.user?.name ?? "",
    vehicle: "",
    orders: s._count.kitchenAssignments,
    status: s.status === "ACTIVE" || s.status === "APPROVED" ? "Active" : s.status === "PENDINGAPPROVAL" ? "Pending Approval" : s.status,
    docs: s.kyc?.verifiedAt ? "Verified" : "Pending",
  }))

  return {
    stats: {
      totalRevenue,
      todayRevenue,
      todayOrders: todayOrdersAgg,
      completedOrders: completedCount,
      pendingOrders: pendingCount,
      cancelledOrders: cancelledCount,
      activeCustomers: customerCount,
      kitchenPartners: kitchenPartnerCount,
      deliveryPartners: deliveryPartnerCount,
      menuItems: menuItemCount,
    },
    revenueTrend: monthlyRevenue,
    ordersByTimeSlot,
    vegNonVeg,
    orderStatusDist,
    topSelling,
    topKitchens,
    deliveryPerformance,
    recentOrders,
    kitchenPartners: kitchenPartnersList,
    deliveryPartners: deliveryPartnersList,
  }
}

// ============ KITCHEN DASHBOARD ============

export async function getKitchenDashboardData() {
  const session = await getSession()
  if (!session?.user) {
    return null
  }

  let kitchenPartner = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
    include: {
      kitchenAlias: true,
      kitchenKyc: true,
      kitchenAddress: true,
      user: { select: { name: true, email: true } },
    },
  })

  if (!kitchenPartner) {
    const existingSlugs = new Set(
      (await prisma.kitchenPartner.findMany({ select: { slug: true } }))
        .map(k => k.slug)
        .filter(Boolean) as string[]
    )
    const slug = uniqueSlug(session.user.name ?? "kitchen", existingSlugs)
    kitchenPartner = await prisma.kitchenPartner.create({
      data: { userId: session.user.id, slug },
      include: { kitchenAlias: true, kitchenKyc: true, kitchenAddress: true, user: { select: { name: true, email: true } } },
    })
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = new Date(todayStart.getTime() + 86400000)
  void subMonths(now, 5)
  const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
  const tomorrowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))

  const [
    todayOrdersCount,
    todayCompletedCount,
    todayPendingCount,
    todayRevenueAgg,
    monthRevenueAgg,
    totalCustomerData,
    menus,
    recentOrderItems,
    popularItemsData,
    vegCount,
    nonVegCount,
    tomorrowAvailability,
    payoutAgg,
    supportTickets,
    kitchenReviews,
  ] = await Promise.all([
    prisma.orderItem.count({
      where: { kitchenPartnerId: kitchenPartner.id, order: { createdAt: { gte: todayStart, lt: todayEnd } } },
    }),
    prisma.orderItem.count({
      where: { kitchenPartnerId: kitchenPartner.id, order: { createdAt: { gte: todayStart, lt: todayEnd }, status: "COMPLETED" } },
    }),
    prisma.orderItem.count({
      where: { kitchenPartnerId: kitchenPartner.id, order: { createdAt: { gte: todayStart, lt: todayEnd }, status: "CONFIRMED" } },
    }),
    prisma.orderItem.aggregate({
      where: { kitchenPartnerId: kitchenPartner.id, order: { createdAt: { gte: todayStart, lt: todayEnd } } },
      _sum: { unitPrice: true },
    }),
    prisma.orderItem.aggregate({
      where: { kitchenPartnerId: kitchenPartner.id, order: { createdAt: { gte: monthStart } } },
      _sum: { unitPrice: true },
    }),
    prisma.orderItem.groupBy({
      by: ["orderId"],
      where: { kitchenPartnerId: kitchenPartner.id },
      _count: { orderId: true },
    }),
    prisma.menu.findMany({
      where: { kitchenPartnerId: kitchenPartner.id },
      include: {
        menuItems: {
          where: { deletedAt: null },
          include: { photos: { take: 1 } },
          orderBy: { createdAt: "desc" },
        },
      },
    }),
    prisma.orderItem.findMany({
      where: { kitchenPartnerId: kitchenPartner.id },
      take: 10,
      orderBy: { order: { createdAt: "desc" } },
      include: {
        order: {
          include: {
            payment: { select: { status: true } },
            user: { select: { name: true, phoneNumber: true } },
            address: true,
            deliveryPartner: {
              include: { user: { select: { name: true, phoneNumber: true } } },
            },
          },
        },
        menuItem: { select: { name: true, timeSlot: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      where: { kitchenPartnerId: kitchenPartner.id },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 6,
    }),
    prisma.menuItem.count({
      where: { foodType: "VEG", menu: { kitchenPartnerId: kitchenPartner.id }, deletedAt: null },
    }),
    prisma.menuItem.count({
      where: { foodType: "NONVEG", menu: { kitchenPartnerId: kitchenPartner.id }, deletedAt: null },
    }),
    prisma.kitchenAvailability.findUnique({
      where: {
        kitchenPartnerId_serviceDate: {
          kitchenPartnerId: kitchenPartner.id,
          serviceDate: tomorrowStart,
        },
      },
    }),
    prisma.kitchenPayout.aggregate({
      where: { kitchenPartnerId: kitchenPartner.id, status: { in: ["PENDING", "SETTLED"] } },
      _sum: { netAmount: true },
    }),
    prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, subject: true, status: true, priority: true, createdAt: true },
    }),
    prisma.review.findMany({
      where: { kitchenPartnerId: kitchenPartner.id },
      include: {
        user: { select: { name: true } },
        order: { select: { orderItems: { take: 1, include: { menuItem: { select: { name: true } } } } } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allMenuItems = menus.flatMap((menu: any) => 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menu.menuItems.map((mi: any) => ({
      id: mi.id,
      name: mi.name,
      price: Number(mi.price),
      foodType: mi.foodType,
      timeSlot: formatTimeSlot(mi.timeSlot),
      isAvailable: mi.isAvailable,
      menuName: menu.name,
      image: mi.photos[0]?.imageUrl ?? null,
    }))
  )

  const popularIds = popularItemsData.map((i) => i.menuItemId)
  const popularNames = popularIds.length > 0
    ? await prisma.menuItem.findMany({
        where: { id: { in: popularIds } },
        select: { id: true, name: true },
      })
    : []
  const popularNameMap = new Map(popularNames.map((i) => [i.id, i.name]))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const popularFood = popularItemsData.map((i: any) => ({
    item: popularNameMap.get(i.menuItemId) ?? "",
    orders: i._count.id,
  }))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orderList = recentOrderItems.map((oi: any) => ({
    id: oi.order.id,
    itemName: oi.menuItem.name,
    timeSlot: formatTimeSlot(oi.menuItem.timeSlot),
    quantity: oi.quantity,
    amount: Number(oi.unitPrice) * oi.quantity,
    status: formatOrderStatus(oi.order.status),
    time: format(oi.order.createdAt, "hh:mm a"),
    customerName: oi.order.user?.name ?? "",
    customerPhone: oi.order.user?.phoneNumber ?? "",
    customerAddress: oi.order.address
      ? `${oi.order.address.lineOne}${oi.order.address.lineTwo ? ", " + oi.order.address.lineTwo : ""}, ${oi.order.address.pincode}`
      : "",
    deliveryPartner: oi.order.deliveryPartner
      ? {
          name: oi.order.deliveryPartner.user?.name ?? "",
          phone: oi.order.deliveryPartner.user?.phoneNumber ?? null,
        }
      : null,
  }))

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const weeklySales = dayNames.map((day) => ({
    day,
    sales: 0,
    target: 5000,
  }))

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const monthlyRevenue: { period: string; revenue: number; orders: number }[] = []
  const nowMonth = now.getMonth()
  for (let i = 5; i >= 0; i--) {
    const monthIdx = (nowMonth - i + 12) % 12
    monthlyRevenue.push({
      period: monthNames[monthIdx],
      revenue: 0,
      orders: 0,
    })
  }

  const todayRevenue = Number(todayRevenueAgg._sum.unitPrice ?? 0)
  const monthRevenue = Number(monthRevenueAgg._sum.unitPrice ?? 0)
  const uniqueCustomers = totalCustomerData.length

  return {
    kitchen: {
      id: kitchenPartner.id,
      displayName: kitchenPartner.kitchenAlias?.displayName ?? "",
      status: kitchenPartner.status,
      avgRating: "avgRating" in kitchenPartner && typeof (kitchenPartner as Record<string, unknown>).avgRating === "number"
        ? Math.round(Number((kitchenPartner as Record<string, unknown>).avgRating) * 10) / 10
        : null,
      totalReviews: (kitchenPartner as Record<string, unknown>).totalReviews as number | undefined,
      bankName: kitchenPartner.kitchenKyc?.bankName ?? null,
      bankAccountNumber: kitchenPartner.kitchenKyc?.bankAccountNumber ?? null,
      ifscCode: kitchenPartner.kitchenKyc?.ifscCode ?? null,
      accountHolderName: kitchenPartner.kitchenKyc?.accountHolderName ?? null,
      upiId: kitchenPartner.kitchenKyc?.upiId ?? null,
      gpayNumber: kitchenPartner.kitchenKyc?.gpayNumber ?? null,
      phoneNumber: kitchenPartner.kitchenKyc?.phoneNumber ?? null,
      userName: kitchenPartner.user?.name ?? null,
      email: kitchenPartner.user?.email ?? null,
      address: kitchenPartner.kitchenAddress
        ? {
            lineOne: kitchenPartner.kitchenAddress.lineOne,
            doorNo: kitchenPartner.kitchenAddress.doorNo,
            area: kitchenPartner.kitchenAddress.area,
            landmark: kitchenPartner.kitchenAddress.landmark,
            pincode: kitchenPartner.kitchenAddress.pincode,
            latitude: kitchenPartner.kitchenAddress.latitude,
            longitude: kitchenPartner.kitchenAddress.longitude,
          }
        : null,
    },
    stats: {
      todayOrders: todayOrdersCount,
      todayCompleted: todayCompletedCount,
      todayPending: todayPendingCount,
      todayRevenue,
      monthRevenue,
      customers: uniqueCustomers,
      menuItems: allMenuItems.length,
    },
    menuItems: allMenuItems,
    orders: orderList,
    tomorrowAvailability,
    monthlyRevenue,
    weeklySales,
    popularFood,
    vegCount,
    nonVegCount,
    settlements: payoutAgg._sum.netAmount
      ? [{ period: format(now, "MMMM yyyy"), gross: monthRevenue, commission: Math.round(monthRevenue * 0.15), net: monthRevenue - Math.round(monthRevenue * 0.15), status: "Pending" }]
      : [],
    supportTickets: supportTickets.map((t: { id: string; subject: string; status: string; priority: string; createdAt: Date }) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
    })),
    reviews: (kitchenReviews as Array<Record<string, unknown>>).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      rating: r.rating as number,
      tasteRating: r.tasteRating as number | null,
      packagingRating: r.packagingRating as number | null,
      portionSizeRating: r.portionSizeRating as number | null,
      comment: r.comment as string | null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      customerName: (r.user as any)?.name ?? "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemName: ((r.order as any)?.orderItems?.[0]?.menuItem?.name as string) ?? "",
      createdAt: (r.createdAt as Date).toISOString(),
    })),
  }
}

export async function updateKitchenBankDetails(data: {
  bankName?: string
  bankAccountNumber?: string
  ifscCode?: string
  accountHolderName?: string
  upiId?: string
  gpayNumber?: string
  phoneNumber?: string
}) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchenPartner = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!kitchenPartner) return { success: false, error: "Kitchen partner not found" }

  await prisma.kitchenPartnerKyc.upsert({
    where: { kitchenPartnerId: kitchenPartner.id },
    update: {
      bankName: data.bankName || null,
      bankAccountNumber: data.bankAccountNumber || null,
      ifscCode: data.ifscCode || null,
      accountHolderName: data.accountHolderName || null,
      upiId: data.upiId || null,
      gpayNumber: data.gpayNumber || null,
      phoneNumber: data.phoneNumber || null,
    },
    create: {
      kitchenPartnerId: kitchenPartner.id,
      bankName: data.bankName || null,
      bankAccountNumber: data.bankAccountNumber || null,
      ifscCode: data.ifscCode || null,
      accountHolderName: data.accountHolderName || null,
      upiId: data.upiId || null,
      gpayNumber: data.gpayNumber || null,
      phoneNumber: data.phoneNumber || null,
    },
  })

  return { success: true }
}

// ============ DELIVERY PARTNER BANK DETAILS ============

export async function updateDeliveryPartnerBankDetails(data: {
  bankName: string
  bankAccountNumber: string
  ifscCode: string
  accountHolderName: string
  upiId: string
  googlePayNumber: string
  phonePeNumber: string
}) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const deliveryPartner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!deliveryPartner) return { success: false, error: "Delivery partner not found" }

  await prisma.deliveryPartnerKyc.upsert({
    where: { deliveryPartnerId: deliveryPartner.id },
    update: {
      bankName: data.bankName || null,
      bankAccountNumber: data.bankAccountNumber || null,
      ifscCode: data.ifscCode || null,
      accountHolderName: data.accountHolderName || null,
      upiId: data.upiId || null,
      googlePayNumber: data.googlePayNumber || null,
      phonePeNumber: data.phonePeNumber || null,
    },
    create: {
      deliveryPartnerId: deliveryPartner.id,
      bankName: data.bankName || null,
      bankAccountNumber: data.bankAccountNumber || null,
      ifscCode: data.ifscCode || null,
      accountHolderName: data.accountHolderName || null,
      upiId: data.upiId || null,
      googlePayNumber: data.googlePayNumber || null,
      phonePeNumber: data.phonePeNumber || null,
    },
  })

  return { success: true }
}

// ============ KITCHEN ADDRESS ============

export async function updateKitchenAddress(data: {
  lineOne: string
  doorNo?: string
  area?: string
  landmark?: string
  pincode: string
  latitude: number
  longitude: number
}) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchenPartner = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!kitchenPartner) return { success: false, error: "Kitchen partner not found" }

  await prisma.kitchenAddress.upsert({
    where: { kitchenPartnerId: kitchenPartner.id },
    update: {
      lineOne: data.lineOne,
      doorNo: data.doorNo ?? null,
      area: data.area ?? null,
      landmark: data.landmark ?? null,
      pincode: data.pincode,
      latitude: data.latitude,
      longitude: data.longitude,
    },
    create: {
      kitchenPartnerId: kitchenPartner.id,
      lineOne: data.lineOne,
      doorNo: data.doorNo ?? null,
      area: data.area ?? null,
      landmark: data.landmark ?? null,
      pincode: data.pincode,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  })

  return { success: true }
}

// ============ MENU MANAGEMENT ============

export async function addKitchenMenuItem(formData: FormData) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchenPartner = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!kitchenPartner) return { success: false, error: "Kitchen partner not found" }

  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const foodType = formData.get("foodType") as string
  const timeSlot = formData.get("timeSlot") as string
  const price = parseFloat(formData.get("price") as string)
  const description = (formData.get("description") as string) || ""
  const isAvailable = formData.get("isAvailable") === "true"
  const imagesRaw = (formData.get("images") as string) || "[]"

  if (!name || !category || !foodType || !timeSlot || !price) {
    return { success: false, error: "Missing required fields" }
  }

  let menu = await prisma.menu.findFirst({
    where: { kitchenPartnerId: kitchenPartner.id, name: category },
  })

  if (!menu) {
    menu = await prisma.menu.create({
      data: { kitchenPartnerId: kitchenPartner.id, name: category },
    })
  }

  const existingItemSlugs = new Set(
    (await prisma.menuItem.findMany({ select: { slug: true } }))
      .map(i => i.slug)
      .filter(Boolean) as string[]
  )
  const slug = uniqueSlug(name, existingItemSlugs)

  const menuItem = await prisma.menuItem.create({
    data: {
      menuId: menu.id,
      name,
      slug,
      description,
      price,
      foodType: foodType.toUpperCase() as "VEG" | "NONVEG",
      timeSlot: timeSlot.toUpperCase() as "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER",
      isAvailable,
    },
  })

  let images: { secure_url: string; public_id: string }[] = []
  try {
    images = JSON.parse(imagesRaw)
  } catch {
    // ignore invalid JSON
  }

  if (images.length > 0) {
    await prisma.menuItemPhoto.createMany({
      data: images.map((img, idx) => ({
        menuItemId: menuItem.id,
        imageUrl: img.secure_url,
        cloudinaryPublicId: img.public_id,
        sortOrder: idx,
      })),
    })
  }

  return { success: true }
}

export async function toggleMenuItemAvailability(itemId: string, isAvailable: boolean) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  await prisma.menuItem.update({
    where: { id: itemId },
    data: { isAvailable },
  })

  return { success: true }
}

export async function setKitchenAvailability(isAvailable: boolean) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchenPartner = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!kitchenPartner) return { success: false, error: "Kitchen partner not found" }

  const now = new Date()
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))

  await prisma.kitchenAvailability.upsert({
    where: {
      kitchenPartnerId_serviceDate: {
        kitchenPartnerId: kitchenPartner.id,
        serviceDate: tomorrow,
      },
    },
    update: { isAvailable },
    create: {
      kitchenPartnerId: kitchenPartner.id,
      serviceDate: tomorrow,
      isAvailable,
    },
  })

  return { success: true }
}

// ============ DELIVERY PARTNER DASHBOARD ============

export async function getDeliveryDashboardData() {
  const session = await getSession()
  if (!session?.user) {
    return null
  }

  let deliveryPartner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { name: true, phoneNumber: true, email: true } },
      kyc: true,
      kitchenAssignments: {
        include: {
          kitchenPartner: { include: { kitchenAlias: true } },
        },
        orderBy: { createdAt: "desc" },
      },
      reviews: {
        include: {
          order: { select: { id: true, orderItems: { take: 1, include: { menuItem: { select: { name: true } } } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  })

  if (!deliveryPartner) {
    deliveryPartner = await prisma.deliveryPartner.create({
      data: { userId: session.user.id },
      include: {
        user: { select: { name: true, phoneNumber: true, email: true } },
        kyc: true,
        kitchenAssignments: {
          include: {
            kitchenPartner: { include: { kitchenAlias: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        reviews: {
          include: {
            order: { select: { id: true, orderItems: { take: 1, include: { menuItem: { select: { name: true } } } } } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    })
  }

  const totalAssignments = deliveryPartner.kitchenAssignments.length
  const completedAssignments = deliveryPartner.kitchenAssignments.filter((a) => a.status === "DELIVERED").length
  const pendingAssignments = deliveryPartner.kitchenAssignments.filter((a) => a.status === "PENDING").length
  const cancelledAssignments = deliveryPartner.kitchenAssignments.filter((a) => a.status === "CANCELLED").length

  const avgRating =
    deliveryPartner.reviews.length > 0
      ? deliveryPartner.reviews.reduce((sum, r) => sum + r.rating, 0) / deliveryPartner.reviews.length
      : 0

  const now = new Date()

  const [todayPayouts, weekPayouts, monthPayouts, supportTickets] = await Promise.all([
    prisma.deliveryPartnerPayout.aggregate({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        createdAt: { gte: startOfDay(new Date()) },
        status: { in: ["PENDING", "SETTLED"] },
      },
      _sum: { amount: true },
    }),
    prisma.deliveryPartnerPayout.aggregate({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        createdAt: { gte: new Date(Date.now() - 7 * 86400000) },
        status: { in: ["PENDING", "SETTLED"] },
      },
      _sum: { amount: true },
    }),
    prisma.deliveryPartnerPayout.aggregate({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        status: { in: ["PENDING", "SETTLED"] },
      },
      _sum: { amount: true },
    }),
    prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, subject: true, status: true, priority: true, createdAt: true },
    }),
  ])

  const recentAssignments = deliveryPartner.kitchenAssignments.slice(0, 10).map((a) => ({
    id: a.id,
    kitchen: a.kitchenPartner?.kitchenAlias?.displayName ?? "",
    status: a.status === "DELIVERED" ? "Delivered" : a.status === "PENDING" ? "Pending" : "Cancelled",
    date: format(a.createdAt, "dd MMM yyyy"),
  }))

  const assignedKitchenIds = deliveryPartner.kitchenAssignments
    .map((a) => a.kitchenPartnerId)
    .filter((id): id is string => id !== null)

  const deliveryOrders = assignedKitchenIds.length > 0
    ? await prisma.orderItem.findMany({
        where: {
          kitchenPartnerId: { in: assignedKitchenIds },
        },
        take: 20,
        orderBy: { order: { createdAt: "desc" } },
        include: {
          menuItem: { select: { name: true, timeSlot: true } },
          order: {
            include: {
              address: { select: { lineOne: true, lineTwo: true, pincode: true, latitude: true, longitude: true } },
              payment: { select: { status: true, provider: true } },
              user: { select: { name: true, phoneNumber: true, id: true } },
            },
          },
          kitchenPartner: {
            include: {
              kitchenAlias: true,
              kitchenAddress: true,
              user: {
                select: { name: true, phoneNumber: true },
              },
            },
          },
        },
      })
    : []

  const deliveryOrderList = deliveryOrders.map((oi) => {
    const ka = oi.kitchenPartner?.kitchenAddress
    return {
      id: oi.order.id,
      itemName: oi.menuItem.name,
      timeSlot: formatTimeSlot(oi.menuItem.timeSlot),
      quantity: oi.quantity,
      customerName: oi.order.user?.name ?? "",
      customerPhone: oi.order.user?.phoneNumber ?? "",
      customerAddress: oi.order.address
        ? `${oi.order.address.lineOne}${oi.order.address.lineTwo ? ", " + oi.order.address.lineTwo : ""}, ${oi.order.address.pincode}`
        : "",
      customerLat: oi.order.address?.latitude ? Number(oi.order.address.latitude) : null,
      customerLng: oi.order.address?.longitude ? Number(oi.order.address.longitude) : null,
      kitchenName: oi.kitchenPartner?.kitchenAlias?.displayName ?? "",
      kitchenPhone: oi.kitchenPartner?.user?.phoneNumber ?? "",
      kitchenAddress: ka
        ? `${ka.lineOne}, ${ka.pincode}`
        : "Address not set",
      kitchenLat: ka?.latitude ? Number(ka.latitude) : null,
      kitchenLng: ka?.longitude ? Number(ka.longitude) : null,
      orderStatus: oi.order.status,
      paymentProvider: oi.order.payment?.provider ?? null,
      paymentStatus: oi.order.payment?.status ?? null,
    }
  })

  const kyc = deliveryPartner.kyc

  return {
    profile: {
      id: deliveryPartner.id,
      name: deliveryPartner.user?.name ?? "Delivery Person",
      phone: deliveryPartner.user?.phoneNumber ?? "-",
      email: deliveryPartner.user?.email ?? null,
      bankName: kyc?.bankName ?? null,
      bankAccount: kyc?.bankAccountNumber ?? null,
      bankIfsc: kyc?.ifscCode ?? null,
      accountHolderName: kyc?.accountHolderName ?? null,
      upi: kyc?.upiId ?? null,
      googlePayNumber: kyc?.googlePayNumber ?? null,
      phonePeNumber: kyc?.phonePeNumber ?? null,
      isOnline: (deliveryPartner as Record<string, unknown>).isOnline ?? false,
      cashInHand: Number((deliveryPartner as Record<string, unknown>).cashInHand ?? 0),
      codEligible: (deliveryPartner as Record<string, unknown>).codEligible ?? true,
      avgRating: "avgRating" in deliveryPartner && typeof (deliveryPartner as Record<string, unknown>).avgRating === "number"
        ? Math.round(Number((deliveryPartner as Record<string, unknown>).avgRating) * 10) / 10
        : null,
      totalReviews: (deliveryPartner as Record<string, unknown>).totalReviews as number | undefined,
    },
    stats: {
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      cancelledAssignments,
      todayEarnings: Number(todayPayouts._sum.amount ?? 0),
      weeklyEarnings: Number(weekPayouts._sum.amount ?? 0),
      monthlyEarnings: Number(monthPayouts._sum.amount ?? 0),
      rating: Math.round(avgRating * 10) / 10,
      distanceTravelled: 0,
    },
    assignments: recentAssignments,
    deliveryOrders: deliveryOrderList,
    supportTickets: supportTickets.map((t: { id: string; subject: string; status: string; priority: string; createdAt: Date }) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt,
    })),
    reviews: (deliveryPartner.reviews as Array<Record<string, unknown>>).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      rating: r.rating as number,
      speedRating: r.speedRating as number | null,
      behaviorHygiene: r.behaviorHygiene as boolean | null,
      comment: r.comment as string | null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemName: ((r.order as any)?.orderItems?.[0]?.menuItem?.name as string) ?? "",
      createdAt: (r.createdAt as Date).toISOString(),
    })),
  }
}
