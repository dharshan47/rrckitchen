import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const contentSid = process.env.TWILIO_CONTENT_SID;

const client = twilio(accountSid, authToken);

export interface TwilioResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendOtpSms(
  to: string,
  otp: string
): Promise<TwilioResult> {
  if (!accountSid || !authToken || !messagingServiceSid || !contentSid) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const message = await client.messages.create({
      to,
      messagingServiceSid,
      contentSid,
      contentVariables: JSON.stringify({ "1": otp }),
    });

    return { success: true, messageId: message.sid };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Twilio service unavailable";
    console.error("[TWILIO] sendOtpSms failed:", message);
    return { success: false, error: message };
  }
}
