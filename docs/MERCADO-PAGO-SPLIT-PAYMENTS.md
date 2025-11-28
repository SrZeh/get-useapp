# Split de Pagamentos - Mercado Pago Marketplace

Este documento explica como funciona o Split de Pagamentos no Get & Use e como implementar OAuth para split automático completo.

## Como Funciona Atualmente

### Implementação Atual (Sem OAuth)

Atualmente, o sistema usa `marketplace_fee` na criação da preferência de pagamento:

```typescript
{
  items: [
    {
      id: `item-${reservationId}`,
      title: "Aluguel de item",
      quantity: 1,
      unit_price: baseCents / 100, // Valor base em reais
      currency_id: "BRL",
    },
  ],
  marketplace_fee: marketplaceFeeReais, // Comissão do marketplace
}
```

**Como funciona:**
1. Cliente paga o valor total (base + taxas)
2. Mercado Pago recebe o pagamento na conta do marketplace
3. Marketplace recebe automaticamente a `marketplace_fee` (comissão)
4. O restante fica na conta do marketplace
5. **Transferência manual necessária** para o vendedor

### Limitações da Implementação Atual

- ❌ O dinheiro não vai automaticamente para o vendedor
- ❌ Requer transferência manual após cada pagamento
- ❌ Não aproveita o split automático completo do Mercado Pago

## Implementação Completa com OAuth (Recomendado)

Para implementar split automático completo, precisamos:

### 1. OAuth Flow para Vendedores

Cada vendedor precisa autorizar o marketplace a receber pagamentos em seu nome:

1. **Criar aplicação OAuth no Mercado Pago**
   - Acesse: https://www.mercadopago.com.br/developers/panel/app
   - Crie uma aplicação
   - Configure redirect URI: `https://seu-dominio.com/mercadopago/oauth/callback`

2. **Fluxo de Autorização**
   ```
   Vendedor → Clica "Conectar com Mercado Pago"
   → Redireciona para Mercado Pago OAuth
   → Vendedor autoriza
   → Mercado Pago redireciona de volta com code
   → Backend troca code por access_token
   → Salva access_token do vendedor no Firestore
   ```

3. **Armazenar Access Token**
   ```typescript
   // Firestore: users/{uid}
   {
     mercadoPagoAccessToken: "APP_USR-...", // Access token do vendedor
     mercadoPagoRefreshToken: "...",
     mercadoPagoTokenExpiresAt: Timestamp,
   }
   ```

### 2. Usar Access Token do Vendedor

Na criação da preferência, usar o access_token do vendedor:

```typescript
// Obter access_token do vendedor
const ownerProfile = await db.doc(`users/${r.itemOwnerUid}`).get();
const ownerAccessToken = ownerProfile.data()?.mercadoPagoAccessToken;

if (!ownerAccessToken) {
  throw new HttpsError("failed-precondition", "Vendedor precisa conectar com Mercado Pago");
}

// Criar cliente com access_token do vendedor
const ownerClient = new MercadoPagoConfig({
  accessToken: ownerAccessToken,
});

const preference = new Preference(ownerClient);

// Criar preferência com marketplace_fee
const preferenceData = {
  items: [...],
  marketplace_fee: marketplaceFeeReais, // Comissão do marketplace
  // ... outros campos
};

const response = await preference.create({ body: preferenceData });
```

### 3. Resultado com OAuth

Com OAuth implementado:
- ✅ Pagamento vai automaticamente para o vendedor
- ✅ Marketplace recebe automaticamente a comissão
- ✅ Sem necessidade de transferências manuais
- ✅ Split automático completo

## Estrutura de Custos

### Exemplo: Reserva de R$ 100,00

```
Valor base: R$ 100,00
Taxa de serviço (7%): R$ 7,00
Taxa de processamento (cartão ~4%): R$ 4,28
Total pago pelo cliente: R$ 111,28

Divisão com Split:
- Marketplace recebe: R$ 11,28 (marketplace_fee)
- Vendedor recebe: R$ 100,00 (valor base)
- Taxa do Mercado Pago: descontada do vendedor (~4% do valor base)
```

## Próximos Passos

### Fase 1: Implementação Básica (Atual)
- ✅ Usar `marketplace_fee` na preferência
- ✅ Receber pagamentos na conta do marketplace
- ⏳ Implementar transferências manuais para vendedores

### Fase 2: OAuth (Futuro)
- ⏳ Criar aplicação OAuth no Mercado Pago
- ⏳ Implementar fluxo de autorização
- ⏳ Armazenar access_tokens dos vendedores
- ⏳ Usar access_token do vendedor na criação da preferência
- ⏳ Split automático completo

## Referências

- [Documentação OAuth Mercado Pago](https://www.mercadopago.com.br/developers/pt/docs/your-integrations/oauth)
- [Split de Pagamentos - Marketplace](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/advanced-features/split-payments)
- [Checkout Pro - Marketplace](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/integration-test/test-your-integration)

## Notas Importantes

1. **Comissão do Mercado Pago**: É descontada do valor recebido pelo vendedor
2. **Reembolsos**: São divididos proporcionalmente entre marketplace e vendedor
3. **Modelo 1:1**: Marketplace não pode reembolsar total se vendedor não tiver saldo
4. **Saldo entre contas**: Split permite pagamentos com saldo disponível entre contas Mercado Pago

