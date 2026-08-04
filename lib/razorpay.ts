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

// ── Smart Collect (UPI VPA) helpers ──────────────────────────────────────────

export interface CreateVpaOptions {
  /** Unique receipt / reference for this collect request */
  receipt: string;
  /** Amount in paise (₹1 = 100 paise) */
  amountPaise: number;
  /** How many minutes the VPA stays active (default 30) */
  expireMinutes?: number;
  description?: string;
}

export interface VpaCreatedResult {
  virtualAccountId: string;
  vpa: string;
  expiresAt: Date;
}

/**
 * Creates a Razorpay Virtual Account / UPI VPA for Smart Collect.
 * The customer can pay to this VPA from any UPI app — Razorpay notifies
 * via webhook when payment arrives.
 *
 * Requires "Smart Collect" to be activated on your Razorpay account.
 */
export async function createVpa(opts: CreateVpaOptions): Promise<VpaCreatedResult> {
  const client = getRazorpayClient();
  const expireMinutes = opts.expireMinutes ?? 30;
  const closeBy = Math.floor(Date.now() / 1000) + expireMinutes * 60;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const va = await (client as any).virtualAccounts.create({
    receivers: { types: ["vpa"] },
    description: opts.description ?? "RRC Kitchen Order",
    amount: opts.amountPaise,
    currency: "INR",
    receipt: opts.receipt,
    close_by: closeBy,
    close_by_method: "time",
  });

  const vpa: string = va.receivers?.[0]?.address ?? va.id;
  const expiresAt = new Date((va.close_by ?? closeBy) * 1000);

  return {
    virtualAccountId: va.id as string,
    vpa,
    expiresAt,
  };
}

/**
 * Fetches all payments captured against a Razorpay Virtual Account.
 * Returns an empty array if none yet or if Smart Collect is not configured.
 */
export async function fetchVpaPayments(
  virtualAccountId: string
): Promise<{ paymentId: string; status: string; method: string }[]> {
  try {
    const client = getRazorpayClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (client as any).virtualAccounts.fetchPayments(virtualAccountId);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (result?.items ?? []).map((p: any) => ({
      paymentId: p.id as string,
      status: p.status as string,
      method: p.method as string,
    }));
  } catch {
    return [];
  }
}