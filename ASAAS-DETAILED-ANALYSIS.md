# Análise Detalhada: Asaas para Get & Use App

## 📋 Objetivo
Analisar se a Asaas atende todos os requisitos do projeto Get & Use App e avaliar a facilidade de implementação, comparando com a solução atual (Mercado Pago).

---

## ✅ Checklist de Funcionalidades Necessárias

### 1. Métodos de Pagamento

| Método | Mercado Pago (Atual) | Asaas | Status |
|--------|---------------------|-------|--------|
| **PIX** | ✅ 1,99% | ✅ R$ 1,99 fixo | ✅ Compatível |
| **Cartão de Crédito** | ✅ 3,99% + R$0,39 | ✅ 1,99% + R$0,49 (à vista) | ✅ Compatível |
| **Cartão Parcelado** | ✅ 4,99% - 14,99% | ✅ 2,49% - 3,29% + R$0,49 | ✅ **Melhor** |
| **Boleto** | ✅ R$ 3,50 | ✅ R$ 1,99 | ✅ **Melhor** |

**Conclusão:** ✅ Asaas suporta todos os métodos necessários

---

### 2. Split de Pagamentos (CRÍTICO)

#### Mercado Pago (Atual)
```typescript
// ❌ PROBLEMA: Split requer OAuth (não implementado)
// TODO: Implementar OAuth para usar marketplace_fee e split automático
// Por enquanto, o pagamento vai para a conta do marketplace
// Depois, precisamos fazer transferência manual para o vendedor
```

**Status:** ❌ **NÃO FUNCIONA** - Requer OAuth complexo

#### Asaas
```json
{
  "customer": "cus_123",
  "billingType": "CREDIT_CARD",
  "value": 500.00,
  "split": [
    {
      "walletId": "wallet_owner_123",  // Conta do dono do item
      "fixedValue": 450.00,            // 90% do valor base
      "totalValue": 450.00,
      "description": "Repasse para dono do item"
    },
    {
      "walletId": "wallet_platform",   // Conta da plataforma
      "fixedValue": 50.00,              // 10% do valor base
      "totalValue": 50.00,
      "description": "Taxa da plataforma"
    }
  ]
}
```

**Status:** ✅ **FUNCIONA NATIVAMENTE** - Sem OAuth necessário

**Requisitos:**
- Cada vendedor precisa ter uma conta Asaas (ou wallet)
- Plataforma precisa ter conta Asaas
- Split configurado na criação da cobrança

**Conclusão:** ✅ Asaas resolve o problema principal do Mercado Pago

---

### 3. Webhooks / Notificações

#### Mercado Pago (Atual)
```typescript
// Webhook recebe: topic=payment, id=payment_id
// Busca pagamento via API
// Verifica status === "approved"
// Atualiza reserva para "paid"
```

**Implementação:** ✅ Funciona, mas requer busca adicional

#### Asaas
```typescript
// Webhook recebe evento direto
// Eventos disponíveis:
// - PAYMENT_RECEIVED (pagamento aprovado)
// - PAYMENT_OVERDUE (vencido)
// - PAYMENT_DELETED (cancelado)
// - PAYMENT_AWAITING_RISK_ANALYSIS (aguardando análise)
```

**Eventos Principais:**
- `PAYMENT_RECEIVED` - Pagamento confirmado
- `PAYMENT_OVERDUE` - Pagamento vencido
- `PAYMENT_DELETED` - Pagamento cancelado
- `PAYMENT_AWAITING_RISK_ANALYSIS` - Em análise

**Estrutura do Webhook:**
```json
{
  "event": "PAYMENT_RECEIVED",
  "payment": {
    "id": "pay_123456",
    "customer": "cus_123",
    "value": 500.00,
    "netValue": 450.00,  // Valor líquido após taxas
    "status": "RECEIVED",
    "billingType": "CREDIT_CARD",
    "dueDate": "2024-12-10",
    "externalReference": "reservation_abc123"
  }
}
```

**Conclusão:** ✅ Asaas oferece webhooks mais diretos e claros

---

### 4. Criação de Cobrança

#### Mercado Pago (Atual)
```typescript
// Cria "Preference" (preferência de pagamento)
// Retorna URL do checkout
// Cliente escolhe método no checkout
// Webhook notifica quando pago
```

**Fluxo:** Preference → Checkout → Webhook

#### Asaas
```typescript
// Cria cobrança diretamente
// Pode retornar:
// - Link de pagamento (checkout)
// - QR Code PIX
// - Código de barras (boleto)
// - Token para checkout transparente
```

**Exemplo de Request:**
```json
POST /v3/payments
{
  "customer": "cus_123456",
  "billingType": "CREDIT_CARD",
  "value": 500.00,
  "dueDate": "2024-12-10",
  "description": "Aluguel de item - Reserva #123",
  "externalReference": "reservation_abc123",
  "split": [
    {
      "walletId": "wallet_owner",
      "fixedValue": 450.00
    },
    {
      "walletId": "wallet_platform",
      "fixedValue": 50.00
    }
  ],
  "callback": {
    "successUrl": "https://app.com/success",
    "autoRedirect": true
  }
}
```

**Response:**
```json
{
  "object": "payment",
  "id": "pay_123456",
  "customer": "cus_123456",
  "value": 500.00,
  "netValue": 450.00,
  "status": "PENDING",
  "billingType": "CREDIT_CARD",
  "dueDate": "2024-12-10",
  "invoiceUrl": "https://asaas.com/invoice/...",
  "bankSlipUrl": "https://asaas.com/boleto/...",
  "transactionReceiptUrl": null,
  "invoiceNumber": "000001",
  "externalReference": "reservation_abc123",
  "split": [
    {
      "walletId": "wallet_owner",
      "fixedValue": 450.00
    }
  ]
}
```

**Conclusão:** ✅ Asaas oferece mais opções e controle

---

### 5. Checkout / Interface de Pagamento

#### Mercado Pago (Atual)
- Checkout externo (redireciona para Mercado Pago)
- Ou SDK para checkout transparente (mais complexo)

#### Asaas
- **Link de Pagamento:** Checkout externo (similar ao MP)
- **Checkout Transparente:** SDK disponível
- **QR Code PIX:** Direto na resposta
- **Boleto:** PDF direto na resposta

**Conclusão:** ✅ Asaas oferece mais opções de checkout

---

## 💰 Exemplo Prático de Valores

### Cenário: Reserva de R$ 500,00

#### Cálculo Atual (Mercado Pago)

**Valor Base:** R$ 500,00

**Taxas:**
- Taxa de serviço (7%): R$ 35,00
- Taxa Mercado Pago (PIX 1,99%): R$ 9,95
- **Total de taxas:** R$ 44,95

**Valor Total Cliente Paga:** R$ 544,95

**Divisão:**
- Plataforma recebe: R$ 50,00 (10% do base) + R$ 35,00 (taxa serviço) = R$ 85,00
- Dono recebe: R$ 450,00 (90% do base)
- **Problema:** Mercado Pago recebe tudo primeiro, depois precisa transferir manualmente

---

#### Cálculo com Asaas

**Valor Base:** R$ 500,00

**Taxas:**
- Taxa de serviço (7%): R$ 35,00
- Taxa Asaas (PIX R$ 1,99 fixo): R$ 1,99
- **Total de taxas:** R$ 36,99

**Valor Total Cliente Paga:** R$ 536,99

**Divisão (Split Automático):**
- Plataforma recebe: R$ 50,00 (10% do base) + R$ 35,00 (taxa serviço) = R$ 85,00
- Dono recebe: R$ 450,00 (90% do base)
- **Vantagem:** Split automático - cada um recebe direto na sua conta

**Economia por Transação:** R$ 7,96 (R$ 544,95 - R$ 536,99)

---

### Comparação: PIX vs Cartão

#### PIX - R$ 500,00

| Item | Mercado Pago | Asaas | Diferença |
|------|--------------|-------|-----------|
| Taxa Serviço (7%) | R$ 35,00 | R$ 35,00 | - |
| Taxa Provedor | R$ 9,95 (1,99%) | R$ 1,99 (fixo) | **-R$ 7,96** |
| Total Cliente | R$ 544,95 | R$ 536,99 | **-R$ 7,96** |
| Split | ❌ Manual | ✅ Automático | ✅ |

**Vencedor:** 🏆 **Asaas** (mais barato + split automático)

---

#### Cartão à Vista - R$ 500,00

| Item | Mercado Pago | Asaas | Diferença |
|------|--------------|-------|-----------|
| Taxa Serviço (7%) | R$ 35,00 | R$ 35,00 | - |
| Taxa Provedor | R$ 20,34 (3,99% + R$0,39) | R$ 10,44 (1,99% + R$0,49) | **-R$ 9,90** |
| Total Cliente | R$ 555,34 | R$ 545,44 | **-R$ 9,90** |
| Split | ❌ Manual | ✅ Automático | ✅ |

**Vencedor:** 🏆 **Asaas** (muito mais barato + split automático)

---

#### Cartão Parcelado (6x) - R$ 500,00

| Item | Mercado Pago | Asaas | Diferença |
|------|--------------|-------|-----------|
| Taxa Serviço (7%) | R$ 35,00 | R$ 35,00 | - |
| Taxa Provedor | ~R$ 30,00 (6%) | R$ 12,94 (2,49% + R$0,49) | **-R$ 17,06** |
| Total Cliente | ~R$ 565,00 | R$ 547,94 | **-R$ 17,06** |
| Split | ❌ Manual | ✅ Automático | ✅ |

**Vencedor:** 🏆 **Asaas** (muito mais barato + split automático)

---

## 🔧 Facilidade de Implementação

### Complexidade: BAIXA-MÉDIA

#### 1. Autenticação
```typescript
// Simples: API Key no header
headers: {
  'access_token': 'ASAAS_API_KEY',
  'Content-Type': 'application/json'
}
```

**Dificuldade:** ⭐ (Muito fácil)

---

#### 2. Criar Cobrança
```typescript
// Endpoint simples: POST /v3/payments
// Body JSON direto
// Response com todos os dados necessários
```

**Dificuldade:** ⭐⭐ (Fácil)

**Tempo Estimado:** 2-3 horas

---

#### 3. Webhook
```typescript
// Endpoint: POST /webhook
// Evento direto no body
// Não precisa buscar pagamento adicional
```

**Dificuldade:** ⭐⭐ (Fácil)

**Tempo Estimado:** 1-2 horas

---

#### 4. Split de Pagamentos
```typescript
// Simples: array no body da cobrança
// Não precisa OAuth
// Não precisa configuração adicional
```

**Dificuldade:** ⭐⭐ (Fácil)

**Tempo Estimado:** 1-2 horas

---

### Comparação com Mercado Pago

| Aspecto | Mercado Pago | Asaas |
|--------|--------------|-------|
| **Autenticação** | ⭐⭐ API Key | ⭐ API Key |
| **Criar Pagamento** | ⭐⭐⭐ Preference | ⭐⭐ Payment direto |
| **Webhook** | ⭐⭐⭐ Busca adicional | ⭐⭐ Evento direto |
| **Split** | ⭐⭐⭐⭐⭐ OAuth complexo | ⭐⭐ Array simples |
| **Documentação** | ⭐⭐⭐ Boa | ⭐⭐⭐⭐ Muito boa |
| **Sandbox** | ⭐⭐⭐ Funciona | ⭐⭐⭐⭐ Excelente |

**Conclusão:** ✅ Asaas é **mais simples** de implementar

---

## 📊 Estrutura de Código Estimada

### Arquivos Necessários

```
functions/src/
  ├── asaas.ts              # Cliente Asaas (similar a mercadopago.ts)
  ├── fees.ts               # Atualizar para suportar Asaas
  └── index.ts              # Adicionar:
      ├── createAsaasPayment
      └── asaasWebhook

app/transaction/[id]/
  └── pay.tsx               # Atualizar para usar Asaas
```

---

### Exemplo de Código: `functions/src/asaas.ts`

```typescript
// functions/src/asaas.ts
import axios from 'axios';

const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://api.asaas.com/v3';
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

export interface AsaasPaymentRequest {
  customer: string;
  billingType: 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BOLETO';
  value: number;
  dueDate: string; // YYYY-MM-DD
  description?: string;
  externalReference?: string;
  split?: Array<{
    walletId: string;
    fixedValue: number;
    totalValue?: number;
    description?: string;
  }>;
  callback?: {
    successUrl?: string;
    autoRedirect?: boolean;
  };
}

export interface AsaasPaymentResponse {
  object: string;
  id: string;
  customer: string;
  value: number;
  netValue: number;
  status: string;
  billingType: string;
  dueDate: string;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  externalReference?: string;
  split?: Array<{
    walletId: string;
    fixedValue: number;
  }>;
}

export async function createAsaasPayment(
  payment: AsaasPaymentRequest
): Promise<AsaasPaymentResponse> {
  const response = await axios.post(
    `${ASAAS_API_URL}/payments`,
    payment,
    {
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

export async function getAsaasPayment(
  paymentId: string
): Promise<AsaasPaymentResponse> {
  const response = await axios.get(
    `${ASAAS_API_URL}/payments/${paymentId}`,
    {
      headers: {
        'access_token': ASAAS_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}
```

**Complexidade:** ⭐⭐ (Fácil - similar ao Mercado Pago atual)

---

### Exemplo de Código: `createAsaasPayment` Function

```typescript
// functions/src/index.ts
export const createAsaasPayment = onCall(
  { region: "southamerica-east1", secrets: ["ASAAS_API_KEY"] },
  async ({ auth, data }) => {
    const uid = auth?.uid;
    if (!uid) throw new HttpsError("unauthenticated", "Faça login.");

    const { reservationId, successUrl, cancelUrl } = data as {
      reservationId: string;
      successUrl: string;
      cancelUrl: string;
    };

    // Buscar reserva
    const resRef = db.doc(`reservations/${reservationId}`);
    const snap = await resRef.get();
    if (!snap.exists) throw new HttpsError("not-found", "Reserva não encontrada.");
    
    const r = snap.data() as any;
    const baseCents = Number(r.baseAmountCents);

    // Calcular taxas
    const { serviceFee, surcharge, appFeeFromBase, ownerPayout, totalToCustomer } = 
      computeFees(baseCents, { paymentProvider: 'asaas', paymentMethod: 'pix' });

    // Criar cobrança no Asaas
    const payment = await createAsaasPayment({
      customer: r.renterAsaasCustomerId, // Precisa criar cliente antes
      billingType: 'PIX', // Ou 'CREDIT_CARD'
      value: totalToCustomer / 100, // Converter centavos para reais
      dueDate: new Date().toISOString().split('T')[0], // Hoje
      description: `Aluguel de item - ${r.itemTitle}`,
      externalReference: reservationId,
      split: [
        {
          walletId: r.itemOwnerAsaasWalletId, // Wallet do dono
          fixedValue: ownerPayout / 100,
          description: 'Repasse para dono do item',
        },
        {
          walletId: process.env.ASAAS_PLATFORM_WALLET_ID!, // Wallet da plataforma
          fixedValue: appFeeFromBase / 100,
          description: 'Taxa da plataforma',
        },
      ],
      callback: {
        successUrl: `${successUrl}?res=${reservationId}&status=success`,
        autoRedirect: true,
      },
    });

    // Salvar dados na reserva
    await resRef.set({
      asaasPaymentId: payment.id,
      asaasInvoiceUrl: payment.invoiceUrl,
      totalCents: totalToCustomer,
      updatedAt: TS(),
    }, { merge: true });

    return {
      paymentId: payment.id,
      invoiceUrl: payment.invoiceUrl,
      bankSlipUrl: payment.bankSlipUrl,
    };
  }
);
```

**Complexidade:** ⭐⭐⭐ (Média - similar ao atual, mas mais simples)

---

### Exemplo de Código: Webhook

```typescript
// functions/src/index.ts
export const asaasWebhook = onRequest(
  {
    region: "southamerica-east1",
    cors: true,
    secrets: ["ASAAS_API_KEY"],
  },
  async (req, res) => {
    try {
      const { event, payment } = req.body as {
        event: string;
        payment: {
          id: string;
          status: string;
          externalReference: string;
          value: number;
          netValue: number;
        };
      };

      console.log("[AsaasWebhook] Evento:", event);
      console.log("[AsaasWebhook] Payment:", payment);

      // Apenas processar pagamentos confirmados
      if (event !== 'PAYMENT_RECEIVED' || payment.status !== 'RECEIVED') {
        res.json({ received: true });
        return;
      }

      const reservationId = payment.externalReference;
      if (!reservationId) {
        console.warn("[AsaasWebhook] Sem externalReference");
        res.json({ received: true });
        return;
      }

      const resRef = db.doc(`reservations/${reservationId}`);
      const snap = await resRef.get();
      if (!snap.exists) {
        console.warn("[AsaasWebhook] Reserva não encontrada:", reservationId);
        res.json({ received: true });
        return;
      }

      const r = snap.data() as any;
      if (r.status === "paid") {
        console.log("[AsaasWebhook] Reserva já está paga");
        res.json({ received: true });
        return;
      }

      // Bloquear datas e atualizar reserva
      const days = eachDateKeysExclusive(r.startDate, r.endDate);
      const bookedCol = db.collection("items").doc(r.itemId).collection("bookedDays");

      await db.runTransaction(async (trx) => {
        // Verificar conflitos e bloquear datas
        for (const day of days) {
          const dayRef = bookedCol.doc(day);
          const dSnap = await trx.get(dayRef);
          if (dSnap.exists) {
            const curr = dSnap.data() as any;
            if (curr.resId && curr.resId !== reservationId) {
              throw new Error(`Conflito de data ${day}`);
            }
          }
          trx.set(dayRef, {
            resId: reservationId,
            renterUid: r.renterUid,
            itemOwnerUid: r.itemOwnerUid,
            status: "booked",
            createdAt: TS(),
          });
        }

        // Atualizar reserva
        trx.update(resRef, {
          status: "paid",
          paidAt: TS(),
          asaasPaymentId: payment.id,
          updatedAt: TS(),
        });
      });

      // Notificar usuários
      await Promise.all([
        createNotification({
          recipientId: String(r.itemOwnerUid),
          type: "payment_update",
          entityType: "reservation",
          entityId: String(reservationId),
          title: "Pagamento confirmado",
          body: "Uma reserva sua foi paga.",
          metadata: { reservationId },
        }),
        createNotification({
          recipientId: String(r.renterUid),
          type: "payment_update",
          entityType: "reservation",
          entityId: String(reservationId),
          title: "Pagamento aprovado",
          body: "Seu pagamento foi aprovado.",
          metadata: { reservationId },
        }),
      ]);

      res.json({ received: true });
    } catch (e: any) {
      console.error("[AsaasWebhook] Erro:", e?.message, e);
      res.status(500).send("Webhook handler error");
    }
  }
);
```

**Complexidade:** ⭐⭐ (Fácil - mais simples que Mercado Pago)

---

## ⚠️ Pontos de Atenção

### 1. Criação de Clientes/Wallets

**Requisito:** Cada vendedor precisa ter:
- Cliente Asaas (para receber cobranças)
- Wallet Asaas (para receber split)

**Solução:**
```typescript
// Criar cliente quando usuário se cadastra como vendedor
// Criar wallet quando necessário
// Armazenar IDs no Firestore
```

**Complexidade:** ⭐⭐⭐ (Média - precisa de fluxo de onboarding)

---

### 2. Gestão de Wallets

**Requisito:** Plataforma precisa ter wallet própria

**Solução:**
- Criar wallet da plataforma no Asaas
- Armazenar ID em variável de ambiente
- Usar em todas as cobranças com split

**Complexidade:** ⭐ (Muito fácil)

---

### 3. Sandbox vs Produção

**Requisito:** Testar antes de produção

**Solução:**
- Asaas oferece sandbox completo
- URLs diferentes: `https://sandbox.asaas.com` vs `https://api.asaas.com`
- API Keys diferentes

**Complexidade:** ⭐⭐ (Fácil)

---

## 📈 Estimativa de Tempo de Implementação

| Tarefa | Tempo | Complexidade |
|--------|-------|--------------|
| Criar cliente Asaas | 1-2h | ⭐⭐ |
| Implementar `createAsaasPayment` | 2-3h | ⭐⭐⭐ |
| Implementar webhook | 1-2h | ⭐⭐ |
| Implementar split | 1-2h | ⭐⭐ |
| Atualizar frontend | 2-3h | ⭐⭐ |
| Testes e ajustes | 2-3h | ⭐⭐⭐ |
| **TOTAL** | **9-15 horas** | **Média** |

**Conclusão:** ✅ Implementação relativamente rápida (1-2 dias de trabalho)

---

## 🎯 Conclusão Final

### ✅ Asaas TEM TUDO que precisamos:

1. ✅ **Métodos de pagamento:** PIX, cartão, boleto
2. ✅ **Split de pagamentos:** Nativo, sem OAuth
3. ✅ **Webhooks:** Eventos diretos e claros
4. ✅ **Checkout:** Múltiplas opções
5. ✅ **Documentação:** Excelente
6. ✅ **Sandbox:** Completo para testes

### ✅ Facilidade de Implementação: ALTA

- API RESTful simples
- Documentação clara
- Exemplos práticos
- Sem complexidades como OAuth
- Split nativo (sem configuração adicional)

### 💰 Vantagens Financeiras:

- **PIX:** Economia de R$ 7,96 por transação (R$ 500)
- **Cartão:** Economia de R$ 9,90 por transação (R$ 500)
- **Split automático:** Elimina transferências manuais

### ⚠️ Pontos de Atenção:

- Cada vendedor precisa conta/wallet Asaas
- Fluxo de onboarding necessário
- Migração de dados existentes

---

## 🚀 Recomendação

**✅ RECOMENDADO para migração**

**Motivos:**
1. Resolve o problema principal (split sem OAuth)
2. Taxas mais baixas
3. Implementação mais simples
4. Documentação excelente
5. Economia significativa por transação

**Próximos Passos:**
1. Criar conta Asaas sandbox
2. Testar endpoints básicos
3. Implementar em ambiente de desenvolvimento
4. Testar extensivamente
5. Migrar gradualmente (feature flag)

---

**Última atualização:** 2024-12-04
**Análise baseada em:** Documentação oficial Asaas + Código atual do projeto



