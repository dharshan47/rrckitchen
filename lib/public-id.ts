import type { Prisma } from "@/lib/generated/prisma/client"

export interface PublicIdSpec {
  prefix: string
  digits: number
}

export const PUBLIC_ID_SPECS = {
  KITCHEN_PARTNER: { prefix: "KP", digits: 7 },
  DELIVERY_PARTNER: { prefix: "DP", digits: 7 },
  ADMIN: { prefix: "ADM", digits: 4 },
  ORDER: { prefix: "ORD", digits: 9 },
  PAYMENT: { prefix: "PYMT", digits: 9 },
  REFUND: { prefix: "RFD", digits: 7 },
  MENU_ITEM: { prefix: "M", digits: 8 },
  CUSTOMER: { prefix: "CUS", digits: 9 },
} as const satisfies Record<string, PublicIdSpec>

export function formatPublicCode(prefix: string, sequence: number, digits: number): string {
  return `${prefix}${String(sequence).padStart(digits, "0")}`
}

/**
 * Atomically allocates the next prefixed code (e.g. `ORD000000123`).
 * Must run inside an active transaction so the counter increment and the
 * row insert commit together. The internal cuid is never replaced — the
 * public code is display/search only.
 */
export async function allocatePublicCode(
  tx: Prisma.TransactionClient,
  { prefix, digits }: PublicIdSpec,
): Promise<string> {
  const rows = await tx.$queryRaw<Array<{ sequence: number }>>`
    UPDATE "public_id_counter"
    SET "sequence" = "sequence" + 1
    WHERE "prefix" = ${prefix}
    RETURNING "sequence"
  `
  const sequence = rows[0]?.sequence
  if (sequence == null) {
    throw new Error(`No public id counter registered for prefix "${prefix}"`)
  }
  return formatPublicCode(prefix, sequence, digits)
}
