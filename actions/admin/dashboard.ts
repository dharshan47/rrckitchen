"use server"

import { startOfDay, subMonths, format, differenceInCalendarDays } from "date-fns"
import { getSession } from "@/lib/auth-server"
import prisma from "@/lib/prisma"
import { requireAdmin } from "@/lib/auth-guards"
import { uniqueSlug } from "@/lib/slug"
import { allocatePublicCode, PUBLIC_ID_SPECS } from "@/lib/public-id"


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

function formatPaymentStatus(status?: string): string | undefined {
  if (!status) return undefined
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
  } catch (error) {
    console.error("requireAdmin failed in getAdminDashboardData:", error);
    return null
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = new Date(todayStart.getTime() + 86400000)
  const sixMonthsAgo = startOfDay(subMonths(now, 5))

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
    pendingKycKitchens,
    pendingKycDelivery,
    openSupportTickets,
    lowStockItems,
    monthlyOrders,
    customersTrendData,
    kitchensTrendData,
    deliveryTrendData,
    paymentSourcesData,
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
    prisma.user.count({ where: { role: { in: ["customer", "CUSTOMER"] } } }),
    prisma.kitchenPartner.count({ where: { status: { in: ["APPROVED", "ACTIVE"] } } }),
    prisma.deliveryPartner.count({ where: { status: { in: ["APPROVED", "ACTIVE"] } } }),
    prisma.menuItem.count({ where: { deletedAt: null } }),
    prisma.kitchenPartner.count({ where: { status: "PENDINGAPPROVAL" } }),
    prisma.deliveryPartner.count({ where: { status: "PENDINGAPPROVAL" } }),
    prisma.supportTicket.count({ where: { status: "OPEN" } }),
    prisma.menuItem.count({ where: { isAvailable: false, deletedAt: null } }),
    prisma.order.findMany({
      where: { createdAt: { gte: sixMonthsAgo }, payment: { status: "SUCCESS" } },
      select: { totalAmount: true, createdAt: true },
    }),
    prisma.user.findMany({
      where: { role: { in: ["customer", "CUSTOMER"] }, createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.kitchenPartner.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.deliveryPartner.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true },
    }),
    prisma.payment.groupBy({
      by: ["paymentMethod"],
      where: { status: "SUCCESS" },
      _sum: { amount: true },
    }),
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
  for (const order of monthlyOrders) {
    const monthsAgo = (nowMonth - order.createdAt.getMonth() + 12) % 12
    const idx = 5 - monthsAgo
    if (idx >= 0 && idx < 6) {
      monthlyRevenue[idx].revenue += Number(order.totalAmount)
      monthlyRevenue[idx].orders += 1
    }
  }

  const customerTrend = [0, 0, 0, 0, 0, 0]
  const kitchenTrend = [0, 0, 0, 0, 0, 0]
  const deliveryTrend = [0, 0, 0, 0, 0, 0]
  for (const u of customersTrendData) {
    const idx = 5 - ((nowMonth - u.createdAt.getMonth() + 12) % 12)
    if (idx >= 0 && idx < 6) customerTrend[idx] += 1
  }
  for (const k of kitchensTrendData) {
    const idx = 5 - ((nowMonth - k.createdAt.getMonth() + 12) % 12)
    if (idx >= 0 && idx < 6) kitchenTrend[idx] += 1
  }
  for (const d of deliveryTrendData) {
    const idx = 5 - ((nowMonth - d.createdAt.getMonth() + 12) % 12)
    if (idx >= 0 && idx < 6) deliveryTrend[idx] += 1
  }

  const paymentSources = paymentSourcesData
    .map((row) => ({
      name: row.paymentMethod
        ? row.paymentMethod.charAt(0).toUpperCase() + row.paymentMethod.slice(1)
        : "Other",
      value: Number(row._sum.amount ?? 0),
    }))
    .filter((row) => row.value > 0)
    .sort((a, b) => b.value - a.value)

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
    item: itemNameMap.get(item.menuItemId),
    orders: item._count.id,
  }))

  const topKitchens = topKitchensData.map((k) => {
    const totalRev = k.orderItems.reduce((sum, oi) => sum + Number(oi.unitPrice) * oi.quantity, 0)
    const avgRating =
      k.reviews.length > 0
        ? k.reviews.reduce((sum, r) => sum + r.rating, 0) / k.reviews.length
        : 0
    return {
      name: k.kitchenAlias?.displayName,
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
      name: s.user?.name,
      deliveries: s._count.kitchenAssignments,
      rating: Math.round(avgRating * 10) / 10,
    }
  })

  const recentOrders = recentOrdersData.map((o) => {
    const kitchen = o.orderItems[0]?.kitchenPartner?.kitchenAlias?.displayName
    return {
      id: o.publicCode ?? o.id,
      customer: o.user?.name,
      kitchen,
      date: format(o.createdAt, "dd MMM yyyy"),
      amount: Number(o.totalAmount),
      status: formatOrderStatus(o.status),
      payment: formatPaymentStatus(o.payment?.status),
    }
  })

  const kitchenPartnersList = kitchenPartnersData.map((k) => {
    const totalRev = k.orderItems.reduce((sum, oi) => sum + Number(oi.unitPrice) * oi.quantity, 0)
    return {
      name: k.kitchenAlias?.displayName,
      status: k.status === "ACTIVE" || k.status === "APPROVED" ? "Active" : k.status,
      orders: k._count.orderItems,
      revenue: totalRev,
    }
  })

  const deliveryPartnersList = deliveryPartnersData.map((s) => ({
    name: s.user?.name,
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
      pendingKyc: pendingKycKitchens + pendingKycDelivery,
      openSupportTickets,
      lowStockItems,
    },
    revenueTrend: monthlyRevenue,
    customerTrend,
    kitchenTrend,
    deliveryTrend,
    paymentSources,
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
      kitchenCategories: {
        include: { category: { select: { id: true, name: true } } },
      },
      user: { select: { name: true, email: true, phoneNumber: true } },
    },
  })

  if (!kitchenPartner) {
    const existingSlugs = new Set(
      (await prisma.kitchenPartner.findMany({ select: { slug: true } }))
        .map(k => k.slug)
        .filter(Boolean) as string[]
    )
    const slug = uniqueSlug(session.user.name ?? session.user.id, existingSlugs)
    kitchenPartner = await prisma.$transaction(async (tx) => {
      const created = await tx.kitchenPartner.create({
        data: {
          publicCode: await allocatePublicCode(tx, PUBLIC_ID_SPECS.KITCHEN_PARTNER),
          userId: session.user.id,
          slug,
          status: "APPROVED",
        },
        include: {
          kitchenAlias: true,
          kitchenKyc: true,
          kitchenAddress: true,
          kitchenCategories: {
            include: { category: { select: { id: true, name: true } } },
          },
          user: { select: { name: true, email: true, phoneNumber: true } },
        },
      })
      return created
    })
  }

  if (!kitchenPartner) {
    return null
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const sixMonthsAgo = startOfDay(subMonths(now, 5))
  const weekStart = startOfDay(new Date(now.getTime() - 6 * 86400000))
  const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))
  const tomorrowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))

  const todayServiceDate = todayStart
  const tomorrowServiceDate = tomorrowStart

  const [
    todayOrdersCount,
    todayCompletedCount,
    todayPendingCount,
    todayRevenueAgg,
    yesterdayOrdersCount,
    yesterdayCompletedCount,
    yesterdayRevenueAgg,
    preOrderCount,
    preOrderRevenueAgg,
    monthRevenueAgg,
    todayAvailability,
    totalCustomerData,
    kitchenOrderUsers,
    menus,
    recentOrderItems,
    popularItemsData,
    vegCount,
    nonVegCount,
    tomorrowAvailability,
    monthlyOrderItems,
    payoutRows,
    supportTickets,
    kitchenReviews,
  ] = await Promise.all([
    prisma.orderItem.count({
      where: { kitchenPartnerId: kitchenPartner.id, order: { serviceDate: todayServiceDate } },
    }),
    prisma.orderItem.count({
      where: { kitchenPartnerId: kitchenPartner.id, order: { serviceDate: todayServiceDate, status: "COMPLETED" } },
    }),
    prisma.orderItem.count({
      where: { kitchenPartnerId: kitchenPartner.id, order: { serviceDate: todayServiceDate, status: "CONFIRMED" } },
    }),
    prisma.orderItem.aggregate({
      where: { kitchenPartnerId: kitchenPartner.id, order: { serviceDate: todayServiceDate } },
      _sum: { unitPrice: true },
    }),
    prisma.orderItem.count({
      where: { kitchenPartnerId: kitchenPartner.id, order: { serviceDate: startOfDay(new Date(now.getTime() - 86400000)) } },
    }),
    prisma.orderItem.count({
      where: { kitchenPartnerId: kitchenPartner.id, order: { serviceDate: startOfDay(new Date(now.getTime() - 86400000)), status: "COMPLETED" } },
    }),
    prisma.orderItem.aggregate({
      where: { kitchenPartnerId: kitchenPartner.id, order: { serviceDate: startOfDay(new Date(now.getTime() - 86400000)) } },
      _sum: { unitPrice: true },
    }),
    prisma.orderItem.count({
      where: { kitchenPartnerId: kitchenPartner.id, order: { serviceDate: tomorrowServiceDate } },
    }),
    prisma.orderItem.aggregate({
      where: { kitchenPartnerId: kitchenPartner.id, order: { serviceDate: tomorrowServiceDate } },
      _sum: { unitPrice: true },
    }),
    prisma.orderItem.aggregate({
      where: { kitchenPartnerId: kitchenPartner.id, order: { createdAt: { gte: monthStart } } },
      _sum: { unitPrice: true },
    }),
    prisma.kitchenAvailability.findUnique({
      where: {
        kitchenPartnerId_serviceDate: {
          kitchenPartnerId: kitchenPartner.id,
          serviceDate: todayServiceDate,
        },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["orderId"],
      where: { kitchenPartnerId: kitchenPartner.id },
      _count: { orderId: true },
    }),
    prisma.order.findMany({
      where: { orderItems: { some: { kitchenPartnerId: kitchenPartner.id } } },
      select: { userId: true },
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
      take: 20,
      orderBy: { order: { createdAt: "desc" } },
      include: {
        order: {
          select: {
            id: true,
            publicCode: true,
            status: true,
            createdAt: true,
            serviceDate: true,
            serviceDateType: true,
            user: { select: { name: true, phoneNumber: true } },
            address: true,
            payment: { select: { status: true } },
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
    prisma.orderItem.findMany({
      where: { kitchenPartnerId: kitchenPartner.id, order: { createdAt: { gte: sixMonthsAgo } } },
      select: {
        orderId: true,
        unitPrice: true,
        quantity: true,
        order: { select: { createdAt: true } },
      },
    }),
    prisma.kitchenPayout.findMany({
      where: { kitchenPartnerId: kitchenPartner.id },
      orderBy: { createdAt: "desc" },
      take: 10,
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
      description: mi.description,
      foodType: mi.foodType,
      timeSlot: formatTimeSlot(mi.timeSlot),
      isAvailable: mi.isAvailable,
      availableFor: mi.availableFor,
      menuName: menu.name,
      image: mi.photos[0]?.imageUrl,
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
    item: popularNameMap.get(i.menuItemId),
    orders: i._count.id,
  }))

  const orderList = recentOrderItems
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((oi: any) => {
      // Exclude CANCELLED orders where payment is not successful/refunded
      if (oi.order.status === "CANCELLED") {
        const pStatus = oi.order.payment?.status;
        if (pStatus !== "SUCCESS" && pStatus !== "REFUNDED" && pStatus !== "PARTIAL_REFUND") {
          return false;
        }
      }
      return true;
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((oi: any) => ({
      id: oi.order.id,
    publicCode: oi.order.publicCode,
    itemName: oi.menuItem.name,
    timeSlot: formatTimeSlot(oi.menuItem.timeSlot),
    quantity: oi.quantity,
    amount: Number(oi.unitPrice) * oi.quantity,
    status: formatOrderStatus(oi.order.status),
    serviceDateType: oi.order.serviceDateType,
    paymentStatus: formatPaymentStatus(oi.order.payment?.status),
    time: format(oi.order.createdAt, "hh:mm a"),
    date: format(oi.order.createdAt, "dd MMM yyyy"),
    serviceDate: oi.order.serviceDate ? format(oi.order.serviceDate, "dd MMM yyyy") : undefined,
    customerName: oi.order.user?.name,
    customerPhone: oi.order.user?.phoneNumber,
    customerAddress: oi.order.address
      ? `${oi.order.address.lineOne}${oi.order.address.lineTwo ? ", " + oi.order.address.lineTwo : ""}, ${oi.order.address.pincode}`
      : undefined,
    deliveryPartner: oi.order.deliveryPartner
      ? {
          name: oi.order.deliveryPartner.user?.name,
          phone: oi.order.deliveryPartner.user?.phoneNumber,
        }
      : null,
  }))

  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const weeklySales = dayNames.map((day) => ({
    day,
    sales: 0,
  }))
  for (const oi of monthlyOrderItems) {
    const dayIdx = differenceInCalendarDays(oi.order.createdAt, weekStart)
    if (dayIdx >= 0 && dayIdx < 7) {
      weeklySales[dayIdx].sales += Number(oi.unitPrice) * oi.quantity
    }
  }

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
  const orderIdsSeen = new Set<string>()
  for (const oi of monthlyOrderItems) {
    const monthsAgo = (nowMonth - oi.order.createdAt.getMonth() + 12) % 12
    const idx = 5 - monthsAgo
    if (idx >= 0 && idx < 6) {
      monthlyRevenue[idx].revenue += Number(oi.unitPrice) * oi.quantity
      if (!orderIdsSeen.has(oi.orderId)) {
        orderIdsSeen.add(oi.orderId)
        monthlyRevenue[idx].orders += 1
      }
    }
  }

  const todayRevenue = Number(todayRevenueAgg._sum.unitPrice ?? 0)
  const monthRevenue = Number(monthRevenueAgg._sum.unitPrice ?? 0)
  const yesterdayRevenue = Number(yesterdayRevenueAgg._sum.unitPrice ?? 0)
  const uniqueCustomers = totalCustomerData.length
  const preOrderRevenue = Number(preOrderRevenueAgg._sum.unitPrice ?? 0)

  const userIdCounts = new Map<string, number>()
  for (const o of kitchenOrderUsers) {
    if (!o.userId) continue
    userIdCounts.set(o.userId, (userIdCounts.get(o.userId) ?? 0) + 1)
  }
  const repeatCustomers = [...userIdCounts.values()].filter((c) => c > 1).length

  return {
    kitchen: {
      id: kitchenPartner.id,
      slug: kitchenPartner.slug,
      displayName: kitchenPartner.kitchenAlias?.displayName,
      imageUrl: kitchenPartner.kitchenAlias?.imageUrl,
      coverImageUrl: kitchenPartner.kitchenAlias?.coverImageUrl,
      description: kitchenPartner.kitchenAlias?.description,
      story: kitchenPartner.kitchenAlias?.story,
      experienceYears: kitchenPartner.kitchenAlias?.experienceYears,
      status: kitchenPartner.status,
      avgRating: "avgRating" in kitchenPartner && typeof (kitchenPartner as Record<string, unknown>).avgRating === "number"
        ? Math.round(Number((kitchenPartner as Record<string, unknown>).avgRating) * 10) / 10
        : null,
      totalReviews: (kitchenPartner as Record<string, unknown>).totalReviews as number | undefined,
      bankName: kitchenPartner.kitchenKyc?.bankName,
      bankAccountNumber: kitchenPartner.kitchenKyc?.bankAccountNumber,
      ifscCode: kitchenPartner.kitchenKyc?.ifscCode,
      accountHolderName: kitchenPartner.kitchenKyc?.accountHolderName,
      upiId: kitchenPartner.kitchenKyc?.upiId,
      gpayNumber: kitchenPartner.kitchenKyc?.gpayNumber,
      phoneNumber: kitchenPartner.user?.phoneNumber || kitchenPartner.kitchenKyc?.phoneNumber,
      userName: kitchenPartner.user?.name,
      email: kitchenPartner.user?.email,
      operatingHours: kitchenPartner.operatingHours as Record<string, { open: string; close: string }> | null,
      estimatedPrepTime: kitchenPartner.estimatedPrepTime,
      cuisineIds: kitchenPartner.kitchenCategories.map((kc) => kc.categoryId),
      cuisines: kitchenPartner.kitchenCategories.map((kc) => kc.category.name),
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
      yesterdayOrders: yesterdayOrdersCount,
      yesterdayCompleted: yesterdayCompletedCount,
      yesterdayRevenue,
      monthRevenue,
      customers: uniqueCustomers,
      repeatCustomers,
      menuItems: allMenuItems.length,
      preOrderCount,
      preOrderRevenue,
    },
    menuItems: allMenuItems,
    orders: orderList,
    todayAvailability,
    tomorrowAvailability,
    monthlyRevenue,
    weeklySales,
    popularFood,
    vegCount,
    nonVegCount,
    settlements: payoutRows.map((p) => ({
      id: p.id,
      period: format(p.createdAt, "MMMM yyyy"),
      gross: Number(p.grossAmount),
      commission: Number(p.commissionAmount),
      net: Number(p.netAmount),
      status: p.status === "SETTLED" ? "Paid" : "Pending",
      payoutDate: p.status === "SETTLED" && p.settledAt ? format(p.settledAt, "dd MMM yyyy") : null,
      transactionId: p.razorpayPayoutId,
    })),
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
      customerName: (r.user as any)?.name,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      itemName: ((r.order as any)?.orderItems?.[0]?.menuItem?.name as string),
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

export async function updateKitchenPhoto(imageUrl: string | null) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchenPartner = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
    include: { kitchenAlias: { select: { id: true } } },
  })
  if (!kitchenPartner) return { success: false, error: "Kitchen partner not found" }

  if (kitchenPartner.kitchenAlias) {
    await prisma.kitchenAlias.update({
      where: { id: kitchenPartner.kitchenAlias.id },
      data: { imageUrl },
    })
  }

  return { success: true }
}

export async function updateKitchenCoverPhoto(coverImageUrl: string | null) {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchenPartner = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
    include: { kitchenAlias: { select: { id: true } } },
  })
  if (!kitchenPartner) return { success: false, error: "Kitchen partner not found" }

  if (kitchenPartner.kitchenAlias) {
    await prisma.kitchenAlias.update({
      where: { id: kitchenPartner.kitchenAlias.id },
      data: { coverImageUrl },
    })
  }

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
  const availableFor = (formData.get("availableFor") as string) || "BOTH"
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

  const menuItem = await prisma.$transaction(async (tx) => {
    const created = await tx.menuItem.create({
      data: {
        publicCode: await allocatePublicCode(tx, PUBLIC_ID_SPECS.MENU_ITEM),
        menuId: menu.id,
        name,
        slug,
        description,
        price,
        foodType: foodType.toUpperCase() as "VEG" | "NONVEG",
        timeSlot: timeSlot.toUpperCase() as "MORNING" | "LUNCH" | "EVENINGSNACKS" | "DINNER",
        isAvailable,
        availableFor: availableFor as "TODAY" | "TOMORROW" | "BOTH",
      },
    })
    return created
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

export async function setKitchenAvailability(isAvailable: boolean, serviceDateType?: "TODAY" | "TOMORROW") {
  const session = await getSession()
  if (!session?.user) return { success: false, error: "Unauthorized" }

  const kitchenPartner = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
  })
  if (!kitchenPartner) return { success: false, error: "Kitchen partner not found" }

  const now = new Date()
  let serviceDate: Date
  if (serviceDateType === "TODAY") {
    serviceDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  } else {
    serviceDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1))
  }

  await prisma.kitchenAvailability.upsert({
    where: {
      kitchenPartnerId_serviceDate: {
        kitchenPartnerId: kitchenPartner.id,
        serviceDate,
      },
    },
    update: { isAvailable },
    create: {
      kitchenPartnerId: kitchenPartner.id,
      serviceDate,
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
      user: { select: { name: true, phoneNumber: true, email: true, image: true } },
      kyc: true,
      deliveryAssignments: {
        include: {
          order: { include: { orderItems: { take: 1, include: { kitchenPartner: { include: { kitchenAlias: true } } } } } }
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
    deliveryPartner = await prisma.$transaction(async (tx) => {
      const created = await tx.deliveryPartner.create({
        data: {
          publicCode: await allocatePublicCode(tx, PUBLIC_ID_SPECS.DELIVERY_PARTNER),
          userId: session.user.id,
          status: "APPROVED",
        },
        include: {
          user: { select: { name: true, phoneNumber: true, email: true, image: true } },
          kyc: true,
          deliveryAssignments: {
            include: {
              order: { include: { orderItems: { take: 1, include: { kitchenPartner: { include: { kitchenAlias: true } } } } } }
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
      return created
    })
  }

  const totalAssignments = deliveryPartner.deliveryAssignments.length
  const completedAssignments = deliveryPartner.deliveryAssignments.filter((a) => a.status === "DELIVERED").length
  const pendingAssignments = deliveryPartner.deliveryAssignments.filter((a) => a.status === "PENDING").length
  const cancelledAssignments = deliveryPartner.deliveryAssignments.filter((a) => a.status === "CANCELLED").length

  const avgRating =
    deliveryPartner.reviews.length > 0
      ? deliveryPartner.reviews.reduce((sum, r) => sum + r.rating, 0) / deliveryPartner.reviews.length
      : 0

  const now = new Date()
  const todayStart = startOfDay(now)
  const weekStart = startOfDay(new Date(Date.now() - 6 * 86400000))
  const yesterdayStart = startOfDay(new Date(Date.now() - 86400000))
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1)

  const [todayPayouts, weekPayouts, monthPayouts, yesterdayPayouts, lastMonthPayouts, weekPayoutRows, ratingDist, supportTickets] = await Promise.all([
    prisma.deliveryPartnerPayout.aggregate({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        createdAt: { gte: todayStart },
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
    prisma.deliveryPartnerPayout.aggregate({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        createdAt: { gte: yesterdayStart, lt: todayStart },
        status: { in: ["PENDING", "SETTLED"] },
      },
      _sum: { amount: true },
    }),
    prisma.deliveryPartnerPayout.aggregate({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        createdAt: { gte: prevMonthStart, lt: prevMonthEnd },
        status: { in: ["PENDING", "SETTLED"] },
      },
      _sum: { amount: true },
    }),
    prisma.deliveryPartnerPayout.findMany({
      where: {
        deliveryPartnerId: deliveryPartner.id,
        createdAt: { gte: weekStart },
        status: { in: ["PENDING", "SETTLED"] },
      },
      select: { amount: true, createdAt: true },
    }),
    prisma.deliveryReview.groupBy({
      by: ["rating"],
      where: { deliveryPartnerId: deliveryPartner.id },
      _count: { id: true },
    }),
    prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, subject: true, status: true, priority: true, createdAt: true },
    }),
  ])

  const weeklyEarningsTrend = Array.from({ length: 7 }, (_, i) => ({
    name: format(new Date(Date.now() - (6 - i) * 86400000), "EEE"),
    value: 0,
  }))
  for (const row of weekPayoutRows) {
    const idx = differenceInCalendarDays(row.createdAt, weekStart)
    if (idx >= 0 && idx < 7) {
      weeklyEarningsTrend[idx].value += Number(row.amount)
    }
  }

  const weeklyTrips = deliveryPartner.deliveryAssignments.filter((a) => a.createdAt >= weekStart).length

  const ratingDistMap: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
  for (const row of ratingDist) {
    ratingDistMap[row.rating] = row._count.id
  }
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: ratingDistMap[stars],
  }))

  const recentAssignments = deliveryPartner.deliveryAssignments.slice(0, 10).map((a) => ({
    id: a.id,
    kitchen: a.order?.orderItems[0]?.kitchenPartner?.kitchenAlias?.displayName,
    status: a.status === "DELIVERED" ? "Delivered" : a.status === "PENDING" ? "Pending" : "Cancelled",
    date: format(a.createdAt, "dd MMM yyyy"),
  }))

  const assignedOrderIds = deliveryPartner.deliveryAssignments
    .map((a) => a.orderId)
    .filter((id): id is string => id !== null)

  const deliveryOrders = assignedOrderIds.length > 0
    ? await prisma.orderItem.findMany({
        where: {
          orderId: { in: assignedOrderIds },
        },
        take: 20,
        orderBy: { order: { createdAt: "desc" } },
        include: {
          menuItem: { select: { name: true, timeSlot: true } },
          order: {
            select: {
              id: true,
              publicCode: true,
              status: true,
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
      publicCode: oi.order.publicCode,
      itemName: oi.menuItem.name,
      timeSlot: formatTimeSlot(oi.menuItem.timeSlot),
      quantity: oi.quantity,
      amount: Number(oi.unitPrice) * oi.quantity,
      customerName: oi.order.user?.name,
      customerPhone: oi.order.user?.phoneNumber,
      customerAddress: oi.order.address
        ? `${oi.order.address.lineOne}${oi.order.address.lineTwo ? ", " + oi.order.address.lineTwo : ""}, ${oi.order.address.pincode}`
        : undefined,
      customerLat: oi.order.address?.latitude ? Number(oi.order.address.latitude) : null,
      customerLng: oi.order.address?.longitude ? Number(oi.order.address.longitude) : null,
      kitchenName: oi.kitchenPartner?.kitchenAlias?.displayName,
      kitchenImageUrl: oi.kitchenPartner?.kitchenAlias?.imageUrl,
      kitchenPhone: oi.kitchenPartner?.user?.phoneNumber,
      kitchenAddress: ka
        ? `${ka.lineOne}, ${ka.pincode}`
        : undefined,
      kitchenLat: ka?.latitude ? Number(ka.latitude) : null,
      kitchenLng: ka?.longitude ? Number(ka.longitude) : null,
      orderStatus: oi.order.status,
      paymentProvider: oi.order.payment?.provider,
      paymentStatus: oi.order.payment?.status,
    }
  })

  const kyc = deliveryPartner.kyc

  return {
    profile: {
      id: deliveryPartner.id,
      name: deliveryPartner.user?.name,
      imageUrl: deliveryPartner.user?.image,
      phone: deliveryPartner.user?.phoneNumber,
      email: deliveryPartner.user?.email,
      bankName: kyc?.bankName,
      bankAccount: kyc?.bankAccountNumber,
      bankIfsc: kyc?.ifscCode,
      accountHolderName: kyc?.accountHolderName,
      upi: kyc?.upiId,
      googlePayNumber: kyc?.googlePayNumber,
      phonePeNumber: kyc?.phonePeNumber,
      isOnline: deliveryPartner.isOnline,
      avgRating: Math.round(Number(deliveryPartner.avgRating) * 10) / 10,
      totalReviews: deliveryPartner.totalReviews,
    },
    stats: {
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      cancelledAssignments,
      todayEarnings: Number(todayPayouts._sum.amount ?? 0),
      weeklyEarnings: Number(weekPayouts._sum.amount ?? 0),
      monthlyEarnings: Number(monthPayouts._sum.amount ?? 0),
      yesterdayEarnings: Number(yesterdayPayouts._sum.amount ?? 0),
      lastMonthEarnings: Number(lastMonthPayouts._sum.amount ?? 0),
      weeklyTrips,
      rating: Math.round(avgRating * 10) / 10,
      distanceTravelled: 0,
    },
    weeklyEarningsTrend,
    ratingDistribution,
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
      itemName: ((r.order as any)?.orderItems?.[0]?.menuItem?.name as string),
      createdAt: (r.createdAt as Date).toISOString(),
    })),
  }
}

export type KitchenDashboardData = Awaited<ReturnType<typeof getKitchenDashboardData>>
