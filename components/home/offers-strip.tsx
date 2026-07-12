interface OfferCoupon {
  code: string;
  description: string;
  discountValue?: number;
}

export function OffersStrip({ coupons }: { coupons: OfferCoupon[] }) {
  if (coupons.length === 0) return null;

  return (
    <section className="mb-6">
      <h2 className="text-lg font-bold text-foreground mb-3 px-4">Offers for you</h2>
      <div className="flex gap-3 overflow-x-auto scrollbar-none px-4">
        {coupons.map((c) => (
          <div key={c.code} className="shrink-0 w-64 rounded-xl bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 p-4">
            <p className="text-xs font-bold text-primary uppercase">{c.code}</p>
            <p className="text-sm font-medium mt-1">{c.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export async function getActiveCoupons() {
  const { default: prisma } = await import("@/lib/prisma");
  const now = new Date();
  const coupons = await prisma.coupon.findMany({
    where: {
      isActive: true,
      validFrom: { lte: now },
      validTo: { gte: now },
    },
    select: { code: true, description: true, discountValue: true },
    take: 10,
  });
  return coupons.map((c) => ({ code: c.code, description: c.description ?? `${Number(c.discountValue)}% off`, discountValue: Number(c.discountValue) }));
}
