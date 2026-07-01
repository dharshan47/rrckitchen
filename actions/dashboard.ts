"use server"

import { startOfDay, subMonths, format } from "date-fns"
import prisma from "@/lib/prisma"
import { getSession } from "@/lib/auth-server"

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
  const session = await getSession()
  if (!session?.user) {
    return null
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = new Date(todayStart.getTime() + 86400000)
  const sixMonthsAgo = subMonths(now, 5)
  const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))

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
    prisma.user.count({ where: { roles: { contains: "customer" } } }),
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
    .filter((s) => true)
    .map((s) => ({
      status: formatOrderStatus(s),
      count: statusMap[s],
      fill: `var(--color-${s.toLowerCase()})`,
    }))

  const topSelling = topSellingData.map((item) => ({
    item: itemNameMap.get(item.menuItemId) ?? "Unknown",
    orders: item._count.id,
  }))

  const topKitchens = topKitchensData.map((k) => {
    const totalRev = k.orderItems.reduce((sum, oi) => sum + Number(oi.unitPrice) * oi.quantity, 0)
    const avgRating =
      k.reviews.length > 0
        ? k.reviews.reduce((sum, r) => sum + r.rating, 0) / k.reviews.length
        : 0
    return {
      name: k.kitchenAlias?.displayName ?? "Unknown",
      orders: k._count.orderItems,
      revenue: totalRev,
      rating: Math.round(avgRating * 10) / 10,
    }
  })

  const deliveryPerformance = deliveryPartnersData.map((s) => ({
    name: s.user?.name ?? "Delivery Partner",
    deliveries: s._count.kitchenAssignments,
    rating: 0,
  }))

  const recentOrders = recentOrdersData.map((o) => {
    const kitchen = o.orderItems[0]?.kitchenPartner?.kitchenAlias?.displayName ?? "Unknown"
    return {
      id: o.id,
      customer: o.user?.name ?? "Unknown",
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
      name: k.kitchenAlias?.displayName ?? "Unknown",
      status: k.status === "ACTIVE" || k.status === "APPROVED" ? "Active" : k.status,
      orders: k._count.orderItems,
      revenue: totalRev,
    }
  })

  const deliveryPartnersList = deliveryPartnersData.map((s) => ({
    name: s.user?.name ?? "Unknown",
    vehicle: "-",
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

  const kitchenPartner = await prisma.kitchenPartner.findUnique({
    where: { userId: session.user.id },
    include: {
      kitchenAlias: true,
      kitchenKyc: true,
    },
  })

  if (!kitchenPartner) {
    return null
  }

  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = new Date(todayStart.getTime() + 86400000)
  const sixMonthsAgo = subMonths(now, 5)
  const monthStart = startOfDay(new Date(now.getFullYear(), now.getMonth(), 1))

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
          include: { payment: { select: { status: true } } },
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
  ])

  const allMenuItems = menus.flatMap((menu) =>
    menu.menuItems.map((mi) => ({
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

  const popularFood = popularItemsData.map((i) => ({
    item: popularNameMap.get(i.menuItemId) ?? "Unknown",
    orders: i._count.id,
  }))

  const orderList = recentOrderItems.map((oi) => ({
    id: oi.order.id,
    itemName: oi.menuItem.name,
    timeSlot: formatTimeSlot(oi.menuItem.timeSlot),
    quantity: oi.quantity,
    amount: Number(oi.unitPrice) * oi.quantity,
    status: formatOrderStatus(oi.order.status),
    time: format(oi.order.createdAt, "hh:mm a"),
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
      displayName: kitchenPartner.kitchenAlias?.displayName ?? "My Kitchen",
      status: kitchenPartner.status,
      fssaiNumber: kitchenPartner.kitchenKyc?.fssaiNumber ?? null,
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
    monthlyRevenue,
    weeklySales,
    popularFood,
    vegCount,
    nonVegCount,
    settlements: [] as Array<{ period: string; gross: number; commission: number; net: number; status: string }>,
  }
}

// ============ DELIVERY PARTNER DASHBOARD ============

export async function getDeliveryDashboardData() {
  const session = await getSession()
  if (!session?.user) {
    return null
  }

  const deliveryPartner = await prisma.deliveryPartner.findUnique({
    where: { userId: session.user.id },
    include: {
      user: { select: { name: true, phoneNumber: true } },
      bankAccount: { select: { accountHolderName: true, ifscCode: true } },
      upiAccount: { select: { upiId: true } },
      kitchenAssignments: {
        include: {
          kitchenPartner: { include: { kitchenAlias: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!deliveryPartner) {
    return null
  }

  const totalAssignments = deliveryPartner.kitchenAssignments.length
  const completedAssignments = deliveryPartner.kitchenAssignments.filter((a) => a.status === "DELIVERED").length
  const pendingAssignments = deliveryPartner.kitchenAssignments.filter((a) => a.status === "PENDING").length
  const cancelledAssignments = deliveryPartner.kitchenAssignments.filter((a) => a.status === "CANCELLED").length

  const recentAssignments = deliveryPartner.kitchenAssignments.slice(0, 10).map((a) => ({
    id: a.id,
    kitchen: a.kitchenPartner?.kitchenAlias?.displayName ?? "Unknown",
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
            include: { address: true },
          },
          kitchenPartner: { include: { kitchenAlias: true } },
        },
      })
    : []

  const deliveryOrderList = deliveryOrders.map((oi) => ({
    id: oi.order.id,
    kitchenHub: oi.kitchenPartner?.kitchenAlias?.displayName ?? "Unknown",
    itemName: oi.menuItem.name,
    timeSlot: formatTimeSlot(oi.menuItem.timeSlot),
    quantity: oi.quantity,
    address: oi.order.address
      ? `${oi.order.address.lineOne}${oi.order.address.lineTwo ? ", " + oi.order.address.lineTwo : ""}, ${oi.order.address.pincode}`
      : "Address not set",
  }))

  return {
    profile: {
      name: deliveryPartner.user?.name ?? "Delivery Person",
      phone: deliveryPartner.user?.phoneNumber ?? "-",
      bankAccount: deliveryPartner.bankAccount?.accountHolderName
        ? `${deliveryPartner.bankAccount.accountHolderName} • ${deliveryPartner.bankAccount.ifscCode}`
        : null,
      upi: deliveryPartner.upiAccount?.upiId ?? null,
    },
    stats: {
      totalAssignments,
      completedAssignments,
      pendingAssignments,
      cancelledAssignments,
      todayEarnings: 0,
      weeklyEarnings: 0,
      monthlyEarnings: 0,
      rating: 0,
      distanceTravelled: 0,
    },
    assignments: recentAssignments,
    deliveryOrders: deliveryOrderList,
  }
}
