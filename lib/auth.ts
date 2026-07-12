import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber, admin, twoFactor } from "better-auth/plugins";
import prisma from "./prisma";

const normalizePhoneNumberForValidation = (phoneNumber: string) =>
  phoneNumber.trim().replace(/\s+/g, "");

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  appName: "RRC Kitchen",
  baseURL: {
    allowedHosts: [
      "localhost:3000",
      "*.vercel.app",
    ],
    protocol: process.env.NODE_ENV === "development" ? "http" : "https",
  },
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    phoneNumber({
      phoneNumberValidator: async (phoneNumber: string) => {
        const normalized = normalizePhoneNumberForValidation(phoneNumber);
        return /^(\+91)?[6-9]\d{9}$/.test(normalized);
      },
      sendOTP: async () => {},
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
