// functions/src/fees.ts
const round = (n: number) => Math.round(n);

export type ComputeFeesOpts = {
  servicePct?: number;       // 0.07 = 7%
  paymentProvider?: 'mercadopago'; // Stripe removido
  paymentMethod?: 'card' | 'pix';
};

/**
 * Calcula taxas para pagamento
 * - Taxa de serviço: 7% do valor base (fica na plataforma)
 * - Taxa do provedor: varia conforme método de pagamento
 * - Divisão: 10% plataforma / 90% dono (do valor base)
 */
export function computeFees(baseCents: number, opts: ComputeFeesOpts = {}) {
  const {
    servicePct = 0.07,
    paymentProvider = 'mercadopago',
    paymentMethod = 'card',
  } = opts;

  // Taxa de serviço da plataforma (7%)
  const serviceFee = round(baseCents * servicePct);

  // Taxa do provedor de pagamento
  let providerFee = 0;
  if (paymentProvider === 'mercadopago') {
    if (paymentMethod === 'pix') {
      // PIX: ~1,99% (sem taxa fixa)
      providerFee = round((baseCents + serviceFee) * 0.0199);
    } else {
      // Cartão: ~3,99% + R$0,39
      providerFee = round((baseCents + serviceFee) * 0.0399) + 39;
    }
  }

  // Divisão do valor base: 10% plataforma, 90% dono
  const appFeeFromBase = round(baseCents * 0.10);
  const ownerPayout = round(baseCents * 0.90);

  // Total que o cliente paga
  const totalToCustomer = baseCents + serviceFee + providerFee;

  return {
    serviceFee,
    surcharge: providerFee, // Mantido como 'surcharge' para compatibilidade
    appFeeFromBase,
    ownerPayout,
    totalToCustomer,
  };
}
