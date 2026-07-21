import Razorpay from "razorpay";

let _client: InstanceType<typeof Razorpay> | null = null;

export function getRazorpayClient() {
  if (!_client) {
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error(
        "[Razorpay] Payment service is not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in your environment variables and restart the server."
      );
    }
    _client = new Razorpay({ key_id, key_secret });
  }
  return _client;
}

function createRazorpayProxy() {
  return new Proxy({} as ReturnType<typeof getRazorpayClient>, {
    get(_, prop) {
      return getRazorpayClient()[prop as keyof ReturnType<typeof getRazorpayClient>];
    },
  });
}

export const razorpayClient = createRazorpayProxy();