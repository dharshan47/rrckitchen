import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const contentSid = process.env.TWILIO_CONTENT_SID;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export const client = twilio(accountSid, authToken);

export interface TwilioResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSms(
  to: string,
  body: string
): Promise<TwilioResult> {
  if (!accountSid || !authToken) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    if (messagingServiceSid) {
      const message = await client.messages.create({
        to,
        body,
        messagingServiceSid,
      });
      return { success: true, messageId: message.sid };
    }

    if (fromNumber) {
      const message = await client.messages.create({
        to,
        body,
        from: fromNumber,
      });
      return { success: true, messageId: message.sid };
    }

    return { success: false, error: "No sender configured (messaging service or phone number)" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Twilio service unavailable";
    console.error("[TWILIO] sendSms failed:", msg);
    return { success: false, error: msg };
  }
}

export async function sendOtpSms(
  to: string,
  otp: string
): Promise<TwilioResult> {
  return sendSms(to, `Your RRC Kitchen verification code is: ${otp}. It expires in 5 minutes. Please do not share this code.`);
}
