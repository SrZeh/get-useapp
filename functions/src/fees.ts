// functions/src/fees.ts
const round = (n: number) => Math.round(n);

export type ComputeFeesOpts = {
  servicePct?: number;       // 0.07 = 7%
  paymentProvider?: 'asaas' | 'mercadopago'; // Asaas é o padrão agora
  paymentMethod?: 'card' | 'pix' | 'boleto';
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
    paymentProvider = 'asaas',
    paymentMethod = 'pix',
  } = opts;

  // Taxa de serviço da plataforma (7%)
  const serviceFee = round(baseCents * servicePct);

  // Taxa do provedor de pagamento
  let providerFee = 0;
  
  if (paymentProvider === 'asaas') {
    if (paymentMethod === 'pix') {
      // PIX: R$ 1,99 fixo
      providerFee = 199; // R$ 1,99 em centavos
    } else if (paymentMethod === 'card') {
      // Cartão à vista: 1,99% + R$ 0,49
      providerFee = round((baseCents + serviceFee) * 0.0199) + 49;
    } else if (paymentMethod === 'boleto') {
      // Boleto: R$ 1,99 fixo
      providerFee = 199; // R$ 1,99 em centavos
    }
  } else if (paymentProvider === 'mercadopago') {
    // Mantido para compatibilidade (será removido)
    if (paymentMethod === 'pix') {
      providerFee = round((baseCents + serviceFee) * 0.0199);
    } else {
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
