import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber, admin, twoFactor } from "better-auth/plugins";
import prisma from "./prisma";
import { sendOtpSms } from "./twilio";

const normalizePhoneNumberForValidation = (phoneNumber: string) =>
  phoneNumber.trim().replace(/\s+/g, "");

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  appName: "RRC Kitchen",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedHost: true,
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    phoneNumber({
      phoneNumberValidator: async (phoneNumber: string) => {
        const normalized = normalizePhoneNumberForValidation(phoneNumber);
        return /^(\+91)?[6-9]\d{9}$/.test(normalized);
      },
      sendOTP: async ({ phoneNumber, code }) => {
        const result = await sendOtpSms(phoneNumber, code);
        if (!result.success) {
          throw new Error(result.error || "Failed to send OTP");
        }
      },
    }),
    admin(),
    twoFactor({
      allowPasswordless: true,
      issuer: "RRC Kitchen",
      totpOptions: {
        digits: 6,
        period: 30,
      },
      backupCodeOptions: {
        amount: 10,
        length: 10,
      },
      accountLockout: {
        enabled: true,
        maxFailedAttempts: 10,
        durationSeconds: 900,
      },
    }),
  ],
});
