// functions/src/fees.ts
const round = (n: number) => Math.round(n);

export type ComputeFeesOpts = {
  servicePct?: number;       // 0.05 = 5%
  stripePct?: number;        // 0.0399 = 3,99%
  stripeFixedCents?: number; // 39 = R$0,39
};

export function computeFees(baseCents: number, opts: ComputeFeesOpts = {}) {
  const {
    servicePct = 0.05,
    stripePct = 0.0399,
    stripeFixedCents = 39,
  } = opts;

  const serviceFee = round(baseCents * servicePct);

  // gross-up: sobretaxa cobre a taxa sobre o total (base+serviço+sobre)
  const basePlusService = baseCents + serviceFee;
  const surcharge = Math.ceil((stripePct * basePlusService + stripeFixedCents) / (1 - stripePct));

  const appFeeFromBase = round(baseCents * 0.10); // 10% do anúncio (fica na plataforma)
  const ownerPayout = round(baseCents * 0.90);    // 90% do anúncio
  const totalToCustomer = baseCents + serviceFee + surcharge;

  return { serviceFee, surcharge, appFeeFromBase, ownerPayout, totalToCustomer };
}
