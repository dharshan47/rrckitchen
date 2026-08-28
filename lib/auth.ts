import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber, admin, twoFactor } from "better-auth/plugins";
import prisma from "./prisma";
import { redis } from "./redis";
import { sendOtpSms } from "./twilio";

const normalizePhoneNumberForValidation = (phoneNumber: string) =>
  phoneNumber.trim().replace(/\s+/g, "");

const RATE_LIMIT_INCREMENT_SCRIPT = `
  local current = redis.call("INCR", KEYS[1])
  if current == 1 then
    redis.call("EXPIRE", KEYS[1], ARGV[1])
  end
  return current
`;

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  appName: "RRC Kitchen",
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  trustedHost: true,
  session: {
    storeSessionInDatabase: true,
  },
  secondaryStorage: {
    get: async (key) => redis.get<string>(key),
    set: async (key, value, maxAge) => {
      if (maxAge) {
        await redis.set(key, value, { ex: maxAge });
      } else {
        await redis.set(key, value);
      }
    },
    delete: async (key) => {
      await redis.del(key);
    },
    increment: async (key, ttl) => {
      const count = (await redis.eval(
        RATE_LIMIT_INCREMENT_SCRIPT,
        [key],
        [ttl]
      )) as number;
      return count ?? 0;
    },
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
