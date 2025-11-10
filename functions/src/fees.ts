// functions/src/fees.ts
const round = (n: number) => Math.round(n);

export type ComputeFeesOpts = {
  servicePct?: number;       // 0.07 = 7%
  stripePct?: number;        // Percentual adicional sobre (base + serviço)
  stripeFixedCents?: number; // 39 = R$0,39
};

export function computeFees(baseCents: number, opts: ComputeFeesOpts = {}) {
  const {
    servicePct = 0.07,
    stripePct = 0,
    stripeFixedCents = 39,
  } = opts;

  const serviceFee = round(baseCents * servicePct);

  const basePlusService = baseCents + serviceFee;
  const stripePercentFee = round(basePlusService * stripePct);
  const surcharge = stripePercentFee + stripeFixedCents;

  const appFeeFromBase = round(baseCents * 0.10); // 10% do anúncio (fica na plataforma)
  const ownerPayout = round(baseCents * 0.90);    // 90% do anúncio
  const totalToCustomer = baseCents + serviceFee + surcharge;

  return { serviceFee, surcharge, appFeeFromBase, ownerPayout, totalToCustomer };
}
