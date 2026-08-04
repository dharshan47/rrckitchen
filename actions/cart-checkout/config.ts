"use server"

export async function getCartConfig() {
  return {
    packagingCharge: Number(process.env.PACKAGING_CHARGE) || 10,
    deliveryCharge: Number(process.env.DELIVERY_CHARGE) || 20,
    freeDeliveryMin: Number(process.env.FREE_DELIVERY_MIN) || 299,
  }
}
