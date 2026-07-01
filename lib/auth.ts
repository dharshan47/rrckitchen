import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber, admin } from "better-auth/plugins";
import Razorpay from "razorpay";
import prisma from "./prisma";

const normalizePhoneNumberForValidation = (phoneNumber: string) =>
  phoneNumber.trim().replace(/\s+/g, "");

const getTempEmail = (phoneNumber: string) =>
  `user+${phoneNumber.replace(/\D/g, "")}@rrckitchen.local`;

export const razorpayClient = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    phoneNumber({
      otpLength: 6,
      expiresIn: 300,
      phoneNumberValidator: async (phoneNumber: string) => {
        const normalized = normalizePhoneNumberForValidation(phoneNumber);
        return /^\+?\d{10,15}$/.test(normalized);
      },
      sendOTP: async ({ phoneNumber, code }) => {
        const normalized = normalizePhoneNumberForValidation(phoneNumber);
        console.log(`[BetterAuth][OTP] ${normalized}: ${code}`);
      },
      signUpOnVerification: {
        getTempEmail: (phoneNumber: string) => getTempEmail(phoneNumber),
        getTempName: (phoneNumber: string) => phoneNumber,
      },
    }),
    admin(),
  ],
});