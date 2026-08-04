import prisma from "@/lib/prisma";
import { allocatePublicCode, PUBLIC_ID_SPECS } from "@/lib/public-id";

const ORDER_BY = [{ createdAt: "asc" as const }, { id: "asc" as const }];

async function main() {
  await prisma.$transaction(async (tx) => {
    const users = await tx.user.findMany({ orderBy: ORDER_BY, select: { id: true, publicCode: true } });
    for (const row of users) {
      if (row.publicCode) continue;
      const publicCode = await allocatePublicCode(tx, PUBLIC_ID_SPECS.CUSTOMER);
      await tx.user.update({ where: { id: row.id }, data: { publicCode } });
      console.log(`User ${row.id} -> ${publicCode}`);
    }

    const kitchens = await tx.kitchenPartner.findMany({ orderBy: ORDER_BY, select: { id: true, publicCode: true } });
    for (const row of kitchens) {
      if (row.publicCode) continue;
      const publicCode = await allocatePublicCode(tx, PUBLIC_ID_SPECS.KITCHEN_PARTNER);
      await tx.kitchenPartner.update({ where: { id: row.id }, data: { publicCode } });
      console.log(`KitchenPartner ${row.id} -> ${publicCode}`);
    }

    const deliveries = await tx.deliveryPartner.findMany({ orderBy: ORDER_BY, select: { id: true, publicCode: true } });
    for (const row of deliveries) {
      if (row.publicCode) continue;
      const publicCode = await allocatePublicCode(tx, PUBLIC_ID_SPECS.DELIVERY_PARTNER);
      await tx.deliveryPartner.update({ where: { id: row.id }, data: { publicCode } });
      console.log(`DeliveryPartner ${row.id} -> ${publicCode}`);
    }

    const admins = await tx.adminProfile.findMany({ orderBy: ORDER_BY, select: { id: true, publicCode: true } });
    for (const row of admins) {
      if (row.publicCode) continue;
      const publicCode = await allocatePublicCode(tx, PUBLIC_ID_SPECS.ADMIN);
      await tx.adminProfile.update({ where: { id: row.id }, data: { publicCode } });
      console.log(`AdminProfile ${row.id} -> ${publicCode}`);
    }

    const orders = await tx.order.findMany({ orderBy: ORDER_BY, select: { id: true, publicCode: true } });
    for (const row of orders) {
      if (row.publicCode) continue;
      const publicCode = await allocatePublicCode(tx, PUBLIC_ID_SPECS.ORDER);
      await tx.order.update({ where: { id: row.id }, data: { publicCode } });
      console.log(`Order ${row.id} -> ${publicCode}`);
    }

    const payments = await tx.payment.findMany({ orderBy: ORDER_BY, select: { id: true, publicCode: true } });
    for (const row of payments) {
      if (row.publicCode) continue;
      const publicCode = await allocatePublicCode(tx, PUBLIC_ID_SPECS.PAYMENT);
      await tx.payment.update({ where: { id: row.id }, data: { publicCode } });
      console.log(`Payment ${row.id} -> ${publicCode}`);
    }

    const refunds = await tx.refund.findMany({ orderBy: ORDER_BY, select: { id: true, publicCode: true } });
    for (const row of refunds) {
      if (row.publicCode) continue;
      const publicCode = await allocatePublicCode(tx, PUBLIC_ID_SPECS.REFUND);
      await tx.refund.update({ where: { id: row.id }, data: { publicCode } });
      console.log(`Refund ${row.id} -> ${publicCode}`);
    }

    const menuItems = await tx.menuItem.findMany({ orderBy: ORDER_BY, select: { id: true, publicCode: true } });
    for (const row of menuItems) {
      if (row.publicCode) continue;
      const publicCode = await allocatePublicCode(tx, PUBLIC_ID_SPECS.MENU_ITEM);
      await tx.menuItem.update({ where: { id: row.id }, data: { publicCode } });
      console.log(`MenuItem ${row.id} -> ${publicCode}`);
    }
  });

  console.log("Done backfilling public codes");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());