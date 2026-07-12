import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

export const client = twilio(accountSid, authToken);

export interface TwilioResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendSms(
  to: string,
  body: string,
  contentVariables?: Record<string, string>,
): Promise<TwilioResult> {
  if (!accountSid || !authToken) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    if (messagingServiceSid) {
      const contentSid = process.env.TWILIO_CONTENT_SID;
      const message = contentSid && contentVariables
        ? await client.messages.create({ to, from: fromNumber || undefined, contentSid, contentVariables: JSON.stringify(contentVariables) })
        : await client.messages.create({ to, messagingServiceSid, body });
      console.log("[TWILIO] Message response:", { sid: message.sid, status: message.status, errorCode: message.errorCode, errorMessage: message.errorMessage, to, from: message.from, contentSid });
      if (message.errorCode) {
        return { success: false, error: `Twilio error ${message.errorCode}: ${message.errorMessage || "Unknown"}` };
      }
      return { success: true, messageId: message.sid };
    }

    if (fromNumber) {
      const message = await client.messages.create({
        to,
        body,
        from: fromNumber,
      });
      console.log("[TWILIO] Message response:", { sid: message.sid, status: message.status, errorCode: message.errorCode, errorMessage: message.errorMessage });
      if (message.errorCode) {
        return { success: false, error: `Twilio error ${message.errorCode}: ${message.errorMessage || "Unknown"}` };
      }
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
  const contentSid = process.env.TWILIO_CONTENT_SID;

  if (contentSid) {
    return sendSms(to, "", { "1": otp });
  }

  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

  if (verifyServiceSid) {
    try {
      const verification = await client.verify.v2.services(verifyServiceSid)
        .verifications
        .create({ to, channel: "sms" });
      return { success: true, messageId: verification.sid };
    } catch (err) {
      console.error("[TWILIO] Verify failed:", err instanceof Error ? err.message : err);
    }
  }

  return sendSms(to, `Your RRC Kitchen code: ${otp}. Expires in 5 min.`);
}
