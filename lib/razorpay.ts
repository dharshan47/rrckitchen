import Razorpay from "razorpay";

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  throw new Error(
    "[Razorpay] Payment service is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables and restart the server."
  );
}

export const razorpayClient = new Razorpay({ key_id, key_secret });